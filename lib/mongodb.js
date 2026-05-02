// lib/mongodb.js
import mongoose from "mongoose";

let isConnected = false;

export const connectDB = async () => {
  if (isConnected) return;

  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI environment variable is not set");

  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 5000,
  });

  isConnected = true;
  console.log("MongoDB connected");
};

// Call this once in your server entrypoint (e.g. server.js / index.js):
//   import { connectDB } from "./lib/mongodb.js";
//   await connectDB();