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

function normalizeArticleLanguage(language) {
  return String(language || '').trim().toLowerCase() === 'ar' ? 'ar' : 'en';
}

function getSiteUrl(req) {
  const configured = (process.env.SITE_URL || '').trim().replace(/\/+$/, '');
  if (configured) {
    return configured;
  }

  const forwardedProto = (req.headers['x-forwarded-proto'] || '').toString().split(',')[0].trim();
  const protocol = forwardedProto || req.protocol || 'https';
  const host = req.get('host') || '';
  return `${protocol}://${host}`;
}

function toPlainText(htmlContent) {
  return sanitizeHtml(htmlContent || '', { allowedTags: [], allowedAttributes: {} }).replace(/\s+/g, ' ').trim();
}

function trimDescription(text, max = 160) {
  const value = String(text || '').trim();
  if (value.length <= max) {
    return value;
  }
  return `${value.slice(0, max - 1).trim()}…`;
}

// GET: Form to Create Article (Admin only)
exports.getCreateArticle = asyncHandler(async (req, res) => {
  const articleId = (req.params.id || '').trim();
  let formData = {
    articleId: '',
    title: '',
    content: '',
    language: 'en',
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
      language: normalizeArticleLanguage(article.language),
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
  const language = normalizeArticleLanguage(req.body.language);
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
        language,
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
          language,
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
        language,
        status,
        publishedAt: shouldPublish ? (existingArticle.publishedAt || publishDate) : null,
      },
      { new: true }
    );
  } else {
    savedArticle = await Article.create({
      title: safeTitle,
      content: sanitizedContent,
      language,
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

  const siteUrl = getSiteUrl(req);
  const articleUrl = `${siteUrl}/article/${article._id}`;
  const plainContent = toPlainText(article.content);
  const description = trimDescription(plainContent || article.title || 'Read this article from At-Taqwa Foundation.');

  res.render('article', {
    article,
    title: article.title,
    seo: {
      title: `${article.title} | At-Taqwa Foundation`,
      description,
      canonical: articleUrl,
      ogType: 'article',
      image: '/images/attaqwa.jpg',
      jsonLd: [
        {
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: article.title,
          description,
          datePublished: article.createdAt ? new Date(article.createdAt).toISOString() : undefined,
          dateModified: article.updatedAt ? new Date(article.updatedAt).toISOString() : undefined,
          author: {
            '@type': 'Organization',
            name: 'At-Taqwa Foundation',
          },
          publisher: {
            '@type': 'Organization',
            name: 'At-Taqwa Foundation',
            logo: {
              '@type': 'ImageObject',
              url: `${siteUrl}/images/attaqwa.jpg`,
            },
          },
          mainEntityOfPage: articleUrl,
        },
      ],
    },
  }); // Render article view
});

// GET: View All Articles
exports.getAllArticles = asyncHandler(async (req, res) => {
  const articles = await Article.find(getPublicArticleFilter()).sort({ createdAt: -1 }); // Get all published articles
  const siteUrl = getSiteUrl(req);
  res.render('all_articles', {
    title: 'All Articles',
    articles,
    seo: {
      title: 'All Articles | At-Taqwa Foundation',
      description: 'Browse published Islamic articles and curricular resources from At-Taqwa Foundation.',
      canonical: `${siteUrl}/all_articles`,
      ogType: 'website',
      image: '/images/attaqwa.jpg',
      jsonLd: [
        {
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: 'All Articles',
          url: `${siteUrl}/all_articles`,
        },
      ],
    },
  }); // Render the view listing all articles
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
