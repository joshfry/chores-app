/**
 * Express App Setup
 * Configures middleware, routes, and error handling
 */

const express = require("express");
const cors = require("cors");

const config = require("./config/server");
const requestLogger = require("./middleware/logger");
const {
  validateAcceptHeader,
  validateContentType,
} = require("./middleware/json-only");
const apiRoutes = require("./routes");
const basicRoutes = require("./routes/basic");

const app = express();

// Basic middleware
app.use(cors(config.cors));
app.use(express.json());
app.use(requestLogger);

// JSON-only middleware for API routes
app.use("/api", validateAcceptHeader);
app.use("/api", validateContentType);

// Routes
app.use("/api", apiRoutes);
app.use(basicRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Endpoint not found",
    path: req.originalUrl,
  });
});

module.exports = app;
