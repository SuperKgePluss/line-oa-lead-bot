const sheetService = require("../services/sheet.service");
const notificationService = require("../services/notification.service");
const taggingService = require("../services/tagging.service");

const PRODUCT_KEYWORDS = [
    "ppe",
    "หน้ากาก",
    "mask",
    "toggle",
    "clamp",
    "toggle clamp",
    "อะไหล่",
    "วาล์ว",
    "แคลมป์",
    "สปริง",
    "กิ๊บสแตนเลส",
    "ล้อ",
];

function addDays(dateString, days) {
    const date = new Date(dateString);
    date.setDate(date.getDate() + days);
    return date.toISOString();
}

function normalizeText(text) {
    return String(text || "").trim().toLowerCase();
}

function detectProduct(text) {
    const normalized = normalizeText(text);

    const matchedKeyword = PRODUCT_KEYWORDS.find((keyword) =>
        normalized.includes(keyword.toLowerCase())
    );

    return matchedKeyword || null;
}

function extractQuantity(text) {
    const match = String(text || "").match(/\d+/);
    if (!match) return "";

    const quantity = Number(match[0]);
    if (!Number.isFinite(quantity) || quantity <= 0) return "";

    return quantity;
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

            const detectedProduct = detectProduct(userText);

            // ถ้าไม่มีสินค้า/keyword ที่สนใจ ยังไม่บันทึก
            if (!detectedProduct) {
                console.log("[LEGACY] No product keyword detected, skipped:", {
                    userId,
                    text: userText,
                });
                continue;
            }

            const now = new Date().toISOString();
            const quantity = extractQuantity(userText);

            const completedLead = {
                userId,
                triggerKeyword: "legacy_smart_capture",
                name: "ไม่ระบุ",
                product: detectedProduct,
                quantity,
                startedAt: now,
                completedAt: now,
                followUpStatus: "pending",
                lastInteractionAt: now,
                followUpSentAt: "",
                followUpStage: 0,
                followUpSent1At: "",
                followUpSent2At: "",
                followUpSent3At: "",
                followUpSent4At: "",
                nextFollowUpAt: addDays(now, 30),
            };

            completedLead.tags = taggingService.generateTags(completedLead);

            try {
                await sheetService.appendLead(completedLead);
                console.log("[LEGACY] Smart lead appended successfully:", completedLead);
            } catch (error) {
                console.error("[LEGACY][SHEET] Failed to append smart lead:", error.message);
                console.error(error);
            }

            try {
                await notificationService.notifyNewLead(completedLead);
                console.log("[LEGACY] Notification sent successfully");
            } catch (error) {
                console.error("[LEGACY][NOTIFICATION] Failed:", error.message);
                console.error(error);
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