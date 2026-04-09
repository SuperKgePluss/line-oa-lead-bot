const userStateRepository = require("../repositories/userState.repository");
const { isValidQuantity } = require("../utils/validator.util");

function addDays(dateString, days) {
    const date = new Date(dateString);
    date.setDate(date.getDate() + days);
    return date.toISOString();
}

function startFlow(userId, triggerKeyword) {
    const initialState = {
        userId,
        inFlow: true,
        flowType: "lead",
        currentStep: "ask_name",
        triggerKeyword,
        leadData: {
            name: "",
            product: "",
            quantity: "",
        },
        startedAt: new Date().toISOString(),
        lastInteractionAt: new Date().toISOString(),
    };

    userStateRepository.setUserState(userId, initialState);

    return {
        state: initialState,
        message: "ขอทราบชื่อคุณลูกค้าด้วยนะครับ 😊"
    };
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

    if (state.currentStep === "ask_name") {
        const name = text.trim();

        if (!name) {
            return {
                success: false,
                message: "ขอทราบชื่อคุณลูกค้าด้วยนะครับ 😊",
                completed: false,
            };
        }

        state.leadData.name = name;
        state.currentStep = "ask_product";

        userStateRepository.setUserState(userId, state);

        return {
            success: true,
            message: "คุณลูกค้าสนใจสินค้าประเภทไหนครับ? เช่น toggle clamp, อะไหล่เครื่องจักร, PPE, ล้อ, สปริง, กิ๊บสแตนเลส หรืออื่นๆ",
            completed: false,
        };
    }

    if (state.currentStep === "ask_product") {
        const product = text.trim();

        if (!product) {
            return {
                success: false,
                message: "คุณลูกค้าสนใจสินค้าประเภทไหนครับ? เช่น toggle clamp, อะไหล่เครื่องจักร, PPE, ล้อ, สปริง, กิ๊บสแตนเลส หรืออื่นๆ",
                completed: false,
            };
        }

        state.leadData.product = product;
        state.currentStep = "ask_quantity";

        userStateRepository.setUserState(userId, state);

        return {
            success: true,
            message: "ต้องการจำนวนประมาณเท่าไหร่ครับ?",
            completed: false,
        };
    }

    if (state.currentStep === "ask_quantity") {
        if (!isValidQuantity(text)) {
            return {
                success: false,
                message: "รบกวนระบุจำนวนเป็นตัวเลขจำนวนเต็มที่มากกว่า 0 นะครับ",
                completed: false,
            };
        }

        state.leadData.quantity = Number(text.trim());
        state.currentStep = "completed";
        state.completedAt = new Date().toISOString();

        userStateRepository.setUserState(userId, state);

        return {
            success: true,
            message: `ขอบคุณมากครับ 🙏
ทีมงาน Holken รับทราบแล้วนะครับ
จะเตรียมใบเสนอราคาและติดต่อกลับภายใน 1 ชั่วโมงครับ`,
            completed: true,
            leadData: state.leadData,
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

    const completedLead = {
        userId: state.userId,
        triggerKeyword: state.triggerKeyword,
        name: state.leadData.name,
        product: state.leadData.product,
        quantity: state.leadData.quantity,
        startedAt: state.startedAt,
        completedAt,
        followUpStatus: "pending",
        lastInteractionAt: completedAt,
        followUpSentAt: "",
        followUpStage: 0,
        followUpSent1At: "",
        followUpSent2At: "",
        followUpSent3At: "",
        followUpSent4At: "",
        nextFollowUpAt: addDays(completedAt, 30),
    };

    state.inFlow = false;
    state.flowType = "completed";
    userStateRepository.setUserState(userId, state);

    return completedLead;
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