const Question = require('../models/question'); // Question Model
const Video = require('../models/addVideo'); // Video Model
const asyncHandler = require('express-async-handler');

// GET: Handle search requests
exports.search = asyncHandler(async (req, res) => {
  const query = req.query.q; // Search query from the request
  const success = req.flash('success');
  const error = req.flash('error');

  if (!query) {
    req.flash('error', 'Search query cannot be empty.');
    return res.redirect('/');
  }

  try {
    // Search questions: Both `question` and `answer` fields
    const questions = await Question.find(
      { $text: { $search: query } }, // Search condition
      { score: { $meta: 'textScore' } } // Include relevance score
    ).sort({ score: { $meta: 'textScore' } });

    // Search videos: `title` field
    const videos = await Video.find(
      { $text: { $search: query } },
      { score: { $meta: 'textScore' } }
    ).sort({ score: { $meta: 'textScore' } });

    res.render('searchResults', {
      title: 'Search Results',
      query,
      questions,
      videos,
      success,
      error,
    });
  } catch (error) {
    req.flash('error', 'An error occurred while searching. Please try again later.');
    res.redirect('/');
  }
});
