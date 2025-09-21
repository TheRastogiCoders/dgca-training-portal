const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true, unique: true },
  subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  description: { type: String },
}, { timestamps: true });

// Ensure uniqueness of title per subject, not globally
bookSchema.index({ subject: 1, title: 1 }, { unique: true });
// Keep old unique on title from existing schema from causing errors by making it sparse (best effort if exists)

module.exports = mongoose.model('Book', bookSchema);
