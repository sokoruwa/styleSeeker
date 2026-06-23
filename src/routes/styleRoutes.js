const express = require('express');
const { saveStylePreferences } = require('../services/styleService');

const router = express.Router();

router.get('/style-preferences', (req, res) => {
    console.log('Style route hit');
    res.json({ message: 'Style route works' });
});

router.post('/save-style-preferences', async (req, res) => {
    try {
        if (!req.session || !req.session.userId) {
            return res.status(401).json({ message: 'Please log in' });
        }

        const preferences = await saveStylePreferences(req.session.userId, req.body);
        if (!preferences) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            message: 'Style preferences saved successfully',
            preferences
        });
    } catch (error) {
        console.error('Error saving preferences:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
