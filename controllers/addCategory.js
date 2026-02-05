const addCategory = require('../models/videoCategory');
const asyncHandler = require('express-async-handler');

// GET: Display form for adding a new category
exports.getAddCategory = asyncHandler(async (req, res) => {
  const success = req.flash('success'); // Fetch success messages explicitly
  const error = req.flash('error');    // Fetch error messages explicitly

  res.render('addCategory', { 
    title: 'Add Video Category',
    success, // Pass success message to view
    error    // Pass error message to view
  });
});

// POST: Add a new video category
exports.postAddCategory = asyncHandler(async (req, res) => {
  const { title } = req.body;

  if (!title) {
    req.flash('error', 'Category title is required.');
    return res.redirect('/add_category');
  }

  try {
    // Add a new video category
    await addCategory.create({ title });
    req.flash('success', 'Category added successfully!');
    res.redirect('/add_video');  // Redirect after successfully adding the category
  } catch (err) {
    req.flash('error', 'Failed to add category. Please try again later.');
    res.redirect('/add_category'); // Redirect in case of error
  }
});
