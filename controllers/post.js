const asyncHandler = require('express-async-handler');
const Post = require('../models/post');
const PostComment = require('../models/post_comment');

const HOME_POST_PAGE_SIZE = 5;

function getActorFromSession(req) {
  if (req.session && req.session.user) {
    return {
      type: 'user',
      id: req.session.user.id,
      name: req.session.user.username || 'User',
      userId: req.session.user.id,
      adminId: null,
    };
  }

  if (req.session && req.session.admin) {
    return {
      type: 'admin',
      id: req.session.admin.id,
      name: req.session.admin.username || 'Admin',
      userId: null,
      adminId: req.session.admin.id,
    };
  }

  return null;
}

function normalizePostBody(value) {
  return String(value || '').trim();
}

function mapAuthorName(item) {
  if (item.authorType === 'admin') {
    return item.authorAdminId && item.authorAdminId.username
      ? item.authorAdminId.username
      : 'Admin';
  }

  return item.authorUserId && item.authorUserId.username
    ? item.authorUserId.username
    : 'User';
}

function mapComment(comment) {
  return {
    id: comment._id,
    parentCommentId: comment.parentCommentId ? String(comment.parentCommentId) : null,
    body: comment.body,
    authorType: comment.authorType,
    authorName: mapAuthorName(comment),
    createdAt: comment.createdAt,
    replies: [],
  };
}

async function fetchPostsSlice(skip = 0, limit = HOME_POST_PAGE_SIZE) {
  const safeSkip = Math.max(0, Number(skip) || 0);
  const safeLimit = Math.min(20, Math.max(1, Number(limit) || HOME_POST_PAGE_SIZE));

  const [posts, total] = await Promise.all([
    Post.find({})
      .sort({ createdAt: -1 })
      .skip(safeSkip)
      .limit(safeLimit)
      .populate('authorUserId', 'username')
      .populate('authorAdminId', 'username'),
    Post.countDocuments({}),
  ]);

  const postIds = posts.map((post) => post._id);
  const comments = postIds.length
    ? await PostComment.find({ postId: { $in: postIds } })
      .sort({ createdAt: 1 })
      .populate('authorUserId', 'username')
      .populate('authorAdminId', 'username')
    : [];

  const commentsByPostId = comments.reduce((acc, comment) => {
    const key = String(comment.postId);
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(mapComment(comment));
    return acc;
  }, {});

  const mappedPosts = posts.map((post) => {
    const flatComments = commentsByPostId[String(post._id)] || [];
    const byId = new Map(flatComments.map((comment) => [String(comment.id), comment]));
    const rootComments = [];

    flatComments.forEach((comment) => {
      if (comment.parentCommentId && byId.has(String(comment.parentCommentId))) {
        byId.get(String(comment.parentCommentId)).replies.push(comment);
      } else {
        rootComments.push(comment);
      }
    });

    return {
      id: String(post._id),
      body: post.body,
      authorType: post.authorType,
      authorName: mapAuthorName(post),
      createdAt: post.createdAt,
      commentsCount: Number.isFinite(Number(post.commentsCount)) ? Number(post.commentsCount) : 0,
      comments: rootComments,
    };
  });

  return {
    posts: mappedPosts,
    total,
    hasMore: safeSkip + mappedPosts.length < total,
  };
}

exports.getHomePosts = asyncHandler(async (req, res) => {
  const skip = Math.max(0, parseInt(req.query.skip, 10) || 0);
  const limit = Math.min(20, Math.max(1, parseInt(req.query.limit, 10) || HOME_POST_PAGE_SIZE));
  const payload = await fetchPostsSlice(skip, limit);

  return res.json({
    posts: payload.posts,
    hasMore: payload.hasMore,
  });
});

exports.createPost = asyncHandler(async (req, res) => {
  const actor = getActorFromSession(req);
  if (!actor) {
    return res.status(401).json({ error: 'You need to sign in to post.' });
  }

  const body = normalizePostBody(req.body.body);
  if (!body) {
    return res.status(400).json({ error: 'Post text is required.' });
  }
  if (body.length > 1200) {
    return res.status(400).json({ error: 'Post text must not exceed 1200 characters.' });
  }

  const post = await Post.create({
    body,
    authorType: actor.type,
    authorUserId: actor.userId,
    authorAdminId: actor.adminId,
    commentsCount: 0,
  });

  return res.status(201).json({
    post: {
      id: post._id,
      body: post.body,
      authorType: actor.type,
      authorName: actor.name,
      createdAt: post.createdAt,
      commentsCount: 0,
      comments: [],
    },
  });
});

exports.createComment = asyncHandler(async (req, res) => {
  const actor = getActorFromSession(req);
  if (!actor) {
    return res.status(401).json({ error: 'You need to sign in to comment.' });
  }

  const postId = (req.params.id || '').trim();
  const parentCommentId = (req.body.parentCommentId || '').trim();
  const body = normalizePostBody(req.body.body);

  if (!postId) {
    return res.status(400).json({ error: 'Post id is required.' });
  }

  if (!body) {
    return res.status(400).json({ error: 'Comment text is required.' });
  }

  if (body.length > 700) {
    return res.status(400).json({ error: 'Comment text must not exceed 700 characters.' });
  }

  const post = await Post.findById(postId);
  if (!post) {
    return res.status(404).json({ error: 'Post not found.' });
  }

  let parentComment = null;
  if (parentCommentId) {
    parentComment = await PostComment.findOne({
      _id: parentCommentId,
      postId: post._id,
    });
    if (!parentComment) {
      return res.status(400).json({ error: 'Parent comment not found.' });
    }
  }

  const comment = await PostComment.create({
    postId: post._id,
    parentCommentId: parentComment ? parentComment._id : null,
    body,
    authorType: actor.type,
    authorUserId: actor.userId,
    authorAdminId: actor.adminId,
  });

  post.commentsCount = (post.commentsCount || 0) + 1;
  await post.save();

  return res.status(201).json({
    comment: {
      id: String(comment._id),
      postId: String(post._id),
      parentCommentId: parentComment ? String(parentComment._id) : null,
      body: comment.body,
      authorType: actor.type,
      authorName: actor.name,
      createdAt: comment.createdAt,
    },
    commentsCount: post.commentsCount,
  });
});

exports.fetchPostsSlice = fetchPostsSlice;
exports.HOME_POST_PAGE_SIZE = HOME_POST_PAGE_SIZE;
