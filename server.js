require('dotenv').config();
const express = require("express");
const fs = require('fs')
const Anthropic = require('@anthropic-ai/sdk');
const app = express();

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
// const mongoose = require('mongoose');

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json()); // Add this line to parse JSON requests

// Serve static files from the 'public' directory
app.use(express.static(__dirname + "/public"));
// app.use(express.static('public'));

// Add these new imports
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { MongoClient, ObjectId } = require('mongodb'); // Add this line for MongoDB
const MongoStore = require('connect-mongo');
const cors = require('cors');  // Add this line
const session = require('express-session');
const path = require('path');
const mongoose = require('mongoose');
const User = require('./models/User'); // Add this line
const Measurement = require('./models/Measurement');

// Add SECRET_KEY and users array
const SECRET_KEY = 'your_secret_key'; // In a real app, use an environment variable
const users = [
    { id: 1, username: 'user1', passwordHash: '$2b$10$X7Uy9Ry5ZUZrGn7.z9Yw8.Zs1xY5Uw5Uy9Ry5ZUZrGn7.z9Yw8.' },
];

// MongoDB connection string (replace with your actual connection string)
const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);

// Connect to MongoDB
async function connectToMongo() {
    try {
        await client.connect();
        console.log("Connected to MongoDB");
    } catch (e) {
        console.error("MongoDB connection error:", e);
    }
}
connectToMongo();

// Session configuration
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000
    }
}));

// Debug middleware
app.use((req, res, next) => {
    console.log('Session:', req.session);
    next();
});

// Other middleware
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:4000', // Replace with your client's URL
  credentials: true
}));

// Add this middleware to log session for every request
app.use((req, res, next) => {
    console.log('Session ID:', req.sessionID);
    console.log('Session data:', req.session);
    next();
});

// Add this after your middleware but before any routes
app.use((req, res, next) => {
    console.log('Incoming request:', req.method, req.path);
    console.log('Session:', req.session);
    next();
});

// Add these test routes FIRST
app.get('/test', (req, res) => {
    res.json({ message: 'Basic route works' });
});

app.get('/api/test', (req, res) => {
    res.json({ message: 'API route works' });
});

app.get('/api/style-preferences', (req, res) => {
    console.log('Style route hit');
    res.json({ message: 'Style route works' });
});

// Your existing debug middleware
app.use((req, res, next) => {
    console.log('Request URL:', req.url);
    console.log('Request Method:', req.method);
    console.log('Session:', req.session);
    next();
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/index.html'));
});

// mongoose.connect('mongodb://localhost:27017/storyDB', { useNewUrlParser: true, useUnifiedTopology: true })
//     .then(() => console.log('Connected to MongoDB'))
//     .catch(err => console.error('Could not connect to MongoDB', err));
//
//
// const storySchema = new mongoose.Schema({
//     name: String,
//     summary: String,
//     pic: String,
//     url: String,
// });
//
// const Story = mongoose.model('Story', storySchema);

app.get('/fit_calculator', function(req, res) {
    res.sendFile(__dirname + '/public/fit_calculator.html');
});

// Login endpoint
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    console.log('Login attempt for:', username);

    try {
        const user = await User.findOne({ username });
        console.log('Found user:', user);

        if (!user) {
            console.log('No user found with username:', username);
            return res.json({ success: false, message: 'User not found' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.log('Password mismatch for user:', username);
            return res.json({ success: false, message: 'Invalid password' });
        }

        // Set session data
        req.session.userId = user._id;
        req.session.username = username;
        req.session.isLoggedIn = true;

        // Log session data
        console.log('Session after login:', req.session);

        // Save session explicitly
        await new Promise((resolve) => req.session.save(resolve));

        res.json({
            success: true,
            username: username,
            message: 'Login successful'
        });
    } catch (error) {
        console.error('Login error:', error);
        res.json({ success: false, message: 'Login failed' });
    }
});

// Check login status
app.get('/api/check-login', (req, res) => {
    console.log('Check login session:', req.session);
    res.json({
        isLoggedIn: !!req.session.isLoggedIn,
        username: req.session.username
    });
});

// Logout endpoint
app.post('/api/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Logout error:', err);
            return res.json({ success: false, message: 'Logout failed' });
        }
        res.json({ success: true, message: 'Logged out successfully' });
    });
});

