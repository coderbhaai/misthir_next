import mongoose from "mongoose";
import "lib/models";

const mode = process.env.MODE || "dev";
const dbName = process.env.MONGODB_DB || "misthir";
const authSource = mode === 'prod' ? 'admin' : dbName;

let MONGODB_URI: string;

if (mode === "dev") {
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI missing in .env.local for dev");
  MONGODB_URI = process.env.MONGODB_URI;
} else {
  const username = process.env.MONGODB_USER!;
  const password = encodeURIComponent(process.env.MONGODB_PASS!);
  const host = process.env.MONGODB_HOST || "127.0.0.1:27017";
  MONGODB_URI = `mongodb://${username}:${password}@${host}/${dbName}?authSource=${authSource}`;
}

const cached = (global as any).mongoose || { conn: null, promise: null };

export default async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    const opts = { dbName, bufferCommands: false };
    cached.promise = mongoose.connect(MONGODB_URI, opts);
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) { console.log("Error", error);
    cached.promise = null;
    throw error;
  }
}

(global as any).mongoose = cached;
