const Question = require('../models/question');
const VideoCategory = require('../models/videoCategory');
const Visitor = require('../models/visitor');
const Article = require('../models/article');
const LiveStreamSchedule = require('../models/live_stream_schedule');
const postController = require('./post');
const axios = require('axios');
const asyncHandler = require('express-async-handler');

// YouTube API Credentials
const YOUTUBE_API_KEY = 'AIzaSyCZV3KPk9vQK3Rrkwz4alWgslhHmoVSf14'; // Replace with your API Key
const CHANNEL_ID = 'UCuc74pUfHQ0w4wLxe9yeIRg'; // Replace with your channel ID
const HOME_PAGE_SIZE = 5;
const HOME_EAGER_LOAD_THRESHOLD = 25;

function getPublicArticleFilter() {
  return {
    $or: [
      { status: 'published' },
      { status: { $exists: false } },
    ],
  };
}

exports.index = asyncHandler(async (req, res) => {
  const noticeType = (req.query.liveClassNotice || '').trim();
  const liveClassNotice = noticeType === 'not_started'
    ? 'No class is active right now. Please wait for admin to start the live class.'
    : '';
  let liveVideoUrl = "https://www.youtube.com/embed/xjxOWSmSjnU"; // Fallback video

  try {
    // Fetch YouTube live broadcasts for the specified channel
    const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
      params: {
        part: 'id',
        channelId: CHANNEL_ID,
        eventType: 'live', // Get only active live streams
        type: 'video',
        key: YOUTUBE_API_KEY
      }
    });

    console.log('YouTube API Response:', response.data);

    // Extract the live videoId from the API response
    if (response.data.items && response.data.items.length > 0 && response.data.items[0].id.videoId) {
      const videoId = response.data.items[0].id.videoId;
      liveVideoUrl = `https://www.youtube.com/embed/${videoId}`;
    } else {
      console.warn('No live videos found.');
    }
  } catch (error) {
    console.error('Error fetching live video:', error.message);
  }

  // Fetch video categories and answered questions from the database
  const [totalQuestions, totalVideoCategories, totalArticles, liveStreamSchedule] = await Promise.all([
    Question.countDocuments({ isAnswered: true }),
    VideoCategory.countDocuments(),
    Article.countDocuments(getPublicArticleFilter()),
    LiveStreamSchedule.findOne({}),
  ]);

  const shouldLazyLoadVideos = totalVideoCategories > HOME_EAGER_LOAD_THRESHOLD;
  const shouldLazyLoadArticles = totalArticles > HOME_EAGER_LOAD_THRESHOLD;

  const [videoCategories, questions, articles, postPayload] = await Promise.all([
    shouldLazyLoadVideos
      ? VideoCategory.find().sort({ _id: -1 }).limit(HOME_PAGE_SIZE)
      : VideoCategory.find().sort({ _id: -1 }),
    Question.find({ isAnswered: true }).sort({ createdAt: -1 }).limit(HOME_PAGE_SIZE),
    shouldLazyLoadArticles
      ? Article.find(getPublicArticleFilter()).sort({ createdAt: -1 }).limit(HOME_PAGE_SIZE)
      : Article.find(getPublicArticleFilter()).sort({ createdAt: -1 }),
    postController.fetchPostsSlice(0, postController.HOME_POST_PAGE_SIZE),
  ]);
  
  // Update visitor count
  let visitor = await Visitor.findOne();
  if (!visitor) {
    visitor = new Visitor({ count: 1 });
  } else {
    visitor.count += 1;
  }
  await visitor.save();

  // Render the updated view
  res.render('index', {
    liveVideoUrl, 
    videoCategories, 
    questions, 
    visitorCount: visitor.count,
    articles, // Pass articles to view
    homePageSize: HOME_PAGE_SIZE,
    hasMoreQuestions: totalQuestions > questions.length,
    hasMoreVideos: totalVideoCategories > videoCategories.length,
    hasMoreArticles: totalArticles > articles.length,
    posts: postPayload.posts || [],
    postPageSize: postController.HOME_POST_PAGE_SIZE,
    hasMorePosts: Boolean(postPayload.hasMore),
    liveClassNotice,
    liveStreamSchedule: {
      startsAt: liveStreamSchedule && liveStreamSchedule.startsAt ? liveStreamSchedule.startsAt : null,
      note: liveStreamSchedule && liveStreamSchedule.note ? liveStreamSchedule.note : '',
    },
  });
});

exports.getHomeFeed = asyncHandler(async (req, res) => {
  const feedType = req.params.type;
  const skip = Math.max(0, parseInt(req.query.skip, 10) || 0);
  const limit = Math.min(20, Math.max(1, parseInt(req.query.limit, 10) || HOME_PAGE_SIZE));

  let items = [];
  let total = 0;

  if (feedType === 'questions') {
    [items, total] = await Promise.all([
      Question.find({ isAnswered: true }).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Question.countDocuments({ isAnswered: true }),
    ]);

    return res.json({
      items: items.map((question) => ({
        id: question._id,
        title: question.question,
        url: `/question/${question._id}`,
      })),
      hasMore: skip + items.length < total,
    });
  }

  if (feedType === 'videos') {
    [items, total] = await Promise.all([
      VideoCategory.find().sort({ _id: -1 }).skip(skip).limit(limit),
      VideoCategory.countDocuments(),
    ]);

    return res.json({
      items: items.map((category) => ({
        id: category._id,
        title: category.title,
        url: `/video_categories/${category._id}`,
      })),
      hasMore: skip + items.length < total,
    });
  }

  if (feedType === 'articles') {
    [items, total] = await Promise.all([
      Article.find(getPublicArticleFilter()).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Article.countDocuments(getPublicArticleFilter()),
    ]);

    return res.json({
      items: items.map((article) => ({
        id: article._id,
        title: article.title,
        url: `/article/${article._id}`,
      })),
      hasMore: skip + items.length < total,
    });
  }

  res.status(400).json({ error: 'Invalid feed type.' });
});
