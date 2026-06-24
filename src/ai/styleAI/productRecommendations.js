const { searchEbayProducts } = require('../../services/ebayService');
const { getUserStyleProfile } = require('../../utils/styleProfile');

const MAX_INTENTS = 3;
const MAX_QUERY_LENGTH = 100;
const MAX_RECOMMENDATIONS = 6;
const SUSTAINABLE_QUERY_TERMS = ['secondhand', 'pre-owned', 'vintage', 'thrift', 'upcycled', 'deadstock'];

function toStringArray(value) {
    if (!Array.isArray(value)) {
        return [];
    }

    return value.map(item => String(item).trim()).filter(Boolean).slice(0, 8);
}

function normalizeIntent(intent) {
    if (!intent || typeof intent !== 'object') {
        return null;
    }

    const query = typeof intent.query === 'string' ? intent.query.trim() : '';
    if (!query || query.length > MAX_QUERY_LENGTH) {
        return null;
    }

    const maxPrice = Number(intent.maxPrice);

    return {
        query,
        pieceType: typeof intent.pieceType === 'string' ? intent.pieceType.trim() : '',
        colors: toStringArray(intent.colors),
        occasion: typeof intent.occasion === 'string' ? intent.occasion.trim() : '',
        mustHave: toStringArray(intent.mustHave),
        avoid: toStringArray(intent.avoid),
        maxPrice: Number.isFinite(maxPrice) ? maxPrice : undefined
    };
}

function normalizeIntents(intents) {
    if (!Array.isArray(intents)) {
        return [];
    }

    return intents.map(normalizeIntent).filter(Boolean).slice(0, MAX_INTENTS);
}

function wordsFrom(value) {
    return String(value || '')
        .toLowerCase()
        .split(/[^a-z0-9]+/)
        .map(word => word.trim())
        .filter(word => word.length >= 3);
}

function includesTerm(text, term) {
    return text.includes(String(term || '').toLowerCase());
}

function hasSustainableTerm(query) {
    const normalizedQuery = String(query || '').toLowerCase();
    return SUSTAINABLE_QUERY_TERMS.some(term => normalizedQuery.includes(term));
}

function buildSustainableSearchQuery(query) {
    if (hasSustainableTerm(query)) {
        return query;
    }

    return `${query} pre-owned vintage`;
}

function parsePriceValue(price) {
    if (typeof price === 'number') {
        return price;
    }

    if (typeof price !== 'string') {
        return undefined;
    }

    const match = price.match(/\d+(?:\.\d+)?/);
    if (!match) {
        return undefined;
    }

    const value = Number(match[0]);
    return Number.isFinite(value) ? value : undefined;
}

function uniqueTerms(terms) {
    return [...new Set(terms.map(term => String(term).trim()).filter(Boolean))];
}

function buildRankingTerms(intent, profile = {}) {
    const budgetMax = Number(intent.maxPrice || profile?.budget?.max);

    return {
        positive: uniqueTerms([
            ...wordsFrom(intent.query),
            intent.pieceType,
            intent.occasion,
            ...intent.colors,
            ...intent.mustHave,
            ...SUSTAINABLE_QUERY_TERMS,
            ...(profile.aesthetics || []),
            ...(profile.colors || []),
            ...(profile.silhouettes || []),
            ...(profile.keyPieces || []),
            ...(profile.occasions || [])
        ]),
        negative: uniqueTerms([
            ...intent.avoid,
            ...(profile.dislikes || []),
            ...(profile.fitPreferences?.avoid || [])
        ]),
        budgetMax: Number.isFinite(budgetMax) ? budgetMax : undefined
    };
}

function scoreProduct(product, intent, profile) {
    const text = `${product.title || ''} ${product.price || ''}`.toLowerCase();
    const terms = buildRankingTerms(intent, profile);
    const reasons = [];
    let score = 0;

    for (const term of terms.positive) {
        if (includesTerm(text, term)) {
            score += 8;
            if (reasons.length < 3) {
                reasons.push(`Matches ${term}`);
            }
        }
    }

    if (hasSustainableTerm(text)) {
        score += 12;
        reasons.unshift('Supports the thrift-first sustainable focus');
    }

    for (const term of terms.negative) {
        if (includesTerm(text, term)) {
            score -= 14;
            reasons.push(`May conflict with disliked term: ${term}`);
        }
    }

    const priceValue = parsePriceValue(product.price);
    if (terms.budgetMax && priceValue !== undefined) {
        if (priceValue <= terms.budgetMax) {
            score += 10;
            reasons.push(`Within $${terms.budgetMax} budget`);
        } else {
            score -= 8;
            reasons.push(`Above $${terms.budgetMax} budget`);
        }
    }

    if (product.image) score += 2;
    if (product.url) score += 2;
    if (!reasons.length) reasons.push(`Relevant to "${intent.query}"`);

    return {
        ...product,
        score,
        matchReasons: reasons.slice(0, 4),
        searchIntent: {
            query: intent.query,
            pieceType: intent.pieceType,
            occasion: intent.occasion
        }
    };
}

function dedupeProducts(products) {
    const seen = new Set();
    return products.filter(product => {
        const key = product.url || product.title;
        if (!key || seen.has(key)) {
            return false;
        }
        seen.add(key);
        return true;
    });
}

async function recommendProducts({ intents, user }) {
    const normalizedIntents = normalizeIntents(intents);
    if (!normalizedIntents.length) {
        return { error: 'At least one valid product search intent is required' };
    }

    const profile = getUserStyleProfile(user) || {};
    const candidateGroups = await Promise.all(normalizedIntents.map(async intent => {
        const products = await searchEbayProducts(buildSustainableSearchQuery(intent.query));
        return products.map(product => scoreProduct(product, intent, profile));
    }));

    const recommendations = dedupeProducts(candidateGroups.flat())
        .sort((left, right) => right.score - left.score)
        .slice(0, MAX_RECOMMENDATIONS);

    return {
        intents: normalizedIntents,
        recommendations
    };
}

module.exports = {
    normalizeIntents,
    recommendProducts,
    scoreProduct
};
