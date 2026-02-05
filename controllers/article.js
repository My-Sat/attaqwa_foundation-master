const asyncHandler = require('express-async-handler');
const Article = require('../models/article');
const sanitizeHtml = require('sanitize-html');

// GET: Form to Create Article (Admin only)
exports.getCreateArticle = asyncHandler(async (req, res) => {
  res.render('admin_create_article'); // Render the form view
});

// POST: Save Article to Database (Admin only)
exports.postCreateArticle = asyncHandler(async (req, res) => {
  const { title, content } = req.body;

  const sanitizedContent = sanitizeHtml(content, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(['h1', 'h2', 'h3', 'p', 'strong', 'em', 'ul', 'li']),
    allowedAttributes: false,
  });

  await Article.create({ title, content: sanitizedContent });

  res.redirect('/');
});
// GET: View a Specific Article
exports.getArticle = asyncHandler(async (req, res) => {
  const article = await Article.findById(req.params.id); // Find article by ID

  if (!article) {
    res.status(404).send("Article Not Found");
    return;
  }

  res.render('article', { article }); // Render article view
});

// GET: View All Articles
exports.getAllArticles = asyncHandler(async (req, res) => {
  const articles = await Article.find().sort({ createdAt: -1 }); // Get all articles sorted by creation date
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
