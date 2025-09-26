/**
 * JSON-Only API Middleware
 * Ensures API routes only serve JSON responses and accept JSON requests
 */

const validateAcceptHeader = (req, res, next) => {
  const acceptsJson = req.accepts("json");
  const acceptsHtml = req.accepts("html");

  // If client prefers HTML over JSON, reject the request
  if (acceptsHtml && !acceptsJson) {
    return res
      .status(406)
      .send(
        "This API only serves JSON. Please set Accept: application/json header."
      );
  }

  // If no Accept header or doesn't include json, reject
  if (!acceptsJson) {
    return res
      .status(406)
      .send(
        "This API only serves JSON. Please set Accept: application/json header."
      );
  }

  next();
};

const validateContentType = (req, res, next) => {
  if (["POST", "PUT", "PATCH"].includes(req.method)) {
    if (!req.is("application/json")) {
      return res
        .status(415)
        .send(
          "This API only accepts JSON. Please set Content-Type: application/json header."
        );
    }
  }
  next();
};

module.exports = {
  validateAcceptHeader,
  validateContentType,
};
