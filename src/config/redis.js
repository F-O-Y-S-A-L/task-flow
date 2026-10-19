const Redis = require("ioredis");
const env = require("./env");

const redis = new Redis({
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  password: env.REDIS_PASSWORD || undefined,
  maxRetriesPerRequest: null,
  enableReadyCheck: true
});
redis.on("error", (err) => console.error("Redis error:", err.message));
module.exports = redis;
