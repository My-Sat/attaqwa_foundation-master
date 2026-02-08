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
  },
  { timestamps: true }
);

module.exports = mongoose.model('Registration', registrationSchema);
