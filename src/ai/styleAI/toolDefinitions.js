const tools = [
    {
        name: 'get_user_profile',
        description: "Get the current user's saved body measurements and style preferences",
        input_schema: { type: 'object', properties: {}, required: [] }
    },
    {
        name: 'recommend_products',
        description: 'Create ranked sustainable product recommendations from structured search intents. Use this when the user asks for specific products, shopping ideas, or buyable outfit pieces. The backend searches eBay with thrift-aware query terms, ranks candidates against the user profile, and returns the best matches with reasons.',
        input_schema: {
            type: 'object',
            properties: {
                intents: {
                    type: 'array',
                    description: 'Structured product search intents. Create 1-3 focused intents instead of one broad query.',
                    items: {
                        type: 'object',
                        properties: {
                            query: {
                                type: 'string',
                                description: 'Focused eBay search query with thrift-aware terms when relevant, e.g. "pre-owned ankara wrap skirt", "vintage silver cropped bomber jacket"'
                            },
                            pieceType: {
                                type: 'string',
                                description: 'The wardrobe piece type, e.g. skirt, jacket, shoe, bag'
                            },
                            colors: {
                                type: 'array',
                                description: 'Preferred colors for this item',
                                items: { type: 'string' }
                            },
                            occasion: {
                                type: 'string',
                                description: 'Where the user would wear this item'
                            },
                            mustHave: {
                                type: 'array',
                                description: 'Terms that make a candidate more relevant',
                                items: { type: 'string' }
                            },
                            avoid: {
                                type: 'array',
                                description: 'Terms the candidate should avoid',
                                items: { type: 'string' }
                            },
                            maxPrice: {
                                type: 'number',
                                description: 'Maximum target price in USD when the user has a budget'
                            }
                        },
                        required: ['query']
                    }
                }
            },
            required: ['intents']
        }
    },
    {
        name: 'search_products',
        description: 'Legacy product search. Prefer recommend_products for ranked recommendations.',
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
