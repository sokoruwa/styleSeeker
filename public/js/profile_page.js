document.addEventListener('DOMContentLoaded', async function() {
    try {
        // Check login status
        const loginStatus = await checkLoginStatus();
        console.log('Login status:', loginStatus);

        if (!loginStatus.isLoggedIn) {
            window.location.href = '/login.html';
            return;
        }

        // Fetch measurements
        console.log('Fetching measurements...');
        const measurementsResponse = await fetch('/api/measurements', {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Accept': 'application/json'
            }
        });
        console.log('Measurements response:', measurementsResponse);

        // Fetch style preferences
        console.log('Fetching style preferences...');
        const styleResponse = await fetch('/api/style-preferences', {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Accept': 'application/json'
            }
        });
        console.log('Style response:', styleResponse);

        // Check responses
        if (!measurementsResponse.ok) {
            console.error('Measurements response not ok:', await measurementsResponse.text());
            throw new Error(`Measurements HTTP error! status: ${measurementsResponse.status}`);
        }
        if (!styleResponse.ok) {
            console.error('Style response not ok:', await styleResponse.text());
            throw new Error(`Style HTTP error! status: ${styleResponse.status}`);
        }

        const measurementsData = await measurementsResponse.json();
        console.log('Measurements data:', measurementsData);

        const styleData = await styleResponse.json();
        console.log('Style data:', styleData);

        // Display measurements if they exist
        if (measurementsData && measurementsData.measurements) {
            displayMeasurements(measurementsData.measurements);
        } else {
            displayNoMeasurements();
        }

        // Display style preferences if they exist
        if (styleData && styleData.preferences) {
            displayStylePreferences(styleData.preferences);
        } else {
            displayNoStylePreferences();
        }

    } catch (error) {
        console.error('Detailed error:', error);
        // Display error message to user
        document.getElementById('measurementsData').innerHTML = `
            <div class="cyber-alert error">
                <p>Error: ${error.message}</p>
                <p>Please try refreshing the page. If the problem persists, contact support.</p>
            </div>
        `;
        document.getElementById('styleQuizData').innerHTML = `
            <div class="cyber-alert error">
                <p>Error: ${error.message}</p>
                <p>Please try refreshing the page. If the problem persists, contact support.</p>
            </div>
        `;
    }
});

function displayMeasurements(measurements) {
    const measurementsContainer = document.getElementById('measurementsData');
    const bodyType = calculateBodyType(measurements);
    console.log('Calculated body type:', bodyType);

    measurementsContainer.innerHTML = `
        <div class="cyber-highlight">
            <h3><i class="fas fa-dna"></i> Body Type: ${bodyType}</h3>
        </div>
        <div class="measurements-grid mt-3">
            <div class="cyber-stats">
                <div class="stat-item">
                    <span class="stat-label">Bust</span>
                    <span class="stat-value">${measurements.bust}"</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Waist</span>
                    <span class="stat-value">${measurements.waist}"</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Hips</span>
                    <span class="stat-value">${measurements.hips}"</span>
                </div>
            </div>
        </div>
        <div class="recommendations mt-4">
            <h4><i class="fas fa-tshirt"></i> Style Recommendations:</h4>
            <div class="cyber-recommendations">
                ${getRecommendations(bodyType)}
            </div>
        </div>
    `;
}

function displayNoMeasurements() {
    document.getElementById('measurementsData').innerHTML = `
        <div class="cyber-alert">
            <p>No measurements saved yet. 
               <a href="/fit_calculator.html" class="cyber-link">Take the Fit Calculator</a> 
               to get personalized recommendations!</p>
        </div>
    `;
}

function displayStylePreferences(preferences) {
    if (!preferences) {
        displayNoStylePreferences();
        return;
    }

    const styleContainer = document.getElementById('styleQuizData');
    styleContainer.innerHTML = `
        <div class="style-preferences cyber-box">
            <div class="preference-item">
                <h4>Primary Style</h4>
                <p>${preferences.primaryStyle || 'Not set'}</p>
            </div>
            <div class="preference-item">
                <h4>Secondary Style</h4>
                <p>${preferences.secondaryStyle || 'Not set'}</p>
            </div>
            <div class="preference-item">
                <h4>Style Recommendations</h4>
                <p>${preferences.recommendations || 'No recommendations yet'}</p>
            </div>
            <div class="preference-item">
                <h4>Key Pieces</h4>
                <p>${preferences.keyPieces || 'No key pieces defined'}</p>
            </div>
        </div>
    `;
}

function displayNoStylePreferences() {
    document.getElementById('styleQuizData').innerHTML = `
        <div class="cyber-alert info">
            <p>You haven't taken the style quiz yet! 
               <a href="/chat_bot.html" class="cyber-link">Chat with StyleBot</a> 
               to discover your personal style.</p>
        </div>
    `;
}

// Reuse these functions from fit_calculator.js
function calculateBodyType(measurements) {
    const { bust, waist, hips } = measurements;
    
    if (hips - waist >= 10 && bust - waist >= 8) {
        return "Hourglass";
    } else if (hips - waist >= 8) {
        return "Pear";
    } else if (bust - waist >= 8) {
        return "Apple";
    } else {
        return "Rectangle";
    }
}

function getRecommendations(bodyType) {
    const recommendations = {
        Hourglass: `
            <ul>
                <li>Fitted dresses that accentuate your waist</li>
                <li>Wrap dresses and tops</li>
                <li>Belt your outfits to highlight your waist</li>
                <li>Form-fitting clothing that follows your curves</li>
            </ul>`,
        Pear: `
            <ul>
                <li>A-line skirts and dresses</li>
                <li>Boat neck and wide-neck tops to balance proportions</li>
                <li>Statement tops with detail around shoulders</li>
                <li>Dark colors on bottom, bright colors on top</li>
            </ul>`,
        Apple: `
            <ul>
                <li>Empire waist dresses</li>
                <li>V-neck tops to elongate torso</li>
                <li>Flowy bottoms to create balance</li>
                <li>Structured jackets that hit at the hip</li>
            </ul>`,
        Rectangle: `
            <ul>
                <li>Peplum tops to create curves</li>
                <li>Layered clothing to add dimension</li>
                <li>Belt at the waist to create definition</li>
                <li>Ruffles and gathered details to add curves</li>
            </ul>`
    };

    return recommendations[bodyType] || '<p>No specific recommendations available.</p>';
}