const sheetService = require('./sheet.service');
const lineService = require('./line.service'); // หรือ client pushMessage ที่คุณใช้อยู่

const FOLLOW_UP_DELAY_MS = 24 * 60 * 60 * 1000;

async function getPendingFollowUps() {
    const leads = await sheetService.getAllLeads();

    return leads.filter(lead =>
        lead.followUpStatus === 'pending' &&
        !lead.followUpSentAt &&
        !!lead.lastInteractionAt &&
        !!lead.userId
    );
}

function shouldSendFollowUp(lead) {
    if (!lead) return false;
    if (lead.followUpStatus !== 'pending') return false;
    if (lead.followUpSentAt) return false;
    if (!lead.lastInteractionAt) return false;

    const lastInteractionTime = new Date(lead.lastInteractionAtRaw).getTime();
    if (Number.isNaN(lastInteractionTime)) return false;

    const now = Date.now();
    return (now - lastInteractionTime) >= FOLLOW_UP_DELAY_MS;
}

async function sendFollowUp(lead) {
    const message = {
        type: 'text',
        text: `สวัสดีค่ะ สนใจสอบถามเพิ่มเติมเกี่ยวกับ ${lead.product || 'สินค้า'} ได้เลยนะคะ หากต้องการให้ช่วยแนะนำหรือสรุปราคาเพิ่มเติม แจ้งได้เลยค่ะ`
    };

    await lineService.pushMessage(lead.userId, [message]);
}

async function processPendingFollowUps() {
    const pendingLeads = await getPendingFollowUps();

    for (const lead of pendingLeads) {
        try {
            if (!shouldSendFollowUp(lead)) {
                continue;
            }

            await sendFollowUp(lead);

            const sentAt = new Date().toISOString();
            await sheetService.updateFollowUpSent(lead.rowIndex, 'sent', sentAt);

            console.log(`[FOLLOWUP] sent to userId=${lead.userId}, row=${lead.rowIndex}`);
        } catch (error) {
            console.error(`[FOLLOWUP] failed row=${lead.rowIndex}`, error);
        }
    }
}

module.exports = {
    getPendingFollowUps,
    shouldSendFollowUp,
    sendFollowUp,
    processPendingFollowUps
};