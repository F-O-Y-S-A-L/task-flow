const request = require("supertest");
const app = require("../src/app");
const redis = require("../src/config/redis");
const { emailQueue } = require("../src/config/queue");

describe("health endpoints", () => {
  afterAll(async () => {
    await emailQueue.close();
    await redis.quit();
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
