const User = require('../../models/User');

async function saveStylePreferences(userId, preferences) {
    const user = await User.findById(userId);
    if (!user) {
        return null;
    }

    user.stylePreferences = {
        primaryStyle: preferences.primaryStyle,
        secondaryStyle: preferences.secondaryStyle,
        recommendations: preferences.recommendations,
        keyPieces: preferences.keyPieces,
        updatedAt: new Date()
    };

    await user.save();
    return user.stylePreferences;
}

async function saveAesthetic(userId, aesthetic, description) {
    return User.findByIdAndUpdate(userId, {
        $set: {
            aesthetic,
            aestheticDescription: description,
            aestheticDate: new Date()
        }
    });
}

module.exports = {
    saveStylePreferences,
    saveAesthetic
};
