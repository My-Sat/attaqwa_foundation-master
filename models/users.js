const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    surname: {
      type: String,
      required: true,
      trim: true,
    },
    otherNames: {
      type: String,
      default: '',
      trim: true,
    },
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
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Virtual to populate messages
userSchema.virtual('messages', {
  ref: 'Message',
  localField: '_id',
  foreignField: 'userId',
});

const User = mongoose.model('User', userSchema);

module.exports = User;
