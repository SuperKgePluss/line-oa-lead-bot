const express = require("express");
const router = express.Router();
const legacyWebhookController = require("../controllers/legacyWebhook.controller");
const { line, legacyLineConfig } = require("../config/legacyLine");

router.post("/", line.middleware(legacyLineConfig), legacyWebhookController.handleLegacyWebhook);

module.exports = router;