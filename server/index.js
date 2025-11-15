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

// Serve practice questions by book slug
app.get('/api/practice-questions/:book', (req, res) => {
  try {
    const book = (req.params.book || '').toLowerCase();
    const chapter = (req.query.chapter || '').toLowerCase();
    
    // Allow temporarily disabling via env flag but still respond successfully
    if (process.env.PRACTICE_QUESTIONS_DISABLED === 'true') {
      return res.json({ chapter, questions: [] });
    }
    
    // Require chapter parameter for chapter-specific files
    let filePath;
    if (chapter) {
      filePath = path.join(__dirname, 'practice-questions', `${book}-${chapter}.json`);
      console.log(`[API] Loading chapter file: ${book}-${chapter}.json`);
      console.log(`[API] Full file path: ${filePath}`);
      console.log(`[API] File exists: ${fs.existsSync(filePath)}`);
      if (!fs.existsSync(filePath)) {
        console.log(`[API] File not found: ${filePath}`);
        // List available files for debugging
        const practiceQuestionsDir = path.join(__dirname, 'practice-questions');
        if (fs.existsSync(practiceQuestionsDir)) {
          const files = fs.readdirSync(practiceQuestionsDir).filter(f => f.includes(book));
          console.log(`[API] Available files for book "${book}":`, files);
        }
        // Return an empty set rather than 404 so frontend can show "no questions" state
        return res.json({ chapter, questions: [] });
      }
    } else {
      // If no chapter specified, try to find default book file (for backward compatibility)
      filePath = path.join(__dirname, 'practice-questions', `${book}.json`);
      console.log(`[API] Loading default book file: ${book}.json`);
      if (!fs.existsSync(filePath)) {
        return res.json({ chapter: null, questions: [] });
      }
    }
    
    const raw = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(raw);
    console.log(`[API] Loaded ${data.questions?.length || 0} questions from ${path.basename(filePath)}`);
    
    // Prevent caching to ensure fresh data
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
