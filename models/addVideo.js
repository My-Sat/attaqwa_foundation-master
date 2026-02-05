const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'VideoCategory', required: true },
  youtubeUrl: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

// Create a text index on the `title` field
videoSchema.index({ title: 'text' });

module.exports = mongoose.model('Video', videoSchema);
