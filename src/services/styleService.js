const User = require('../../models/User');
const { normalizeStyleProfile } = require('../utils/styleProfile');

async function saveStylePreferences(userId, preferences) {
    const styleProfile = normalizeStyleProfile(preferences);
    const user = await User.findByIdAndUpdate(
        userId,
        {
            $set: { styleProfile },
            $unset: { stylePreferences: '' }
        },
        { new: true, runValidators: false }
    ).select('styleProfile');

    return user?.styleProfile || null;
}

module.exports = {
    saveStylePreferences
};
