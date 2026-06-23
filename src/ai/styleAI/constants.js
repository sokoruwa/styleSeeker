const MAX_TOOL_LOOPS = Number(process.env.CHAT_MAX_TOOL_LOOPS) || 3;
const PROVIDER_TIMEOUT_MS = Number(process.env.ANTHROPIC_TIMEOUT_MS) || 30000;
const FALLBACK_TEXT = "I'm having trouble reaching StyleAI right now. Please try again in a moment.";

module.exports = {
    FALLBACK_TEXT,
    MAX_TOOL_LOOPS,
    PROVIDER_TIMEOUT_MS
};
