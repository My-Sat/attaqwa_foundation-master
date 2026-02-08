const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const Article = require('../models/article');
const sanitizeHtml = require('sanitize-html');

function sanitizeArticleBody(content) {
  return sanitizeHtml(content, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(['h1', 'h2', 'h3', 'p', 'strong', 'em', 'ul', 'li']),
    allowedAttributes: false,
  });
}

function getIsPublishIntent(intent) {
  return String(intent || '').toLowerCase() === 'published';
}

function getPublicArticleFilter() {
  return {
    $or: [
      { status: 'published' },
      { status: { $exists: false } },
    ],
  };
}

// GET: Form to Create Article (Admin only)
exports.getCreateArticle = asyncHandler(async (req, res) => {
  const articleId = (req.params.id || '').trim();
  let formData = {
    articleId: '',
    title: '',
    content: '',
  };

  if (articleId) {
    if (!mongoose.isValidObjectId(articleId)) {
      return res.status(404).send('Article Not Found');
    }

    const article = await Article.findById(articleId);
    if (!article) {
      return res.status(404).send('Article Not Found');
    }

    formData = {
      articleId: String(article._id),
      title: article.title || '',
      content: article.content || '',
    };
  }

  res.render('admin_create_article', {
    title: articleId ? 'Edit Article' : 'Create Article',
    formData,
    errors: {},
  });
});

// POST: Save Article to Database (Admin only)
exports.postCreateArticle = asyncHandler(async (req, res) => {
  const intent = req.body.intent;
  const shouldPublish = getIsPublishIntent(intent);
  const articleId = (req.body.articleId || '').trim();
  const rawTitle = (req.body.title || '').trim();
  const rawContent = (req.body.content || '').trim();
  const safeTitle = sanitizeHtml(rawTitle, { allowedTags: [], allowedAttributes: {} }).trim();
  const plainContent = sanitizeHtml(rawContent, { allowedTags: [], allowedAttributes: {} }).trim();
  const errors = {};

  if (!safeTitle) {
    errors.title = 'Title is required.';
  } else if (safeTitle.length > 140) {
    errors.title = 'Title must not exceed 140 characters.';
  }

  if (shouldPublish && !plainContent) {
    errors.content = 'Content is required.';
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).render('admin_create_article', {
      title: articleId ? 'Edit Article' : 'Create Article',
      formData: {
        articleId,
        title: safeTitle,
        content: rawContent,
      },
      errors,
    });
  }

  const sanitizedContent = sanitizeArticleBody(rawContent);
  const status = shouldPublish ? 'published' : 'draft';
  const publishDate = shouldPublish ? new Date() : null;

  let savedArticle = null;

  if (articleId) {
    if (!mongoose.isValidObjectId(articleId)) {
      return res.status(404).render('admin_create_article', {
        title: 'Edit Article',
        formData: {
          articleId: '',
          title: safeTitle,
          content: rawContent,
        },
        errors: {
          title: 'Article could not be found.',
        },
      });
    }

    const existingArticle = await Article.findById(articleId);
    if (!existingArticle) {
      return res.status(404).render('admin_create_article', {
        title: 'Edit Article',
        formData: {
          articleId: '',
          title: safeTitle,
          content: rawContent,
        },
        errors: {
          title: 'Article could not be found.',
        },
      });
    }

    savedArticle = await Article.findByIdAndUpdate(
      articleId,
      {
        title: safeTitle,
        content: sanitizedContent,
        status,
        publishedAt: shouldPublish ? (existingArticle.publishedAt || publishDate) : null,
      },
      { new: true }
    );
  } else {
    savedArticle = await Article.create({
      title: safeTitle,
      content: sanitizedContent,
      status,
      publishedAt: publishDate,
    });
  }

  if (shouldPublish) {
    return res.redirect(`/article/${savedArticle._id}`);
  }

  return res.redirect(`/create_article/${savedArticle._id}`);
});
// GET: View a Specific Article
exports.getArticle = asyncHandler(async (req, res) => {
  const article = await Article.findById(req.params.id); // Find article by ID

  if (!article) {
    res.status(404).send("Article Not Found");
    return;
  }

  const isAdmin = Boolean(req.session?.isLoggedIn && req.session?.admin);
  const isPublished = article.status === 'published' || typeof article.status === 'undefined';
  if (!isAdmin && !isPublished) {
    res.status(404).send("Article Not Found");
    return;
  }

  res.render('article', { article }); // Render article view
});

// GET: View All Articles
exports.getAllArticles = asyncHandler(async (req, res) => {
  const articles = await Article.find(getPublicArticleFilter()).sort({ createdAt: -1 }); // Get all published articles
  res.render('all_articles', { articles }); // Render the view listing all articles
});

// GET: Fetch and List All Articles for Deletion
exports.getDeleteArticle = asyncHandler(async (req, res) => {
  const articles = await Article.find({}, 'title');
  res.render('delete_article', { articles });
});

// POST: Handle Article Deletion
exports.postDeleteArticle = asyncHandler(async (req, res) => {
  const { articleId } = req.body;
  const deletedArticle = await Article.findByIdAndDelete(articleId);

  if (!deletedArticle) {
    return res.status(404).send("Article not found or couldn't be deleted.");
  }

  res.redirect('/dashboard');
});

// GET: Fetch and List All Articles for Edit Selection
exports.getEditArticleList = asyncHandler(async (req, res) => {
  const articles = await Article.find({}, 'title');
  res.render('edit_article_list', { articles });
});

// POST: Fetch Article Content for Editing
exports.getArticleForEdit = asyncHandler(async (req, res) => {
  const { articleId } = req.body;
  const article = await Article.findById(articleId);

  if (!article) {
    return res.status(404).send("Article not found.");
  }

  res.render('edit_article', { article });
});

// POST: Update Edited Article
exports.postUpdateArticle = asyncHandler(async (req, res) => {
  const { articleId, title, content } = req.body;

  const updatedArticle = await Article.findByIdAndUpdate(
    articleId,
    { title, content },
    { new: true }
  );

  if (!updatedArticle) {
    return res.status(404).send("Error updating article.");
  }

  res.redirect(`/article/${articleId}`);
});
