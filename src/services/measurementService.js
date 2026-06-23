const User = require('../../models/User');

async function saveMeasurements(userId, measurements) {
    const savedMeasurements = {
        height: measurements.height,
        bust: measurements.bust,
        waist: measurements.waist,
        hips: measurements.hips,
        hipDips: measurements.hipDips
    };

    const result = await User.findByIdAndUpdate(
        userId,
        {
            $set: {
                measurements: savedMeasurements,
                bodyType: measurements.bodyType,
                outfit: measurements.outfit
            }
        },
        { new: true, runValidators: false }
    );

    if (!result) {
        return null;
    }

    return result.measurements;
}

async function getMeasurements(userId) {
    const user = await User.findById(userId);
    if (!user) {
        return null;
    }

    return user.measurements || null;
}

module.exports = {
    saveMeasurements,
    getMeasurements
};
