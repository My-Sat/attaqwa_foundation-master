const mongoose = require('mongoose');
const { Schema } = mongoose;

const liveClassStateSchema = new Schema(
  {
    isLive: {
      type: Boolean,
      default: false,
    },
    activeSessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ClassSession',
      default: null,
    },
    roomName: {
      type: String,
      default: '',
    },
    startedAt: {
      type: Date,
      default: null,
    },
    endedAt: {
      type: Date,
      default: null,
    },
    startedByName: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('LiveClassState', liveClassStateSchema);
