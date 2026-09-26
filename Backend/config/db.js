// config/db.js
const mongoose = require("mongoose");
const logger = require("./loggerConfig");

let connectionPromise = null;

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (connectionPromise) {
    return connectionPromise;
  }

  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is not configured");
  }

  connectionPromise = mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 5000,
  })
    .then((conn) => {
      logger.info(`📌 MongoDB Connected: ${conn.connection.host}`);
      return conn.connection;
    })
    .catch((error) => {
      connectionPromise = null;
      logger.error(`❌ MongoDB Connection Error: ${error.message}`);
      throw error;
    });

  return connectionPromise;
};

// Log mongoose connection events
mongoose.connection.on("connected", () => {
  logger.info("✅ Mongoose connected to database");
});

mongoose.connection.on("error", (err) => {
  logger.error(`❌ Mongoose error: ${err}`);
});

mongoose.connection.on("disconnected", () => {
  connectionPromise = null;
  logger.warn("⚠️ Mongoose disconnected");
});

// Close connection on server shutdown
process.on("SIGINT", async () => {
  await mongoose.connection.close();
  logger.info("🔻 Mongoose connection closed due to app termination");
  process.exit(0);
});

module.exports = connectDB;
