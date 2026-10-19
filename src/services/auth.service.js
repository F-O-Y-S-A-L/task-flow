const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const env = require("../config/env");
const { signAccessToken, signRefreshToken } = require("../utils/tokens");
const { emailQueue } = require("../config/queue");

const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex");

async function register({ name, email, password }) {
  const existing = await User.findOne({ email });
  if (existing) {
    const err = new Error("Email is already registered");
    err.statusCode = 409;
    throw err;
  }
  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({ name, email, passwordHash });
  await emailQueue.add("welcome-email", { to: user.email, name: user.name }, { attempts: 3, backoff: { type: "exponential", delay: 1000 }, removeOnComplete: 100 });
  return issueTokens(user);
}

async function login({ email, password }) {
  const user = await User.findOne({ email }).select("+passwordHash +refreshTokenHash");
  const ok = user && await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    const err = new Error("Invalid email or password");
    err.statusCode = 401;
    throw err;
  }
  return issueTokens(user);
}

async function issueTokens(user) {
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);
  user.refreshTokenHash = hashToken(refreshToken);
  await user.save();
  return { user: publicUser(user), accessToken, refreshToken };
}

async function refresh(refreshToken) {
  if (!refreshToken) {
    const err = new Error("Refresh token required");
    err.statusCode = 401;
    throw err;
  }
  let payload;
  try {
    payload = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET);
  } catch (_err) {
    const e = new Error("Invalid or expired refresh token"); e.statusCode = 401; throw e;
  }
  const user = await User.findById(payload.sub).select("+refreshTokenHash");
  if (!user || !user.refreshTokenHash || user.refreshTokenHash !== hashToken(refreshToken)) {
    const e = new Error("Refresh token has been revoked"); e.statusCode = 401; throw e;
  }
  return issueTokens(user);
}

async function logout(userId) {
  await User.findByIdAndUpdate(userId, { $unset: { refreshTokenHash: 1 } });
}
function publicUser(user) {
  return { id: user.id, name: user.name, email: user.email, role: user.role, createdAt: user.createdAt };
}
module.exports = { register, login, refresh, logout, publicUser };
