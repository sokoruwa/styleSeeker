const express = require("express");
const fs = require('fs')
const app = express();
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
    resave: true,
    saveUninitialized: true,
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
  origin: 'http://localhost:3000', // Replace with your client's URL
  credentials: true
}));

// Add this middleware to log session for every request
app.use((req, res, next) => {
    console.log('Session ID:', req.sessionID);
    console.log('Session data:', req.session);
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
        // Find user and log the result
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
        req.session.username = user.username;  // Use user.username from database
        req.session.isLoggedIn = true;

        // Log session data
        console.log('Session after login:', {
            userId: req.session.userId,
            username: req.session.username,
            isLoggedIn: req.session.isLoggedIn
        });

        await new Promise((resolve) => req.session.save(resolve));

        res.json({
            success: true,
            username: user.username,
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
        return res.status(401).json({ message: 'User not logged in' });
    }

    try {
        const database = client.db("styleSeeker");
        const users = database.collection("users");

        const user = await users.findOne({ _id: new ObjectId(req.session.userId) });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Only send necessary data
        const profileData = {
            username: user.username,
            measurements: user.measurements || null,
            bodyType: user.bodyType || null,
            outfit: user.outfit || null
        };

        res.status(200).json(profileData);
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ message: 'Error fetching user profile' });
    }
});

app.listen(3000, function () {
    console.log("server started at 3000");
    // const rawData=fs.readFileSync(__dirname+"/public/data/data10.json");
    // carList=JSON.parse(rawData);
    // console.log(carList);
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