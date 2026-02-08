const mongoose = require('mongoose');
const { Schema } = mongoose;

const classSessionSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
    default: 0,
  },
  schedule: {
    startDate: {
      type: Date,
      default: null,
    },
    startTime: {
      type: String,
      default: '18:00',
      match: /^\d{2}:\d{2}$/,
    },
    durationMinutes: {
      type: Number,
      default: 60,
      min: 15,
      max: 720,
    },
    frequency: {
      type: String,
      enum: ['daily', 'weekly'],
      default: 'weekly',
    },
    weekDays: {
      type: [Number],
      default: [1],
    },
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
