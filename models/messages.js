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
  kind: {
    type: String,
    enum: ['qa', 'session', 'community'],
    default: 'qa',
  },
  linkType: {
    type: String,
    enum: ['inbox', 'community-comment'],
    default: 'inbox',
  },
  linkPostId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    default: null,
  },
  linkCommentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PostComment',
    default: null,
  },
  isRead: {
    type: Boolean,
    default: false, // By default, a new message is unread
  },
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);
