import mongoose from 'mongoose';

export const connectDB = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error('MONGO_URI missing in env');

  const opts = {
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    maxPoolSize: 10,
    autoIndex: true,
    appName: 'ChatterBox-Server'
  };

  try {
    await mongoose.connect(uri, opts);
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB error:', err.message);
    process.exit(1);
  }

  mongoose.connection.on('disconnected', () => console.warn('MongoDB disconnected'));

  process.on('SIGINT', async () => {
    await mongoose.disconnect();
    console.log('MongoDB connection closed');
    process.exit(0);
  });
};
