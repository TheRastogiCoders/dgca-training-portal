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
const practiceQuestionsDir = path.join(__dirname, 'practice-questions');

const PRACTICE_BOOK_SLUG_MAPPING = {
  'air-law': 'oxford',
  'human-performance-and-limitations': 'human-performance',
  'oxford': 'oxford',
  'cae-oxford': 'oxford',
  'rk-bali': 'rk-bali',
  'ic-joshi': 'ic-joshi',
  'general-navigation': 'cae-oxford-general-navigation',
  'cae-oxford-general-navigation': 'cae-oxford-general-navigation',
  'cae-oxford-flight-planning': 'cae-oxford-flight-planning',
  'cae-oxford-flight-planning-monitoring': 'cae-oxford-flight-planning',
  'cae-oxford-performance': 'cae-oxford-performance',
  'cae-oxford-radio-navigation': 'cae-oxford-radio-navigation',
  'cae-oxford-powerplant': 'cae-oxford-powerplant',
  'powerplant': 'cae-oxford-powerplant',
  'cae-oxford-principles-of-flight': 'cae-oxford-principles-of-flight',
  'principles-of-flight': 'cae-oxford-principles-of-flight',
  'cae-oxford-navigation': 'cae-oxford-navigation',
  'operational-procedures': 'operational-procedures',
  'instrument-2014': 'instrument',
  'instrument': 'instrument',
  'cae-oxford-meteorology': 'cae-oxford',
  'cae-oxford-radio-telephony': 'cae-oxford',
  'mass-and-balance-and-performance': 'mass-and-balance-and-performance',
  'mass-and-balance': 'mass-and-balance-and-performance'
};

const resolvePracticeQuestionFile = (bookParam, chapterParam) => {
  const book = (bookParam || '').toLowerCase();
  const chapter = (chapterParam || '').toLowerCase();
  let filePrefix = PRACTICE_BOOK_SLUG_MAPPING[book] || book;
  let filePath;

  if (chapter) {
    filePath = path.join(practiceQuestionsDir, `${filePrefix}-${chapter}.json`);

    if (!fs.existsSync(filePath)) {
      const alternativePrefixes = [];

      if (book === 'cae-oxford' && filePrefix === 'oxford') {
        alternativePrefixes.push('cae-oxford');
      }

      if (book === 'mass-and-balance-and-performance' || filePrefix === 'mass-and-balance-and-performance') {
        alternativePrefixes.push('mass-and-balance');
        alternativePrefixes.push('performance');
      }

      if (book !== filePrefix) {
        alternativePrefixes.push(book);
      }

      for (const altPrefix of alternativePrefixes) {
        const altFilePath = path.join(practiceQuestionsDir, `${altPrefix}-${chapter}.json`);
        if (fs.existsSync(altFilePath)) {
          filePath = altFilePath;
          filePrefix = altPrefix;
          break;
        }
      }
    }

    if (!fs.existsSync(filePath)) {
      if (!fs.existsSync(practiceQuestionsDir)) {
        return { book, chapter, filePath: null };
      }

      const allFiles = fs.readdirSync(practiceQuestionsDir).filter(f => f.endsWith('.json'));
      const matchingFile = allFiles.find(f => {
        const fileBase = f.replace('.json', '');
        return fileBase.endsWith(`-${chapter}`) || fileBase === chapter || fileBase.includes(`-${chapter}-`);
      });

      if (matchingFile) {
        filePath = path.join(practiceQuestionsDir, matchingFile);
      } else {
        return { book, chapter, filePath: null };
      }
    }
  } else {
    filePath = path.join(practiceQuestionsDir, `${filePrefix}.json`);
    if (!fs.existsSync(filePath)) {
      return { book, chapter: null, filePath: null };
    }
  }

  return { book, chapter, filePath };
};

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
