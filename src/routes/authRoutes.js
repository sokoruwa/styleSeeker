const express = require('express');
const { loginUser, signupUser } = require('../services/authService');

const router = express.Router();

router.post('/login', async (req, res) => {
    const { username, password } = req.body;

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
        const result = await signupUser(req.body);
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
    if (req.session && req.session.isLoggedIn) {
        return res.json({
            isLoggedIn: true,
            username: req.session.username
        });
    }

    res.json({ isLoggedIn: false });
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
