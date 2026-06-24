const express = require('express');
const { streamChat } = require('../services/chatService');

const router = express.Router();
const MAX_CONVERSATION_MESSAGES = Number(process.env.CHAT_MAX_MESSAGES) || 20;
const MAX_MESSAGE_LENGTH = Number(process.env.CHAT_MAX_MESSAGE_LENGTH) || 2000;
const VALID_ROLES = new Set(['user', 'assistant']);

function validateMessages(messages) {
    if (!Array.isArray(messages)) {
        return 'messages must be an array';
    }

    if (messages.length === 0) {
        return 'messages must include at least one message';
    }

    if (messages.length > MAX_CONVERSATION_MESSAGES) {
        return `messages cannot exceed ${MAX_CONVERSATION_MESSAGES} entries`;
    }

    for (const [index, message] of messages.entries()) {
        if (!message || typeof message !== 'object') {
            return `messages[${index}] must be an object`;
        }

        if (!VALID_ROLES.has(message.role)) {
            return `messages[${index}].role must be user or assistant`;
        }

        if (typeof message.content !== 'string' || !message.content.trim()) {
            return `messages[${index}].content must be a non-empty string`;
        }

        if (message.content.length > MAX_MESSAGE_LENGTH) {
            return `messages[${index}].content cannot exceed ${MAX_MESSAGE_LENGTH} characters`;
        }
    }

    return null;
}

function fallbackEvent() {
    return `data: ${JSON.stringify({
        type: 'text',
        text: "I'm having trouble reaching thriftAssist right now. Please try again in a moment."
    })}\n\n`;
}

router.post('/chat', async (req, res) => {
    const { messages } = req.body;
    const validationError = validateMessages(messages);

    if (validationError) {
        return res.status(400).json({ message: validationError });
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    try {
        await streamChat({
            messages,
            userId: req.session?.userId,
            res
        });
        res.end();
    } catch (error) {
        if (process.env.NODE_ENV !== 'test') {
            console.error('Chat error:', error);
        }
        res.write(fallbackEvent());
        res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`);
        res.end();
    }
});

module.exports = router;
