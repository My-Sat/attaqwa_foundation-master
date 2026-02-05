const VideoCategory = require('../models/videoCategory');
const Video = require('../models/addVideo'); // Video model
const asyncHandler = require('express-async-handler');

// GET: Display form to delete a video category
exports.getDeleteCategory = asyncHandler(async (req, res) => {
  const success = req.flash('success'); // Fetch success messages explicitly
  const error = req.flash('error');    // Fetch error messages explicitly

  const categories = await VideoCategory.find(); // Fetch all categories

  res.render('deleteCategory', { 
    title: 'Delete Video Category', 
    categories,
    success,  // Pass success message to view
    error     // Pass error message to view
  });
});

// POST: Handle deletion of a category and its associated videos
exports.postDeleteCategory = asyncHandler(async (req, res) => {
  const { category } = req.body;

  if (!category) {
    req.flash('error', 'Please select a category to delete.');
    return res.redirect('/delete_category');
  }

  try {
    // Delete all videos in the category
    await Video.deleteMany({ category });

    // Delete the category itself
    await VideoCategory.findByIdAndDelete(category);

    req.flash('success', 'Category and all associated videos deleted successfully!');
    res.redirect('/delete_category');
  } catch (err) {
    console.error('Error deleting category:', err);
    req.flash('error', 'Failed to delete category. Please try again later.');
    res.redirect('/delete_category');
  }
});
