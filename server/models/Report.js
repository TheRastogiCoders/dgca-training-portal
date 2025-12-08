const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  questionId: { type: String, required: true },
  questionText: { type: String },
  bookSlug: { type: String },
  chapterSlug: { type: String },
  reportType: { 
    type: String, 
    required: true,
    enum: ['Wrong Answer', 'Incorrect Question', 'Formatting Issue', 'Missing Data', 'Other']
  },
  comment: { type: String },
  reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  // Store denormalized reporter info to display even if user record is missing/unavailable
  reporterName: { type: String },
  reporterEmail: { type: String },
  status: { 
    type: String, 
    enum: ['pending', 'reviewed', 'resolved', 'dismissed'],
    default: 'pending'
  },
}, { timestamps: true });

module.exports = mongoose.model('Report', reportSchema);

