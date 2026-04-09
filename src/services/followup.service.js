const sheetService = require('./sheet.service');
const lineService = require('./line.service');

function addDays(dateValue, days) {
    const date = new Date(dateValue);
    date.setDate(date.getDate() + days);
    return date;
}

function addMonths(dateValue, months) {
    const date = new Date(dateValue);
    date.setMonth(date.getMonth() + months);
    return date;
}

function isDue(nextFollowUpAt) {
    if (!nextFollowUpAt) return false;
    const nextTime = new Date(nextFollowUpAt).getTime();
    if (Number.isNaN(nextTime)) return false;
    return Date.now() >= nextTime;
}

function getStageMessage(stage, lead) {
    const product = lead.product || 'สินค้า';

    const messages = {
        0: `สวัสดีครับ 😊 ทาง Holken แวะมาสอบถามนะครับ ช่วงนี้มีสนใจที่ต้องการเพิ่มเติมเกี่ยวกับ ${product} ไหมครับ? ยินดีดูแลมากๆ ให้ได้เลยครับ 🙏`,
        1: `สวัสดีครับ 🛠️ Holken มีอะไหล่เครื่องจักรพร้อมส่งนะครับ ถ้ายังต้องการ ${product} หรืออยากปรึกษาเพิ่มเติม ทักมาได้เลยครับ`,
        2: `สวัสดีครับ 🙏 นานแล้วที่ไม่ได้คุยกัน ทาง Holken ยังดูแลอยู่นะครับ ถ้ามีอะไรให้ช่วยเรื่อง ${product} หรืออุปกรณ์ที่ถามไว้ ทักได้เลยครับ`,
        3: `สวัสดีครับ 😊 Holken ขอส่งความระลึกถึงนะครับ ถ้าปีนี้มีแพลนจัดซื้ออะไรเกี่ยวกับ ${product} ยินดีดูแลให้ครับ 🤍`,
    };

    return {
        type: 'text',
        text: messages[stage],
    };
}

function getNextSchedule(stage, baseDate) {
    if (stage === 0) return addDays(baseDate, 30);   // 30 -> 60
    if (stage === 1) return addMonths(baseDate, 4);  // 60 -> 6 เดือน
    if (stage === 2) return addMonths(baseDate, 6);  // 6 เดือน -> 1 ปี
    return null; // stage 3 คือจบแล้ว
}

async function getPendingFollowUps() {
    const leads = await sheetService.getAllLeads();

    return leads.filter((lead) =>
        lead.followUpStatus === 'pending' &&
        !!lead.userId &&
        !!lead.nextFollowUpAt &&
        Number(lead.followUpStage) < 4
    );
}

async function processPendingFollowUps() {
    const pendingLeads = await getPendingFollowUps();

    for (const lead of pendingLeads) {
        try {
            const stage = Number(lead.followUpStage || 0);

            if (!isDue(lead.nextFollowUpAt)) {
                continue;
            }

            const message = getStageMessage(stage, lead);
            await lineService.pushMessage(lead.userId, [message]);

            const now = new Date();
            const nextSchedule = getNextSchedule(stage, now);

            const payload = {
                followUpSentAt: now,
                followUpStage: stage + 1,
            };

            if (stage === 0) payload.followUpSent1At = now;
            if (stage === 1) payload.followUpSent2At = now;
            if (stage === 2) payload.followUpSent3At = now;
            if (stage === 3) payload.followUpSent4At = now;

            if (stage === 3) {
                payload.followUpStatus = 'completed';
                payload.nextFollowUpAt = '';
            } else {
                payload.followUpStatus = 'pending';
                payload.nextFollowUpAt = nextSchedule;
            }

            await sheetService.updateFollowUpProgress(lead.rowIndex, payload);

            console.log(`[FOLLOWUP] stage ${stage + 1} sent to userId=${lead.userId}, row=${lead.rowIndex}`);
        } catch (error) {
            console.error(`[FOLLOWUP] failed row=${lead.rowIndex}`, error);
        }
    }
}

module.exports = {
    getPendingFollowUps,
    processPendingFollowUps,
};