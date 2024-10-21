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

// Set up session middleware
app.use(session({
    secret: 'your-secret-key', // Replace with a real secret key
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set to true if using https
}));

// Session middleware setup
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({ 
        client: client,
        dbName: "styleAI", // specify the database name
        collectionName: "sessions" // optional: specify the collection name
    }),
    cookie: { secure: false } // Set to true if using HTTPS
}));

// Other middleware
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:3000', // Replace with your client's URL
  credentials: true
}));

// Move the session middleware setup here, before your routes
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

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/public/index.html');
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

// Add new login route
app.post('/api/login', async (req, res) => {
    console.log('Login attempt:', req.body);
    const { username, password } = req.body;
    
    try {
        const database = client.db("styleAI");
        const users = database.collection("users");

        // Find user
        const user = await users.findOne({ username: username });
        console.log('User found:', user ? 'Yes' : 'No');
        
        if (!user) {
            console.log('User not found:', username);
            return res.status(401).json({ success: false, message: 'Invalid username or password' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        console.log('Password match:', isMatch);
        
        if (isMatch) {
            console.log('Session before setting userId:', req.session);
            req.session.userId = user._id.toString(); // Convert ObjectId to string
            req.session.username = user.username; // Add this line
            console.log('Session after setting userId:', req.session);
            res.json({ success: true, username: user.username }); // Modified this line
        } else {
            console.log('Password mismatch for user:', username);
            res.status(401).json({ success: false, message: 'Invalid username or password' });
        }
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// New route for account creation
app.post('/api/create-account', async (req, res) => {
    const { firstName, lastName, username, email, password } = req.body;

    try {
        const database = client.db("styleAI");
        const users = database.collection("users");

        // Check if username or email already exists
        const existingUser = await users.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            return res.json({ success: false, message: 'Username or email already exists' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert the new user
        const result = await users.insertOne({
            firstName,
            lastName,
            username,
            email,
            password: hashedPassword
        });

        console.log('User inserted:', result);
        res.json({ success: true, message: 'Account created successfully' });
    } catch (error) {
        console.error('Detailed account creation error:', error);
        res.status(500).json({ success: false, message: 'An error occurred during account creation', error: error.message });
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

        const database = client.db("styleAI");
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
        const database = client.db("styleAI");
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

app.get('/api/check-login', (req, res) => {
    console.log('Checking login. Session:', req.session);
    if (req.session && req.session.userId) {
        console.log('User is logged in. User ID:', req.session.userId);
        res.json({ isLoggedIn: true, username: req.session.username });
    } else {
        console.log('User is not logged in.');
        res.json({ isLoggedIn: false });
    }
});

app.post('/api/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Could not log out, please try again' });
        }
        res.json({ success: true });
    });
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
    const database = client.db("styleAI");
    const users = database.collection("users");
    const user = await users.findOne({ username: username });
    if (user) {
        res.json({ exists: true, user: { username: user.username, _id: user._id } });
    } else {
        res.json({ exists: false });
    }
});