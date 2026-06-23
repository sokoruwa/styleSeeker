const User = require('../../models/User');

async function getUserProfile(userId) {
    const user = await User.findById(userId).select('-password').lean();

    if (!user) {
        return null;
    }

    return {
        username: user.username,
        measurements: user.measurements || null,
        bodyType: user.bodyType || null,
        stylePreferences: user.stylePreferences || null
    };
}

module.exports = {
    getUserProfile
};
