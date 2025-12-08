const express = require('express');
const { z } = require('zod');
const Report = require('../models/Report');
const auth = require('../middleware/auth');
const { requireAdmin } = require('../middleware/auth');
const router = express.Router();
const jwt = require('jsonwebtoken');

const reportSchema = z.object({
  questionId: z.string().min(1),
  questionText: z.string().optional(),
  bookSlug: z.string().optional(),
  chapterSlug: z.string().optional(),
  reportType: z.enum(['Wrong Answer', 'Incorrect Question', 'Formatting Issue', 'Missing Data', 'Other']),
  comment: z.string().max(1000).optional(),
  reporterName: z.string().optional(),
  reporterEmail: z.string().email().optional(),
});

// Submit a report (can be anonymous or authenticated)
// Optional auth middleware - doesn't fail if no token
router.post('/', async (req, res, next) => {
  try {
    console.log('Report submission received:', req.body);
    const validatedData = reportSchema.parse(req.body);
    
    // Validate that if reportType is "Other", comment must be provided
    if (validatedData.reportType === 'Other' && (!validatedData.comment || validatedData.comment.trim().length === 0)) {
      return res.status(400).json({ error: 'Comment is required when report type is "Other"' });
    }

    // Try to get user info from token if provided (optional authentication)
    let userId = null;
    let reporterName = validatedData.reporterName || null;
    let reporterEmail = validatedData.reporterEmail || null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key');
        userId = decoded.id;
        reporterName = decoded.username || null;
        reporterEmail = decoded.email || null;
      } catch (tokenError) {
        // Token invalid or expired, but continue as anonymous
        console.log('Optional token validation failed, proceeding as anonymous:', tokenError.message);
      }
    }

    const report = await Report.create({
      ...validatedData,
      reportedBy: userId,
      reporterName,
      reporterEmail
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

// Get all reports (admin only) with pagination and filters
router.get('/', auth, requireAdmin, async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page || '1', 10));
    const limit = Math.min(100, parseInt(req.query.limit || '20', 10));
    const skip = (page - 1) * limit;

    const query = {};
    
    // Filter by status
    if (req.query.status) {
      const validStatuses = ['pending', 'reviewed', 'resolved', 'dismissed'];
      if (validStatuses.includes(req.query.status)) {
        query.status = req.query.status;
      }
    }

    // Filter by report type
    if (req.query.reportType) {
      query.reportType = req.query.reportType;
    }

    // Search by question ID or text
    if (req.query.search) {
      query.$or = [
        { questionId: { $regex: req.query.search, $options: 'i' } },
        { questionText: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const [reports, total] = await Promise.all([
      Report.find(query)
        .populate('reportedBy', 'username email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Report.countDocuments(query)
    ]);

    res.json({
      reports,
      total,
      page,
      pages: Math.ceil(total / limit)
    });
  } catch (err) {
    next(err);
  }
});

// Get a single report by ID (admin only)
router.get('/:id', auth, requireAdmin, async (req, res, next) => {
  try {
    const report = await Report.findById(req.params.id)
      .populate('reportedBy', 'username email')
      .lean();
    
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }
    
    res.json({ report });
  } catch (err) {
    next(err);
  }
});

// Update report status (admin only)
router.put('/:id/status', auth, requireAdmin, async (req, res, next) => {
  try {
    const statusSchema = z.object({
      status: z.enum(['pending', 'reviewed', 'resolved', 'dismissed'])
    });
    
    const { status } = statusSchema.parse(req.body);
    
    const report = await Report.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('reportedBy', 'username email');
    
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }
    
    res.json({ 
      message: 'Report status updated successfully',
      report 
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.errors[0].message });
    }
    next(err);
  }
});

// Delete a report (admin only)
router.delete('/:id', auth, requireAdmin, async (req, res, next) => {
  try {
    const report = await Report.findByIdAndDelete(req.params.id);
    
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }
    
    res.json({ message: 'Report deleted successfully' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

