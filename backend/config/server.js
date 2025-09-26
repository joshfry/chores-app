/**
 * Server Configuration
 * Centralized configuration for the Express server
 */

const config = {
  port: process.env.PORT || 3001,
  env: process.env.NODE_ENV || "development",
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  },
};

module.exports = config;
