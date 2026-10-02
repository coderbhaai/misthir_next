// lib > server > test-bb.ts

/**
 * Quick test script for MongoDB + API latency
 * Run: npx ts-node lib/server/test-bb.ts
 */

import mongoose from "mongoose";
import axios, { AxiosError } from "axios";

const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb+srv://amitkhare588:DS2njJmew5jtwfsi@cluster0.8jach9f.mongodb.net/raphael?retryWrites=true&w=majority";

const API_URL = "http://localhost:3000/api/basic/action?function=check_api";

async function testMongoDB(): Promise<void> {
  const start = Date.now();

  try {
    await mongoose.connect(MONGODB_URI);
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error("❌ MongoDB connection failed:", err.message);
    } else {
      console.error("❌ MongoDB connection failed:", err);
    }
  } finally {
    await mongoose.disconnect();
  }
}

async function testAPI(): Promise<void> {
  const start = Date.now();

  try {
    const res = await axios.get(API_URL, { timeout: 30000 });
  } catch (err: unknown) {
    if (err instanceof AxiosError) {
      console.error("❌ API test failed:", err.message);
      if (err.code) console.error("Error code:", err.code);
    } else if (err instanceof Error) {
      console.error("❌ API test failed:", err.message);
    } else {
      console.error("❌ API test failed with unknown error:", err);
    }
  }
}

(async () => {
  await testMongoDB();
  await testAPI();
})();
