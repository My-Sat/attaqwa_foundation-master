const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
});

// Virtual to populate messages
userSchema.virtual('messages', {
  ref: 'Message',
  localField: '_id',
  foreignField: 'userId',
});

const User = mongoose.model('User', userSchema);

module.exports = User;
