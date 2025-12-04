const express = require('express');
const { z } = require('zod');
const User = require('../models/User');
const Log = require('../models/Log');
const Result = require('../models/Result');
const auth = require('../middleware/auth');
const { requireAdmin } = require('../middleware/auth');
const fs = require('fs');
const path = require('path');

const router = express.Router();

// Optional host guard: only allow if ADMIN_HOST matches Host header (disabled for now)
// router.use((req, res, next) => {
//   const adminHost = process.env.ADMIN_HOST;
//   if (adminHost) {
//     const host = req.headers.host || '';
//     if (!host.startsWith(adminHost)) {
//       return res.status(403).json({ message: 'Admin API restricted to admin domain' });
//     }
//   }
//   next();
// });

// All routes below require admin auth
router.use(auth, requireAdmin);

// Users list (simple endpoint)
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Failed to fetch users', error: error.message });
  }
});

// Update user admin flag
router.put('/users/:id/role', async (req, res, next) => {
  try {
    const body = z.object({ isAdmin: z.boolean() }).parse(req.body);
    const user = await User.findByIdAndUpdate(req.params.id, { isAdmin: body.isAdmin }, { new: true }).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    next(err);
  }
});

// Delete user
router.delete('/users/:id', async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json({ message: 'Deleted' });
});

// Logs - basic listing with pagination
router.get('/logs', async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page || '1', 10));
  const limit = Math.min(200, parseInt(req.query.limit || '20', 10));
  const skip = (page - 1) * limit;

  const query = {};
  // Text search on URL and method
  if (req.query.q) {
    const q = String(req.query.q).trim();
    query.$or = [
      { url: { $regex: q, $options: 'i' } },
      { method: { $regex: q, $options: 'i' } },
    ];
  }
  if (req.query.method) {
    query.method = String(req.query.method).toUpperCase();
  }
  if (req.query.status) {
    const status = parseInt(String(req.query.status), 10);
    if (!Number.isNaN(status)) query.status = status;
  }
  if (req.query.user) {
    query.userId = req.query.user;
  }
  // Optional date range
  if (req.query.from || req.query.to) {
    query.createdAt = {};
    if (req.query.from) query.createdAt.$gte = new Date(req.query.from);
    if (req.query.to) query.createdAt.$lte = new Date(req.query.to);
  }

  const [items, total] = await Promise.all([
    Log.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Log.countDocuments(query),
  ]);
  res.json({ items, total, page, pages: Math.ceil(total / limit) });
});

// Analytics - simple counts
router.get('/stats', async (req, res) => {
  const [users, logs, results] = await Promise.all([
    User.countDocuments(),
    Log.countDocuments(),
    Result.countDocuments(),
  ]);
  res.json({ users, logs, results });
});

// Results - list with pagination and basic filters
router.get('/results', async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page || '1', 10));
  const limit = Math.min(100, parseInt(req.query.limit || '20', 10));
  const skip = (page - 1) * limit;
  const query = {};
  if (req.query.subject) query.subject = req.query.subject;
  if (req.query.user) query.user = req.query.user;
  const [items, total] = await Promise.all([
    Result.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('user', 'username email')
      .populate('subject', 'name')
      .populate('book', 'title')
      .lean(),
    Result.countDocuments(query),
  ]);
  res.json({ items, total, page, pages: Math.ceil(total / limit) });
});