app.post('/api/create-account', async (req, res) => {
    console.log('=== Create Account Request ===');
    console.log('Request body:', { ...req.body, password: '****' });

    const { firstName, lastName, username, email, password } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !username || !email || !password) {
        console.log('Missing required fields');
        return res.status(400).json({
            success: false,
            message: 'All fields are required'
        });
    }

    try {
        const database = client.db("styleSeeker");
        const users = database.collection("users");

        console.log('Checking for existing user...');
        const existingUser = await users.findOne({ $or: [{ username }, { email }] });
        
        if (existingUser) {
            console.log('User already exists:', {
                existingUsername: existingUser.username,
                existingEmail: existingUser.email
            });
            return res.status(409).json({ 
                success: false, 
                message: `Account already exists with ${existingUser.username === username ? 'this username' : 'this email'}`
            });
        }

        // Hash the password
        console.log('Hashing password...');
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert the new user
        console.log('Inserting new user...');
        const result = await users.insertOne({
            firstName,
            lastName,
            username,
            email,
            password: hashedPassword,
            createdAt: new Date()
        });

        console.log('User created successfully:', result.insertedId);
        res.status(200).json({ 
            success: true, 
            message: 'Account created successfully'
        });
    } catch (error) {
        console.error('Create account error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'An error occurred during account creation', 
            error: error.message 
        });
    }
});

app.post('/api/save-measurements', async (req, res) => {
    console.log('Received data:', req.body);
    console.log('Session:', req.session);

    if (!req.session.userId) {
        return res.status(401).json({ success: false, message: 'User not logged in' });
    }

    try {
        const { height, bust, waist, hips, hipDips, bodyType, outfit } = req.body;
        const userId = new ObjectId(req.session.userId); // Convert string to ObjectId

        const database = client.db("styleSeeker");
        const users = database.collection("users");

        const result = await users.updateOne(
            { _id: userId },
            { $set: {
                measurements: {
                    height,
                    bust,
                    waist,
                    hips,
                    hipDips
                },
                bodyType,
                outfit
            }}
        );

        console.log('Update result:', result);

        if (result.matchedCount === 1) {
            res.status(200).json({ success: true, message: 'Measurements saved successfully' });
        } else {
            res.status(400).json({ success: false, message: 'Failed to save measurements: User not found' });
        }
    } catch (error) {
        console.error('Error saving measurements:', error);
        res.status(500).json({ success: false, message: 'Error saving measurements: ' + error.message });
    }
});

app.get('/api/user-profile', async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ message: 'Not authenticated' });
    }

    try {
        const database = client.db("styleSeeker");
        const users = database.collection("users");
        const userId = new ObjectId(req.session.userId);

        const user = await users.findOne({ _id: userId });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Send all relevant user data
        res.json({
            username: user.username,
            measurements: user.measurements || null,
            bodyType: user.bodyType || null,
            stylePreferences: user.stylePreferences || null
        });
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ message: 'Error fetching profile data' });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ success: false, message: 'An error occurred on the server' });
});

// Add this middleware to log session for every request
app.use((req, res, next) => {
    console.log('Session ID:', req.sessionID);
    console.log('Session data:', req.session);
    next();
});

app.get('/api/check-user/:username', async (req, res) => {
    const { username } = req.params;
    const database = client.db("styleSeeker");
    const users = database.collection("users");
    const user = await users.findOne({ username: username });
    if (user) {
        res.json({ exists: true, user: { username: user.username, _id: user._id } });
    } else {
        res.json({ exists: false });
    }
});

// Add this debugging route
app.get('/api/debug/users', async (req, res) => {
    try {
        const users = await User.find({}, 'username email');
        console.log('All users:', users);
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Error fetching users' });
    }
});

// Add explicit MIME type for JavaScript files
app.use('/js', (req, res, next) => {
    res.type('application/javascript');
    next();
}, express.static('public/js'));

app.post('/api/signup', async (req, res) => {
    try {
        const { username, password } = req.body;
        console.log("Signup request received:", { username });
        
        if (!username || !password) {
            return res.status(400).json({ message: 'Username and password are required' });
        }

        // Check if username already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            console.log("Username already exists:", username);
            return res.status(400).json({ message: 'Username already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user without email field
        const user = new User({
            username: username,
            password: hashedPassword
        });

        await user.save();
        console.log("User created successfully:", username);
        res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ 
            message: 'Error creating user', 
            error: error.message 
        });
    }
});

// Add this with your other routes
app.post('/api/save-aesthetic', async (req, res) => {
    if (!req.session || !req.session.isLoggedIn) {
        return res.status(401).json({ message: 'Not authenticated' });
    }

    try {
        const { aesthetic, description } = req.body;
        const userId = req.session.userId;

        await User.findByIdAndUpdate(userId, {
            $set: {
                aesthetic: aesthetic,
                aestheticDescription: description,
                aestheticDate: new Date()
            }
        });

        res.json({ message: 'Aesthetic saved successfully' });
    } catch (error) {
        console.error('Error saving aesthetic:', error);
        res.status(500).json({ message: 'Failed to save aesthetic' });
    }
});

