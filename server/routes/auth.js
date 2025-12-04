const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();
const { OAuth2Client } = require('google-auth-library');

// Google OAuth client - Initialize lazily to ensure .env is loaded
let googleClient = null;

const getGoogleClient = () => {
  if (!googleClient && process.env.GOOGLE_CLIENT_ID) {
    googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    console.log('✅ Google OAuth client initialized with Client ID:', process.env.GOOGLE_CLIENT_ID.substring(0, 20) + '...');
  } else if (!process.env.GOOGLE_CLIENT_ID) {
    console.warn('⚠️  GOOGLE_CLIENT_ID not set in environment variables. Google Sign-In will not work.');
  }
  return googleClient;
};

// Initialize on module load
getGoogleClient();

// Enhanced password validation
const validatePassword = (password) => {
  if (!password || password.length < 6) {
    return { isValid: false, message: 'Password must be at least 6 characters long' };
  }
  if (password.length > 128) {
    return { isValid: false, message: 'Password must be less than 128 characters' };
  }
  return { isValid: true };
};

// Enhanced email validation
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Enhanced username validation
const validateUsername = (username) => {
  if (!username || username.length < 3) {
    return { isValid: false, message: 'Username must be at least 3 characters long' };
  }
  if (username.length > 50) {
    return { isValid: false, message: 'Username must be less than 50 characters' };
  }
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return { isValid: false, message: 'Username can only contain letters, numbers, and underscores' };
  }
  return { isValid: true };
};

// Rate limiting for auth endpoints (relaxed for development)
const authLimiter = require('express-rate-limit')({
  windowMs: 60 * 1000, // 1 minute
  max: process.env.NODE_ENV === 'production' ? 30 : 1000,
  standardHeaders: true,
  legacyHeaders: false,
});

// Register endpoint with enhanced security
router.post('/register', authLimiter, async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Enhanced validation
    if (!username || !email || !password) {
      return res.status(400).json({ 
        message: 'Username, email, and password are required' 
      });
    }

    // Validate username
    const usernameValidation = validateUsername(username);
    if (!usernameValidation.isValid) {
      return res.status(400).json({ 
        message: usernameValidation.message 
      });
    }

    // Validate email
    if (!validateEmail(email)) {
      return res.status(400).json({ 
        message: 'Please enter a valid email address' 
      });
    }

    // Validate password
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return res.status(400).json({ 
        message: passwordValidation.message 
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ username }, { email }] 
    });

    if (existingUser) {
      return res.status(400).json({ 
        message: existingUser.username === username 
          ? 'Username already exists' 
          : 'Email already exists'
      });
    }

    // Hash password with higher salt rounds for security
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    const user = new User({
      username,
      email,
      password: hashedPassword,
      isAdmin: false
    });

    await user.save();

    // Return success response (don't include sensitive data)
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
    console.error('Registration error:', error);
    res.status(500).json({ 
      message: 'Internal server error. Please try again later.' 
    });
  }
});

// Admin credentials
const ADMIN_EMAIL = 'Vimaannadminportalfordgca2026@gmail.com';
const ADMIN_PASSWORD = 'Dgcaaviationadmincredential@2026';

// Login endpoint with enhanced security
router.post('/login', authLimiter, async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Enhanced validation
    if ((!username && !email) || !password) {
      return res.status(400).json({ 
        message: 'Username/email and password are required' 
      });
    }

    // Check for admin credentials - also check if username is actually an email
    const loginEmail = email || (username && username.includes('@') ? username : null);
    const isAdminEmail = loginEmail && loginEmail.toLowerCase() === ADMIN_EMAIL.toLowerCase();
    const isAdminPassword = password === ADMIN_PASSWORD;
    
    if (isAdminEmail && isAdminPassword) {
      // Find or create admin user
      let adminUser = await User.findOne({ email: ADMIN_EMAIL.toLowerCase() });
      
      if (!adminUser) {
        // Create admin user if doesn't exist
        const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 12);
        adminUser = await User.create({
          username: 'admin',
          email: ADMIN_EMAIL.toLowerCase(),
          password: hashedPassword,
          isAdmin: true,
          isActive: true
        });
      } else {
        // Ensure admin user has admin privileges
        if (!adminUser.isAdmin) {
          adminUser.isAdmin = true;
          await adminUser.save();
        }
      }

      // Generate JWT token for admin
      const token = jwt.sign(
        { 
          id: adminUser._id, 
          username: adminUser.username, 
          email: adminUser.email,
          isAdmin: true 
        },
        process.env.JWT_SECRET || 'fallback-secret-key',
        { expiresIn: '24h' }
      );

      return res.json({
        message: 'Admin login successful',
        token,
        user: {
          id: adminUser._id,
          username: adminUser.username,
          email: adminUser.email,
          isAdmin: true
        }
      });
    }

    // Regular user login
    const query = username ? { username } : { email: email?.toLowerCase() };
    const user = await User.findOne(query);
    if (!user) {
      return res.status(401).json({ 
        message: 'Invalid username/email or password' 
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({ 
        message: 'Account is deactivated. Please contact support.' 
      });
    }

    // Check password with timing attack protection
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        message: 'Invalid username/email or password' 
      });
    }

    // Generate JWT token with shorter expiration for security
    const token = jwt.sign(
      { 
        id: user._id, 
        username: user.username, 
        isAdmin: user.isAdmin 
      },
      process.env.JWT_SECRET || 'fallback-secret-key',
      { expiresIn: '24h' } // Shorter token expiration
    );

    // Return success response
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      message: 'Internal server error. Please try again later.' 
    });
  }
});

