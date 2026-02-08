const mongoose = require('mongoose');
const { Schema } = mongoose;

const liveStreamScheduleSchema = new Schema(
  {
    startsAt: {
      type: Date,
      default: null,
    },
    note: {
      type: String,
      default: '',
      trim: true,
    },
    updatedByName: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('LiveStreamSchedule', liveStreamScheduleSchema);
