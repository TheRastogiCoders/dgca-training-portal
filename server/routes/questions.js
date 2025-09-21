const express = require('express');
const { z } = require('zod');
const Question = require('../models/Question');
const auth = require('../middleware/auth');
const { requireAdmin } = require('../middleware/auth');
const { cache, invalidateCache } = require('../middleware/cache');
const cacheService = require('../utils/cache');
const router = express.Router();

const questionSchema = z.object({
  subject: z.string().regex(/^[0-9a-fA-F]{24}$/),
  book: z.string().regex(/^[0-9a-fA-F]{24}$/),
  text: z.string().min(1).max(5000),
  options: z.array(z.string().min(1)).min(2).max(10),
  answer: z.string().min(1),
  explanation: z.string().max(5000).optional().or(z.literal('')),
});

// Get all questions with caching
router.get('/', cache(300, (req) => {
  const page = req.query.page || '1';
  const limit = req.query.limit || '20';
  const filters = req.query;
  return cacheService.constructor.generateKey('questions', page, limit, JSON.stringify(filters));
}), async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page || '1', 10));
    const limit = Math.min(100, parseInt(req.query.limit || '20', 10));
    const skip = (page - 1) * limit;
    
    const [items, total] = await Promise.all([
      Question.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('subject')
        .populate('book'),
      Question.countDocuments(),
    ]);
    
    res.json({ 
      items, 
      total, 
      page, 
      pages: Math.ceil(total / limit),
      cached: false // This will be set to true by cache middleware if served from cache
    });
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
});

// Create question with cache invalidation
router.post('/', auth, requireAdmin, invalidateCache('questions:*'), async (req, res, next) => {
  try {
    const { subject, book, text, options, answer, explanation } = questionSchema.parse(req.body);
    const question = await Question.create({ subject, book, text, options, answer, explanation });
    
    // Invalidate related caches
    await cacheService.del('questions:*');
    await cacheService.del('stats:questions');
    
    res.status(201).json(question);
  } catch (err) {
    next(err);
  }
});

// Update question
router.put('/:id', auth, requireAdmin, async (req, res, next) => {
  try {
    const { subject, book, text, options, answer, explanation } = questionSchema.partial().parse(req.body);
    const question = await Question.findByIdAndUpdate(
      req.params.id,
      { subject, book, text, options, answer, explanation },
      { new: true }
    );
    if (!question) return res.status(404).json({ message: 'Not found' });
    res.json(question);
  } catch (err) {
    next(err);
  }
});

// Delete question
router.delete('/:id', auth, requireAdmin, async (req, res) => {
  const question = await Question.findByIdAndDelete(req.params.id);
  if (!question) return res.status(404).json({ message: 'Not found' });
  res.json({ message: 'Deleted' });
});

module.exports = router;
