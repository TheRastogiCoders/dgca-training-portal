const express = require('express');
const { z } = require('zod');
const Report = require('../models/Report');
const auth = require('../middleware/auth');
const router = express.Router();

const reportSchema = z.object({
  questionId: z.string().min(1),
  questionText: z.string().optional(),
  bookSlug: z.string().optional(),
  chapterSlug: z.string().optional(),
  reportType: z.enum(['Wrong Answer', 'Incorrect Question', 'Formatting Issue', 'Missing Data', 'Other']),
  comment: z.string().max(1000).optional(),
});

// Submit a report (can be anonymous or authenticated)
router.post('/', async (req, res, next) => {
  try {
    console.log('Report submission received:', req.body);
    const validatedData = reportSchema.parse(req.body);
    
    // Validate that if reportType is "Other", comment must be provided
    if (validatedData.reportType === 'Other' && (!validatedData.comment || validatedData.comment.trim().length === 0)) {
      return res.status(400).json({ error: 'Comment is required when report type is "Other"' });
    }

    // Get user ID if authenticated (try to get from token if available)
    let userId = null;
    if (req.user && req.user.id) {
      userId = req.user.id;
    }

    const report = await Report.create({
      ...validatedData,
      reportedBy: userId,
    });

    console.log('Report created successfully:', report._id);

    res.status(201).json({ 
      message: 'Report submitted successfully',
      report: {
        id: report._id,
        reportType: report.reportType,
        status: report.status
      }
    });
  } catch (err) {
    console.error('Error in report submission:', err);
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.errors[0].message });
    }
    // Handle MongoDB connection errors gracefully
    if (err.name === 'MongoServerError' || err.name === 'MongooseError') {
      return res.status(503).json({ error: 'Database temporarily unavailable. Please try again later.' });
    }
    next(err);
  }
});

// Get all reports (admin only - optional for future use)
router.get('/', auth, async (req, res, next) => {
  try {
    // Check if user is admin (you may need to adjust this based on your auth setup)
    const reports = await Report.find()
      .populate('reportedBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(100);
    
    res.json({ reports });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

