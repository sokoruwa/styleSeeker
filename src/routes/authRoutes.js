const express = require('express');
const { loginUser, signupUser } = require('../services/authService');

const router = express.Router();

router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    console.log('Login attempt for:', username);

    try {
        const result = await loginUser(username, password);
        if (!result.success) {
            return res.json(result);
        }

        req.session.userId = result.user._id;
        req.session.username = username;
        req.session.isLoggedIn = true;

        await new Promise(resolve => req.session.save(resolve));

        res.json({
            success: true,
            username,
            message: 'Login successful'
        });
    } catch (error) {
        console.error('Login error:', error);
        res.json({ success: false, message: 'Login failed' });
    }
});

router.post('/signup', async (req, res) => {
    try {
        const { username, password } = req.body;
        console.log('Signup request received:', { username });

        const result = await signupUser(username, password);
        res.status(result.status).json(result.body);
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({
            message: 'Error creating user',
            error: error.message
        });
    }
});

router.get('/check-auth', (req, res) => {
    console.log('Checking auth status. Session:', req.session);

    if (req.session && req.session.isLoggedIn) {
        return res.json({
            isLoggedIn: true,
            username: req.session.username
        });
    }

    res.json({ isLoggedIn: false });
});

router.get('/check-login', (req, res) => {
    console.log('Check login session:', req.session);
    res.json({
        isLoggedIn: !!req.session.isLoggedIn,
        username: req.session.username
    });
});

router.post('/logout', (req, res) => {
    req.session.destroy(error => {
        if (error) {
            console.error('Logout error:', error);
            return res.json({ success: false, message: 'Logout failed' });
        }

        res.json({ success: true, message: 'Logged out successfully' });
    });
});

module.exports = router;
