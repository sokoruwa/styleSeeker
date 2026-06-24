const { getToolProfilePayload, loadUserProfile, saveStyleProfile } = require('./profileStore');
const { recommendProducts } = require('./productRecommendations');
const { searchProducts } = require('./productSearch');
const { writeSse } = require('./streaming');

function isNonEmptyString(value) {
    return typeof value === 'string' && value.trim().length > 0;
}

function isNonEmptyStringArray(value) {
    return Array.isArray(value) && value.some(item => isNonEmptyString(item));
}

function isValidStyleProfileInput(input) {
    return Boolean(
        input
        && typeof input === 'object'
        && isNonEmptyStringArray(input.aesthetics)
        && isNonEmptyStringArray(input.keyPieces)
        && Number.isFinite(Number(input.confidence))
    );
}

async function handleToolUse(block, userId, res) {
    if (!block || typeof block !== 'object' || !isNonEmptyString(block.name)) {
        return JSON.stringify({ error: 'Invalid tool call' });
    }

    if (block.name === 'get_user_profile') {
        const user = await loadUserProfile(userId);
        return JSON.stringify(getToolProfilePayload(user));
    }

    if (block.name === 'search_products') {
        const result = await searchProducts(block.input?.query);
        if (result.error) {
            return JSON.stringify({ error: result.error });
        }

        if (result.products.length > 0) {
            writeSse(res, { type: 'products', products: result.products });
        }
        return JSON.stringify({
            found: result.products.length,
            items: result.products.map(product => product.title)
        });
    }

    if (block.name === 'recommend_products') {
        try {
            const user = await loadUserProfile(userId);
            const result = await recommendProducts({
                intents: block.input?.intents,
                user
            });

            if (result.error) {
                return JSON.stringify({ error: result.error });
            }

            if (result.recommendations.length > 0) {
                writeSse(res, { type: 'products', products: result.recommendations });
            }

            return JSON.stringify({
                intents: result.intents,
                recommendations: result.recommendations.map(product => ({
                    title: product.title,
                    price: product.price,
                    score: product.score,
                    matchReasons: product.matchReasons,
                    searchIntent: product.searchIntent
                }))
            });
        } catch (error) {
            return JSON.stringify({ error: 'Could not build product recommendations' });
        }
    }

    if (block.name === 'save_style_profile') {
        if (!isValidStyleProfileInput(block.input)) {
            return JSON.stringify({ error: 'Invalid style profile input' });
        }

        const result = await saveStyleProfile(userId, block.input);
        if (result.error) {
            return JSON.stringify({ error: result.error });
        }

        writeSse(res, { type: 'saved', profile: result.styleProfile });
        return JSON.stringify({ success: true });
    }

    return JSON.stringify({ error: `Unknown tool: ${block.name}` });
}

module.exports = {
    handleToolUse
};
