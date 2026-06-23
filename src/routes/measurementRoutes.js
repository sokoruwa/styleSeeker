const express = require('express');
const { getMeasurements, saveMeasurements } = require('../services/measurementService');

const router = express.Router();

router.post('/measurements', async (req, res) => {
    if (!req.session || !req.session.isLoggedIn) {
        return res.status(401).json({ message: 'Not authenticated' });
    }

    try {
        const measurements = await saveMeasurements(req.session.userId, req.body);
        if (!measurements) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            message: 'Measurements saved successfully.',
            measurements
        });
    } catch (error) {
        console.error('Error saving measurements:', error);
        res.status(500).json({
            message: 'Error saving measurements',
            error: error.message
        });
    }
});

router.get('/measurements', async (req, res) => {
    if (!req.session || !req.session.isLoggedIn) {
        return res.status(401).json({ message: 'Not authenticated' });
    }

    try {
        const result = await getMeasurements(req.session.userId);
        if (!result) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(result);
    } catch (error) {
        console.error('Error fetching measurements:', error);
        res.status(500).json({ message: 'Failed to fetch measurements' });
    }
});

module.exports = router;
