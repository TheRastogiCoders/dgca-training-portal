const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { z } = require('zod');
const Note = require('../models/Note');
const auth = require('../middleware/auth');
const router = express.Router();

const noteSchema = z.object({
  title: z.string().min(1).max(300),
  description: z.string().max(2000).optional().or(z.literal('')),
  subject: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
});

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (req, file, cb) => {
    const isPdf = file.mimetype === 'application/pdf' || /\.pdf$/i.test(file.originalname || '');
    if (!isPdf) return cb(new Error('Only PDF files are allowed'));
    cb(null, true);
  }
});

// Upload a note (PDF)
router.post('/', auth, upload.single('file'), async (req, res, next) => {
  try {
    const { title, description, subject } = noteSchema.parse(req.body);
    if (!req.file) return res.status(400).json({ message: 'File required' });
    const note = await Note.create({
      title,
      description,
      fileUrl: `/uploads/${req.file.filename}`,
      uploadedBy: req.user.id,
      subject: subject || undefined,
    });
    res.status(201).json(note);
  } catch (err) {
    next(err);
  }
});

// List all notes
router.get('/', async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page || '1', 10));
  const limit = Math.min(100, parseInt(req.query.limit || '20', 10));
  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    Note.find().sort({ createdAt: -1 }).skip(skip).limit(limit).populate('uploadedBy', 'username').populate('subject'),
    Note.countDocuments(),
  ]);
  res.json({ items, total, page, pages: Math.ceil(total / limit) });
});

// Get a single note
router.get('/:id', async (req, res) => {
  const note = await Note.findById(req.params.id).populate('uploadedBy', 'username').populate('subject');
  if (!note) return res.status(404).json({ message: 'Not found' });
  res.json(note);
});

// Delete a note (admin or uploader)
router.delete('/:id', auth, async (req, res, next) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ message: 'Not found' });
    if (!req.user.isAdmin && note.uploadedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    const filePath = path.join(__dirname, '..', note.fileUrl);
    try {
      await fs.promises.unlink(filePath);
    } catch (e) {
      // If file missing, continue to delete DB record
    }
    await note.deleteOne();
    res.json({ message: 'Deleted' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
