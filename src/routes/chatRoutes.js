const express = require('express');
const { streamChat } = require('../services/chatService');

const router = express.Router();

router.post('/chat', async (req, res) => {
    const { messages } = req.body;

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
        console.error('Chat error:', error);
        res.write(`data: ${JSON.stringify({ type: 'error', message: 'Something went wrong. Please try again.' })}\n\n`);
        res.end();
    }
});

module.exports = router;
