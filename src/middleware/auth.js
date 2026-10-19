const jwt = require("jsonwebtoken");
const env = require("../config/env");
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");

const requireAuth = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: { message: "Authentication required" } });

  let payload;
  try {
    payload = jwt.verify(token, env.JWT_ACCESS_SECRET);
  } catch (_err) {
    return res.status(401).json({ error: { message: "Invalid or expired access token" } });
  }

  const user = await User.findById(payload.sub);
  if (!user) return res.status(401).json({ error: { message: "User no longer exists" } });
  req.user = user;
  next();
});

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: { message: "Insufficient permissions" } });
    }
    next();
  };
}
module.exports = { requireAuth, requireRole };
