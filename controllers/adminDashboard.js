const asyncHandler = require('express-async-handler');
const Admin = require('../models/admin');
const Video = require('../models/addVideo');
const VideoCategory = require('../models/videoCategory');
const Question = require('../models/question');
const Article = require('../models/article');
const ClassSession = require('../models/class_session');
const Registration = require('../models/class_registration');
const Message = require('../models/messages');
const sanitizeHtml = require('sanitize-html');

function getEmbedUrl(youtubeUrl) {
  if (!youtubeUrl) {
    return null;
  }

  const value = youtubeUrl.trim();

  const embedMatch = value.match(/youtube\.com\/embed\/([^?&/]+)/);
  if (embedMatch) {
    return `https://www.youtube.com/embed/${embedMatch[1]}`;
  }

  const watchMatch = value.match(/[?&]v=([^&]+)/);
  if (watchMatch) {
    return `https://www.youtube.com/embed/${watchMatch[1]}`;
  }

  const shortMatch = value.match(/youtu\.be\/([^?&/]+)/);
  if (shortMatch) {
    return `https://www.youtube.com/embed/${shortMatch[1]}`;
  }

  return null;
}

exports.getVideoCategories = asyncHandler(async (req, res) => {
  const categories = await VideoCategory.aggregate([
    {
      $lookup: {
        from: 'videos',
        localField: '_id',
        foreignField: 'category',
        as: 'videos',
      },
    },
    {
      $project: {
        title: 1,
        videoCount: { $size: '$videos' },
      },
    },
    { $sort: { title: 1 } },
  ]);

  res.json({ categories });
});

exports.createVideoCategory = asyncHandler(async (req, res) => {
  const title = (req.body.title || '').trim();

  if (!title) {
    return res.status(400).json({ error: 'Category title is required.' });
  }

  const existingCategory = await VideoCategory.findOne({ title });
  if (existingCategory) {
    return res.status(409).json({ error: 'Category already exists.' });
  }

  const category = await VideoCategory.create({ title });
  return res.status(201).json({
    category: {
      _id: category._id,
      title: category.title,
      videoCount: 0,
    },
  });
});

exports.updateVideoCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const title = (req.body.title || '').trim();

  if (!title) {
    return res.status(400).json({ error: 'Category title is required.' });
  }

  const existingCategory = await VideoCategory.findOne({ title, _id: { $ne: id } });
  if (existingCategory) {
    return res.status(409).json({ error: 'Category already exists.' });
  }

  const updatedCategory = await VideoCategory.findByIdAndUpdate(
    id,
    { title },
    { new: true }
  );

  if (!updatedCategory) {
    return res.status(404).json({ error: 'Category not found.' });
  }

  const videoCount = await Video.countDocuments({ category: id });

  return res.json({
    category: {
      _id: updatedCategory._id,
      title: updatedCategory.title,
      videoCount,
    },
  });
});

exports.deleteVideoCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const category = await VideoCategory.findById(id);

  if (!category) {
    return res.status(404).json({ error: 'Category not found.' });
  }

  await Promise.all([
    Video.deleteMany({ category: id }),
    VideoCategory.findByIdAndDelete(id),
  ]);

  return res.json({ success: true });
});

exports.getVideos = asyncHandler(async (req, res) => {
  const filter = {};
  const categoryId = (req.query.category || '').trim();

  if (categoryId) {
    filter.category = categoryId;
  }

  const videos = await Video.find(filter)
    .populate('category', 'title')
    .sort({ createdAt: -1 });

  res.json({
    videos: videos.map((video) => ({
      _id: video._id,
      title: video.title,
      youtubeUrl: video.youtubeUrl,
      category: video.category
        ? { _id: video.category._id, title: video.category.title }
        : null,
    })),
  });
});

