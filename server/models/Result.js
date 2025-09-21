const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  // For traditional tests
  subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject' },
  book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book' },
  // For AI practice tests
  testType: { type: String, enum: ['book', 'admin', 'ai'], default: 'book' },
  subjectName: { type: String }, // For AI tests
  bookName: { type: String }, // For AI tests
  chapterName: { type: String }, // For AI tests
  // Common fields
  score: { type: Number, required: true },
  total: { type: Number, required: true },
  timeSpent: { type: Number, default: 0 }, // in seconds
  difficulty: { type: String, default: 'medium' },
  answers: [{
    // For traditional tests
    question: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
    // For AI tests
    questionText: { type: String },
    selected: { type: String, required: true },
    correct: { type: Boolean, required: true },
    explanation: { type: String }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Result', resultSchema);
