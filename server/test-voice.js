import mongoose from 'mongoose';
import Message from './src/models/Message.js';
import 'dotenv/config';

const testVoiceMessage = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Test creating a voice message
    const voiceMessage = await Message.create({
      from: new mongoose.Types.ObjectId(),
      to: new mongoose.Types.ObjectId(),
      body: 'Voice Message',
      messageType: 'voice',
      audioUrl: '/uploads/audio/test-voice.m4a',
      audioDuration: 15.5
    });

    console.log('Voice message created:', voiceMessage);

    // Test querying voice messages
    const voiceMessages = await Message.find({ messageType: 'voice' });
    console.log('Voice messages found:', voiceMessages.length);

    // Test querying by message type
    const textMessages = await Message.find({ messageType: 'text' });
    console.log('Text messages found:', textMessages.length);

    console.log('Test completed successfully!');
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

testVoiceMessage();
