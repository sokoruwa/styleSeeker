const express = require('express');
const { saveStylePreferences } = require('../services/styleService');

const router = express.Router();

router.post('/save-style-profile', async (req, res) => {
    try {
        if (!req.session || !req.session.userId) {
            return res.status(401).json({ message: 'Please log in' });
        }

        const profile = await saveStylePreferences(req.session.userId, req.body);
        if (!profile) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            message: 'Style profile saved successfully',
            profile
        });
    } catch (error) {
        console.error('Error saving style profile:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
