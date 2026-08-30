import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoMemoryServer = null;

export const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/cart_rescue';
    console.log(`Connecting to MongoDB at ${mongoUri}...`);
    
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 2000
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`Local MongoDB connection failed (${error.message}). Starting MongoMemoryServer fallback...`);
    try {
      mongoMemoryServer = await MongoMemoryServer.create();
      const uri = mongoMemoryServer.getUri();
      const conn = await mongoose.connect(uri);
      console.log(`In-Memory MongoDB Connected successfully at: ${uri}`);
    } catch (memErr) {
      console.error(`Failed to start MongoMemoryServer: ${memErr.message}`);
      process.exit(1);
    }
  }
};
