
const http = require("node:http");
const app = require("./app.js");
const env = require("./config/env.js");
const { connectDB } = require("./config/db.js");
const redis = require("./config/redis.js");
const { emailQueue } = require("./config/queue.js");
const mongoose = require("mongoose");

async function start() {
  await connectDB();
  await redis.ping();

  const server = http.createServer(app);

  server.listen(env.PORT, () => {
    console.log(`TaskFlow API listening on ports ${env.PORT}`);
  });

  const shutdown = async (signal) => {
    console.log(`${signal} received; shutting down`);

    server.close(async () => {
      try {
        await emailQueue.close();
        await redis.quit();
        await mongoose.disconnect();
        process.exit(0);
      } catch (err) {
        console.error("Shutdown failed:", err);
        process.exit(1);
      }
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
