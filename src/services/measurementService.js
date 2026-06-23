const User = require('../../models/User');

async function saveMeasurements(userId, measurements) {
    const result = await User.findByIdAndUpdate(
        userId,
        {
            $set: {
                measurements: {
                    bust: measurements.bust,
                    waist: measurements.waist,
                    hips: measurements.hips
                }
            }
        },
        { new: true, runValidators: false }
    );

    if (!result) {
        return null;
    }

    await result.save();
    return result.measurements;
}

async function getMeasurements(userId) {
    const user = await User.findById(userId);
    if (!user) {
        return null;
    }

    return {
        measurements: user.measurements,
        username: user.username
    };
}

module.exports = {
    saveMeasurements,
    getMeasurements
};
