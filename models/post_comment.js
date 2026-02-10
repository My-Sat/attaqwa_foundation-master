const mongoose = require('mongoose');

const postCommentSchema = new mongoose.Schema(
  {
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
      required: true,
      index: true,
    },
    parentCommentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PostComment',
      default: null,
      index: true,
    },
    body: {
      type: String,
      required: true,
      trim: true,
      maxlength: 700,
    },
    authorType: {
      type: String,
      enum: ['user', 'admin'],
      required: true,
    },
    authorUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    authorAdminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('PostComment', postCommentSchema);
