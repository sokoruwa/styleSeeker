const express = require('express');
const User = require('../../models/User');
const { getUserProfile } = require('../services/profileService');
const { saveAesthetic } = require('../services/styleService');

const router = express.Router();

router.get('/user-profile', async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ message: 'Not authenticated' });
    }

    try {
        const profile = await getUserProfile(req.session.userId);
        if (!profile) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(profile);
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ message: 'Error fetching profile data' });
    }
});

router.get('/profile', (req, res) => {
    if (!req.session || !req.session.isLoggedIn) {
        return res.status(401).json({ message: 'Not authenticated' });
    }

    User.findById(req.session.userId)
        .select('-password')
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

router.post('/save-aesthetic', async (req, res) => {
    if (!req.session || !req.session.isLoggedIn) {
        return res.status(401).json({ message: 'Not authenticated' });
    }

    try {
        const { aesthetic, description } = req.body;
        await saveAesthetic(req.session.userId, aesthetic, description);
        res.json({ message: 'Aesthetic saved successfully' });
    } catch (error) {
        console.error('Error saving aesthetic:', error);
        res.status(500).json({ message: 'Failed to save aesthetic' });
    }
});

module.exports = router;
