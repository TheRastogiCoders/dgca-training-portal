const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
  text: { type: String, required: true },
  options: [{ type: String, required: true }],
  answer: { type: String, required: true },
  explanation: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Question', questionSchema);
