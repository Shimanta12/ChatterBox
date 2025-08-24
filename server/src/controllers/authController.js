import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';

export const validateRegister = [
  body('name').notEmpty().withMessage('Name required'),
  body('email').isEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password min 6 chars')
];

export const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { name, email, password } = req.body;
    console.log('🔸 Register attempt:', { name, email, passwordLength: password.length });
    
    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) return res.status(409).json({ message: 'Email already used' });

    const hash = await bcrypt.hash(password, 10);
    console.log('🔸 Password hashed successfully, length:', hash.length);
    
    const user = await User.create({ name: name.trim(), email: email.toLowerCase().trim(), password: hash });
    console.log('🔸 User created:', { id: user._id, email: user.email });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, avatar: user.avatar }
    });
  } catch (err) {
    console.error('❌ register error', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const validateLogin = [
  body('email').isEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password min 6 chars')
];

export const login = async (req, res) => {
  try {
    console.log('🔹 Login attempt started');
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Validation errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    console.log('🔹 Login attempt for:', { email, passwordLength: password.length });
    
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    console.log('🔹 User found in DB:', user ? {
      id: user._id,
      email: user.email,
      hasPassword: !!user.password,
      passwordLength: user.password ? user.password.length : 0
    } : 'NO USER FOUND');
    
    if (!user) {
      console.log('❌ User not found');
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    console.log('🔹 Comparing passwords...');
    console.log('🔹 Input password:', password);
    console.log('🔹 Stored hash (first 20 chars):', user.password ? user.password.substring(0, 20) + '...' : 'NO PASSWORD');
    
    const ok = await bcrypt.compare(password, user.password);
    console.log('🔹 Password comparison result:', ok);
    
    if (!ok) {
      console.log('❌ Password mismatch');
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    console.log('✅ Login successful');
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, avatar: user.avatar }
    });
  } catch (err) {
    console.error('❌ login error', err);
    res.status(500).json({ message: 'Server error' });
  }
};