const mongoose = require('mongoose');
const { Schema } = mongoose;

const registrationSchema = new Schema({
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
  momoReferenceName: {
    type: String,
    required: true,
  },
  accessCode: {
    type: String,
    unique: true,
    sparse: true,
  },
  accessCodeAssigned: {
    type: Boolean,
    default: false,
  },
  codeExpiration: {
    type: Date,
  },
});

module.exports = mongoose.model('Registration', registrationSchema);
