const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const messageSchema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  question: {
    type: String,
    required: true,
  },
  answer: {
    type: String,
    required: true,
  },
  isRead: {
    type: Boolean,
    default: false, // By default, a new message is unread
  },
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);