exports.createVideo = asyncHandler(async (req, res) => {
  const title = (req.body.title || '').trim();
  const category = (req.body.category || '').trim();
  const youtubeUrl = (req.body.youtubeUrl || '').trim();

  if (!title || !category || !youtubeUrl) {
    return res.status(400).json({ error: 'Title, category, and YouTube URL are required.' });
  }

  const existingCategory = await VideoCategory.findById(category);
  if (!existingCategory) {
    return res.status(404).json({ error: 'Selected category does not exist.' });
  }

  const embedUrl = getEmbedUrl(youtubeUrl);
  if (!embedUrl) {
    return res.status(400).json({ error: 'Invalid YouTube URL.' });
  }

  const video = await Video.create({
    title,
    category: existingCategory._id,
    youtubeUrl: embedUrl,
  });

  return res.status(201).json({
    video: {
      _id: video._id,
      title: video.title,
      youtubeUrl: video.youtubeUrl,
      category: { _id: existingCategory._id, title: existingCategory.title },
    },
  });
});

exports.deleteVideo = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const video = await Video.findByIdAndDelete(id);

  if (!video) {
    return res.status(404).json({ error: 'Video not found.' });
  }

  return res.json({ success: true });
});

exports.getAdmins = asyncHandler(async (req, res) => {
  const admins = await Admin.find({}, 'username').sort({ username: 1 });

  res.json({
    admins: admins.map((admin) => ({
      _id: admin._id,
      username: admin.username,
    })),
  });
});

exports.deleteAdmin = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const admin = await Admin.findById(id);

  if (!admin) {
    return res.status(404).json({ error: 'Admin not found.' });
  }

  const currentAdminId = req.session?.admin?.id ? String(req.session.admin.id) : '';
  if (currentAdminId && currentAdminId === String(id)) {
    return res.status(400).json({ error: 'You cannot delete your own account while logged in.' });
  }

  const currentAdminUsername = req.session?.admin?.username || '';
  if (!currentAdminId && currentAdminUsername && currentAdminUsername === admin.username) {
    return res.status(400).json({ error: 'You cannot delete your own account while logged in.' });
  }

  await Admin.findByIdAndDelete(id);
  return res.json({ success: true });
});

exports.getQuestions = asyncHandler(async (req, res) => {
  const questions = await Question.find()
    .populate('userId', 'username')
    .sort({ createdAt: -1 });

  res.json({
    questions: questions.map((question) => ({
      _id: question._id,
      question: question.question,
      answer: question.answer || '',
      isAnswered: question.isAnswered,
      username: question.userId ? question.userId.username : 'Unknown',
      answeredByName: question.answeredByName || '',
      answeredAt: question.answeredAt || null,
      updatedByName: question.updatedByName || '',
      updatedAt: question.updatedAt || null,
      createdAt: question.createdAt,
    })),
  });
});

exports.updateQuestionAnswer = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const answer = (req.body.answer || '').trim();
  const adminName = req.session?.admin?.username || 'Admin';

  if (!answer) {
    return res.status(400).json({ error: 'Answer is required.' });
  }

  const question = await Question.findById(id);
  if (!question) {
    return res.status(404).json({ error: 'Question not found.' });
  }

  const previousAnswer = question.answer || '';
  question.answer = answer;
  question.isAnswered = true;

  if (!question.answeredByName) {
    question.answeredByName = adminName;
    question.answeredAt = new Date();
  }

  if (previousAnswer && previousAnswer !== answer) {
    question.updatedByName = adminName;
    question.updatedAt = new Date();
  }

  await question.save();

  if (question.userId && previousAnswer !== answer) {
    await Message.create({
      userId: question.userId,
      question: question.question,
      answer,
    });
  }

  return res.json({
    question: {
      _id: question._id,
      question: question.question,
      answer: question.answer,
      isAnswered: question.isAnswered,
      answeredByName: question.answeredByName || '',
      answeredAt: question.answeredAt || null,
      updatedByName: question.updatedByName || '',
      updatedAt: question.updatedAt || null,
    },
  });
});

exports.deleteQuestion = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const deletedQuestion = await Question.findByIdAndDelete(id);

  if (!deletedQuestion) {
    return res.status(404).json({ error: 'Question not found.' });
  }

  return res.json({ success: true });
});

