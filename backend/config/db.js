
const mongoose = require("mongoose");

const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error(
      "MONGODB_URI is missing. Please configure it in your .env file."
    );
  }

  try {
    const connection = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
      autoIndex: true,
    });

    console.log("MongoDB connected successfully!");

    return connection;
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);

    throw error;
  }
};

module.exports = connectDB;
