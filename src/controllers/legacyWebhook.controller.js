const userStateRepository = require("../repositories/userState.repository");
const sheetService = require("../services/sheet.service");
const notificationService = require("../services/notification.service");
const taggingService = require("../services/tagging.service");
const { isValidQuantity } = require("../utils/validator.util");

function getLegacyUserKey(userId) {
    return `legacy:${userId}`;
}

function addDays(dateString, days) {
    const date = new Date(dateString);
    date.setDate(date.getDate() + days);
    return date.toISOString();
}

async function handleLegacyWebhook(req, res) {
    try {
        const events = req.body.events || [];

        for (const event of events) {
            if (event.type !== "message") continue;
            if (event.message.type !== "text") continue;

            const userId = event.source.userId;
            const userText = (event.message.text || "").trim();
            if (!userId || !userText) continue;

            const stateKey = getLegacyUserKey(userId);
            let state = userStateRepository.getUserState(stateKey);

            if (!state) {
                state = {
                    userId,
                    inFlow: true,
                    flowType: "legacy_lead",
                    currentStep: "ask_product",
                    leadData: {
                        name: userText,
                        product: "",
                        quantity: "",
                    },
                    startedAt: new Date().toISOString(),
                    lastInteractionAt: new Date().toISOString(),
                };

                userStateRepository.setUserState(stateKey, state);
                console.log("[LEGACY] Step 1 saved (name):", { userId, name: userText });
                continue;
            }

            if (state.currentStep === "ask_product") {
                state.leadData.product = userText;
                state.currentStep = "ask_quantity";
                state.lastInteractionAt = new Date().toISOString();

                userStateRepository.setUserState(stateKey, state);
                console.log("[LEGACY] Step 2 saved (product):", { userId, product: userText });
                continue;
            }

            if (state.currentStep === "ask_quantity") {
                if (!isValidQuantity(userText)) {
                    console.log("[LEGACY] Invalid quantity, ignored:", { userId, text: userText });
                    continue;
                }

                state.leadData.quantity = Number(userText.trim());
                state.completedAt = new Date().toISOString();
                state.lastInteractionAt = state.completedAt;

                const completedLead = {
                    userId: state.userId,
                    triggerKeyword: "legacy_manual",
                    name: state.leadData.name,
                    product: state.leadData.product,
                    quantity: state.leadData.quantity,
                    startedAt: state.startedAt,
                    completedAt: state.completedAt,
                    followUpStatus: "pending",
                    lastInteractionAt: state.completedAt,
                    followUpSentAt: "",
                    followUpStage: 0,
                    followUpSent1At: "",
                    followUpSent2At: "",
                    followUpSent3At: "",
                    followUpSent4At: "",
                    nextFollowUpAt: addDays(state.completedAt, 30),
                };

                completedLead.tags = taggingService.generateTags(completedLead);

                try {
                    await sheetService.appendLead(completedLead);
                    console.log("[LEGACY] Lead appended successfully:", completedLead);
                } catch (error) {
                    console.error("[LEGACY][SHEET] Failed to append lead:", error.message);
                    console.error(error);
                }

                try {
                    await notificationService.notifyNewLead(completedLead);
                    console.log("[LEGACY] Notification sent successfully");
                } catch (error) {
                    console.error("[LEGACY][NOTIFICATION] Failed:", error.message);
                    console.error(error);
                }

                userStateRepository.clearUserState(stateKey);
                continue;
            }
        }

        res.status(200).send("OK");
    } catch (error) {
        console.error("[LEGACY] Webhook Error:", error);
        res.status(500).send("Internal Server Error");
    }
}

module.exports = {
    handleLegacyWebhook,
};