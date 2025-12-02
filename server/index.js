const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
// const csrf = require('csurf');
// const mongoSanitize = require('express-mongo-sanitize');
// const { body, validationResult } = require('express-validator');
// const swaggerUi = require('swagger-ui-express');
// const swaggerSpecs = require('./config/swagger');
require('dotenv').config();
const path = require('path');
const fs = require('fs');
const { resolvePracticeQuestionFile } = require('./utils/practiceQuestions');

const authRoutes = require('./routes/auth');
const subjectRoutes = require('./routes/subjects');
const bookRoutes = require('./routes/books');
const questionRoutes = require('./routes/questions');
const resultRoutes = require('./routes/results');
const noteRoutes = require('./routes/notes');
const reportRoutes = require('./routes/reports');
const aiRoutes = require('./routes/ai');
const adminRoutes = require('./routes/admin');
const searchRoutes = require('./routes/search');
const Log = require('./models/Log');
const { ZodError } = require('zod');
// const { errorHandler, notFound } = require('./utils/errorHandler');

const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: [
        "'self'",
        "https://accounts.google.com",
        "https://apis.google.com"
      ],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://accounts.google.com", "https://oauth2.googleapis.com"],
    },
  },
  crossOriginEmbedderPolicy: false
}));

// CORS configuration - Allow all origins for development
app.use(cors({
  origin: true, // Allow all origins for development
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token']
}));

// Handle preflight
app.options('*', cors());

// Body parsing and sanitization
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// MongoDB injection protection
// app.use(mongoSanitize());

// CSRF protection (disabled for API routes, enabled for web routes)
// const csrfProtection = csrf({ cookie: true });
// app.use('/api', (req, res, next) => {
//   // Skip CSRF for API routes that use JWT
//   if (req.path.startsWith('/auth/login') || req.path.startsWith('/auth/register')) {
//     return next();
//   }
//   return csrfProtection(req, res, next);
// });
// Rate limiters - Simplified for development
const authLimiter = rateLimit({ 
  windowMs: 15 * 60 * 1000, 
  max: 100, 
  standardHeaders: true, 
  legacyHeaders: false,
  trustProxy: false // Disable proxy trust for development
});
const aiLimiter = rateLimit({ 
  windowMs: 60 * 1000, 
  max: 50, 
  standardHeaders: true, 
  legacyHeaders: false,
  trustProxy: false // Disable proxy trust for development
});
// Request logging (basic)
app.use(async (req, res, next) => {
  const start = Date.now();
  res.on('finish', async () => {
    try {
      await Log.create({
        method: req.method,
        url: req.originalUrl,
        status: res.statusCode,
        ip: req.ip,
        userId: req.user?.id,
        userAgent: req.headers['user-agent'],
        responseMs: Date.now() - start,
      });
    } catch (e) {}
  });
  next();
});

// MongoDB connection with better error handling
mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log('✅ MongoDB connected successfully'))
.catch(err => {
  console.error('❌ MongoDB connection error:', err.message);
  console.log('🔄 Server will continue without database connection');
  console.log('💡 To fix: Install MongoDB locally or update MONGODB_URI in .env');
});

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Swagger API Documentation
// app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs, {
//   explorer: true,
//   customCss: '.swagger-ui .topbar { display: none }',
//   customSiteTitle: 'VIMAANNA API Documentation'
// }));

// API routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/results', resultRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/ai', aiLimiter, aiRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/search', searchRoutes);

// Lightweight endpoint to serve practice books from JSON file
app.get('/api/practice-books', (req, res) => {
  try {
    const filePath = path.join(__dirname, 'practiceBooks.json');
    const raw = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(raw);
    const subject = (req.query.subject || '').toLowerCase();
    let items = Array.isArray(data.books) ? data.books : [];
    if (subject) {
      items = items.filter(b => Array.isArray(b.subjects) && b.subjects.includes(subject));
    }
    res.json({ items, total: items.length });
  } catch (err) {
    res.status(500).json({ message: 'Failed to load practice books' });
  }
});

