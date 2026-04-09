const KEYWORDS = {
    "ราคา": {
        replyText: `สวัสดีครับ 🙏 ขอบคุณที่ติดต่อ Holken นะครับ
ยินดีเตรียมข้อมูลและใบเสนอราคาให้เลยครับ
รบกวนขอข้อมูลเพิ่มเติมสักเล็กน้อยนะครับ

ขอทราบชื่อคุณลูกค้าด้วยนะครับ 😊`,
        flowType: "lead",
        startLeadFlow: true,
    },
    "สั่ง": {
        replyText: `สวัสดีครับ 🙏 ขอบคุณที่ติดต่อ Holken นะครับ
ยินดีเตรียมข้อมูลและใบเสนอราคาให้เลยครับ
รบกวนขอข้อมูลเพิ่มเติมสักเล็กน้อยนะครับ

ขอทราบชื่อคุณลูกค้าด้วยนะครับ 😊`,
        flowType: "lead",
        startLeadFlow: true,
    },
    "อะไหล่": {
        replyText: `สวัสดีครับ 🙏 ขอบคุณที่ติดต่อ Holken นะครับ
ยินดีเตรียมข้อมูลและใบเสนอราคาให้เลยครับ
รบกวนขอข้อมูลเพิ่มเติมสักเล็กน้อยนะครับ

ขอทราบชื่อคุณลูกค้าด้วยนะครับ 😊`,
        flowType: "lead",
        startLeadFlow: true,
    },
    "toggle": {
        replyText: `สวัสดีครับ 🙏 ขอบคุณที่ติดต่อ Holken นะครับ
ยินดีเตรียมข้อมูลและใบเสนอราคาให้เลยครับ
รบกวนขอข้อมูลเพิ่มเติมสักเล็กน้อยนะครับ

ขอทราบชื่อคุณลูกค้าด้วยนะครับ 😊`,
        flowType: "lead",
        startLeadFlow: true,
    },
    "clamp": {
        replyText: `สวัสดีครับ 🙏 ขอบคุณที่ติดต่อ Holken นะครับ
ยินดีเตรียมข้อมูลและใบเสนอราคาให้เลยครับ
รบกวนขอข้อมูลเพิ่มเติมสักเล็กน้อยนะครับ

ขอทราบชื่อคุณลูกค้าด้วยนะครับ 😊`,
        flowType: "lead",
        startLeadFlow: true,
    },
    "ppe": {
        replyText: `สวัสดีครับ 🙏 ขอบคุณที่ติดต่อ Holken นะครับ
ยินดีเตรียมข้อมูลและใบเสนอราคาให้เลยครับ
รบกวนขอข้อมูลเพิ่มเติมสักเล็กน้อยนะครับ

ขอทราบชื่อคุณลูกค้าด้วยนะครับ 😊`,
        flowType: "lead",
        startLeadFlow: true,
    },
    "หน้ากาก": {
        replyText: `สวัสดีครับ 🙏 ขอบคุณที่ติดต่อ Holken นะครับ
ยินดีเตรียมข้อมูลและใบเสนอราคาให้เลยครับ
รบกวนขอข้อมูลเพิ่มเติมสักเล็กน้อยนะครับ

ขอทราบชื่อคุณลูกค้าด้วยนะครับ 😊`,
        flowType: "lead",
        startLeadFlow: true,
    },
    "ใบเสนอ": {
        replyText: `สวัสดีครับ 🙏 ขอบคุณที่ติดต่อ Holken นะครับ
ยินดีเตรียมข้อมูลและใบเสนอราคาให้เลยครับ
รบกวนขอข้อมูลเพิ่มเติมสักเล็กน้อยนะครับ

ขอทราบชื่อคุณลูกค้าด้วยนะครับ 😊`,
        flowType: "lead",
        startLeadFlow: true,
    },
    "วาล์ว": {
        replyText: `สวัสดีครับ 🙏 ขอบคุณที่ติดต่อ Holken นะครับ
ยินดีเตรียมข้อมูลและใบเสนอราคาให้เลยครับ
รบกวนขอข้อมูลเพิ่มเติมสักเล็กน้อยนะครับ

ขอทราบชื่อคุณลูกค้าด้วยนะครับ 😊`,
        flowType: "lead",
        startLeadFlow: true,
    },
    "แคลมป์": {
        replyText: `สวัสดีครับ 🙏 ขอบคุณที่ติดต่อ Holken นะครับ
ยินดีเตรียมข้อมูลและใบเสนอราคาให้เลยครับ
รบกวนขอข้อมูลเพิ่มเติมสักเล็กน้อยนะครับ

ขอทราบชื่อคุณลูกค้าด้วยนะครับ 😊`,
        flowType: "lead",
        startLeadFlow: true,
    },

    "ใบกำกับ": {
        replyText: `รับทราบครับ 🙏
ทาง Holken ออกใบกำกับภาษีได้เลยครับ
รบกวนแจ้งข้อมูลสำหรับออกเอกสารด้วยนะครับ

ขอทราบชื่อบริษัท / ชื่อผู้รับใบกำกับภาษีก่อนนะครับ`,
        flowType: "invoice",
        startLeadFlow: false,
    },
    "ใบกำกับภาษี": {
        replyText: `รับทราบครับ 🙏
ทาง Holken ออกใบกำกับภาษีได้เลยครับ
รบกวนแจ้งข้อมูลสำหรับออกเอกสารด้วยนะครับ

ขอทราบชื่อบริษัท / ชื่อผู้รับใบกำกับภาษีก่อนนะครับ`,
        flowType: "invoice",
        startLeadFlow: false,
    },
    "vat": {
        replyText: `รับทราบครับ 🙏
ทาง Holken ออกใบกำกับภาษีได้เลยครับ
รบกวนแจ้งข้อมูลสำหรับออกเอกสารด้วยนะครับ

ขอทราบชื่อบริษัท / ชื่อผู้รับใบกำกับภาษีก่อนนะครับ`,
        flowType: "invoice",
        startLeadFlow: false,
    },
    "ภาษี": {
        replyText: `รับทราบครับ 🙏
ทาง Holken ออกใบกำกับภาษีได้เลยครับ
รบกวนแจ้งข้อมูลสำหรับออกเอกสารด้วยนะครับ

ขอทราบชื่อบริษัท / ชื่อผู้รับใบกำกับภาษีก่อนนะครับ`,
        flowType: "invoice",
        startLeadFlow: false,
    },
};

function normalizeText(text) {
    return text.trim().toLowerCase();
}

function getReplyByKeyword(text) {
    const normalizedText = normalizeText(text);
    const keywordData = KEYWORDS[normalizedText];

    if (keywordData) {
        return {
            matched: true,
            keyword: normalizedText,
            replyText: keywordData.replyText,
            startLeadFlow: keywordData.startLeadFlow || false,
            flowType: keywordData.flowType || null,
        };
    }

    return {
        matched: false,
        keyword: null,
        replyText: `ขออภัยครับ 🙏
หากต้องการสอบถามสินค้าเพิ่มเติม สามารถพิมพ์คำว่า "ราคา" หรือ "สั่ง" ได้เลยนะครับ 😊

หรือหากต้องการใบกำกับภาษี สามารถพิมพ์ "ใบกำกับ" ได้ครับ`,
        startLeadFlow: false,
        flowType: null,
    };
}

module.exports = {
    normalizeText,
    getReplyByKeyword,
};