// src/controllers/messageController.js
import Message from '../models/Message.js';
import { emitToUser } from '../socket/registry.js';

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

// Optional REST send for testing
export const sendMessageRest = async (req, res) => {
  try {
    const { to, body } = req.body;
    if (!to || !body) return res.status(400).json({ message: 'to and body required' });

    const msg = await Message.create({ from: req.userId, to, body });
    emitToUser(to, 'message:new', msg);
    res.json(msg);
  } catch (err) {
    console.error('sendMessageRest error', err);
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
