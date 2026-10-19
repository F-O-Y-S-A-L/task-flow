const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const requestId = require("./middleware/requestId");
const { notFound, errorHandler } = require("./middleware/errorHandler");
const authRoutes = require("./routes/auth.routes");
const projectRoutes = require("./routes/project.routes");
const taskRoutes = require("./routes/task.routes");
const redis = require("./config/redis");

const app = express(); 
app.disable("x-powered-by");
app.set("trust proxy", 1);
app.use(requestId);
app.use(helmet());
app.use(cors({ origin: process.env.APP_ORIGIN || "http://localhost:3000", credentials: true }));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: false, limit: "1mb" }));
app.use(morgan("combined"));
app.use("/api", rateLimit({ windowMs: 15 * 60 * 1000, limit: 300, standardHeaders: "draft-7", legacyHeaders: false }));
app.get("/health/live", (_req, res) => res.json({ status: "ok" }));
app.get("/health/ready", async (_req, res) => {
  try {
    await redis.ping();
    res.json({ status: "ready", dependencies: { redis: "ok" } });
  } catch (_err) {
    res.status(503).json({ status: "not_ready" });
  }
});
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/projects", projectRoutes);
app.use("/api/v1", taskRoutes);
app.use(notFound);
app.use(errorHandler);
module.exports = app;
