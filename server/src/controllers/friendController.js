// src/controllers/friendController.js
import FriendRequest from '../models/FriendRequest.js';
import User from '../models/User.js';
import { emitToUser } from '../socket/registry.js';

export const sendRequest = async (req, res) => {
  try {
    const { toUserId } = req.body;
    if (!toUserId) return res.status(400).json({ message: 'toUserId required' });
    if (String(toUserId) === String(req.userId)) return res.status(400).json({ message: 'Cannot add yourself' });

    // Check duplicate or existing friendship
    const existing = await FriendRequest.findOne({ from: req.userId, to: toUserId });
    if (existing) return res.status(400).json({ message: 'Request already exists' });

    const doc = await FriendRequest.create({ from: req.userId, to: toUserId });
    const populated = await doc.populate('from', 'name email avatar').execPopulate?.() ?? await doc.populate('from', 'name email avatar');

    // Notify recipient if online
    emitToUser(toUserId, 'friend:request:new', populated);

    res.json(populated);
  } catch (err) {
    console.error('sendRequest error', err);
    // Unique index violation
    if (err?.code === 11000) return res.status(400).json({ message: 'Request already exists' });
    res.status(500).json({ message: 'Server error' });
  }
};

export const listRequests = async (req, res) => {
  try {
    const incoming = await FriendRequest.find({ to: req.userId, status: 'pending' }).populate('from', 'name email avatar');
    const outgoing = await FriendRequest.find({ from: req.userId, status: 'pending' }).populate('to', 'name email avatar');
    res.json({ incoming, outgoing });
  } catch (err) {
    console.error('listRequests error', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const actOnRequest = async (req, res) => {
  try {
    const { requestId, action } = req.body;
    if (!requestId || !['accept', 'reject'].includes(action)) return res.status(400).json({ message: 'Invalid payload' });

    const reqDoc = await FriendRequest.findById(requestId);
    if (!reqDoc) return res.status(404).json({ message: 'Request not found' });
    if (String(reqDoc.to) !== String(req.userId)) return res.status(403).json({ message: 'Not authorized' });

    reqDoc.status = action === 'accept' ? 'accepted' : 'rejected';
    await reqDoc.save();

    if (reqDoc.status === 'accepted') {
      await User.findByIdAndUpdate(reqDoc.from, { $addToSet: { friends: reqDoc.to } });
      await User.findByIdAndUpdate(reqDoc.to, { $addToSet: { friends: reqDoc.from } });
    }

    const populated = await reqDoc.populate('from to', 'name email avatar').execPopulate?.() ?? await reqDoc.populate('from to', 'name email avatar');

    // Notify requester
    emitToUser(reqDoc.from, 'friend:request:update', populated);

    res.json(populated);
  } catch (err) {
    console.error('actOnRequest error', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const listFriends = async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate('friends', 'name email avatar');
    res.json(user?.friends || []);
  } catch (err) {
    console.error('listFriends error', err);
    res.status(500).json({ message: 'Server error' });
  }
};
