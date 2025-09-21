const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const helmet = require('helmet');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

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
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(uploadsDir, file.fieldname);
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /pdf|doc|docx|txt|png|jpg|jpeg/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only PDF, DOC, DOCX, TXT, PNG, JPG, JPEG files are allowed'));
    }
  }
});

// Connect to MongoDB Atlas
const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://DGCAExamination:ExamDGCA%4020267@cluster0.ehw6gmn.mongodb.net/vimaanna_db?retryWrites=true&w=majority&appName=Cluster0';

// MongoDB Atlas connection options
const mongoOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 30000, // 30 seconds timeout
  socketTimeoutMS: 45000, // 45 seconds socket timeout
  maxPoolSize: 10, // Maintain up to 10 socket connections
  heartbeatFrequencyMS: 10000, // Send a ping every 10 seconds
};

mongoose.connect(mongoUri, mongoOptions)
  .then(() => {
    console.log('✅ MongoDB Atlas connected successfully');
    console.log('📊 Database:', mongoose.connection.db.databaseName);
  })
  .catch(err => {
    console.error('❌ MongoDB Atlas connection error:', err.message);
    console.log('💡 Check your Atlas connection string and IP whitelist');
    console.log('💡 Make sure your internet connection is stable');
    process.exit(1);
  });

// User Schema
const userSchema = new mongoose.Schema({
  username: { 
    type: String, 
    required: true, 
    unique: true,
    minlength: 3,
    maxlength: 50,
    trim: true
  },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true,
    trim: true
  },
  password: { 
    type: String, 
    required: true,
    minlength: 6
  },
  isAdmin: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update the updatedAt field before saving
userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const User = mongoose.model('User', userSchema);

// Auth middleware
const auth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Create admin user if it doesn't exist
const createAdminUser = async () => {
  try {
    const existingAdmin = await User.findOne({ username: 'admin' });
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      const adminUser = new User({
        username: 'admin',
        email: 'admin@vimaanna.com',
        password: hashedPassword,
        isAdmin: true
      });
      await adminUser.save();
      console.log('✅ Admin user created: admin / admin123');
    } else {
      console.log('✅ Admin user already exists: admin / admin123');
      // Reset admin password to ensure it's correct
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await User.updateOne({ username: 'admin' }, { password: hashedPassword });
      console.log('✅ Admin password reset to: admin123');
    }
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  }
};

// Input validation
const validateRegistration = (req, res, next) => {
  const { username, email, password } = req.body;
  const errors = [];

  if (!username || username.length < 3) {
    errors.push('Username must be at least 3 characters');
  }
  if (!email || !/\S+@\S+\.\S+/.test(email)) {
    errors.push('Please provide a valid email');
  }
  if (!password || password.length < 6) {
    errors.push('Password must be at least 6 characters');
  }

  if (errors.length > 0) {
    return res.status(400).json({ message: 'Validation failed', errors });
  }
  next();
};

