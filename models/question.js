const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  question: { type: String, required: true },
  answer: { type: String },
  isAnswered: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

// Create a compound text index on both `question` and `answer` fields
questionSchema.index({ question: 'text', answer: 'text' });

module.exports = mongoose.model('Question', questionSchema);