// Dynamic chapter list with question counts per practice book
app.get('/api/practice-books/:book/chapters', (req, res) => {
  try {
    const rawBooks = fs.readFileSync(path.join(__dirname, 'data', 'books.json'), 'utf-8');
    const rawChapters = fs.readFileSync(path.join(__dirname, 'data', 'chapters.json'), 'utf-8');
    const books = JSON.parse(rawBooks);
    const chapters = JSON.parse(rawChapters);

    const bookSlug = (req.params.book || '').toLowerCase();

    const dbBook = books.find(b => (b.id || '').toLowerCase() === bookSlug);
    const attachedChapters = Array.isArray(dbBook?.chapters) ? dbBook.chapters : [];

    // Merge attached chapters (from books.json) with chapters.json metadata when available
    const merged = attachedChapters.map(ch => {
      const chapterMeta = chapters.find(c => c.id === ch.id && c.bookId === dbBook.id) || {};
      const title = chapterMeta.name || ch.name;
      const slugFromMeta = chapterMeta.slug;
      const inferredSlug = (title || '')
        .toLowerCase()
        .replace(/\(([^)]+)\)/g, (_m, acronym) => `-${acronym.toLowerCase()}`)
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      const effectiveSlug = (slugFromMeta || inferredSlug || '').toLowerCase();

      return {
        id: ch.id,
        title,
        slug: effectiveSlug,
      };
    });

    const chaptersWithCounts = merged.map(ch => {
      const { filePath } = resolvePracticeQuestionFile(bookSlug, ch.slug);
      if (!filePath) {
        return { ...ch, questionCount: 0 };
      }
      try {
        const raw = fs.readFileSync(filePath, 'utf-8');
        const data = JSON.parse(raw);
        const questionCount = Array.isArray(data.questions) ? data.questions.length : 0;
        return { ...ch, questionCount };
      } catch {
        return { ...ch, questionCount: 0 };
      }
    });

    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.json({
      bookId: bookSlug,
      chapters: chaptersWithCounts,
      totalChapters: chaptersWithCounts.length,
    });
  } catch (err) {
    console.error('Error building practice book chapters:', err);
    res.status(500).json({ message: 'Failed to load chapters for practice book' });
  }
});

// Practice question metadata (count only)
app.get('/api/practice-questions/:book/count', (req, res) => {
  try {
    const chapterParam = req.query.chapter;
    if (!chapterParam) {
      return res.status(400).json({ message: 'chapter query parameter is required' });
    }

    if (process.env.PRACTICE_QUESTIONS_DISABLED === 'true') {
      return res.json({ chapter: chapterParam.toLowerCase(), questionCount: 0 });
    }

    const { filePath } = resolvePracticeQuestionFile(req.params.book, chapterParam);
    if (!filePath) {
      return res.json({ chapter: chapterParam.toLowerCase(), questionCount: 0 });
    }

    const raw = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(raw);
    const questionCount = Array.isArray(data.questions) ? data.questions.length : 0;

    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.json({
      book: req.params.book,
      chapter: chapterParam.toLowerCase(),
      chapterSlug: data.chapter_slug || data.chapterSlug || chapterParam.toLowerCase(),
      chapterTitle: data.chapter_title || data.chapterTitle || null,
      questionCount
    });
  } catch (err) {
    console.error('Error loading practice question count:', err);
    res.status(500).json({ message: 'Failed to load question count', error: err.message });
  }
});

// Serve practice questions by book slug
app.get('/api/practice-questions/:book', (req, res) => {
  try {
    const chapterParam = req.query.chapter || '';

    if (process.env.PRACTICE_QUESTIONS_DISABLED === 'true') {
      return res.json({ chapter: chapterParam.toLowerCase() || null, questions: [] });
    }

    const { filePath } = resolvePracticeQuestionFile(req.params.book, chapterParam);

    if (!filePath) {
      return res.json({ chapter: chapterParam.toLowerCase() || null, questions: [] });
    }

    const raw = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(raw);
    console.log(`[API] Loaded ${data.questions?.length || 0} questions from ${path.basename(filePath)}`);

    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.json(data);
  } catch (err) {
    console.error('Error loading practice questions:', err);
    res.status(500).json({ message: 'Failed to load questions', error: err.message });
  }
});

app.get('/', (req, res) => {
  res.json({ message: 'Vimaanna DGCA API running', timestamp: new Date().toISOString() });
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});

// 404 handler
// app.use(notFound);

// Global error handler
// app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
