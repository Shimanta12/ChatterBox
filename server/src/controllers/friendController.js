import FriendRequest from '../models/FriendRequest.js';
import User from '../models/User.js';
import { emitToUser } from '../socket/registry.js';

export const unfriendUser = async (req, res) => {
  try {
    const { friendId } = req.params;
    const userId = req.userId;
    
    console.log(`Unfriending: ${userId} -> ${friendId}`);
    
    // Remove from friends lists
    await User.findByIdAndUpdate(userId, { $pull: { friends: friendId } });
    await User.findByIdAndUpdate(friendId, { $pull: { friends: userId } });

    // IMPORTANT: Clean up friend request records (both directions)
    // Delete any friend requests between these users
    const deletedRequests = await FriendRequest.deleteMany({
      $or: [
        { from: userId, to: friendId },
        { from: friendId, to: userId }
      ]
    });

    console.log(`Unfriended: ${userId} <-> ${friendId}, deleted ${deletedRequests.deletedCount} friend request records`);

    res.status(200).json({ 
      success: true, 
      message: "Unfriended successfully",
      deletedRequests: deletedRequests.deletedCount 
    });
  } catch (error) {
    console.error('Unfriend error:', error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const sendRequest = async (req, res) => {
  try {
    const { toUserId } = req.body;
    if (!toUserId) return res.status(400).json({ message: 'toUserId required' });
    if (String(toUserId) === String(req.userId)) return res.status(400).json({ message: 'Cannot add yourself' });

    // Check for existing pending requests only (not accepted/rejected ones)
    const existing = await FriendRequest.findOne({ 
      from: req.userId, 
      to: toUserId, 
      status: 'pending' 
    });
    
    if (existing) return res.status(400).json({ message: 'Request already exists' });

    // Also check if they're already friends
    const user = await User.findById(req.userId);
    if (user.friends && user.friends.includes(toUserId)) {
      return res.status(400).json({ message: 'Already friends' });
    }

    const doc = await FriendRequest.create({ from: req.userId, to: toUserId, status: 'pending' });
    const populated = await doc.populate('from', 'name email avatar').execPopulate?.() ?? await doc.populate('from', 'name email avatar');

    emitToUser(toUserId, 'friend:request:new', populated);

    console.log(`Friend request sent: ${req.userId} -> ${toUserId}`);
    res.json(populated);
  } catch (err) {
    console.error('sendRequest error', err);
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
      console.log(`Friend request accepted: ${reqDoc.from} <-> ${reqDoc.to}`);
    } else {
      console.log(`Friend request rejected: ${reqDoc.from} -> ${reqDoc.to}`);
    }

    const populated = await reqDoc.populate('from to', 'name email avatar').execPopulate?.() ?? await reqDoc.populate('from to', 'name email avatar');

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