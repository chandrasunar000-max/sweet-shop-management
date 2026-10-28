
const mongoose = require("mongoose");

const DEFAULT_MONGODB_URI = "mongodb://127.0.0.1:27017/sweet-shop-management";

const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI || DEFAULT_MONGODB_URI;

  try {
    const connection = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 3000,
      autoIndex: true
    });

    console.log("MongoDB connected successfully!");
    return connection;
  } catch (error) {
    console.warn("MongoDB connection failed:", error.message);
    console.warn("Continuing without MongoDB. Set MONGODB_URI to a reachable local or Atlas instance.");
    return null;
  }
};

module.exports = connectDB;
