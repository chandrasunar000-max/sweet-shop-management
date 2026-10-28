
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = require("./config/db");

const app = express();

app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json());

// Health-check endpoint
app.get("/api/health", (req, res) => {
  const databaseStatus = mongoose.connection.readyState === 1 ? "connected" : "demo-mode";

  res.status(200).json({
    success: true,
    message: "Sweet Shop backend is running!",
    database: databaseStatus
  });
});

// Connect to MongoDB before starting the server
const startServer = async () => {
  try {
    await connectDB();

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();
