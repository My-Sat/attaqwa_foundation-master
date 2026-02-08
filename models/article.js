const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String, default: '' }, // Stores formatted HTML content
    status: { type: String, enum: ['draft', 'published'], default: 'draft' },
    publishedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Article', articleSchema);
