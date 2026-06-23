const User = require('../../models/User');
const { getUserStyleProfile } = require('../utils/styleProfile');

async function getUserProfile(userId) {
    const user = await User.findById(userId).select('-password').lean();

    if (!user) {
        return null;
    }

    return {
        username: user.username,
        measurements: user.measurements || null,
        bodyType: user.bodyType || null,
        styleProfile: getUserStyleProfile(user)
    };
}

module.exports = {
    getUserProfile
};
