const { Queue } = require("bullmq");
const redis = require("./redis");

const emailQueue = new Queue("email", { connection: redis });
module.exports = { emailQueue };
