const env = require("../config/env");

function notFound(req, res) {
  res.status(404).json({ error: { message: `Route not found: ${req.method} ${req.originalUrl}` } });
}
function errorHandler(err, req, res, _next) {
  console.error(err);
  if (err.code === 11000) {
    return res.status(409).json({ error: { message: "A record with this value already exists" } });
  }
  if (err.name === "ValidationError") {
    return res.status(400).json({ error: { message: "Database validation failed" } });
  }
  const status = err.statusCode || 500;
  res.status(status).json({
    error: { message: status === 500 && env.NODE_ENV === "production" ? "Internal server error" : (err.message || "Internal server error") }
  });
}
module.exports = { notFound, errorHandler };
