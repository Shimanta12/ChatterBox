import User from '../models/User.js';
import { cloudinary } from '../config/cloudinary.js';

export const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete old avatar if it exists
    if (user.avatar && user.avatar !== '') {
      try {
        const publicId = user.avatar.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(publicId);
      } catch (error) {
        console.error('Error deleting old avatar:', error);
      }
    }

    // Update user with new avatar URL
    user.avatar = req.file.path;
    await user.save();

    res.json({ 
      message: 'Avatar uploaded successfully',
      avatar: user.avatar 
    });
  } catch (err) {
    console.error('uploadAvatar error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const removeAvatar = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.avatar && user.avatar !== '') {
      try {
        const publicId = user.avatar.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(publicId);
      } catch (error) {
        console.error('Error deleting avatar from cloudinary:', error);
      }
    }

    user.avatar = '';
    await user.save();

    res.json({ 
      message: 'Avatar removed successfully',
      avatar: user.avatar 
    });
  } catch (err) {
    console.error('removeAvatar error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getAvatar = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('avatar');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ avatar: user.avatar });
  } catch (err) {
    console.error('getAvatar error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