// Get all users with their last activity
router.get('/users/all', async (req, res) => {
  try {
    console.log('[Admin] Fetching all users...');
    
    // Get all users
    const allUsers = await User.find().select('-password').sort({ createdAt: -1 }).lean();
    console.log(`[Admin] Found ${allUsers?.length || 0} users in database`);
    
    if (!allUsers || allUsers.length === 0) {
      console.log('[Admin] No users found, returning empty array');
      return res.json({
        total: 0,
        active: 0,
        users: []
      });
    }
    
    // Get last activity for each user from logs
    const userIds = allUsers.map(u => u._id);
    let lastActivities = [];
    
    if (userIds.length > 0) {
      try {
        lastActivities = await Log.aggregate([
          {
            $match: {
              userId: { $in: userIds, $exists: true, $ne: null }
            }
          },
          {
            $group: {
              _id: '$userId',
              lastActivity: { $max: '$createdAt' }
            }
          }
        ]);
      } catch (logError) {
        console.warn('Error fetching logs (continuing without activity data):', logError.message);
        // Continue without activity data
      }
    }

    // Create a map of userId to lastActivity
    const activityMap = new Map();
    lastActivities.forEach(activity => {
      if (activity && activity._id) {
        activityMap.set(activity._id.toString(), activity.lastActivity);
      }
    });

    // Add last activity to each user
    const usersWithActivity = allUsers.map(user => {
      const userId = user._id ? user._id.toString() : null;
      const lastActivity = userId ? (activityMap.get(userId) || user.createdAt || null) : (user.createdAt || null);
      
      return {
        _id: user._id,
        id: user._id,
        username: user.username || 'N/A',
        email: user.email || 'N/A',
        isAdmin: user.isAdmin || false,
        isActive: user.isActive !== undefined ? user.isActive : true,
        createdAt: user.createdAt || null,
        updatedAt: user.updatedAt || null,
        lastActivity: lastActivity
      };
    });

    // Separate active users (activity in last 30 minutes)
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
    const activeUsers = usersWithActivity.filter(user => {
      if (!user.lastActivity) return false;
      try {
        return new Date(user.lastActivity) >= thirtyMinutesAgo;
      } catch (e) {
        return false;
      }
    });
    
    console.log(`[Admin] Returning ${usersWithActivity.length} users (${activeUsers.length} active)`);
    
    res.json({
      total: usersWithActivity.length,
      active: activeUsers.length,
      users: usersWithActivity
    });
  } catch (error) {
    console.error('[Admin] Error fetching all users:', error);
    console.error('[Admin] Error stack:', error.stack);
    res.status(500).json({ 
      message: 'Failed to fetch users', 
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : 'Check server logs for details'
    });
  }
});

// Get active/logged-in users (users with activity in last 30 minutes)
router.get('/users/active', async (req, res) => {
  try {
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
    
    // Get recent logs with user IDs
    const recentLogs = await Log.find({
      userId: { $exists: true, $ne: null },
      createdAt: { $gte: thirtyMinutesAgo }
    })
      .select('userId createdAt')
      .populate('userId', 'username email isAdmin createdAt')
      .sort({ createdAt: -1 })
      .lean();

    // Get unique active users
    const activeUserMap = new Map();
    recentLogs.forEach(log => {
      if (log.userId && log.userId._id) {
        const userId = log.userId._id.toString();
        if (!activeUserMap.has(userId)) {
          activeUserMap.set(userId, {
            ...log.userId,
            lastActivity: log.createdAt
          });
        } else {
          // Update last activity if this log is more recent
          const existing = activeUserMap.get(userId);
          if (log.createdAt > existing.lastActivity) {
            existing.lastActivity = log.createdAt;
          }
        }
      }
    });

    const activeUsers = Array.from(activeUserMap.values());
    
    res.json({
      count: activeUsers.length,
      users: activeUsers.sort((a, b) => new Date(b.lastActivity) - new Date(a.lastActivity))
    });
  } catch (error) {
    console.error('Error fetching active users:', error);
    res.status(500).json({ message: 'Failed to fetch active users', error: error.message });
  }
});