// Add this with your other routes
app.get('/api/profile', (req, res) => {
    if (!req.session || !req.session.isLoggedIn) {
        return res.status(401).json({ message: 'Not authenticated' });
    }

    User.findById(req.session.userId)
        .select('-password') // Exclude password from the response
        .then(user => {
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            res.json(user);
        })
        .catch(error => {
            console.error('Error fetching profile:', error);
            res.status(500).json({ message: 'Error fetching profile' });
        });
});

// Debug middleware to log all requests
app.use((req, res, next) => {
    console.log('Request URL:', req.url);
    console.log('Request Method:', req.method);
    console.log('Session:', req.session);
    next();
});

// Measurements endpoints
app.post('/api/measurements', async (req, res) => {
    console.log('Received measurements request');
    console.log('Session:', req.session);
    console.log('Body:', req.body);

    if (!req.session || !req.session.isLoggedIn) {
        console.log('User not authenticated');
        return res.status(401).json({ message: 'Not authenticated' });
    }

    try {
        // Find the existing user by ID
        const userId = req.session.userId;
        console.log('Looking for user with ID:', userId);

        const result = await User.findByIdAndUpdate(
            userId,
            { 
                $set: { 
                    measurements: {
                        bust: req.body.bust,
                        waist: req.body.waist,
                        hips: req.body.hips
                    }
                }
            },
            { new: true, runValidators: false }  // Return updated document
        );

        console.log('Update result:', result);

        if (!result) {
            console.log('User not found');
            return res.status(404).json({ message: 'User not found' });
        }

        await result.save();
        console.log('Measurements saved:', result);

        res.json({ 
            message: `Measurements saved successfully. <a href="/profile_page.html" class="alert-link">View your profile</a> to see your measurements.`,
            measurements: result.measurements
        });

    } catch (error) {
        console.error('Error saving measurements:', error);
        res.status(500).json({ 
            message: 'Error saving measurements',
            error: error.message 
        });
    }
});

