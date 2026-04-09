const express = require("express");
const webhookRoute = require("./routes/webhook.route");
const followupService = require("./services/followup.service");
const FOLLOWUP_CHECK_INTERVAL_MS = Number(process.env.FOLLOWUP_CHECK_INTERVAL_MS || 24 * 60 * 60 * 1000);

const app = express();

app.use("/webhook", webhookRoute);
app.use(express.json());

setInterval(async () => {
    try {
        console.log("[FOLLOWUP] checking pending follow-ups...");
        await followupService.processPendingFollowUps();
    } catch (error) {
        console.error("[FOLLOWUP] scheduler error:", error);
    }
}, FOLLOWUP_CHECK_INTERVAL_MS);

module.exports = app;