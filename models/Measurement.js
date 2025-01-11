const mongoose = require('mongoose');

const measurementSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    bust: Number,
    waist: Number,
    hips: Number,
    inseam: Number,
    shoulder: Number,
    armLength: Number,
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Measurement', measurementSchema); 