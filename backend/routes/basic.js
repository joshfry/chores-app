/**
 * Basic Routes
 * Health check and API documentation endpoints
 */

const express = require("express");
const router = express.Router();

// Health check endpoint
router.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Chores API is running!",
    timestamp: new Date().toISOString(),
  });
});

// Root API documentation endpoint
router.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Welcome to the Family Chores API",
    version: "1.0.0",
    endpoints: {
      health: "/health",
      children: "/api/children",
      chores: "/api/chores",
      assignments: "/api/assignments",
      dashboard: "/api/dashboard/stats",
    },
  });
});

module.exports = router;
