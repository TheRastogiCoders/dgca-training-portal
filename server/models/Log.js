const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
  method: String,
  url: String,
  status: Number,
  ip: String,
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  userAgent: String,
  responseMs: Number,
  meta: Object,
}, { timestamps: true });

module.exports = mongoose.model('Log', logSchema);


