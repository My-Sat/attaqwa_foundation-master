const Video = require('../models/addVideo'); // Import the Video model
const VideoCategory = require('../models/videoCategory'); // Import the VideoCategory model
const asyncHandler = require('express-async-handler');

// GET: Display videos under a specific category
exports.getVideoList = asyncHandler(async (req, res) => {
  const categoryId = req.params.id;

  try {
    const category = await VideoCategory.findById(categoryId);
    if (!category) return res.status(404).send('Category not found');

    const videos = await Video.find({ category: categoryId });

    res.render('videoList', {
      title: `Videos - ${category.title}`,
      categoryTitle: category.title,
      videos,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
});
