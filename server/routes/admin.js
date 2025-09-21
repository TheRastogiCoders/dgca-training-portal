const express = require('express');
const { z } = require('zod');
const User = require('../models/User');
const Log = require('../models/Log');
const Result = require('../models/Result');
const auth = require('../middleware/auth');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Optional host guard: only allow if ADMIN_HOST matches Host header
router.use((req, res, next) => {
  const adminHost = process.env.ADMIN_HOST;
  if (adminHost) {
    const host = req.headers.host || '';
    if (!host.startsWith(adminHost)) {
      return res.status(403).json({ message: 'Admin API restricted to admin domain' });
    }
  }
  next();
});

// All routes below require admin auth
router.use(auth, requireAdmin);

// Users list
router.get('/users', async (req, res) => {
  const users = await User.find().select('-password');
  res.json(users);
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

module.exports = router;


