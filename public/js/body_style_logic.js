(function(window) {
    const recommendations = {
        Hourglass: [
            'Fitted dresses that accentuate your waist',
            'Wrap dresses and tops',
            'Belt your outfits to highlight your waist',
            'Form-fitting clothing that follows your curves'
        ],
        Pear: [
            'A-line skirts and dresses',
            'Boat neck and wide-neck tops to balance proportions',
            'Statement tops with detail around shoulders',
            'Dark colors on bottom, bright colors on top'
        ],
        Apple: [
            'Empire waist dresses',
            'V-neck tops to elongate torso',
            'Flowy bottoms to create balance',
            'Structured jackets that hit at the hip'
        ],
        Rectangle: [
            'Peplum tops to create curves',
            'Layered clothing to add dimension',
            'Belt at the waist to create definition',
            'Ruffles and gathered details to add curves'
        ]
    };

    function numberValue(value) {
        const number = Number(value);
        return Number.isFinite(number) ? number : 0;
    }

    function calculateBodyType(measurements = {}) {
        const bust = numberValue(measurements.bust);
        const waist = numberValue(measurements.waist);
        const hips = numberValue(measurements.hips);

        if (hips - waist >= 10 && bust - waist >= 8) {
            return 'Hourglass';
        }
        if (hips - waist >= 8) {
            return 'Pear';
        }
        if (bust - waist >= 8) {
            return 'Apple';
        }
        return 'Rectangle';
    }

    function analyzeMeasurements(measurements = {}) {
        return {
            bodyType: calculateBodyType(measurements),
            measurements
        };
    }

    function getRecommendations(bodyType) {
        return recommendations[bodyType] ? [...recommendations[bodyType]] : [];
    }

    window.thriftAssistBodyLogic = {
        analyzeMeasurements,
        calculateBodyType,
        getRecommendations
    };
})(window);
