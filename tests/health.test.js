const request = require("supertest");
const app = require("../src/app");
const redis = require("../src/config/redis");
const { emailQueue } = require("../src/config/queue");
const { default: mongoose } = require("mongoose");

describe("health endpoints", () => {
  afterAll(async () => {
    await emailQueue.close(); // BullMQ queue বন্ধ
    if (mongoose.connection.readyState) {
      await mongoose.connection.close(); // MongoDB connection বন্ধ
    }
    redis.removeAllListeners(); // Redis event listener remove
    await redis.quit(); // Redis client quit
  });

  test("liveness endpoint returns ok", async () => {
    const response = await request(app).get("/health/live");
    expect(response.status).toBe(200);
    expect(response.body.status).toBe("ok");
  });

  test("unknown route returns 404", async () => {
    const response = await request(app).get("/not-a-route");
    expect(response.status).toBe(404);
  });
});