exports.getArticles = asyncHandler(async (req, res) => {
  const articles = await Article.find({}, 'title createdAt').sort({ createdAt: -1 });

  res.json({
    articles: articles.map((article) => ({
      _id: article._id,
      title: article.title,
      createdAt: article.createdAt,
    })),
  });
});

exports.getArticleById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const article = await Article.findById(id);

  if (!article) {
    return res.status(404).json({ error: 'Article not found.' });
  }

  return res.json({
    article: {
      _id: article._id,
      title: article.title,
      content: article.content,
    },
  });
});

exports.updateArticle = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const title = (req.body.title || '').trim();
  const content = (req.body.content || '').trim();

  if (!title || !content) {
    return res.status(400).json({ error: 'Title and content are required.' });
  }

  const sanitizedContent = sanitizeHtml(content, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(['h1', 'h2', 'h3', 'p', 'strong', 'em', 'ul', 'li']),
    allowedAttributes: false,
  });

  const updatedArticle = await Article.findByIdAndUpdate(
    id,
    { title, content: sanitizedContent },
    { new: true }
  );

  if (!updatedArticle) {
    return res.status(404).json({ error: 'Article not found.' });
  }

  return res.json({
    article: {
      _id: updatedArticle._id,
      title: updatedArticle.title,
      content: updatedArticle.content,
    },
  });
});

exports.deleteArticle = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const deletedArticle = await Article.findByIdAndDelete(id);

  if (!deletedArticle) {
    return res.status(404).json({ error: 'Article not found.' });
  }

  return res.json({ success: true });
});

exports.getClassSessions = asyncHandler(async (req, res) => {
  const classSessions = await ClassSession.aggregate([
    {
      $lookup: {
        from: 'registrations',
        localField: '_id',
        foreignField: 'classSessionId',
        as: 'registrations',
      },
    },
    {
      $project: {
        title: 1,
        registrationCount: { $size: '$registrations' },
      },
    },
    { $sort: { title: 1 } },
  ]);

  res.json({ classSessions });
});

exports.createClassSession = asyncHandler(async (req, res) => {
  const title = (req.body.title || '').trim();

  if (!title) {
    return res.status(400).json({ error: 'Session title is required.' });
  }

  const classSession = await ClassSession.create({ title });

  return res.status(201).json({
    classSession: {
      _id: classSession._id,
      title: classSession.title,
      registrationCount: 0,
    },
  });
});

exports.updateClassSession = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const title = (req.body.title || '').trim();

  if (!title) {
    return res.status(400).json({ error: 'Session title is required.' });
  }

  const updatedSession = await ClassSession.findByIdAndUpdate(
    id,
    { title },
    { new: true }
  );

  if (!updatedSession) {
    return res.status(404).json({ error: 'Class session not found.' });
  }

  const registrationCount = await Registration.countDocuments({ classSessionId: id });

  return res.json({
    classSession: {
      _id: updatedSession._id,
      title: updatedSession.title,
      registrationCount,
    },
  });
});

exports.getClassSessionUsers = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const classSession = await ClassSession.findById(id);

  if (!classSession) {
    return res.status(404).json({ error: 'Class session not found.' });
  }

  const registrations = await Registration.find({ classSessionId: id })
    .populate('userId', 'username phoneNumber')
    .sort({ _id: -1 });

  return res.json({
    classSession: {
      _id: classSession._id,
      title: classSession.title,
    },
    users: registrations.map((registration) => ({
      registrationId: registration._id,
      username: registration.userId ? registration.userId.username : 'Unknown',
      phoneNumber: registration.userId ? registration.userId.phoneNumber : '',
      momoReferenceName: registration.momoReferenceName,
      accessCodeAssigned: registration.accessCodeAssigned,
      accessCode: registration.accessCode || '',
    })),
  });
});

exports.deleteClassSession = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const classSession = await ClassSession.findById(id);

  if (!classSession) {
    return res.status(404).json({ error: 'Class session not found.' });
  }

  await Promise.all([
    Registration.deleteMany({ classSessionId: id }),
    ClassSession.findByIdAndDelete(id),
  ]);

  return res.json({ success: true });
});
