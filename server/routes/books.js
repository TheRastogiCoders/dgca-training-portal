const express = require('express');
const { z } = require('zod');
const Book = require('../models/Book');
const auth = require('../middleware/auth');
const { requireAdmin } = require('../middleware/auth');
const router = express.Router();

const bookSchema = z.object({
  title: z.string().min(1).max(300),
  subject: z.string().regex(/^[0-9a-fA-F]{24}$/),
  description: z.string().max(2000).optional().or(z.literal('')),
});

// Get all books
router.get('/', async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page || '1', 10));
  const limit = Math.min(100, parseInt(req.query.limit || '20', 10));
  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    Book.find().sort({ createdAt: -1 }).skip(skip).limit(limit).populate('subject'),
    Book.countDocuments(),
  ]);
  res.json({ items, total, page, pages: Math.ceil(total / limit) });
});

// Create book
router.post('/', auth, requireAdmin, async (req, res, next) => {
  try {
    const { title, subject, description } = bookSchema.parse(req.body);
    const exists = await Book.findOne({ title, subject });
    if (exists) return res.status(400).json({ message: 'Book already exists' });
    const book = await Book.create({ title, subject, description });
    res.status(201).json(book);
  } catch (err) {
    next(err);
  }
});

// Update book
router.put('/:id', auth, requireAdmin, async (req, res, next) => {
  try {
    const { title, subject, description } = bookSchema.partial().parse(req.body);
    const book = await Book.findByIdAndUpdate(req.params.id, { title, subject, description }, { new: true });
    if (!book) return res.status(404).json({ message: 'Not found' });
    res.json(book);
  } catch (err) {
    next(err);
  }
});

// Delete book
router.delete('/:id', auth, requireAdmin, async (req, res) => {
  const book = await Book.findByIdAndDelete(req.params.id);
  if (!book) return res.status(404).json({ message: 'Not found' });
  res.json({ message: 'Deleted' });
});

module.exports = router;
