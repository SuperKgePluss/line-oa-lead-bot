const userStateRepository = require("../repositories/userState.repository");

function isValidTaxId(text) {
    return /^\d{13}$/.test(text.trim());
}

function startFlow(userId, triggerKeyword) {
    const initialState = {
        userId,
        inFlow: true,
        flowType: "invoice",
        currentStep: "ask_invoice_name",
        triggerKeyword,
        invoiceData: {
            companyName: "",
            taxId: "",
            address: "",
        },
        startedAt: new Date().toISOString(),
        lastInteractionAt: new Date().toISOString(),
    };

    userStateRepository.setUserState(userId, initialState);

    return initialState;
}

function updateLastInteraction(state) {
    state.lastInteractionAt = new Date().toISOString();
    return state;
}

function handleFlowStep(userId, text) {
    const state = userStateRepository.getUserState(userId);

    if (!state || !state.inFlow) {
        return {
            success: false,
            message: "ไม่พบ flow ที่กำลังทำงานอยู่ครับ",
            completed: false,
        };
    }

    updateLastInteraction(state);

    if (state.currentStep === "ask_invoice_name") {
        const companyName = text.trim();

        if (!companyName) {
            return {
                success: false,
                message: "ขอทราบชื่อบริษัท / ชื่อผู้รับใบกำกับภาษีก่อนนะครับ",
                completed: false,
            };
        }

        state.invoiceData.companyName = companyName;
        state.currentStep = "ask_tax_id";

        userStateRepository.setUserState(userId, state);

        return {
            success: true,
            message: "ขอเลขประจำตัวผู้เสียภาษี 13 หลักด้วยนะครับ",
            completed: false,
        };
    }

    if (state.currentStep === "ask_tax_id") {
        const taxId = text.trim();

        if (!isValidTaxId(taxId)) {
            return {
                success: false,
                message: "รบกวนระบุเลขประจำตัวผู้เสียภาษี 13 หลักให้ถูกต้องนะครับ",
                completed: false,
            };
        }

        state.invoiceData.taxId = taxId;
        state.currentStep = "ask_invoice_address";

        userStateRepository.setUserState(userId, state);

        return {
            success: true,
            message: "ขอที่อยู่สำหรับออกใบกำกับภาษีด้วยนะครับ",
            completed: false,
        };
    }

    if (state.currentStep === "ask_invoice_address") {
        const address = text.trim();

        if (!address) {
            return {
                success: false,
                message: "ขอที่อยู่สำหรับออกใบกำกับภาษีด้วยนะครับ",
                completed: false,
            };
        }

        state.invoiceData.address = address;
        state.currentStep = "completed";
        state.completedAt = new Date().toISOString();

        userStateRepository.setUserState(userId, state);

        return {
            success: true,
            message: `ขอบคุณมากครับ 🙏
ทีมงาน Holken รับทราบข้อมูลแล้วนะครับ
จะจัดเตรียมใบกำกับภาษีพร้อมส่งให้ครับ`,
            completed: true,
            invoiceData: state.invoiceData,
            fullState: state,
        };
    }

    return {
        success: false,
        message: "เกิดข้อผิดพลาดใน flow กรุณาเริ่มใหม่อีกครั้งครับ",
        completed: false,
    };
}

function completeFlow(userId) {
    const state = userStateRepository.getUserState(userId);

    if (!state) return null;

    const completedAt = state.completedAt || new Date().toISOString();

    const completedInvoice = {
        userId: state.userId,
        flowType: "invoice",
        triggerKeyword: state.triggerKeyword,
        companyName: state.invoiceData.companyName,
        taxId: state.invoiceData.taxId,
        address: state.invoiceData.address,
        startedAt: state.startedAt,
        completedAt,
        lastInteractionAt: completedAt,
    };

    state.inFlow = false;
    state.flowType = "completed";
    userStateRepository.setUserState(userId, state);

    return completedInvoice;
}

function cancelFlow(userId) {
    userStateRepository.clearUserState(userId);
}

module.exports = {
    startFlow,
    handleFlowStep,
    completeFlow,
    cancelFlow,
};