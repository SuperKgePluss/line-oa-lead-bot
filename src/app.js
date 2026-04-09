const express = require("express");
const webhookRoute = require("./routes/webhook.route");
const followupService = require("./services/followup.service");

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
}, 5 * 60 * 1000);

module.exports = app;