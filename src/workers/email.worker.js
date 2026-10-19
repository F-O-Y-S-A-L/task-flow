const { Worker } = require("bullmq");
const redis = require("../config/redis");
const env = require("../config/env");

const worker = new Worker("email", async (job) => {
  const { to, name } = job.data;
  // Add a real SMTP provider here before production. This log keeps local demo jobs observable.
  if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASS) {
    console.log(`[email demo] job=${job.id} to=${to} template=${job.name} name=${name}`);
    return { delivered: false, mode: "demo-no-smtp" };
  }
  // Deliberately fail closed rather than pretending email was sent.
  throw new Error("SMTP adapter is not implemented. Configure a provider adapter before production.");
}, { connection: redis, concurrency: 5 });

worker.on("completed", (job) => console.log(`Email job ${job.id} completed`));
worker.on("failed", (job, err) => console.error(`Email job ${job?.id} failed:`, err.message));
async function shutdown() {
  await worker.close();
  await redis.quit();
  process.exit(0);
}
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
