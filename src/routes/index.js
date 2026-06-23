const express = require('express');
const authRoutes = require('./authRoutes');
const chatRoutes = require('./chatRoutes');
const measurementRoutes = require('./measurementRoutes');
const pageRoutes = require('./pageRoutes');
const profileRoutes = require('./profileRoutes');
const styleRoutes = require('./styleRoutes');

const router = express.Router();

router.use(pageRoutes);

router.use('/api', authRoutes);
router.use('/api', profileRoutes);
router.use('/api', measurementRoutes);
router.use('/api', styleRoutes);
router.use('/api', chatRoutes);

module.exports = router;
