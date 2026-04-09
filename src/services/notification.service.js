const lineService = require("./line.service");

function formatDateTime(dateString) {
    if (!dateString) return "-";

    const date = new Date(dateString);

    return date.toLocaleString("th-TH", {
        dateStyle: "medium",
        timeStyle: "short",
    });
}

function formatTags(tags) {
    if (!Array.isArray(tags) || tags.length === 0) {
        return '-';
    }

    return tags.join(', ');
}

function formatLeadNotification(lead) {
    return [
        "มี Lead ใหม่",
        "",
        `ชื่อ: ${lead.name || "-"}`,
        `สินค้า: ${lead.product || "-"}`,
        `จำนวน: ${lead.quantity || "-"}`,
        `Keyword: ${lead.triggerKeyword || "-"}`,
        `Tags: ${formatTags(lead.tags)}`,
        `เวลา: ${formatDateTime(lead.completedAt)}`,
    ].join("\n");
}

async function notifyNewLead(lead) {
    const salesUserId = process.env.SALES_LINE_USER_ID;

    if (!salesUserId) {
        throw new Error("Missing SALES_LINE_USER_ID in environment variables");
    }

    if (!lead) {
        throw new Error("Lead data is required");
    }

    const messageText = formatLeadNotification(lead);

    console.log("[NOTIFICATION] Sending new lead notification...", {
        salesUserId,
        lead,
    });

    await lineService.pushText(salesUserId, messageText);

    console.log("[NOTIFICATION] Sent successfully");

    return {
        success: true,
        target: salesUserId,
        message: messageText,
    };
}

module.exports = {
    notifyNewLead,
    formatLeadNotification,
};