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
    firstName: String,
    lastName: String,
    email: {
        type: String,
        sparse: true
    },
    measurements: {
        height: Number,
        bust: Number,
        waist: Number,
        hips: Number,
        hipDips: String
    },
    bodyType: String,
    outfit: String,
    aesthetic: String,
    aestheticDescription: String,
    aestheticDate: Date,
    styleProfile: {
        aesthetics: [String],
        colors: [String],
        silhouettes: [String],
        occasions: [String],
        dislikes: [String],
        budget: {
            min: Number,
            max: Number,
            currency: String,
            notes: String
        },
        fitPreferences: {
            preferredFits: [String],
            emphasis: [String],
            avoid: [String],
            notes: String
        },
        keyPieces: [String],
        confidence: {
            type: Number,
            min: 0,
            max: 1
        },
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
