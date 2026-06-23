const request = require('supertest');
const mockInMemoryUser = require('./helpers/inMemoryUser');

const mockAnthropicStreams = [];
const mockAnthropicStream = jest.fn(() => {
    const stream = mockAnthropicStreams.shift();
    if (!stream) {
        throw new Error('No mocked Anthropic stream queued');
    }
    return stream;
});

function createAnthropicStream({ events = [], finalMessage }) {
    return {
        async *[Symbol.asyncIterator]() {
            for (const event of events) {
                yield event;
            }
        },
        finalMessage: jest.fn().mockResolvedValue(finalMessage)
    };
}

function createHangingAnthropicStream() {
    return {
        [Symbol.asyncIterator]() {
            return {
                next: () => new Promise(() => {})
            };
        },
        finalMessage: jest.fn()
    };
}

jest.mock('../models/User', () => mockInMemoryUser);

jest.mock('@anthropic-ai/sdk', () => {
    return jest.fn().mockImplementation(() => ({
        messages: {
            stream: mockAnthropicStream
        }
    }));
});

jest.mock('../src/services/ebayService', () => ({
    searchEbayProducts: jest.fn()
}));

const createApp = require('../src/app');
const { searchEbayProducts } = require('../src/services/ebayService');

function createLoggedInAgent() {
    const app = createApp();
    const agent = request.agent(app);
    return { app, agent };
}

async function signupAndLogin(agent, overrides = {}) {
    const user = {
        username: 'maya',
        password: 'correct-password',
        email: 'maya@example.com',
        firstName: 'Maya',
        lastName: 'Johnson',
        ...overrides
    };

    await agent.post('/api/signup').send(user).expect(201);
    await agent.post('/api/login').send({
        username: user.username,
        password: user.password
    }).expect(200);

    return user;
}

beforeEach(() => {
    mockInMemoryUser.reset();
    mockAnthropicStreams.length = 0;
    mockAnthropicStream.mockClear();
    searchEbayProducts.mockReset();
});

describe('auth routes', () => {
    test('signs up a user with profile fields', async () => {
        const { agent } = createLoggedInAgent();

        const response = await agent.post('/api/signup').send({
            username: 'maya',
            password: 'correct-password',
            email: 'maya@example.com',
            firstName: 'Maya',
            lastName: 'Johnson'
        }).expect(201);

        expect(response.body).toEqual({ message: 'User created successfully' });

        const [savedUser] = mockInMemoryUser.all();
        expect(savedUser).toMatchObject({
            username: 'maya',
            email: 'maya@example.com',
            firstName: 'Maya',
            lastName: 'Johnson'
        });
        expect(savedUser.password).not.toBe('correct-password');
    });

    test('logs in and reports authenticated status', async () => {
        const { agent } = createLoggedInAgent();
        await signupAndLogin(agent);

        const authResponse = await agent.get('/api/check-auth').expect(200);
        expect(authResponse.body).toEqual({
            isLoggedIn: true,
            username: 'maya'
        });
    });

    test('logs out and clears authenticated status', async () => {
        const { agent } = createLoggedInAgent();
        await signupAndLogin(agent);

        await agent.post('/api/logout').expect(200);

        const authResponse = await agent.get('/api/check-auth').expect(200);
        expect(authResponse.body).toEqual({ isLoggedIn: false });
    });
});

describe('profile and style routes', () => {
    test('saves measurements and returns them from the profile route', async () => {
        const { agent } = createLoggedInAgent();
        await signupAndLogin(agent);

        const measurements = { bust: 36, waist: 28, hips: 40 };
        const saveResponse = await agent.post('/api/measurements').send(measurements).expect(200);
        expect(saveResponse.body.measurements).toEqual(measurements);

        const measurementsResponse = await agent.get('/api/measurements').expect(200);
        expect(measurementsResponse.body).toEqual(measurements);

        const profileResponse = await agent.get('/api/user-profile').expect(200);
        expect(profileResponse.body).toMatchObject({
            username: 'maya',
            measurements
        });
        expect(profileResponse.body.password).toBeUndefined();
    });

    test('saves a structured style profile on the authenticated user', async () => {
        const { agent } = createLoggedInAgent();
        await signupAndLogin(agent);

        const styleProfile = {
            aesthetics: ['Afrofuturism', 'Streetwear'],
            colors: ['silver', 'black'],
            silhouettes: ['structured layers'],
            occasions: ['weekend events'],
            dislikes: ['bodycon dresses'],
            budget: { min: 40, max: 150, currency: 'USD', notes: 'Prefer investment accessories' },
            fitPreferences: {
                preferredFits: ['relaxed', 'tailored'],
                emphasis: ['waist'],
                avoid: ['too tight'],
                notes: 'Comfort first'
            },
            keyPieces: ['Cropped jacket', 'silver jewelry'],
            confidence: 0.9
        };

        const response = await agent.post('/api/save-style-profile').send(styleProfile).expect(200);

        expect(response.body.message).toBe('Style profile saved successfully');
        expect(response.body.profile).toMatchObject(styleProfile);

        const profileResponse = await agent.get('/api/user-profile').expect(200);
        expect(profileResponse.body.styleProfile).toMatchObject(styleProfile);
        expect(profileResponse.body.stylePreferences).toBeUndefined();
    });
});

