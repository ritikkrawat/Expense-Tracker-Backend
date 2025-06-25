const mongoose = require('mongoose');

let isConnected = false; // Prevent duplicate connections on Vercel

const connectDB = async () => {
  if (isConnected) return;

  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error("MONGO_URI not found in environment variables");
    throw new Error("MONGO_URI is required to connect to database");
  }

  try {
    const conn = await mongoose.connect(uri);
    isConnected = conn.connections[0].readyState;
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
    throw err;
  }
};

module.exports = connectDB;
