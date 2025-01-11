const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    measurements: {
        bust: Number,
        waist: Number,
        hips: Number
    },
    stylePreferences: {
        primaryStyle: String,
        secondaryStyle: String,
        recommendations: String,
        keyPieces: String,
        updatedAt: Date
    }
}, { timestamps: true });

// Add this to help with debugging
userSchema.methods.toJSON = function() {
    const obj = this.toObject();
    delete obj.password;  // Don't send password
    return obj;
};

const User = mongoose.model('User', userSchema);

module.exports = User; 