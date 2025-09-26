/**
 * Request Logger Middleware
 * Logs incoming requests with timestamp, method, and path
 */

const requestLogger = (req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
};

module.exports = requestLogger;
