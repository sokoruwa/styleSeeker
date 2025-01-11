document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('measurementForm');
    const outputBox = document.getElementById('outputBox');
    const bodyTypeResult = document.getElementById('bodyTypeResult');
    const outfitDisplay = document.getElementById('outfitDisplay');

    form.addEventListener('submit', handleFormSubmit);

    async function handleFormSubmit(event) {
        event.preventDefault();
        
        const fields = ['bust', 'waist', 'hips'];
        const measurements = {};
        
        for (const field of fields) {
            const element = document.getElementById(field);
            if (!element) {
                console.error(`Field ${field} not found in the form`);
                return;
            }
            measurements[field] = parseFloat(element.value) || 0;
        }

        // Calculate body type
        const bodyTypeResult = calculateBodyType(measurements);
        
        // Show results to everyone
        displayResults(bodyTypeResult);

        // Check login status
        const loginStatus = await checkLoginStatus();
        
        if (loginStatus.isLoggedIn) {
            // If logged in, save measurements
            try {
                await saveMeasurements(measurements);
                showSuccessMessage('Measurements saved successfully. <a href="/profile_page.html" class="alert-link">View your profile</a> to see your measurements.');
            } catch (error) {
                showErrorMessage('Error saving measurements. Please try again.');
            }
        } else {
            // If not logged in, show login prompt below results
            showLoginPrompt();
        }
    }

    function calculateBodyType(measurements) {
        const { bust, waist, hips } = measurements;
        
        let bodyType = "";
        if (hips - waist >= 10 && bust - waist >= 8) {
            bodyType = "Hourglass";
        } else if (hips - waist >= 8) {
            bodyType = "Pear";
        } else if (bust - waist >= 8) {
            bodyType = "Apple";
        } else {
            bodyType = "Rectangle";
        }

        return {
            bodyType: bodyType,
            measurements: measurements
        };
    }

    function displayResults(results) {
        // Get elements
        const form = document.getElementById('measurementForm');
        const resultsContainer = document.getElementById('resultsContainer');
        
        // Create results HTML
        resultsContainer.innerHTML = `
            <div class="cyber-box mt-4">
                <div class="cyber-box-header">
                    <h2><i class="fas fa-robot"></i> Analysis Complete</h2>
                </div>
                <div class="cyber-box-content">
                    <div class="body-type-section">
                        <div class="cyber-highlight">
                            <h3><i class="fas fa-dna"></i> Body Type Identified: ${results.bodyType}</h3>
                        </div>
                        <div class="measurements-grid mt-3">
                            <h4><i class="fas fa-ruler"></i> Measurements:</h4>
                            <div class="cyber-stats">
                                <div class="stat-item">
                                    <span class="stat-label">Bust</span>
                                    <span class="stat-value">${results.measurements.bust}"</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-label">Waist</span>
                                    <span class="stat-value">${results.measurements.waist}"</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-label">Hips</span>
                                    <span class="stat-value">${results.measurements.hips}"</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="recommendations mt-4">
                        <h4><i class="fas fa-tshirt"></i> Style Matrix for ${results.bodyType} Configuration:</h4>
                        <div class="cyber-recommendations">
                            ${getRecommendations(results.bodyType)}
                        </div>
                    </div>

                    <button class="cyber-button mt-4" onclick="location.reload()">
                        <span><i class="fas fa-sync"></i> New Analysis</span>
                    </button>
                </div>
            </div>
        `;

        // Show results
        resultsContainer.style.display = 'block';
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

    function showLoginPrompt() {
        const loginPrompt = document.createElement('div');
        loginPrompt.className = 'alert alert-info mt-3';
        loginPrompt.innerHTML = `
            <p>Want to save your measurements and get personalized recommendations? 
               <a href="/login.html">Login</a> or 
               <a href="/signup.html">create an account</a>.</p>
        `;
        document.querySelector('.card').appendChild(loginPrompt);
    }

    async function saveMeasurements(measurements) {
        try {
            console.log('Sending measurements:', measurements); // Debug log
            
            const response = await fetch('/api/measurements', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(measurements)
            });

            console.log('Response status:', response.status); // Debug log

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Server error:', errorData); // Debug log
                throw new Error(errorData.message || 'Failed to save measurements');
            }

            const data = await response.json();
            console.log('Save successful:', data); // Debug log
            return data;
        } catch (error) {
            console.error('Error saving measurements:', error);
            throw new Error('Failed to save measurements');
        }
    }

    // Add event listener when the page loads
    document.addEventListener('DOMContentLoaded', () => {
        const form = document.getElementById('measurementForm');
        if (form) {
            form.addEventListener('submit', handleFormSubmit);
        }

        // Load existing measurements if available
        loadExistingMeasurements();
    });

    async function loadExistingMeasurements() {
        try {
            const response = await fetch('/api/measurements');
            if (!response.ok) {
                throw new Error('Failed to fetch measurements');
            }

            const measurements = await response.json();
            if (measurements) {
                // Fill in the form with existing measurements
                document.getElementById('bust').value = measurements.bust || '';
                document.getElementById('waist').value = measurements.waist || '';
                document.getElementById('hips').value = measurements.hips || '';
                document.getElementById('inseam').value = measurements.inseam || '';
                document.getElementById('shoulder').value = measurements.shoulder || '';
                document.getElementById('armLength').value = measurements.armLength || '';
            }
        } catch (error) {
            console.error('Error loading measurements:', error);
        }
    }
});