// Google Sign-In endpoint
router.post('/google', authLimiter, async (req, res) => {
  try {
    const { idToken } = req.body || {};
    
    console.log('[Google Auth] Request received');
    console.log('[Google Auth] Has idToken:', !!idToken);
    console.log('[Google Auth] Token length:', idToken?.length || 0);
    
    if (!idToken) {
      console.error('[Google Auth] Missing idToken in request body');
      return res.status(400).json({ message: 'Missing Google ID token' });
    }

    // Ensure Google client is initialized (in case .env was loaded after module initialization)
    const client = getGoogleClient();
    
    // Check if Google Client ID is configured
    if (!process.env.GOOGLE_CLIENT_ID || !client) {
      console.error('[Google Auth] GOOGLE_CLIENT_ID not configured');
      console.error('[Google Auth] GOOGLE_CLIENT_ID exists:', !!process.env.GOOGLE_CLIENT_ID);
      console.error('[Google Auth] googleClient exists:', !!client);
      console.error('[Google Auth] All env vars:', Object.keys(process.env).filter(k => k.includes('GOOGLE')));
      return res.status(500).json({ 
        message: 'Google authentication is not configured on the server. Please contact support.' 
      });
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    console.log('[Google Auth] Verifying token with Client ID:', clientId.substring(0, 20) + '...');
    console.log('[Google Auth] Full Client ID:', clientId);

    // Verify token with Google
    let ticket;
    try {
      ticket = await client.verifyIdToken({
        idToken,
        audience: clientId,
      });
      console.log('[Google Auth] Token verified successfully');
    } catch (verifyError) {
      console.error('[Google Auth] Token verification failed');
      console.error('[Google Auth] Error type:', verifyError.constructor.name);
      console.error('[Google Auth] Error message:', verifyError.message);
      console.error('[Google Auth] Full error:', JSON.stringify(verifyError, Object.getOwnPropertyNames(verifyError)));
      
      // Provide more specific error messages
      const errorMsg = verifyError.message || '';
      
      if (errorMsg.includes('audience') || errorMsg.includes('Wrong number of segments')) {
        console.error('[Google Auth] Client ID mismatch detected');
        return res.status(401).json({ 
          message: 'Google Client ID mismatch. Please ensure the Client ID matches between frontend and backend.' 
        });
      }
      if (errorMsg.includes('expired') || errorMsg.includes('Token used too early')) {
        return res.status(401).json({ 
          message: 'Google token has expired. Please try signing in again.' 
        });
      }
      if (errorMsg.includes('invalid') || errorMsg.includes('Invalid token signature') || errorMsg.includes('Token used too early')) {
        return res.status(401).json({ 
          message: 'Invalid Google token. Please try signing in again.' 
        });
      }
      
      // Return detailed error in development, generic in production
      const detailedError = process.env.NODE_ENV === 'development' 
        ? `Google authentication failed: ${errorMsg}` 
        : 'Invalid Google token. Please try signing in again.';
      
      return res.status(401).json({ 
        message: detailedError 
      });
    }

    const payload = ticket.getPayload();
    const email = payload?.email;
    const emailVerified = payload?.email_verified;
    const name = payload?.name || '';
    const picture = payload?.picture || '';

    if (!email || emailVerified === false) {
      return res.status(401).json({ message: 'Google email not verified' });
    }

    // Upsert user
    let user = await User.findOne({ email });
    if (!user) {
      // Generate unique username based on email local part
      const baseUsername = (email.split('@')[0] || 'user').replace(/[^a-zA-Z0-9_]/g, '_').slice(0, 30);
      let username = baseUsername;
      let suffix = 1;
      while (await User.exists({ username })) {
        username = `${baseUsername}_${suffix++}`.slice(0, 50);
      }
      // Set a random password since schema requires it
      const randomPassword = require('crypto').randomBytes(16).toString('hex');
      const hashed = await bcrypt.hash(randomPassword, 12);
      user = await User.create({ username, email, password: hashed, isAdmin: false });
    }

    // Issue JWT
    const token = jwt.sign(
      { id: user._id, username: user.username, isAdmin: user.isAdmin },
      process.env.JWT_SECRET || 'fallback-secret-key',
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Google sign-in successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin,
        name,
        picture,
      },
    });
  } catch (error) {
    console.error('Google sign-in error:', error);
    res.status(401).json({ 
      message: error.message || 'Invalid Google token. Please try again.' 
    });
  }
});

// Get current user endpoint with security
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key');
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    if (!user.isActive) {
      return res.status(401).json({ message: 'Account is deactivated' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
});

// Logout endpoint (client-side token removal)
router.post('/logout', (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

module.exports = router;