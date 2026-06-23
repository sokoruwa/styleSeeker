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
        name: 'save_style_profile',
        description: "Save the user's structured style profile after determining it through conversation",
        input_schema: {
            type: 'object',
            properties: {
                aesthetics: {
                    type: 'array',
                    description: 'Style aesthetics, e.g. African Alte, Afrofuturism, Modern Ankara, Y2K, Minimalist, Streetwear',
                    items: { type: 'string' }
                },
                colors: {
                    type: 'array',
                    description: 'Preferred colors or palettes',
                    items: { type: 'string' }
                },
                silhouettes: {
                    type: 'array',
                    description: 'Preferred shapes and silhouettes',
                    items: { type: 'string' }
                },
                occasions: {
                    type: 'array',
                    description: 'Occasions or contexts the user dresses for',
                    items: { type: 'string' }
                },
                dislikes: {
                    type: 'array',
                    description: 'Styles, colors, pieces, or fits the user dislikes',
                    items: { type: 'string' }
                },
                budget: {
                    type: 'object',
                    description: 'Budget preferences',
                    properties: {
                        min: { type: 'number' },
                        max: { type: 'number' },
                        currency: { type: 'string' },
                        notes: { type: 'string' }
                    }
                },
                fitPreferences: {
                    type: 'object',
                    description: 'Fit and proportion preferences',
                    properties: {
                        preferredFits: { type: 'array', items: { type: 'string' } },
                        emphasis: { type: 'array', items: { type: 'string' } },
                        avoid: { type: 'array', items: { type: 'string' } },
                        notes: { type: 'string' }
                    }
                },
                keyPieces: {
                    type: 'array',
                    description: 'Key wardrobe pieces to build the look',
                    items: { type: 'string' }
                },
                confidence: {
                    type: 'number',
                    description: 'Confidence score from 0 to 1 for this profile'
                }
            },
            required: ['aesthetics', 'keyPieces', 'confidence']
        }
    }
];

module.exports = {
    tools
};
