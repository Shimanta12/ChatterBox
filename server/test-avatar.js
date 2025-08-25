// Simple test script for avatar functionality
// Run with: node test-avatar.js

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from './src/models/User.js';

dotenv.config();

const testAvatarFunctionality = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to database');

    // Test user creation with avatar
    const testUser = new User({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      avatar: 'https://example.com/avatar.jpg'
    });

    await testUser.save();
    console.log('Test user created with avatar:', testUser.avatar);

    // Test user without avatar
    const testUser2 = new User({
      name: 'Test User 2',
      email: 'test2@example.com',
      password: 'password123'
    });

    await testUser2.save();
    console.log('Test user 2 created without avatar');

    // Test avatar update
    testUser.avatar = 'https://example.com/new-avatar.jpg';
    await testUser.save();
    console.log('Avatar updated:', testUser.avatar);

    // Test avatar removal
    testUser.avatar = '';
    await testUser.save();
    console.log('Avatar removed');

    // Clean up
    await User.deleteMany({ email: { $regex: /^test/ } });
    console.log('Test users cleaned up');

    console.log('✅ Avatar functionality test completed successfully!');
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from database');
  }
};

testAvatarFunctionality();
