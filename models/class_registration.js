const mongoose = require('mongoose');
const { Schema } = mongoose;

const registrationSchema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    classSessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ClassSession',
      required: true,
    },
    paymentReference: {
      type: String,
      required: true,
    },
    paymentMethod: {
      type: String,
      default: 'Other',
    },
    sessionPrice: {
      type: Number,
      min: 0,
      default: 0,
    },
    approved: {
      type: Boolean,
      default: false,
    },
    approvedAt: {
      type: Date,
    },
    accessExpiresAt: {
      type: Date,
    },
    accessExpiryReminder24hSentAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Registration', registrationSchema);
