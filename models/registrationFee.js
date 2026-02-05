// models/RegistrationFee.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const registrationFeeSchema = new Schema({
  amount: {
    type: Number,
    required: true,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('RegistrationFee', registrationFeeSchema);
