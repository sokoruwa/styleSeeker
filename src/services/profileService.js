const { ObjectId } = require('mongodb');
const { getDatabase } = require('../db/mongoClient');

async function getUserProfile(userId) {
    const database = getDatabase();
    const users = database.collection('users');
    const user = await users.findOne({ _id: new ObjectId(userId) });

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
