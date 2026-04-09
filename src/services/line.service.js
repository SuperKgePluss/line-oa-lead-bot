const { client } = require("../config/line");

async function replyText(replyToken, text) {
    return await client.replyMessage({
        replyToken,
        messages: [
            {
                type: "text",
                text,
            },
        ],
    });
}

async function pushText(to, text) {
    return await client.pushMessage({
        to,
        messages: [
            {
                type: "text",
                text,
            },
        ],
    });
}

async function pushMessage(to, messages) {
    return await client.pushMessage({
        to,
        messages,
    });
}

module.exports = {
    replyText,
    pushText,
    pushMessage,
};