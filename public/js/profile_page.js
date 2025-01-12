document.addEventListener('DOMContentLoaded', async function() {
    try {
        // Check login status
        const loginStatus = await checkLoginStatus();
        if (!loginStatus.isLoggedIn) {
            window.location.href = '/login.html';
            return;
        }

        // Fetch all profile data
        const response = await fetch('/api/user-profile', {
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error('Failed to fetch profile data');
        }

        const userData = await response.json();
        console.log('User data:', userData);

        // Display username
        document.getElementById('profileUsername').textContent = 
            `Welcome, ${userData.username}!`;

        // Display measurements if they exist
        if (userData.measurements) {
            displayMeasurements(userData.measurements);
        } else {
            displayNoMeasurements();
        }

        // Display style preferences if they exist
        if (userData.stylePreferences) {
            displayStylePreferences(userData.stylePreferences);
        } else {
            displayNoStylePreferences();
        }

    } catch (error) {
        console.error('Error:', error);
        displayError(error.message);
    }
});

function displayMeasurements(measurements) {
    const measurementsContainer = document.getElementById('measurementsData');
    const bodyType = calculateBodyType(measurements);

    measurementsContainer.innerHTML = `
        <div class="cyber-box-section">
            <h3>Body Measurements</h3>
            <div class="measurements-grid">
                <div class="measurement-item">
                    <span class="label">Bust:</span>
                    <span class="value">${measurements.bust}"</span>
                </div>
                <div class="measurement-item">
                    <span class="label">Waist:</span>
                    <span class="value">${measurements.waist}"</span>
                </div>
                <div class="measurement-item">
                    <span class="label">Hips:</span>
                    <span class="value">${measurements.hips}"</span>
                </div>
            </div>
            
            <div class="body-type-section">
                <h3>Body Type: ${bodyType}</h3>
                <div class="recommendations">
                    ${getRecommendations(bodyType)}
                </div>
            </div>
            
            <a href="/fit_calculator.html" class="cyber-button">
                <span>Update Measurements</span>
            </a>
        </div>
    `;
}

function displayStylePreferences(preferences) {
    const styleContainer = document.getElementById('styleQuizData');
    styleContainer.innerHTML = `
        <div class="cyber-box-section">
            <h3>Style Profile</h3>
            <div class="style-grid">
                <div class="style-item">
                    <span class="label">Primary Style:</span>
                    <span class="value">${preferences.primaryStyle}</span>
                </div>
                <div class="style-item">
                    <span class="label">Secondary Style:</span>
                    <span class="value">${preferences.secondaryStyle}</span>
                </div>
            </div>
            
            <div class="recommendations-section">
                <h3>Style Recommendations</h3>
                <div class="recommendations">
                    ${preferences.recommendations || 'No recommendations available'}
                </div>
            </div>
            
            <div class="key-pieces-section">
                <h3>Key Pieces</h3>
                <div class="key-pieces">
                    ${preferences.keyPieces || 'No key pieces defined'}
                </div>
            </div>
            
            <a href="/chat_bot.html" class="cyber-button">
                <span>Update Style Profile</span>
            </a>
        </div>
    `;
}

function displayNoMeasurements() {
    document.getElementById('measurementsData').innerHTML = `
        <div class="cyber-alert info">
            <p>No measurements saved yet.</p>
            <a href="/fit_calculator.html" class="cyber-button">
                <span>Take the Fit Calculator</span>
            </a>
        </div>
    `;
}

function displayNoStylePreferences() {
    document.getElementById('styleQuizData').innerHTML = `
        <div class="cyber-alert info">
            <p>No style preferences saved yet.</p>
            <a href="/chat_bot.html" class="cyber-button">
                <span>Take the Style Quiz</span>
            </a>
        </div>
    `;
}

function displayError(message) {
    const errorHtml = `
        <div class="cyber-alert error">
            <p>Error: ${message}</p>
            <p>Please try refreshing the page. If the problem persists, contact support.</p>
        </div>
    `;
    
    document.getElementById('measurementsData').innerHTML = errorHtml;
    document.getElementById('styleQuizData').innerHTML = errorHtml;
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