app.get('/api/measurements', async (req, res) => {
    if (!req.session || !req.session.isLoggedIn) {
        return res.status(401).json({ message: 'Not authenticated' });
    }

    try {
        const user = await User.findById(req.session.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Add some console.logs for debugging
        console.log('Fetching measurements for user:', user.username);
        console.log('Measurements data:', user.measurements);

        res.json({
            measurements: user.measurements,
            username: user.username
        });
    } catch (error) {
        console.error('Error fetching measurements:', error);
        res.status(500).json({ message: 'Failed to fetch measurements' });
    }
});

app.get('/api/test-style', async (req, res) => {
    console.log('Test style route hit');
    if (!req.session || !req.session.isLoggedIn) {
        return res.status(401).json({ message: 'Not authenticated' });
    }

    try {
        const user = await User.findById(req.session.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ message: 'Test style route works' });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

app.get('/api/check-auth', (req, res) => {
    console.log('Checking auth status. Session:', req.session);
    
    if (req.session && req.session.isLoggedIn) {
        res.json({
            isLoggedIn: true,
            username: req.session.username
        });
    } else {
        res.json({
            isLoggedIn: false
        });
    }
});

// Make sure these routes are BEFORE app.use(express.static('public'))

// Test route to verify API is working
app.get('/api/test', (req, res) => {
    res.json({ message: 'API is working' });
});

// Style preferences route
app.get('/api/style-preferences', (req, res) => {
    console.log('Style preferences route hit - TEST');
    res.json({ message: 'Style preferences route working' });
});

// Save style preferences route
app.post('/api/save-style-preferences', async (req, res) => {
    try {
        if (!req.session || !req.session.userId) {
            return res.status(401).json({ message: 'Please log in' });
        }

        const user = await User.findById(req.session.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.stylePreferences = {
            primaryStyle: req.body.primaryStyle,
            secondaryStyle: req.body.secondaryStyle,
            recommendations: req.body.recommendations,
            keyPieces: req.body.keyPieces,
            updatedAt: new Date()
        };

        await user.save();
        res.json({
            message: 'Style preferences saved successfully',
            preferences: user.stylePreferences
        });

    } catch (error) {
        console.error('Error saving preferences:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Then your static files
app.use(express.static('public'));

// Debug route to list all registered routes
app.get('/debug/routes', (req, res) => {
    const routes = [];
    app._router.stack.forEach(middleware => {
        if (middleware.route) {
            routes.push({
                path: middleware.route.path,
                methods: Object.keys(middleware.route.methods)
            });
        }
    });
    res.json(routes);
});

// Update MongoDB connection with better error handling
mongoose.connect('mongodb://127.0.0.1:27017/styleSeeker', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000 // 5 second timeout
})
.then(() => {
    console.log('Successfully connected to MongoDB.');
})
.catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1); // Exit if we can't connect to database
});

// Add connection error handler
mongoose.connection.on('error', err => {
    console.error('MongoDB connection error:', err);
});

// Add connection success handler
mongoose.connection.once('open', () => {
    console.log('MongoDB connection is open');
});

// Add disconnection handler
mongoose.connection.on('disconnected', () => {
    console.log('MongoDB disconnected');
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true
}));

// Debug middleware to log all requests
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
});

// API Routes - all in one place
const apiRoutes = {
    // Measurements routes
    getMeasurements: app.get('/api/measurements', async (req, res) => {
        if (!req.session || !req.session.isLoggedIn) {
            return res.status(401).json({ message: 'Not authenticated' });
        }

        try {
            const user = await User.findById(req.session.userId);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            console.log('Fetching measurements for user:', user.username);
            console.log('Measurements data:', user.measurements);

            res.json({
                measurements: user.measurements,
                username: user.username
            });
        } catch (error) {
            console.error('Error fetching measurements:', error);
            res.status(500).json({ message: 'Failed to fetch measurements' });
        }
    }),

    // Style preferences routes
    getStylePreferences: app.get('/api/style-preferences', async (req, res) => {
        console.log('Style preferences route hit');
        if (!req.session || !req.session.isLoggedIn) {
            return res.status(401).json({ message: 'Not authenticated' });
        }

        try {
            const user = await User.findById(req.session.userId);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            console.log('Fetching style preferences for user:', user.username);
            res.json({
                preferences: user.stylePreferences || null
            });
        } catch (error) {
            console.error('Error fetching style preferences:', error);
            res.status(500).json({ message: 'Failed to fetch style preferences' });
        }
    }),

    saveStylePreferences: app.post('/api/save-style-preferences', async (req, res) => {
        if (!req.session || !req.session.isLoggedIn) {
            return res.status(401).json({ message: 'Not authenticated' });
        }

        try {
            const user = await User.findById(req.session.userId);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            user.stylePreferences = {
                primaryStyle: req.body.primaryStyle,
                secondaryStyle: req.body.secondaryStyle,
                recommendations: req.body.recommendations,
                keyPieces: req.body.keyPieces,
                updatedAt: new Date()
            };

            await user.save();
            console.log('Style preferences saved for user:', user.username);

            res.json({
                message: 'Style preferences saved successfully',
                preferences: user.stylePreferences
            });
        } catch (error) {
            console.error('Error saving style preferences:', error);
            res.status(500).json({ message: 'Failed to save style preferences' });
        }
    })
};

// Debug route to verify API is working
app.get('/api/test', (req, res) => {
    res.json({ message: 'API is working' });
});

// Static files AFTER all API routes
app.use(express.static('public'));

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something broke!' });
});

