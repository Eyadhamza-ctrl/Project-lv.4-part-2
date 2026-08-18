import mongoose from 'mongoose';

export const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  try {
    const mongoUri =
      process.env.MONGO_URI ||
      process.env.MONGODB_URI ||
      'mongodb://127.0.0.1:27017/eventpulse';

    const conn = await mongoose.connect(mongoUri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    if (process.env.VERCEL || process.env.NODE_ENV === 'test') {
      throw error;
    }
    process.exit(1);
  }
};
