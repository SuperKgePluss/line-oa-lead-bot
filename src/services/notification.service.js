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
        return "-";
    }

    return tags.join(", ");
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

function getSalesUserIds() {
    const multiIds = process.env.SALES_LINE_USER_IDS;
    const singleId = process.env.SALES_LINE_USER_ID;

    if (multiIds) {
        return multiIds
            .split(",")
            .map((id) => id.trim())
            .filter(Boolean);
    }

    if (singleId) {
        return [singleId.trim()];
    }

    throw new Error("Missing SALES_LINE_USER_IDS or SALES_LINE_USER_ID in environment variables");
}

async function notifyNewLead(lead) {
    if (!lead) {
        throw new Error("Lead data is required");
    }

    const salesUserIds = getSalesUserIds();
    const messageText = formatLeadNotification(lead);

    console.log("[NOTIFICATION] Sending new lead notification...", {
        salesUserIds,
        lead,
    });

    const results = [];

    for (const userId of salesUserIds) {
        await lineService.pushText(userId, messageText);
        results.push({
            success: true,
            target: userId,
        });
    }

    console.log("[NOTIFICATION] Sent successfully");

    return {
        success: true,
        targets: salesUserIds,
        message: messageText,
        results,
    };
}

module.exports = {
    notifyNewLead,
    formatLeadNotification,
};