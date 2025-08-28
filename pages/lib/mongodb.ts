import mongoose from 'mongoose';
import "lib/models";

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

// Use type assertion for the cache
const cached = (global as any).mongoose || { conn: null, promise: null };

export default async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      dbName: 'misthir',
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts);
  }

  try {
    cached.conn = await cached.promise;
    console.log('✅ MongoDB Misthir Connected',);
    return cached.conn;
  } catch (error) {
    cached.promise = null;
    throw error;
  }
}

// Store the cache in global scope
(global as any).mongoose = cached;