// Get all books and chapters organized by subject (for admin question upload)
router.get('/books-structure', async (req, res) => {
  try {
    const fs = require('fs');
    const path = require('path');
    
    // Read practice books
    const practiceBooksPath = path.join(__dirname, '..', 'practiceBooks.json');
    const booksPath = path.join(__dirname, '..', 'data', 'books.json');
    const chaptersPath = path.join(__dirname, '..', 'data', 'chapters.json');
    
    const practiceBooks = fs.existsSync(practiceBooksPath) 
      ? JSON.parse(fs.readFileSync(practiceBooksPath, 'utf-8'))
      : { books: [] };
    
    const books = fs.existsSync(booksPath)
      ? JSON.parse(fs.readFileSync(booksPath, 'utf-8'))
      : [];
    
    const chapters = fs.existsSync(chaptersPath)
      ? JSON.parse(fs.readFileSync(chaptersPath, 'utf-8'))
      : [];
    
    // Organize by subject
    const subjects = {
      'air-regulations': { name: 'Air Regulations', books: [] },
      'air-navigation': { name: 'Air Navigation', books: [] },
      'meteorology': { name: 'Meteorology', books: [] },
      'technical-general': { name: 'Technical General', books: [] },
      'technical-specific': { name: 'Technical Specific', books: [] },
      'radio-telephony': { name: 'Radio Telephony (RTR)-A', books: [] }
    };
    
    // Process practice books
    if (practiceBooks.books && Array.isArray(practiceBooks.books)) {
      practiceBooks.books.forEach(book => {
        if (book.subjects && Array.isArray(book.subjects)) {
          book.subjects.forEach(subjectSlug => {
            if (subjects[subjectSlug]) {
              // Get chapters for this book
              const bookChapters = [];
              try {
                const chaptersFilePath = path.join(__dirname, '..', 'data', 'chapters', `${book.slug}.json`);
                if (fs.existsSync(chaptersFilePath)) {
                  const chaptersData = JSON.parse(fs.readFileSync(chaptersFilePath, 'utf-8'));
                  if (chaptersData.chapters && Array.isArray(chaptersData.chapters)) {
                    bookChapters.push(...chaptersData.chapters.map(ch => ({
                      id: ch.id || ch.slug,
                      slug: ch.slug || ch.id,
                      title: ch.title || ch.name,
                      questionCount: ch.questionCount || 0
                    })));
                  }
                }
              } catch (err) {
                console.warn(`Error loading chapters for ${book.slug}:`, err.message);
              }
              
              subjects[subjectSlug].books.push({
                slug: book.slug,
                title: book.title,
                description: book.description,
                chapters: bookChapters
              });
            }
          });
        }
      });
    }
    
    // Process regular books
    books.forEach(book => {
      const subjectSlug = (book.subject || '').toLowerCase().replace(/\s+/g, '-');
      if (subjects[subjectSlug]) {
        const bookChapters = (book.chapters || []).map(ch => ({
          id: ch.id,
          slug: ch.id,
          title: ch.name || ch.title,
          questionCount: 0
        }));
        
        subjects[subjectSlug].books.push({
          slug: book.id,
          title: book.name,
          description: book.author || '',
          chapters: bookChapters
        });
      }
    });
    
    // Get PYQ sessions structure
    const pyqSessions = {
      'air-regulations': [
        { slug: 'olode-may-2025-reg', title: 'REG- OLODE MAY SESSION 2025' },
        { slug: 'regular-session-01-2025-reg', title: 'REG- REGULAR SESSION 01 2025' },
        { slug: 'olode-session-2-2025-reg', title: 'Regulations olode session 2 2025' },
        { slug: 'january-ondemand-2025-reg', title: 'JANUARY ON-DEMAND 2025' },
        { slug: 'olode-05-2025-reg', title: 'Regulations OLODE 05 2025' },
        { slug: 'olode-april-session-regulation-reg', title: 'OLODE APRIL SESSION REGULATION' },
        { slug: 'regulations-june-2025', title: 'REGULATIONS JUNE 2025' }
      ],
      'meteorology': [
        { slug: 'olode-session-07-2025', title: 'OLODE SESSION 07 2025' },
        { slug: 'olode-may-2025', title: 'OLODE MAY 2025 SESSION' },
        { slug: 'olode-nov-2024-session', title: 'OLODE NOV 2024 SESSION' },
        { slug: 'regular-march-2025', title: 'MARCH 2025 REGULAR' },
        { slug: 'regular-march-2024', title: 'MARCH 2024 REGULAR' },
        { slug: 'regular-december-attempt', title: 'DEC 2024 REGULAR' },
        { slug: 'regular-sep-2023', title: 'SEP 2023 REGULAR' },
        { slug: 'regular-june-session', title: 'JUNE 2024 REGULAR' }
      ],
      'air-navigation': [
        { slug: 'nav-regular-march-2025', title: 'NAV- REGULAR MARCH 2025' },
        { slug: 'nav-regular-june-exam', title: 'NAV- REGULAR JUNE EXAM' },
        { slug: 'nav-olode-session1-jan-2025', title: 'NAV- OLODE SESSION1 JAN 2025' },
        { slug: 'nav-olode-session3-2025', title: 'NAV- OLODE SESSION3 2025' },
        { slug: 'nav-regular-december-2024', title: 'NAV- REGULAR DECEMBER 2024' }
      ],
      'technical-general': [
        { slug: 'tech-regular-march-2025', title: 'TECHNICAL REGULAR MARCH 2025' },
        { slug: 'tech-regular-december-2024', title: 'TECHNICAL REGULAR DECEMBER 2024' },
        { slug: 'tech-general-march-2024', title: 'TECHNICAL GENERAL MARCH 2024' },
        { slug: 'gen-olode-may-2025', title: 'Technical Questions OLODE MAY 2025' },
        { slug: 'gen-olode-jan-2025-session1', title: 'Technical General OLODE 01 Session JAN 2025' },
        { slug: 'gen-regular-june-2025-session2', title: 'TECHNICAL Regular session 02 of 2025' }
      ]
    };
    
    res.json({
      subjects: Object.entries(subjects).map(([slug, data]) => ({
        slug,
        name: data.name,
        books: data.books
      })),
      pyqSessions
    });
  } catch (error) {
    console.error('Error fetching books structure:', error);
    res.status(500).json({ 
      message: 'Failed to fetch books structure', 
      error: error.message 
    });
  }
});

