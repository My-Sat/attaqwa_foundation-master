const VideoCategory = require("../models/videoCategory");
const Video = require("../models/addVideo");
const asyncHandler = require("express-async-handler");

// Get: Display delete video category dropdown
exports.getVideoCategories = asyncHandler(async (req, res) => {
  const success = req.flash('success');  // Fetch success messages explicitly
  const error = req.flash('error');     // Fetch error messages explicitly

  const categories = await VideoCategory.find();
  res.render("displayDeleteVideo", { 
    title: "Delete Video", 
    categories,
    success,  // Pass success message to view
    error     // Pass error message to view
  });
});

// Post: Display videos under the selected category
exports.postVideoList = asyncHandler(async (req, res) => {
  const { category } = req.body;

  if (!category) {
    req.flash("error", "Please select a category!");
    return res.redirect("/delete_video");
  }

  const videos = await Video.find({ category }).populate("category");
  res.render("deleteVideo", { 
    title: "Delete Videos", 
    videos, 
    category,
    success: req.flash('success'), // Pass success messages to view
    error: req.flash('error')      // Pass error messages to view
  });
});

// Post: Delete a specific video
exports.postDeleteVideo = asyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    await Video.findByIdAndDelete(id);
    req.flash("success", "Video deleted successfully!");
  } catch (err) {
    req.flash("error", "Failed to delete the video.");
  }

  res.redirect("/delete_video_list");
});
