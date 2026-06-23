function toArray(value) {
    if (Array.isArray(value)) {
        return value.map(item => String(item).trim()).filter(Boolean);
    }

    if (typeof value === 'string') {
        return value.split(',').map(item => item.trim()).filter(Boolean);
    }

    return [];
}

function toNumber(value) {
    const number = Number(value);
    return Number.isFinite(number) ? number : undefined;
}

function clampConfidence(value) {
    const number = toNumber(value);
    if (number === undefined) return undefined;
    return Math.min(1, Math.max(0, number));
}

function normalizeBudget(budget = {}) {
    if (!budget || typeof budget !== 'object') {
        return {};
    }

    return {
        min: toNumber(budget.min),
        max: toNumber(budget.max),
        currency: budget.currency ? String(budget.currency).trim() : undefined,
        notes: budget.notes ? String(budget.notes).trim() : undefined
    };
}

function normalizeFitPreferences(fitPreferences = {}) {
    if (!fitPreferences || typeof fitPreferences !== 'object') {
        return {};
    }

    return {
        preferredFits: toArray(fitPreferences.preferredFits),
        emphasis: toArray(fitPreferences.emphasis),
        avoid: toArray(fitPreferences.avoid),
        notes: fitPreferences.notes ? String(fitPreferences.notes).trim() : undefined
    };
}

function normalizeStyleProfile(input = {}) {
    return {
        aesthetics: toArray(input.aesthetics),
        colors: toArray(input.colors),
        silhouettes: toArray(input.silhouettes),
        occasions: toArray(input.occasions),
        dislikes: toArray(input.dislikes),
        budget: normalizeBudget(input.budget),
        fitPreferences: normalizeFitPreferences(input.fitPreferences),
        keyPieces: toArray(input.keyPieces),
        confidence: clampConfidence(input.confidence),
        updatedAt: new Date()
    };
}

function styleProfileFromLegacy(stylePreferences) {
    if (!stylePreferences) {
        return null;
    }

    return normalizeStyleProfile({
        aesthetics: [stylePreferences.primaryStyle, stylePreferences.secondaryStyle].filter(Boolean),
        keyPieces: stylePreferences.keyPieces,
        fitPreferences: {
            notes: stylePreferences.recommendations
        },
        confidence: 0.7
    });
}

function getUserStyleProfile(user) {
    if (user?.styleProfile) {
        return user.styleProfile;
    }

    return styleProfileFromLegacy(user?.stylePreferences);
}

module.exports = {
    normalizeStyleProfile,
    styleProfileFromLegacy,
    getUserStyleProfile
};
