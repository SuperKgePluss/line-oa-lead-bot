const express = require("express");
const router = express.Router();
const webhookController = require("../controllers/webhook.controller");
const { line, lineConfig } = require("../config/line");

router.post("/", line.middleware(lineConfig), webhookController.handleWebhook);

module.exports = router;