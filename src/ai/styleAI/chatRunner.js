const Anthropic = require('@anthropic-ai/sdk');
const config = require('../../config');
const getFetch = require('../../services/fetchCompat');
const { MAX_TOOL_LOOPS, PROVIDER_TIMEOUT_MS } = require('./constants');
const { buildSystemPrompt } = require('./prompt');
const { handleToolUse } = require('./toolHandlers');
const { tools } = require('./toolDefinitions');
const { withTimeout, writeFallback, writeSse } = require('./streaming');

const anthropic = new Anthropic({
    apiKey: config.anthropicApiKey,
    fetch: getFetch()
});

async function streamChat({ messages, userId, res }) {
    const systemPrompt = await buildSystemPrompt(userId);
    const allMessages = [...messages];
    let toolLoopCount = 0;

    while (true) {
        const stream = anthropic.messages.stream({
            model: 'claude-opus-4-6',
            max_tokens: 1024,
            system: systemPrompt,
            tools,
            messages: allMessages
        });

        const iterator = stream[Symbol.asyncIterator]();
        while (true) {
            const { done, value: event } = await withTimeout(
                iterator.next(),
                PROVIDER_TIMEOUT_MS,
                'Timed out waiting for Anthropic stream event'
            );

            if (done) break;

            if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
                writeSse(res, { type: 'text', text: event.delta.text });
            }
        }

        const finalMessage = await withTimeout(
            stream.finalMessage(),
            PROVIDER_TIMEOUT_MS,
            'Timed out waiting for Anthropic final message'
        );

        if (finalMessage.stop_reason === 'end_turn') {
            writeSse(res, { type: 'done' });
            break;
        }

        if (finalMessage.stop_reason !== 'tool_use') {
            writeSse(res, { type: 'done' });
            break;
        }

        toolLoopCount += 1;
        if (toolLoopCount > MAX_TOOL_LOOPS) {
            writeFallback(res);
            break;
        }

        allMessages.push({ role: 'assistant', content: finalMessage.content });

        const toolResults = [];
        const toolBlocks = Array.isArray(finalMessage.content)
            ? finalMessage.content.filter(content => content.type === 'tool_use')
            : [];

        if (!toolBlocks.length) {
            writeFallback(res);
            break;
        }

        for (const block of toolBlocks) {
            const result = await handleToolUse(block, userId, res);
            toolResults.push({ type: 'tool_result', tool_use_id: block.id, content: result });
        }

        allMessages.push({ role: 'user', content: toolResults });
    }
}

module.exports = {
    streamChat
};
