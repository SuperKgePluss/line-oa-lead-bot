const lineService = require("../services/line.service");
const keywordService = require("../services/keyword.service");
const leadFlowService = require("../services/leadFlow.service");
const invoiceFlowService = require("../services/invoiceFlow.service");
const userStateRepository = require("../repositories/userState.repository");
const sheetService = require("../services/sheet.service");
const notificationService = require("../services/notification.service");
const taggingService = require("../services/tagging.service");

async function handleWebhook(req, res) {
    try {
        const events = req.body.events || [];

        for (const event of events) {
            if (event.type !== "message") continue;
            if (event.message.type !== "text") continue;

            const userId = event.source.userId;
            const replyToken = event.replyToken;
            const userText = event.message.text;

            try {
                await sheetService.updateLastInteractionByUserId(userId, new Date().toISOString());
            } catch (error) {
                console.error("[SHEET] Failed to update last interaction:", error.message);
            }

            const existingState = userStateRepository.getUserState(userId);

            if (existingState && existingState.flowType === "completed") {
                const keywordResult = keywordService.getReplyByKeyword(userText);

                // 🔥 ถ้าเป็น keyword จริง → ปล่อยให้ไปเริ่ม flow ใหม่
                if (keywordResult.matched) {
                    // ไม่ต้อง reply ตรงนี้
                    // ปล่อยให้ไปเข้า CASE 2 ด้านล่าง
                } else {
                    // ถ้าไม่ใช่ keyword → soft reply
                    await lineService.replyText(
                        replyToken,
                        "ขอบคุณที่ติดต่อ Holken ครับ 😊 หากต้องการสอบถามเพิ่มเติม สามารถพิมพ์ \"ราคา\" หรือ \"ใบกำกับ\" ได้เลยนะครับ"
                    );
                    continue;
                }
            }

            if (!existingState) {
                console.log("[FLOW WARNING] No state found for user:", userId);
            }

            console.log("Incoming text:", userText);
            console.log("User ID:", userId);
            console.log("Existing state:", existingState);

            // CASE 1: USER ALREADY IN FLOW
            if (existingState && existingState.inFlow) {
                let flowResult;

                if (existingState.flowType === "invoice") {
                    flowResult = invoiceFlowService.handleFlowStep(userId, userText);
                } else {
                    flowResult = leadFlowService.handleFlowStep(userId, userText);
                }

                await lineService.replyText(replyToken, flowResult.message);

                if (flowResult.completed) {
                    if (existingState.flowType === "invoice") {
                        const completedInvoice = invoiceFlowService.completeFlow(userId);

                        console.log("Invoice flow completed:", completedInvoice);

                        try {
                            if (typeof sheetService.appendInvoiceRequest === "function") {
                                await sheetService.appendInvoiceRequest(completedInvoice);
                                console.log("[SHEET] Invoice request appended successfully:", completedInvoice);
                            } else {
                                console.log("[SHEET] appendInvoiceRequest() not implemented yet, skipping invoice save");
                            }

                            if (typeof notificationService.notifyNewInvoiceRequest === "function") {
                                await notificationService.notifyNewInvoiceRequest(completedInvoice);
                                console.log("[NOTIFICATION] Invoice notification sent successfully");
                            } else {
                                console.log("[NOTIFICATION] notifyNewInvoiceRequest() not implemented yet, skipping invoice notification");
                            }
                        } catch (error) {
                            console.error("[INVOICE] Failed during invoice post-processing:", error.message);
                            console.error(error);
                        }
                    } else {
                        const completedLead = leadFlowService.completeFlow(userId);
                        completedLead.tags = taggingService.generateTags(completedLead);

                        console.log("Lead completed:", completedLead);

                        try {
                            await sheetService.appendLead(completedLead);
                            console.log("[SHEET] Lead appended successfully:", completedLead);

                            try {
                                await notificationService.notifyNewLead(completedLead);
                                console.log("[NOTIFICATION] Lead notification sent successfully");
                            } catch (error) {
                                console.error("[NOTIFICATION] Failed to send notification:", error.message);
                                console.error(error);
                            }
                        } catch (error) {
                            console.error("[SHEET] Failed to append lead:", error.message);
                            console.error(error);
                        }
                    }
                }

                continue;
            }

            // CASE 2: USER NOT IN FLOW YET
            const keywordResult = keywordService.getReplyByKeyword(userText);

            await lineService.replyText(replyToken, keywordResult.replyText);

            if (keywordResult.matched) {
                if (keywordResult.flowType === "invoice") {
                    invoiceFlowService.startFlow(userId, keywordResult.keyword);
                } else if (keywordResult.flowType === "lead") {
                    leadFlowService.startFlow(userId, keywordResult.keyword);
                }
            }
        }

        res.status(200).send("OK");
    } catch (error) {
        console.error("Webhook Error:", error);
        res.status(500).send("Internal Server Error");
    }
}

module.exports = {
    handleWebhook,
};