describe('chat route', () => {
    test('rejects invalid chat requests before opening a stream', async () => {
        const { agent } = createLoggedInAgent();

        const response = await agent.post('/api/chat').send({
            messages: [{ role: 'system', content: 'bad role' }]
        }).expect(400);

        expect(response.body.message).toBe('messages[0].role must be user or assistant');
        expect(mockAnthropicStream).not.toHaveBeenCalled();
    });

    test('rejects overly long conversations', async () => {
        const { agent } = createLoggedInAgent();
        const messages = Array.from({ length: 21 }, (_, index) => ({
            role: index % 2 === 0 ? 'user' : 'assistant',
            content: `message ${index}`
        }));

        const response = await agent.post('/api/chat').send({ messages }).expect(400);

        expect(response.body.message).toBe('messages cannot exceed 20 entries');
        expect(mockAnthropicStream).not.toHaveBeenCalled();
    });

    test('streams Anthropic text and completes', async () => {
        const { agent } = createLoggedInAgent();
        await signupAndLogin(agent);

        mockAnthropicStreams.push(createAnthropicStream({
            events: [
                { type: 'content_block_delta', delta: { type: 'text_delta', text: 'Try a wrap top.' } }
            ],
            finalMessage: {
                stop_reason: 'end_turn',
                content: [{ type: 'text', text: 'Try a wrap top.' }]
            }
        }));

        const response = await agent.post('/api/chat').send({
            messages: [{ role: 'user', content: 'What should I wear?' }]
        }).expect(200);

        expect(response.headers['content-type']).toContain('text/event-stream');
        expect(response.text).toContain('"type":"text"');
        expect(response.text).toContain('Try a wrap top.');
        expect(response.text).toContain('"type":"done"');
        expect(mockAnthropicStream).toHaveBeenCalledWith(expect.objectContaining({
            messages: [{ role: 'user', content: 'What should I wear?' }],
            tools: expect.any(Array)
        }));
    });

    test('streams a fallback when the provider times out', async () => {
        const { agent } = createLoggedInAgent();
        await signupAndLogin(agent);

        mockAnthropicStreams.push(createHangingAnthropicStream());

        const response = await agent.post('/api/chat').send({
            messages: [{ role: 'user', content: 'Are you there?' }]
        }).expect(200);

        expect(response.text).toContain("I'm having trouble reaching StyleAI right now.");
        expect(response.text).toContain('"type":"done"');
    });

    test('continues streaming when eBay search fails', async () => {
        const { agent } = createLoggedInAgent();
        await signupAndLogin(agent);

        searchEbayProducts.mockRejectedValue(new Error('eBay unavailable'));
        mockAnthropicStreams.push(
            createAnthropicStream({
                finalMessage: {
                    stop_reason: 'tool_use',
                    content: [
                        {
                            type: 'tool_use',
                            id: 'tool-search',
                            name: 'search_products',
                            input: { query: 'ankara wrap skirt' }
                        }
                    ]
                }
            }),
            createAnthropicStream({
                events: [
                    { type: 'content_block_delta', delta: { type: 'text_delta', text: 'I can still suggest silhouettes.' } }
                ],
                finalMessage: {
                    stop_reason: 'end_turn',
                    content: [{ type: 'text', text: 'I can still suggest silhouettes.' }]
                }
            })
        );

        const response = await agent.post('/api/chat').send({
            messages: [{ role: 'user', content: 'Find products.' }]
        }).expect(200);

        expect(searchEbayProducts).toHaveBeenCalledWith('ankara wrap skirt');
        expect(response.text).not.toContain('"type":"products"');
        expect(response.text).toContain('I can still suggest silhouettes.');
        expect(response.text).toContain('"type":"done"');
    });

    test('returns tool errors for invalid style profile input and keeps streaming', async () => {
        const { agent } = createLoggedInAgent();
        await signupAndLogin(agent);

        mockAnthropicStreams.push(
            createAnthropicStream({
                finalMessage: {
                    stop_reason: 'tool_use',
                    content: [
                        {
                            type: 'tool_use',
                            id: 'tool-save',
                            name: 'save_style_profile',
                            input: { aesthetics: [], confidence: 'high' }
                        }
                    ]
                }
            }),
            createAnthropicStream({
                events: [
                    { type: 'content_block_delta', delta: { type: 'text_delta', text: 'I need a little more detail.' } }
                ],
                finalMessage: {
                    stop_reason: 'end_turn',
                    content: [{ type: 'text', text: 'I need a little more detail.' }]
                }
            })
        );

        const response = await agent.post('/api/chat').send({
            messages: [{ role: 'user', content: 'Save this.' }]
        }).expect(200);

        expect(response.text).toContain('I need a little more detail.');
        expect(response.text).toContain('"type":"done"');

        const profileResponse = await agent.get('/api/user-profile').expect(200);
        expect(profileResponse.body.styleProfile).toBeNull();
    });

    test('stops tool recursion with a streamed fallback', async () => {
        const { agent } = createLoggedInAgent();
        await signupAndLogin(agent);

        for (let index = 0; index < 4; index += 1) {
            mockAnthropicStreams.push(createAnthropicStream({
                finalMessage: {
                    stop_reason: 'tool_use',
                    content: [
                        {
                            type: 'tool_use',
                            id: `tool-${index}`,
                            name: 'get_user_profile',
                            input: {}
                        }
                    ]
                }
            }));
        }

        const response = await agent.post('/api/chat').send({
            messages: [{ role: 'user', content: 'Keep using tools.' }]
        }).expect(200);

        expect(response.text).toContain("I'm having trouble reaching StyleAI right now.");
        expect(response.text).toContain('"type":"done"');
        expect(mockAnthropicStream).toHaveBeenCalledTimes(4);
    });

    test('handles Anthropic tool calls with mocked eBay and saved style profile', async () => {
        const { agent } = createLoggedInAgent();
        await signupAndLogin(agent);

        searchEbayProducts.mockResolvedValue([
            {
                title: 'Ankara wrap skirt',
                price: '42 USD',
                image: 'https://example.com/skirt.jpg',
                url: 'https://example.com/skirt'
            }
        ]);

        mockAnthropicStreams.push(
            createAnthropicStream({
                finalMessage: {
                    stop_reason: 'tool_use',
                    content: [
                        {
                            type: 'tool_use',
                            id: 'tool-search',
                            name: 'search_products',
                            input: { query: 'ankara wrap skirt' }
                        },
                        {
                            type: 'tool_use',
                            id: 'tool-save',
                            name: 'save_style_profile',
                            input: {
                                aesthetics: ['Modern Ankara', 'Minimalist'],
                                colors: ['indigo', 'white'],
                                silhouettes: ['A-line skirts', 'fitted tees'],
                                occasions: ['casual weekends'],
                                dislikes: ['neon'],
                                budget: { min: 30, max: 120, currency: 'USD' },
                                fitPreferences: {
                                    preferredFits: ['fitted tops'],
                                    emphasis: ['waist'],
                                    avoid: ['stiff fabrics']
                                },
                                keyPieces: ['Ankara skirt', 'fitted tee'],
                                confidence: 0.86
                            }
                        }
                    ]
                }
            }),
            createAnthropicStream({
                events: [
                    { type: 'content_block_delta', delta: { type: 'text_delta', text: 'Saved your style profile.' } }
                ],
                finalMessage: {
                    stop_reason: 'end_turn',
                    content: [{ type: 'text', text: 'Saved your style profile.' }]
                }
            })
        );

        const response = await agent.post('/api/chat').send({
            messages: [{ role: 'user', content: 'Find me a skirt and save my style.' }]
        }).expect(200);

        expect(searchEbayProducts).toHaveBeenCalledWith('ankara wrap skirt');
        expect(response.text).toContain('"type":"products"');
        expect(response.text).toContain('Ankara wrap skirt');
        expect(response.text).toContain('"type":"saved"');
        expect(response.text).toContain('Modern Ankara');
        expect(response.text).toContain('Saved your style profile.');
        expect(response.text).toContain('"type":"done"');

        const profileResponse = await agent.get('/api/user-profile').expect(200);
        expect(profileResponse.body.styleProfile).toMatchObject({
            aesthetics: ['Modern Ankara', 'Minimalist'],
            colors: ['indigo', 'white'],
            silhouettes: ['A-line skirts', 'fitted tees'],
            occasions: ['casual weekends'],
            dislikes: ['neon'],
            budget: { min: 30, max: 120, currency: 'USD' },
            fitPreferences: {
                preferredFits: ['fitted tops'],
                emphasis: ['waist'],
                avoid: ['stiff fabrics']
            },
            keyPieces: ['Ankara skirt', 'fitted tee'],
            confidence: 0.86
        });
    });
});
