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

const authRoutes = require('./routes/auth');
const subjectRoutes = require('./routes/subjects');
const bookRoutes = require('./routes/books');
const questionRoutes = require('./routes/questions');
const resultRoutes = require('./routes/results');
const noteRoutes = require('./routes/notes');
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
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false
}));

// CORS configuration
const normalizeOrigin = (o) => (o || '').replace(/\/$/, '');
const defaultOrigin = 'https://dgca-training-portal.vercel.app';
const configuredOrigins = (process.env.CORS_ORIGINS || process.env.FRONTEND_URL || defaultOrigin)
  .split(',')
  .map(normalizeOrigin)
  .filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests (no origin)
    if (!origin) return callback(null, true);
    const normalized = normalizeOrigin(origin);

    // Allow exact matches from configured origins
    if (configuredOrigins.includes(normalized)) return callback(null, true);

    // Allow Vercel preview deployments if enabled via env
    const allowVercelPreviews = (process.env.ALLOW_VERCEL_PREVIEWS || 'true') === 'true';
    if (allowVercelPreviews && /\.vercel\.app$/.test(new URL(normalized).hostname)) {
      return callback(null, true);
    }

    return callback(new Error(`Not allowed by CORS: ${origin}`));
  },
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
// Rate limiters
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 50, standardHeaders: true, legacyHeaders: false });
const aiLimiter = rateLimit({ windowMs: 60 * 1000, max: 30, standardHeaders: true, legacyHeaders: false });
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

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.error('MongoDB connection error:', err));

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
app.use('/api/ai', aiLimiter, aiRoutes);
app.use('/api/admin', adminRoutes);

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
