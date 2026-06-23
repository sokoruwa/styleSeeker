const express = require('express');
const { getUserProfile } = require('../services/profileService');

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

module.exports = router;
