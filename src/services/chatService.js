const Anthropic = require('@anthropic-ai/sdk');
const config = require('../config');
const User = require('../../models/User');
const { searchEbayProducts } = require('./ebayService');
const getFetch = require('./fetchCompat');

const anthropic = new Anthropic({
    apiKey: config.anthropicApiKey,
    fetch: getFetch()
});

const tools = [
    {
        name: 'get_user_profile',
        description: "Get the current user's saved body measurements and style preferences",
        input_schema: { type: 'object', properties: {}, required: [] }
    },
    {
        name: 'search_products',
        description: 'Search eBay for clothing and fashion items to recommend to the user. Use this when suggesting specific pieces to buy.',
        input_schema: {
            type: 'object',
            properties: {
                query: { type: 'string', description: 'Search query, e.g. "ankara wrap skirt", "streetwear oversized jacket"' }
            },
            required: ['query']
        }
    },
    {
        name: 'save_style_preferences',
        description: "Save the user's style aesthetic after determining it through conversation",
        input_schema: {
            type: 'object',
            properties: {
                primaryStyle: { type: 'string', description: 'Primary style aesthetic (e.g., African Alté, Afrofuturism, Modern Ankara, Y2K, Minimalist, Streetwear)' },
                secondaryStyle: { type: 'string', description: 'Secondary style influence' },
                recommendations: { type: 'string', description: 'Personalized style recommendations' },
                keyPieces: { type: 'string', description: 'Key wardrobe pieces to build the look' }
            },
            required: ['primaryStyle', 'recommendations', 'keyPieces']
        }
    }
];

async function getCurrentUser(userId) {
    if (!userId) {
        return null;
    }

    return User.findById(userId).select('-password').lean();
}

async function buildSystemPrompt(userId) {
    const user = await getCurrentUser(userId);
    let userContext = '';

    if (user) {
        userContext = `\n\nLogged-in user: ${user.username}`;
        if (user.measurements) {
            userContext += `\nMeasurements: bust ${user.measurements.bust}", waist ${user.measurements.waist}", hips ${user.measurements.hips}"`;
        }
        if (user.bodyType) userContext += `\nBody type: ${user.bodyType}`;
        if (user.stylePreferences?.primaryStyle) userContext += `\nCurrent style: ${user.stylePreferences.primaryStyle}`;
    }

    return `You are StyleAI, a warm and knowledgeable personal fashion stylist for styleSeeker — a fashion app celebrating African aesthetics and diverse body types.

Your role:
- Have natural conversations to help users discover their personal style
- Give personalized outfit recommendations based on body type and aesthetic preferences
- Draw from these aesthetics: African Alté (modern African streetwear), Afrofuturism (futuristic African fashion), Modern Ankara (traditional African prints updated), Y2K (2000s revival), Minimalist (clean and simple), Streetwear (urban casual)
- Be warm, encouraging, and body-positive
- Ask thoughtful questions about their lifestyle, vibe, and personality
- Give specific, actionable advice

When you've learned enough to confidently determine someone's style, use save_style_preferences to save their results and let them know.
If you need their measurements or saved data, use get_user_profile.
${userContext}`;
}

async function handleToolUse(block, userId, res) {
    if (block.name === 'get_user_profile') {
        const user = await getCurrentUser(userId);
        return JSON.stringify({
            measurements: user?.measurements || null,
            bodyType: user?.bodyType || null,
            stylePreferences: user?.stylePreferences || null
        });
    }

    if (block.name === 'search_products') {
        try {
            const products = await searchEbayProducts(block.input.query);
            if (products.length > 0) {
                res.write(`data: ${JSON.stringify({ type: 'products', products })}\n\n`);
            }
            return JSON.stringify({ found: products.length, items: products.map(product => product.title) });
        } catch (error) {
            return JSON.stringify({ error: 'Could not fetch products' });
        }
    }

    if (block.name === 'save_style_preferences') {
        if (!userId) {
            return JSON.stringify({ error: 'User not logged in — cannot save' });
        }

        const stylePreferences = { ...block.input, updatedAt: new Date() };
        const user = await User.findByIdAndUpdate(
            userId,
            { $set: { stylePreferences } },
            { new: true, runValidators: false }
        ).select('stylePreferences');

        if (!user) {
            return JSON.stringify({ error: 'User not found' });
        }

        res.write(`data: ${JSON.stringify({ type: 'saved', preferences: user.stylePreferences })}\n\n`);
        return JSON.stringify({ success: true });
    }

    return JSON.stringify({ error: `Unknown tool: ${block.name}` });
}

async function streamChat({ messages, userId, res }) {
    const systemPrompt = await buildSystemPrompt(userId);
    const allMessages = [...messages];

    while (true) {
        const stream = anthropic.messages.stream({
            model: 'claude-opus-4-6',
            max_tokens: 1024,
            system: systemPrompt,
            tools,
            messages: allMessages
        });

        for await (const event of stream) {
            if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
                res.write(`data: ${JSON.stringify({ type: 'text', text: event.delta.text })}\n\n`);
            }
        }

        const finalMessage = await stream.finalMessage();

        if (finalMessage.stop_reason === 'end_turn') {
            res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`);
            break;
        }

        if (finalMessage.stop_reason !== 'tool_use') {
            res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`);
            break;
        }

        allMessages.push({ role: 'assistant', content: finalMessage.content });

        const toolResults = [];
        for (const block of finalMessage.content.filter(content => content.type === 'tool_use')) {
            const result = await handleToolUse(block, userId, res);
            toolResults.push({ type: 'tool_result', tool_use_id: block.id, content: result });
        }

        allMessages.push({ role: 'user', content: toolResults });
    }
}

module.exports = {
    streamChat
};