// Upload questions endpoint
router.post('/questions/upload', async (req, res) => {
  try {
    const { subject, uploadType, book, bookSlug, chapter, chapterSlug, pyqSession, pyqSessionTitle, questions } = req.body;

    if (!subject || !questions || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ 
        message: 'Subject and questions array are required' 
      });
    }

    // Determine file path based on upload type
    const dataDir = path.join(__dirname, '..', '..', 'client', 'src', 'data');
    let filePath;
    let questionData;

    if (uploadType === 'pyq') {
      // PYQ Session upload
      if (!pyqSession) {
        return res.status(400).json({ 
          message: 'PYQ session is required' 
        });
      }

      const subjectSlug = subject.toLowerCase().replace(/\s+/g, '-');
      const filename = `${subjectSlug}-${pyqSession}.json`;
      filePath = path.join(dataDir, filename);

      // Format for PYQ session (similar to existing PYQ JSON structure)
      questionData = {
        book_name: pyqSessionTitle || pyqSession,
        chapter_title: pyqSessionTitle || pyqSession,
        questions: questions.map(q => ({
          question_text: q.question || q.question_text || q.text,
          options: q.options || [],
          answer: q.solution || q.answer || q.correctAnswer
        }))
      };
    } else {
      // Book Chapter upload
      if (!bookSlug || !chapterSlug) {
        return res.status(400).json({ 
          message: 'Book slug and chapter slug are required for book chapter uploads' 
        });
      }

      const subjectSlug = subject.toLowerCase().replace(/\s+/g, '-');
      const filename = `${subjectSlug}-${bookSlug}-${chapterSlug}.json`;
      filePath = path.join(dataDir, filename);

      // Format for book chapter
      questionData = {
        book_name: book || bookSlug,
        chapter_title: chapter || chapterSlug,
        chapter_slug: chapterSlug,
        questions: questions.map(q => ({
          question_text: q.question || q.question_text || q.text,
          options: q.options || [],
          answer: q.solution || q.answer || q.correctAnswer
        }))
      };
    }

    // Ensure data directory exists
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // Check if file exists and merge questions if needed
    let existingQuestions = [];
    if (fs.existsSync(filePath)) {
      try {
        const existingData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        if (existingData.questions && Array.isArray(existingData.questions)) {
          existingQuestions = existingData.questions;
        }
      } catch (err) {
        console.warn('Could not read existing file, will create new one:', err.message);
      }
    }

    // Merge with existing questions (append new ones)
    questionData.questions = [...existingQuestions, ...questionData.questions];

    // Write to file
    fs.writeFileSync(filePath, JSON.stringify(questionData, null, 2), 'utf8');

    res.json({
      message: `Successfully uploaded ${questions.length} question(s)${existingQuestions.length > 0 ? ` (${existingQuestions.length} existing questions preserved)` : ''}`,
      filePath: filePath,
      questionCount: questionData.questions.length,
      newQuestions: questions.length,
      existingQuestions: existingQuestions.length
    });
  } catch (error) {
    console.error('Error uploading questions:', error);
    res.status(500).json({ 
      message: 'Failed to upload questions', 
      error: error.message 
    });
  }
});

module.exports = router;


