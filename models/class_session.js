const mongoose = require('mongoose');
const { Schema } = mongoose;

const classSessionSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Virtual for the category URL
classSessionSchema.virtual('url').get(function () {
  return `/class_session/${this._id}`;
});

// Virtual to populate users
classSessionSchema.virtual('users', {
  ref: 'Registration',
  localField: '_id',
  foreignField: 'classSessionId',
});

module.exports = mongoose.model('ClassSession', classSessionSchema);
