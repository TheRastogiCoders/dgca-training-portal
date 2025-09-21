const express = require('express');
const { z } = require('zod');
const Result = require('../models/Result');
const auth = require('../middleware/auth');
const router = express.Router();

const resultSchema = z.object({
  // For traditional tests
  subject: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
  book: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
  // For AI practice tests
  testType: z.enum(['book', 'admin', 'ai']).default('book'),
  subjectName: z.string().optional(),
  bookName: z.string().optional(),
  chapterName: z.string().optional(),
  // Common fields
  score: z.number().min(0),
  total: z.number().min(1),
  timeSpent: z.number().min(0).default(0),
  difficulty: z.string().default('medium'),
  answers: z.array(z.object({
    // For traditional tests
    question: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
    // For AI tests
    questionText: z.string().optional(),
    selected: z.string().min(1),
    correct: z.boolean(),
    explanation: z.string().optional(),
  })).min(1),
});

// More lenient schema for AI tests
const aiResultSchema = z.object({
  testType: z.literal('ai'),
  subjectName: z.string().optional().default('Unknown Subject'),
  bookName: z.string().optional().default('Unknown Book'),
  chapterName: z.string().optional().default('Unknown Chapter'),
  score: z.number().min(0),
  total: z.number().min(1),
  timeSpent: z.number().min(0).default(0),
  difficulty: z.string().default('medium'),
  answers: z.array(z.object({
    questionText: z.string().optional().default('Question text not available'),
    selected: z.string().optional().default(''),
    correct: z.boolean(),
    explanation: z.string().optional(),
  })).min(1),
});

// Test endpoint to verify API is working
router.get('/test', (req, res) => {
  res.json({ message: 'Results API is working', timestamp: new Date().toISOString() });
});

// Test database connection
router.get('/test-db', async (req, res) => {
  try {
    const count = await Result.countDocuments();
    res.json({ 
      message: 'Database connection working', 
      totalResults: count,
      timestamp: new Date().toISOString() 
    });
  } catch (error) {
    res.status(500).json({ error: 'Database connection failed', details: error.message });
  }
});

// Get all results for logged-in user
router.get('/', auth, async (req, res) => {
  try {
    console.log('=== RESULTS API CALL ===');
    console.log('User ID from token:', req.user.id);
    console.log('User data:', req.user);
    
    const results = await Result.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .populate('subject')
      .populate('book')
      .populate('answers.question');
    
    console.log('Found results in DB:', results.length);
    console.log('Raw results:', results.map(r => ({ 
      id: r._id, 
      user: r.user, 
      testType: r.testType, 
      score: r.score, 
      total: r.total,
      subjectName: r.subjectName,
      createdAt: r.createdAt
    })));
    
    // Transform results to include subject name for AI tests
    const transformedResults = results.map(result => ({
      ...result.toObject(),
      subject: result.subject || { name: result.subjectName || 'Unknown Subject' },
      book: result.book || { name: result.bookName || 'Unknown Book' }
    }));
    
    console.log('Transformed results:', transformedResults.length);
    console.log('Sending response with', transformedResults.length, 'results');
    res.json(transformedResults);
  } catch (error) {
    console.error('Error fetching results:', error);
    res.status(500).json({ error: 'Failed to fetch results', details: error.message });
  }
});

// Save a new result
router.post('/', auth, async (req, res, next) => {
  try {
    console.log('Received result data:', req.body);
    
    let validatedData;
    if (req.body.testType === 'ai') {
      validatedData = aiResultSchema.parse(req.body);
    } else {
      validatedData = resultSchema.parse(req.body);
    }
    
    console.log('Validated data:', validatedData);
    
    const result = await Result.create({ 
      user: req.user.id, 
      ...validatedData 
    });
    
    console.log('Created result:', result);
    res.status(201).json(result);
  } catch (err) {
    console.error('Error saving result:', err);
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
