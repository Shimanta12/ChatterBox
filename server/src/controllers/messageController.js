import Message from '../models/Message.js';
import { emitToUser } from '../socket/registry.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Configure multer for audio file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/audio/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'voice-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error('Only audio files are allowed'));
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

export const getThread = async (req, res) => {
  try {
    const { withUserId } = req.params;
    if (!withUserId) return res.status(400).json({ message: 'withUserId required' });

    const messages = await Message.find({
      $or: [
        { from: req.userId, to: withUserId },
        { from: withUserId, to: req.userId }
      ]
    }).sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) {
    console.error('getThread error', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const sendMessageRest = async (req, res) => {
  try {
    const { to, body, messageType = 'text' } = req.body;
    if (!to || !body) return res.status(400).json({ message: 'to and body required' });

    const msg = await Message.create({ 
      from: req.userId, 
      to, 
      body, 
      messageType 
    });
    emitToUser(to, 'message:new', msg);
    res.json(msg);
  } catch (err) {
    console.error('sendMessageRest error', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const sendVoiceMessage = async (req, res) => {
  try {
    upload.single('audio')(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ message: err.message });
      }

      if (!req.file) {
        return res.status(400).json({ message: 'Audio file is required' });
      }

      const { to, duration, messageType = 'voice' } = req.body;
      if (!to || !duration) {
        return res.status(400).json({ message: 'to and duration are required' });
      }

      // Create audio URL (in production, this would be a CDN or cloud storage URL)
      const audioUrl = `/uploads/audio/${req.file.filename}`;
      
      const msg = await Message.create({
        from: req.userId,
        to,
        body: 'Voice Message',
        messageType: 'voice',
        audioUrl,
        audioDuration: parseFloat(duration)
      });

      emitToUser(to, 'message:new', msg);
      res.json(msg);
    });
  } catch (err) {
    console.error('sendVoiceMessage error', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const markRead = async (req, res) => {
  try {
    const { withUserId } = req.body;
    if (!withUserId) return res.status(400).json({ message: 'withUserId required' });

    await Message.updateMany({ from: withUserId, to: req.userId, read: false }, { $set: { read: true } });
    emitToUser(withUserId, 'message:read', { by: req.userId });
    res.json({ ok: true });
  } catch (err) {
    console.error('markRead error', err);
    res.status(500).json({ message: 'Server error' });
  }
};
