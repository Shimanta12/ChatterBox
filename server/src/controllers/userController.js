import User from '../models/User.js';

export const me = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error('me error', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name, avatar } = req.body;
    const update = {};
    if (name) update.name = name.trim();
    if (avatar !== undefined) update.avatar = avatar;
    const user = await User.findByIdAndUpdate(req.userId, { $set: update }, { new: true }).select('-password');
    res.json(user);
  } catch (err) {
    console.error('updateProfile error', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const searchUsers = async (req, res) => {
  try {
    const q = (req.query.q || '').trim();
    if (!q) return res.json([]);
    const re = new RegExp(q, 'i');
    const users = await User.find({
      $or: [{ name: re }, { email: re }],
      _id: { $ne: req.userId }
    }).select('name email avatar');
    res.json(users);
  } catch (err) {
    console.error('searchUsers error', err);
    res.status(500).json({ message: 'Server error' });
  }
};
