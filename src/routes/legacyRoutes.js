const express = require('express');
const bcrypt = require('bcrypt');
const { ObjectId } = require('mongodb');
const User = require('../../models/User');
const { getDatabase } = require('../db/mongoClient');

const router = express.Router();

router.get('/test', (req, res) => {
    res.json({ message: 'Basic route works' });
});

router.post('/api/create-account', async (req, res) => {
    console.log('=== Create Account Request ===');
    console.log('Request body:', { ...req.body, password: '****' });

    const { firstName, lastName, username, email, password } = req.body;

    if (!firstName || !lastName || !username || !email || !password) {
        console.log('Missing required fields');
        return res.status(400).json({
            success: false,
            message: 'All fields are required'
        });
    }

    try {
        const database = getDatabase();
        const users = database.collection('users');
        const existingUser = await users.findOne({ $or: [{ username }, { email }] });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: `Account already exists with ${existingUser.username === username ? 'this username' : 'this email'}`
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
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

router.post('/api/save-measurements', async (req, res) => {
    console.log('Received data:', req.body);
    console.log('Session:', req.session);

    if (!req.session.userId) {
        return res.status(401).json({ success: false, message: 'User not logged in' });
    }

    try {
        const { height, bust, waist, hips, hipDips, bodyType, outfit } = req.body;
        const database = getDatabase();
        const users = database.collection('users');

        const result = await users.updateOne(
            { _id: new ObjectId(req.session.userId) },
            {
                $set: {
                    measurements: {
                        height,
                        bust,
                        waist,
                        hips,
                        hipDips
                    },
                    bodyType,
                    outfit
                }
            }
        );

        if (result.matchedCount === 1) {
            return res.status(200).json({ success: true, message: 'Measurements saved successfully' });
        }

        res.status(400).json({ success: false, message: 'Failed to save measurements: User not found' });
    } catch (error) {
        console.error('Error saving measurements:', error);
        res.status(500).json({ success: false, message: `Error saving measurements: ${error.message}` });
    }
});

router.get('/api/check-user/:username', async (req, res) => {
    const { username } = req.params;
    const database = getDatabase();
    const users = database.collection('users');
    const user = await users.findOne({ username });

    if (user) {
        return res.json({ exists: true, user: { username: user.username, _id: user._id } });
    }

    res.json({ exists: false });
});

router.get('/api/debug/users', async (req, res) => {
    try {
        const users = await User.find({}, 'username email');
        console.log('All users:', users);
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Error fetching users' });
    }
});

router.get('/api/test-style', async (req, res) => {
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

router.get('/debug/routes', (req, res) => {
    const routes = [];
    req.app._router.stack.forEach(middleware => {
        if (middleware.route) {
            routes.push({
                path: middleware.route.path,
                methods: Object.keys(middleware.route.methods)
            });
        }
    });
    res.json(routes);
});

router.get('/api/test-route', (req, res) => {
    console.log('Test route hit');
    res.json({ message: 'Test route working' });
});

module.exports = router;