// Routes
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Input validation
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }
    
    console.log('🔐 Login attempt for:', username);
    
    const user = await User.findOne({ username });
    if (!user) {
      console.log('❌ User not found:', username);
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      console.log('❌ Password mismatch for:', username);
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const token = jwt.sign({ 
      id: user._id, 
      username: user.username, 
      isAdmin: user.isAdmin 
    }, process.env.JWT_SECRET || 'fallback-secret', { expiresIn: '7d' });
    
    console.log('✅ Login successful for:', username);
    
    res.json({ 
      token, 
      user: { 
        id: user._id,
        username: user.username, 
        email: user.email,
        isAdmin: user.isAdmin
      } 
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/auth/register', validateRegistration, async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    console.log('📝 Registration attempt for:', username, email);
    
    const existingUser = await User.findOne({ 
      $or: [{ username }, { email }] 
    });
    if (existingUser) {
      const field = existingUser.username === username ? 'username' : 'email';
      console.log('❌ User already exists:', field);
      return res.status(400).json({ 
        message: `${field === 'username' ? 'Username' : 'Email'} already exists`,
        field 
      });
    }
    
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = new User({ username, email, password: hashedPassword });
    await user.save();
    
    console.log('✅ User registered successfully:', username);
    
    res.status(201).json({ 
      message: 'User registered successfully',
      user: { 
        id: user._id,
        username: user.username, 
        email: user.email,
        createdAt: user.createdAt
      } 
    });
  } catch (error) {
    console.error('❌ Registration error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Username or email already exists' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'VIMAANNA Server is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Get user profile (protected route)
app.get('/api/user/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ user });
  } catch (error) {
    console.error('❌ Profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user profile (protected route)
app.put('/api/user/profile', auth, async (req, res) => {
  try {
    const { username, email } = req.body;
    const userId = req.user.id;
    
    // Check if username/email already exists for other users
    const existingUser = await User.findOne({
      _id: { $ne: userId },
      $or: [{ username }, { email }]
    });
    
    if (existingUser) {
      const field = existingUser.username === username ? 'username' : 'email';
      return res.status(400).json({ 
        message: `${field === 'username' ? 'Username' : 'Email'} already exists`,
        field 
      });
    }
    
    const user = await User.findByIdAndUpdate(
      userId,
      { username, email, updatedAt: Date.now() },
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    console.log('✅ Profile updated for:', user.username);
    res.json({ user });
  } catch (error) {
    console.error('❌ Profile update error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Test admin user endpoint
app.get('/api/test-admin', async (req, res) => {
  try {
    const admin = await User.findOne({ username: 'admin' });
    res.json({ 
      adminExists: !!admin,
      admin: admin ? {
        username: admin.username,
        email: admin.email,
        isAdmin: admin.isAdmin,
        createdAt: admin.createdAt
      } : null
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Test password endpoint
app.post('/api/test-password', async (req, res) => {
  try {
    const { password } = req.body;
    const admin = await User.findOne({ username: 'admin' });
    
    if (!admin) {
      return res.json({ error: 'Admin user not found' });
    }
    
    const match = await bcrypt.compare(password, admin.password);
    res.json({ 
      passwordMatch: match,
      adminExists: true,
      passwordProvided: !!password
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Subject Schema
const subjectSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String },
  icon: { type: String }
}, { timestamps: true });

const Subject = mongoose.model('Subject', subjectSchema);

// Book Schema
const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  description: { type: String }
}, { timestamps: true });

const Book = mongoose.model('Book', bookSchema);

// Question Schema
const questionSchema = new mongoose.Schema({
  subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
  text: { type: String, required: true },
  options: [{ type: String, required: true }],
  answer: { type: String, required: true },
  explanation: { type: String }
}, { timestamps: true });

const Question = mongoose.model('Question', questionSchema);

// Create default subjects if they don't exist
const createDefaultSubjects = async () => {
  try {
    const subjects = [
      { name: 'Air Regulations', description: 'Civil Aviation Rules and Regulations', icon: '✈️' },
      { name: 'Air Navigation', description: 'Navigation principles and procedures', icon: '🧭' },
      { name: 'Meteorology', description: 'Weather and atmospheric conditions', icon: '🌤️' },
      { name: 'Technical General', description: 'General aviation technical knowledge', icon: '⚙️' },
      { name: 'Technical Specific', description: 'Aircraft-specific technical knowledge', icon: '🔧' },
      { name: 'Radio Telephony (RTR)-A', description: 'Radio communication procedures', icon: '📻' }
    ];

    for (const subjectData of subjects) {
      const existing = await Subject.findOne({ name: subjectData.name });
      if (!existing) {
        await Subject.create(subjectData);
        console.log('✅ Created subject:', subjectData.name);
      }
    }
  } catch (error) {
    console.error('❌ Error creating subjects:', error);
  }
};

// Subjects API
app.get('/api/subjects', async (req, res) => {
  try {
    const subjects = await Subject.find().sort({ name: 1 });
    res.json(subjects);
  } catch (error) {
    console.error('❌ Subjects error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Books API
app.get('/api/books', async (req, res) => {
  try {
    const books = await Book.find().populate('subject', 'name').sort({ title: 1 });
    res.json(books);
  } catch (error) {
    console.error('❌ Books error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/books', auth, async (req, res) => {
  try {
    const { title, subject } = req.body;
    
    if (!title || !subject) {
      return res.status(400).json({ message: 'Title and subject are required' });
    }
    
    const book = new Book({ title, subject });
    await book.save();
    
    const populatedBook = await Book.findById(book._id).populate('subject', 'name');
    console.log('✅ Book created:', populatedBook.title);
    
    res.status(201).json(populatedBook);
  } catch (error) {
    console.error('❌ Book creation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Questions API
app.get('/api/questions', async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page || '1', 10));
    const limit = Math.min(100, parseInt(req.query.limit || '20', 10));
    const skip = (page - 1) * limit;
    
    const [questions, total] = await Promise.all([
      Question.find()
        .populate('subject', 'name')
        .populate('book', 'title')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Question.countDocuments()
    ]);
    
    res.json({
      items: questions,
      total,
      page,
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('❌ Questions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/questions', auth, async (req, res) => {
  try {
    const { subject, book, text, options, answer, explanation } = req.body;
    
    if (!subject || !book || !text || !options || !answer) {
      return res.status(400).json({ message: 'Subject, book, text, options, and answer are required' });
    }
    
    const question = new Question({
      subject,
      book,
      text,
      options: options.filter(opt => opt.trim()),
      answer,
      explanation
    });
    
    await question.save();
    
    const populatedQuestion = await Question.findById(question._id)
      .populate('subject', 'name')
      .populate('book', 'title');
    
    console.log('✅ Question created:', populatedQuestion.text.substring(0, 50) + '...');
    
    res.status(201).json(populatedQuestion);
  } catch (error) {
    console.error('❌ Question creation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.delete('/api/questions/:id', auth, async (req, res) => {
  try {
    const question = await Question.findByIdAndDelete(req.params.id);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }
    
    console.log('✅ Question deleted:', question.text.substring(0, 50) + '...');
    res.json({ message: 'Question deleted successfully' });
  } catch (error) {
    console.error('❌ Question deletion error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin API endpoints
app.get('/api/admin/users', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Admin privileges required' });
    }
    
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    console.log('✅ Admin fetched users:', users.length);
    res.json(users);
  } catch (error) {
    console.error('❌ Admin users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/admin/users/:id/role', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Admin privileges required' });
    }
    
    const { isAdmin } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id, 
      { isAdmin: Boolean(isAdmin) }, 
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    console.log('✅ User role updated:', user.username, 'isAdmin:', user.isAdmin);
    res.json(user);
  } catch (error) {
    console.error('❌ User role update error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.delete('/api/admin/users/:id', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Admin privileges required' });
    }
    
    // Prevent admin from deleting themselves
    if (req.params.id === req.user.id) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }
    
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    console.log('✅ User deleted:', user.username);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('❌ User deletion error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin stats endpoint
app.get('/api/admin/stats', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Admin privileges required' });
    }
    
    const [users, questions, results] = await Promise.all([
      User.countDocuments(),
      Question.countDocuments(),
      0 // Results count - you can add this later
    ]);
    
    const admins = await User.countDocuments({ isAdmin: true });
    const regularUsers = users - admins;
    
    res.json({
      users,
      admins,
      regularUsers,
      questions,
      results,
      activeUsers: users, // Simple implementation
      totalTests: 0,
      avgScore: 0
    });
  } catch (error) {
    console.error('❌ Admin stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin logs endpoint (simplified)
app.get('/api/admin/logs', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Admin privileges required' });
    }
    
    const page = Math.max(1, parseInt(req.query.page || '1', 10));
    const limit = Math.min(100, parseInt(req.query.limit || '20', 10));
    const skip = (page - 1) * limit;
    
    // For now, return empty logs - you can implement proper logging later
    res.json({
      items: [],
      total: 0,
      page,
      pages: 0
    });
  } catch (error) {
    console.error('❌ Admin logs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin results endpoint
app.get('/api/admin/results', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Admin privileges required' });
    }
    
    const page = Math.max(1, parseInt(req.query.page || '1', 10));
    const limit = Math.min(100, parseInt(req.query.limit || '20', 10));
    const skip = (page - 1) * limit;
    
    // For now, return empty results - you can implement this later
    res.json({
      items: [],
      total: 0,
      page,
      pages: 0
    });
  } catch (error) {
    console.error('❌ Admin results error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Result Schema for practice tests
const resultSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject' },
  book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book' },
  subjectName: { type: String },
  bookName: { type: String },
  chapterName: { type: String },
  testType: { type: String, enum: ['book', 'ai', 'admin'], default: 'book' },
  score: { type: Number, required: true },
  total: { type: Number, required: true },
  timeSpent: { type: Number, default: 0 }, // in seconds
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
  answers: [{
    questionText: String,
    selected: String,
    correct: Boolean,
    explanation: String
  }]
}, { timestamps: true });

const Result = mongoose.model('Result', resultSchema);

// Content Schema for study materials
const contentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  type: { type: String, enum: ['notes', 'pdf', 'mcq'], required: true },
  filePath: { type: String, required: true },
  fileName: { type: String, required: true },
  fileSize: { type: Number },
  mimeType: { type: String },
  isPublic: { type: Boolean, default: true },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  tags: [String],
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' }
}, { timestamps: true });

const Content = mongoose.model('Content', contentSchema);

// MCQ Schema for uploaded questions
const mcqSchema = new mongoose.Schema({
  subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book' },
  title: { type: String, required: true },
  questions: [{
    text: { type: String, required: true },
    options: [{ type: String, required: true }],
    answer: { type: String, required: true },
    explanation: { type: String },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' }
  }],
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  isPublic: { type: Boolean, default: true },
  tags: [String]
}, { timestamps: true });

const MCQ = mongoose.model('MCQ', mcqSchema);

// Results API for practice tests
app.get('/api/results', auth, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page || '1', 10));
    const limit = Math.min(100, parseInt(req.query.limit || '20', 10));
    const skip = (page - 1) * limit;
    
    const results = await Result.find({ user: req.user.id })
      .populate('subject', 'name')
      .populate('book', 'title')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    console.log('✅ Fetched results for user:', req.user.username, 'Count:', results.length);
    res.json(results);
  } catch (error) {
    console.error('❌ Results fetch error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/results', auth, async (req, res) => {
  try {
    const { 
      subject, 
      book, 
      subjectName, 
      bookName, 
      chapterName, 
      testType, 
      score, 
      total, 
      timeSpent, 
      difficulty, 
      answers 
    } = req.body;
    
    const result = new Result({
      user: req.user.id,
      subject,
      book,
      subjectName,
      bookName,
      chapterName,
      testType: testType || 'book',
      score: Number(score),
      total: Number(total),
      timeSpent: Number(timeSpent) || 0,
      difficulty: difficulty || 'medium',
      answers: answers || []
    });
    
    await result.save();
    
    const populatedResult = await Result.findById(result._id)
      .populate('subject', 'name')
      .populate('book', 'title');
    
    console.log('✅ Result saved for user:', req.user.username, 'Score:', score + '/' + total);
    res.status(201).json(populatedResult);
  } catch (error) {
    console.error('❌ Result save error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Test endpoint for practice test page
app.get('/api/results/test', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Results API is working',
    timestamp: new Date().toISOString()
  });
});

// AI Chat endpoint (simplified)
app.post('/api/ai/chat', async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message || message.trim().length === 0) {
      return res.status(400).json({ message: 'Message is required' });
    }
    
    // Simple fallback response for AI chat
    const responses = [
      "I'm here to help with DGCA exam preparation! What specific topic would you like to study?",
      "For aviation questions, I can help with Air Regulations, Navigation, Meteorology, and more. What's your question?",
      "Great question! Let me help you understand this aviation concept. Could you be more specific about what you'd like to know?",
      "I'm VIMAANNA AI, your aviation learning assistant. I can help with DGCA exam topics, flight training questions, and aviation theory.",
      "That's an interesting aviation question! I can provide guidance on various DGCA subjects. What area would you like to focus on?"
    ];
    
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    
    console.log('🤖 AI Chat request from user:', message.substring(0, 50) + '...');
    
    res.json({
      success: true,
      response: randomResponse,
      timestamp: new Date().toISOString(),
      note: 'fallback: ai_not_configured'
    });
  } catch (error) {
    console.error('❌ AI Chat error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Content Management API endpoints
app.get('/api/content', async (req, res) => {
  try {
    const { type, subject } = req.query;
    const query = { isPublic: true };
    
    if (type) query.type = type;
    if (subject) query.subject = subject;
    
    const content = await Content.find(query)
      .populate('subject', 'name')
      .populate('uploadedBy', 'username')
      .sort({ createdAt: -1 });
    
    res.json(content);
  } catch (error) {
    console.error('❌ Content fetch error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Upload study materials (notes)
app.post('/api/content/upload', auth, upload.single('file'), async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Admin privileges required' });
    }
    
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    const { title, description, subject, type, tags, difficulty } = req.body;
    
    const content = new Content({
      title,
      description,
      subject,
      type: type || 'notes',
      filePath: req.file.path,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      uploadedBy: req.user.id,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      difficulty: difficulty || 'medium'
    });
    
    await content.save();
    
    const populatedContent = await Content.findById(content._id)
      .populate('subject', 'name')
      .populate('uploadedBy', 'username');
    
    console.log('✅ Content uploaded:', populatedContent.title);
    res.status(201).json(populatedContent);
  } catch (error) {
    console.error('❌ Content upload error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Upload PDF for admin analysis questions
app.post('/api/content/pdf', auth, upload.single('pdf'), async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Admin privileges required' });
    }
    
    if (!req.file) {
      return res.status(400).json({ message: 'No PDF file uploaded' });
    }
    
    if (req.file.mimetype !== 'application/pdf') {
      return res.status(400).json({ message: 'Only PDF files are allowed' });
    }
    
    const { title, description, subject, tags, difficulty } = req.body;
    
    const content = new Content({
      title,
      description,
      subject,
      type: 'pdf',
      filePath: req.file.path,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      uploadedBy: req.user.id,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      difficulty: difficulty || 'medium'
    });
    
    await content.save();
    
    const populatedContent = await Content.findById(content._id)
      .populate('subject', 'name')
      .populate('uploadedBy', 'username');
    
    console.log('✅ PDF uploaded for admin analysis:', populatedContent.title);
    res.status(201).json(populatedContent);
  } catch (error) {
    console.error('❌ PDF upload error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Upload MCQ questions
app.post('/api/mcq/upload', auth, async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Admin privileges required' });
    }
    
    const { title, subject, book, questions, tags } = req.body;
    
    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ message: 'Questions array is required' });
    }
    
    const mcq = new MCQ({
      title,
      subject,
      book,
      questions,
      uploadedBy: req.user.id,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : []
    });
    
    await mcq.save();
    
    const populatedMCQ = await MCQ.findById(mcq._id)
      .populate('subject', 'name')
      .populate('book', 'title')
      .populate('uploadedBy', 'username');
    
    console.log('✅ MCQ uploaded:', populatedMCQ.title, 'Questions:', questions.length);
    res.status(201).json(populatedMCQ);
  } catch (error) {
    console.error('❌ MCQ upload error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get MCQ questions
app.get('/api/mcq', async (req, res) => {
  try {
    const { subject, book } = req.query;
    const query = { isPublic: true };
    
    if (subject) query.subject = subject;
    if (book) query.book = book;
    
    const mcqs = await MCQ.find(query)
      .populate('subject', 'name')
      .populate('book', 'title')
      .populate('uploadedBy', 'username')
      .sort({ createdAt: -1 });
    
    res.json(mcqs);
  } catch (error) {
    console.error('❌ MCQ fetch error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get content by ID (for viewing)
app.get('/api/content/:id', async (req, res) => {
  try {
    const content = await Content.findById(req.params.id)
      .populate('subject', 'name')
      .populate('uploadedBy', 'username');
    
    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }
    
    // For PDF files, serve the file
    if (content.type === 'pdf' && content.filePath) {
      const filePath = path.join(__dirname, content.filePath);
      if (fs.existsSync(filePath)) {
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'inline; filename="' + content.fileName + '"');
        return res.sendFile(filePath);
      }
    }
    
    // For other files, return file info
    res.json(content);
  } catch (error) {
    console.error('❌ Content fetch error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete content
app.delete('/api/content/:id', auth, async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Admin privileges required' });
    }
    
    const content = await Content.findById(req.params.id);
    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }
    
    // Delete file from filesystem
    if (content.filePath && fs.existsSync(content.filePath)) {
      fs.unlinkSync(content.filePath);
    }
    
    await Content.findByIdAndDelete(req.params.id);
    
    console.log('✅ Content deleted:', content.title);
    res.json({ message: 'Content deleted successfully' });
  } catch (error) {
    console.error('❌ Content deletion error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    message: 'Route not found',
    path: req.originalUrl,
    method: req.method
  });
});

// Error handler
app.use((error, req, res, next) => {
  console.error('❌ Unhandled error:', error);
  res.status(500).json({ 
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log('🚀 VIMAANNA Server started successfully!');
  console.log(`📍 Server running on: http://localhost:${PORT}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
  console.log('👤 Admin credentials: admin / admin123');
  console.log('📊 MongoDB URI:', mongoUri);
  createAdminUser();
  createDefaultSubjects();
});
