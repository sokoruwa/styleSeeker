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
    email: {
        type: String,
        required: true,
        unique: true
    },
    firstName: String,
    lastName: String
});

// Add this pre-save middleware to log user creation
userSchema.pre('save', function(next) {
    console.log('Saving user:', this);
    next();
});

const User = mongoose.model('User', userSchema);

module.exports = User; 