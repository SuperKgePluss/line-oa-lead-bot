require("dotenv").config();

const line = require("@line/bot-sdk");

const legacyLineConfig = {
  channelSecret: process.env.LEGACY_LINE_CHANNEL_SECRET,
};

module.exports = {
  line,
  legacyLineConfig,
};