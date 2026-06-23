const User = require('../../../models/User');
const { getUserStyleProfile, normalizeStyleProfile } = require('../../utils/styleProfile');

async function loadUserProfile(userId) {
    if (!userId) {
        return null;
    }

    return User.findById(userId).select('-password').lean();
}

function getToolProfilePayload(user) {
    return {
        measurements: user?.measurements || null,
        bodyType: user?.bodyType || null,
        styleProfile: getUserStyleProfile(user)
    };
}

async function saveStyleProfile(userId, input) {
    if (!userId) {
        return { error: 'User not logged in - cannot save' };
    }

    const styleProfile = normalizeStyleProfile(input);
    const user = await User.findByIdAndUpdate(
        userId,
        {
            $set: { styleProfile },
            $unset: { stylePreferences: '' }
        },
        { new: true, runValidators: false }
    ).select('styleProfile');

    if (!user) {
        return { error: 'User not found' };
    }

    return { styleProfile: user.styleProfile };
}

module.exports = {
    getToolProfilePayload,
    getUserStyleProfile,
    loadUserProfile,
    saveStyleProfile
};
