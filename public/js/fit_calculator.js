document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('measurementForm');
    const outputBox = document.getElementById('outputBox');
    const bodyTypeResult = document.getElementById('bodyTypeResult');
    const outfitDisplay = document.getElementById('outfitDisplay');

    form.addEventListener('submit', handleFormSubmit);

    async function handleFormSubmit(e) {
        e.preventDefault();

        // Get form values
        const heightFeet = parseInt(document.getElementById('heightFeet').value) || 0;
        const heightInches = parseInt(document.getElementById('heightInches').value) || 0;
        const bust = parseInt(document.getElementById('bust').value) || 0;
        const waist = parseInt(document.getElementById('waist').value) || 0;
        const hips = parseInt(document.getElementById('hips').value) || 0;
        const hipDips = document.getElementById('hipDips').checked;

        // Calculate results
        const results = calculateBodyType(heightFeet, heightInches, bust, waist, hips, hipDips);
        
        // Display results
        displayResults(results);

        // Check login status and show appropriate message
        const loginStatus = await checkLoginStatus();
        if (!loginStatus.isLoggedIn) {
            // Add login prompt to results
            const loginPrompt = document.createElement('div');
            loginPrompt.className = 'alert alert-info';
            loginPrompt.innerHTML = `
                <p>Want to save your results and get personalized style recommendations?</p>
                <a href="login.html" class="alert-link">Log in</a> or 
                <a href="login.html#signup" class="alert-link">create an account</a>!
            `;
            outputBox.appendChild(loginPrompt);
        } else {
            // Save measurements to profile if logged in
            saveMeasurements(heightFeet, heightInches, bust, waist, hips, hipDips);
        }
    }

    function calculateBodyType(heightFeet, heightInches, bust, waist, hips, hipDips) {
        // Your existing calculation logic here
        const totalHeightInches = (heightFeet * 12) + heightInches;
        
        // Add your body type calculation logic here
        // This is a simplified example
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
            measurements: {
                height: `${heightFeet}'${heightInches}"`,
                bust: bust,
                waist: waist,
                hips: hips,
                hipDips: hipDips
            }
        };
    }

    function displayResults(results) {
        // Show the output box
        outputBox.style.display = 'block';

        // Display body type result
        bodyTypeResult.innerHTML = `
            <h2>Your Body Type: ${results.bodyType}</h2>
            <p>Height: ${results.measurements.height}</p>
            <p>Measurements: ${results.measurements.bust}-${results.measurements.waist}-${results.measurements.hips}</p>
        `;

        // Display outfit recommendations
        outfitDisplay.innerHTML = `
            <h3>Style Recommendations for ${results.bodyType} Body Type:</h3>
            ${getRecommendations(results.bodyType)}
        `;
    }

    function getRecommendations(bodyType) {
        // Add your recommendation logic here
        const recommendations = {
            Hourglass: "Fitted dresses, wrap styles, belted pieces that accentuate your waist",
            Pear: "A-line skirts, boat neck tops, statement shoulders to balance proportions",
            Apple: "Empire waist dresses, V-necks, flowy bottoms to create balance",
            Rectangle: "Ruffles, layers, peplum tops to create curves and definition"
        };

        return `<p>${recommendations[bodyType]}</p>`;
    }

    async function saveMeasurements(heightFeet, heightInches, bust, waist, hips, hipDips) {
        try {
            const response = await fetch('/api/measurements', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    heightFeet,
                    heightInches,
                    bust,
                    waist,
                    hips,
                    hipDips
                })
            });

            if (!response.ok) {
                throw new Error('Failed to save measurements');
            }

        } catch (error) {
            console.error('Error saving measurements:', error);
        }
    }
});