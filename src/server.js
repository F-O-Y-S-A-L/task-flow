const http = require("http");
const app = require("./app");
const env = require("./config/env");
const { connectDB } = require("./config/db");
const redis = require("./config/redis");
const { emailQueue } = require("./config/queue");

async function start() {
  await connectDB();
  await redis.ping();
  const server = http.createServer(app);
  server.listen(env.PORT, () => console.log(`TaskFlow API listening on port ${env.PORT}`));

  const shutdown = async (signal) => {
    console.log(`${signal} received; shutting down`);
    server.close(async () => {
      await emailQueue.close();
      await redis.quit();
      const mongoose = require("mongoose");
      await mongoose.disconnect();
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10000).unref();
  };
  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}
start().catch((err) => {
  console.error("Failed to start API:", err);
  process.exit(1);
});
