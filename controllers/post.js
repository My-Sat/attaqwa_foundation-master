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

function getActorLikeKey(req) {
  const actor = getActorFromSession(req);
  if (!actor) {
    return null;
  }
  return actor.type === 'admin' ? `a:${actor.id}` : `u:${actor.id}`;
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

function mapComment(comment, likeKey) {
  const likedByKeys = Array.isArray(comment.likedByKeys) ? comment.likedByKeys : [];
  return {
    id: comment._id,
    parentCommentId: comment.parentCommentId ? String(comment.parentCommentId) : null,
    body: comment.body,
    authorType: comment.authorType,
    authorName: mapAuthorName(comment),
    createdAt: comment.createdAt,
    likesCount: Number.isFinite(Number(comment.likesCount)) ? Number(comment.likesCount) : 0,
    likedByCurrent: Boolean(likeKey && likedByKeys.includes(likeKey)),
    replies: [],
  };
}

async function fetchPostsSlice(skip = 0, limit = HOME_POST_PAGE_SIZE, req = null) {
  const safeSkip = Math.max(0, Number(skip) || 0);
  const safeLimit = Math.min(20, Math.max(1, Number(limit) || HOME_POST_PAGE_SIZE));
  const likeKey = req ? getActorLikeKey(req) : null;

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
    acc[key].push(mapComment(comment, likeKey));
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

    const likedByKeys = Array.isArray(post.likedByKeys) ? post.likedByKeys : [];
    return {
      id: String(post._id),
      body: post.body,
      authorType: post.authorType,
      authorName: mapAuthorName(post),
      createdAt: post.createdAt,
      commentsCount: Number.isFinite(Number(post.commentsCount)) ? Number(post.commentsCount) : 0,
      likesCount: Number.isFinite(Number(post.likesCount)) ? Number(post.likesCount) : 0,
      likedByCurrent: Boolean(likeKey && likedByKeys.includes(likeKey)),
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
  const payload = await fetchPostsSlice(skip, limit, req);

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
    likesCount: 0,
    likedByKeys: [],
  });

  return res.status(201).json({
    post: {
      id: post._id,
      body: post.body,
      authorType: actor.type,
      authorName: actor.name,
      createdAt: post.createdAt,
      commentsCount: 0,
      likesCount: 0,
      likedByCurrent: false,
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
    likesCount: 0,
    likedByKeys: [],
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
      likesCount: 0,
      likedByCurrent: false,
    },
    commentsCount: post.commentsCount,
  });
});

exports.togglePostLike = asyncHandler(async (req, res) => {
  const actor = getActorFromSession(req);
  if (!actor) {
    return res.status(401).json({ error: 'You need to sign in to like posts.' });
  }

  const likeKey = getActorLikeKey(req);
  const postId = (req.params.id || '').trim();
  if (!postId) {
    return res.status(400).json({ error: 'Post id is required.' });
  }

  const post = await Post.findById(postId);
  if (!post) {
    return res.status(404).json({ error: 'Post not found.' });
  }

  const likedByKeys = Array.isArray(post.likedByKeys) ? post.likedByKeys : [];
  const existingIndex = likedByKeys.indexOf(likeKey);
  let liked = false;

  if (existingIndex >= 0) {
    likedByKeys.splice(existingIndex, 1);
    liked = false;
  } else {
    likedByKeys.push(likeKey);
    liked = true;
  }

  post.likedByKeys = likedByKeys;
  post.likesCount = likedByKeys.length;
  await post.save();

  return res.json({
    liked,
    likesCount: post.likesCount,
  });
});

exports.toggleCommentLike = asyncHandler(async (req, res) => {
  const actor = getActorFromSession(req);
  if (!actor) {
    return res.status(401).json({ error: 'You need to sign in to like replies.' });
  }

  const likeKey = getActorLikeKey(req);
  const postId = (req.params.postId || '').trim();
  const commentId = (req.params.commentId || '').trim();

  if (!postId || !commentId) {
    return res.status(400).json({ error: 'Post id and comment id are required.' });
  }

  const comment = await PostComment.findOne({ _id: commentId, postId });
  if (!comment) {
    return res.status(404).json({ error: 'Comment not found.' });
  }

  const likedByKeys = Array.isArray(comment.likedByKeys) ? comment.likedByKeys : [];
  const existingIndex = likedByKeys.indexOf(likeKey);
  let liked = false;

  if (existingIndex >= 0) {
    likedByKeys.splice(existingIndex, 1);
    liked = false;
  } else {
    likedByKeys.push(likeKey);
    liked = true;
  }

  comment.likedByKeys = likedByKeys;
  comment.likesCount = likedByKeys.length;
  await comment.save();

  return res.json({
    liked,
    likesCount: comment.likesCount,
  });
});

exports.fetchPostsSlice = fetchPostsSlice;
exports.HOME_POST_PAGE_SIZE = HOME_POST_PAGE_SIZE;