// AI Style Chat endpoint
app.post('/api/chat', async (req, res) => {
    const { messages } = req.body;

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const tools = [
        {
            name: 'get_user_profile',
            description: "Get the current user's saved body measurements and style preferences",
            input_schema: { type: 'object', properties: {}, required: [] }
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

    try {
        // Build user context for system prompt
        let userContext = '';
        if (req.session && req.session.userId) {
            try {
                const database = client.db("styleSeeker");
                const usersCol = database.collection("users");
                const userId = new ObjectId(req.session.userId);
                const user = await usersCol.findOne({ _id: userId });
                if (user) {
                    userContext = `\n\nLogged-in user: ${user.username}`;
                    if (user.measurements) {
                        userContext += `\nMeasurements: bust ${user.measurements.bust}", waist ${user.measurements.waist}", hips ${user.measurements.hips}"`;
                    }
                    if (user.bodyType) userContext += `\nBody type: ${user.bodyType}`;
                    if (user.stylePreferences?.primaryStyle) userContext += `\nCurrent style: ${user.stylePreferences.primaryStyle}`;
                }
            } catch (e) { /* continue without profile */ }
        }

        const systemPrompt = `You are StyleAI, a warm and knowledgeable personal fashion stylist for styleSeeker — a fashion app celebrating African aesthetics and diverse body types.

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

        const allMessages = [...messages];

        // Agentic loop
        while (true) {
            const stream = anthropic.messages.stream({
                model: 'claude-opus-4-6',
                max_tokens: 1024,
                system: systemPrompt,
                tools,
                messages: allMessages,
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

            if (finalMessage.stop_reason === 'tool_use') {
                allMessages.push({ role: 'assistant', content: finalMessage.content });

                const toolResults = [];
                for (const block of finalMessage.content.filter(b => b.type === 'tool_use')) {
                    let result;

                    if (block.name === 'get_user_profile') {
                        if (req.session && req.session.userId) {
                            const database = client.db("styleSeeker");
                            const usersCol = database.collection("users");
                            const userId = new ObjectId(req.session.userId);
                            const user = await usersCol.findOne({ _id: userId });
                            result = JSON.stringify({
                                measurements: user?.measurements || null,
                                bodyType: user?.bodyType || null,
                                stylePreferences: user?.stylePreferences || null
                            });
                        } else {
                            result = JSON.stringify({ error: 'No user logged in' });
                        }
                    } else if (block.name === 'save_style_preferences') {
                        if (req.session && req.session.userId) {
                            const database = client.db("styleSeeker");
                            const usersCol = database.collection("users");
                            const userId = new ObjectId(req.session.userId);
                            await usersCol.updateOne(
                                { _id: userId },
                                { $set: { stylePreferences: { ...block.input, updatedAt: new Date() } } }
                            );
                            res.write(`data: ${JSON.stringify({ type: 'saved', preferences: block.input })}\n\n`);
                            result = JSON.stringify({ success: true });
                        } else {
                            result = JSON.stringify({ error: 'User not logged in — cannot save' });
                        }
                    }

                    toolResults.push({ type: 'tool_result', tool_use_id: block.id, content: result });
                }

                allMessages.push({ role: 'user', content: toolResults });
            } else {
                res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`);
                break;
            }
        }

        res.end();
    } catch (error) {
        console.error('Chat error:', error);
        res.write(`data: ${JSON.stringify({ type: 'error', message: 'Something went wrong. Please try again.' })}\n\n`);
        res.end();
    }
});

// Start the server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    // Log all registered routes
    console.log('\nRegistered routes:');
    app._router.stack.forEach(r => {
        if (r.route && r.route.path) {
            console.log(`${Object.keys(r.route.methods).join(',')} ${r.route.path}`);
        }
    });
});

app.get('/api/test-route', (req, res) => {
    console.log('Test route hit');
    res.json({ message: 'Test route working' });
});

// Style preferences endpoints
app.get('/api/style-preferences', async (req, res) => {
    console.log('Received style preferences request');
    console.log('Session:', req.session);

    if (!req.session || !req.session.isLoggedIn) {
        console.log('User not authenticated');
        return res.status(401).json({ message: 'Not authenticated' });
    }

    try {
        const user = await User.findById(req.session.userId);
        if (!user) {
            console.log('User not found');
            return res.status(404).json({ message: 'User not found' });
        }

        // Add some console.logs for debugging
        console.log('Fetching style preferences for user:', user.username);
        console.log('Style preferences data:', user.stylePreferences);

        res.json({
            preferences: user.stylePreferences || null
        });
    } catch (error) {
        console.error('Error fetching style preferences:', error);
        res.status(500).json({ message: 'Failed to fetch style preferences' });
    }
});

app.post('/api/save-style-preferences', async (req, res) => {
    console.log('Received save style preferences request');
    console.log('Session:', req.session);
    console.log('Body:', req.body);

    if (!req.session || !req.session.isLoggedIn) {
        console.log('User not authenticated');
        return res.status(401).json({ message: 'Not authenticated' });
    }

    try {
        const userId = req.session.userId;
        console.log('Looking for user with ID:', userId);

        const result = await User.findByIdAndUpdate(
            userId,
            { 
                $set: { 
                    stylePreferences: {
                        primaryStyle: req.body.primaryStyle,
                        secondaryStyle: req.body.secondaryStyle,
                        recommendations: req.body.recommendations,
                        keyPieces: req.body.keyPieces,
                        updatedAt: new Date()
                    }
                }
            },
            { new: true, runValidators: false }
        );

        console.log('Update result:', result);

        if (!result) {
            console.log('User not found');
            return res.status(404).json({ message: 'User not found' });
        }

        await result.save();
        console.log('Style preferences saved:', result.stylePreferences);

        res.json({ 
            message: 'Style preferences saved successfully',
            preferences: result.stylePreferences
        });

    } catch (error) {
        console.error('Error saving style preferences:', error);
        res.status(500).json({ 
            message: 'Error saving style preferences',
            error: error.message 
        });
    }
});

// Keep this logging middleware at the top of your routes
app.use((req, res, next) => {
    console.log('Request received:', {
        method: req.method,
        path: req.path,
        url: req.url
    });
    next();
});