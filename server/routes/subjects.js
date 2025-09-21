const express = require('express');
const { z } = require('zod');
const Subject = require('../models/Subject');
const auth = require('../middleware/auth');
const { requireAdmin } = require('../middleware/auth');
const router = express.Router();

const subjectSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(1000).optional().or(z.literal('')),
});

// Get all subjects
router.get('/', async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page || '1', 10));
  const limit = Math.min(100, parseInt(req.query.limit || '20', 10));
  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    Subject.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
    Subject.countDocuments(),
  ]);
  res.json({ items, total, page, pages: Math.ceil(total / limit) });
});

// Create subject
router.post('/', auth, requireAdmin, async (req, res, next) => {
  try {
    const { name, description } = subjectSchema.parse(req.body);
  const exists = await Subject.findOne({ name });
  if (exists) return res.status(400).json({ message: 'Subject already exists' });
  const subject = await Subject.create({ name, description });
  res.status(201).json(subject);
  } catch (err) {
    next(err);
  }
});

// Update subject
router.put('/:id', auth, requireAdmin, async (req, res, next) => {
  try {
    const { name, description } = subjectSchema.partial().parse(req.body);
    const subject = await Subject.findByIdAndUpdate(req.params.id, { name, description }, { new: true });
    if (!subject) return res.status(404).json({ message: 'Not found' });
    res.json(subject);
  } catch (err) {
    next(err);
  }
});

// Delete subject
router.delete('/:id', auth, requireAdmin, async (req, res) => {
  const subject = await Subject.findByIdAndDelete(req.params.id);
  if (!subject) return res.status(404).json({ message: 'Not found' });
  res.json({ message: 'Deleted' });
});

module.exports = router;
