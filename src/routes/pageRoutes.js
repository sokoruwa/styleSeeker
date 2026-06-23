const express = require('express');
const path = require('path');
const config = require('../config');

const router = express.Router();

router.get('/', (req, res) => {
    res.sendFile(path.join(config.publicDir, 'index.html'));
});

router.get('/fit_calculator', (req, res) => {
    res.sendFile(path.join(config.publicDir, 'fit_calculator.html'));
});

module.exports = router;
