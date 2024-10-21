document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, checking login status...');
    checkLoginStatus().then(isLoggedIn => {
        console.log('Initial login check result:', isLoggedIn);
        updateUIBasedOnLoginStatus(isLoggedIn);
    });

    const logoutButton = document.getElementById('logoutButton');
    if (logoutButton) {
        logoutButton.addEventListener('click', logout);
    } else {
        console.error('Logout button not found');
    }
});

function parseHeight(height) {
    const parts = height.match(/(\d+)\'(\d+)\"/);
    if (parts) {
        const feet = parseInt(parts[1], 10);
        const inches = parseInt(parts[2], 10);
        return feet * 12 + inches; // Convert height to total inches
    } else {
        return 0; // Default to 0 if parsing fails
    }
}

async function calculateFit(event) {
    event.preventDefault(); // Prevent the form from submitting traditionally

    // Get user input
    const heightInput = document.getElementById('height').value;
    const height = parseHeight(heightInput); // Parse the height input
    const bust = parseFloat(document.getElementById('bust').value);
    const waist = parseFloat(document.getElementById('waist').value);
    const hips = parseFloat(document.getElementById('hips').value);
    const hipDips = document.getElementById('hipDips').checked; // New checkbox for hip dips

    // Calculate body type based on measurements
    const bodyType = determineBodyType(height, bust, waist, hips);

    // Generate outfit recommendation based on body type, height, and hip dips
    const outfit = generateOutfit(bodyType, height, hipDips);

    // Display body type result
    const bodyTypeResult = document.getElementById('bodyTypeResult');
    bodyTypeResult.innerHTML = `<p><strong>Body Type:</strong> ${bodyType}</p>`;

    // Display outfit recommendation
    const outfitDisplay = document.getElementById('outfitDisplay');
    outfitDisplay.innerHTML = `<p><strong>Styling Tips:</strong> ${outfit}</p>`;

    // Show output box
    document.getElementById('outputBox').style.display = 'block';

    // Save to profile
    await saveToProfile(bodyType, outfit);
}

function determineBodyType(height, bust, waist, hips) {
    bust = parseFloat(bust);
    waist = parseFloat(waist);
    hips = parseFloat(hips);

    // Example of using height: Adjusting thresholds based on height
    const heightFactor = height > 64 ? 1.1 : 1.05; // Adjust factor based on height (64 inches is 5'4")

    const bustWaistRatio = bust / waist; 
    const hipWaistRatio = hips / waist;
    const bustHipRatio = bust / hips;

    if (bustWaistRatio <= heightFactor && hipWaistRatio <= heightFactor && Math.abs(bust - hips) <= 5 && waist >= (0.75 * hips)) {
        return 'Rectangle';
    } else if (bustWaistRatio > heightFactor && hipWaistRatio > heightFactor && Math.abs(bust - hips) <= 5) {
        return 'Hourglass';
    } else if (hipWaistRatio > 1.2 && bustHipRatio < 0.95) {
        return 'Pear';
    } else if (bustWaistRatio > 1.2 && hipWaistRatio < 0.95) {
        return 'Apple';
    } else {
        return 'Undefined';
    }
}

function generateOutfit(bodyType, height, hipDips) {
    const baseRecommendations = {
        'Hourglass': 'Fitted dress or top with a belted waist, high-waisted jeans with a crop top, A-line skirt with a fitted blouse.',
        'Pear': 'A-line skirts or dresses, wide-leg pants, tops with detailing on the shoulders to balance the hips.',
        'Apple': 'Empire waist dresses or tops, flowy tops with V-necks, high-waisted pants with a tucked-in blouse.',
        'Rectangle': 'Tailored blazers, peplum tops, dresses with ruching or detailing at the waist.'
    };

    let recommendation = baseRecommendations[bodyType] || 'No specific outfit recommendations for this body type.';

    // Add recommendations for hip dips
    if (hipDips) {
        recommendation += ' For hip dips: High-waisted bottoms, A-line skirts, and dresses that skim over the hips. Avoid clingy fabrics around the hip area.';
    }

    // Add height-specific recommendations
    if (height > 68) { // Taller than 5'8"
        recommendation += ' As you are tall, consider maxi dresses, wide-leg pants, and vertical stripes to elongate your silhouette further.';
    } else if (height < 63) { // Shorter than 5'3"
        recommendation += ' For your height, consider high-waisted bottoms, vertical stripes, and monochromatic outfits to create a lengthening effect. Heels or wedges can also add height.';
    }

    return recommendation;
}

function saveToProfile(bodyType, outfit) {
    checkLoginStatus().then(isLoggedIn => {
        if (!isLoggedIn) {
            showSaveError('You must be logged in to save measurements');
            return;
        }
        
        const height = document.getElementById('height').value;
        const bust = document.getElementById('bust').value;
        const waist = document.getElementById('waist').value;
        const hips = document.getElementById('hips').value;
        const hipDips = document.getElementById('hipDips').checked;

        const data = {
            height,
            bust,
            waist,
            hips,
            hipDips,
            bodyType,
            outfit
        };

        console.log('Sending data to server:', data);

        fetch('/api/save-measurements', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
            credentials: 'include'
        })
        .then(response => response.json())
        .then(data => {
            console.log('Server response:', data);
            if (data.success) {
                showSaveSuccess();
            } else {
                showSaveError(data.message);
            }
        })
        .catch(error => {
            console.error('Error saving measurements:', error);
            showSaveError('An error occurred while saving measurements');
        });
    });
}

function checkLoginStatus() {
    console.log('Checking login status...');
    return fetch('/api/check-login', {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        console.log('Login status data:', data);
        updateUIBasedOnLoginStatus(data.isLoggedIn, data.username);
        return data.isLoggedIn;
    })
    .catch(error => {
        console.error('Error checking login status:', error);
        updateUIBasedOnLoginStatus(false);
        return false;
    });
}

function showLoginPrompt() {
    // Check if the prompt already exists
    if (!document.querySelector('.login-prompt')) {
        const promptElement = document.createElement('div');
        promptElement.className = 'alert alert-info mt-3 login-prompt';
        promptElement.textContent = 'Log in or create an account to save your measurements and recommendations!';
        document.querySelector('.container').appendChild(promptElement);
    }
}

function showSaveSuccess() {
    const successElement = document.createElement('div');
    successElement.className = 'alert alert-success mt-3';
    successElement.innerHTML = `
        <strong>Success!</strong> Your measurements and recommendations have been saved to your profile.
        <br>
        You can view and update this information at any time on your <a href="/profile_page.html" class="alert-link">profile page</a>.
    `;
    
    // Remove any existing success messages or login prompts
    const existingSuccess = document.querySelector('.alert-success');
    const existingPrompt = document.getElementById('loginPrompt');
    if (existingSuccess) existingSuccess.remove();
    if (existingPrompt) existingPrompt.remove();
    
    // Add the new success message
    document.querySelector('.container').appendChild(successElement);
    
    // Optionally, scroll to the success message
    successElement.scrollIntoView({ behavior: 'smooth', block: 'end' });
}

function showSaveError(message) {
    const errorElement = document.createElement('div');
    errorElement.className = 'alert alert-danger mt-3';
    
    if (message === 'You must be logged in to save measurements') {
        errorElement.innerHTML = `You must be <a href="login.html" class="alert-link">logged in</a> to save measurements`;
    } else {
        errorElement.textContent = message || 'There was an error saving your measurements. Please try again later.';
    }
    
    // Remove any existing error messages
    const existingError = document.querySelector('.alert-danger');
    if (existingError) {
        existingError.remove();
    }
    
    document.querySelector('.container').appendChild(errorElement);
}

function updateUIBasedOnLoginStatus(isLoggedIn, username) {
    const loginNavItem = document.getElementById('loginNavItem');
    const userDropdown = document.getElementById('userDropdown');
    const usernameSpan = document.getElementById('username');

    if (isLoggedIn) {
        loginNavItem.style.display = 'none';
        userDropdown.style.display = 'block';
        usernameSpan.textContent = username;
    } else {
        loginNavItem.style.display = 'block';
        userDropdown.style.display = 'none';
    }
}

function logout() {
    console.log('Logout function called');
    fetch('/api/logout', {
        method: 'POST',
        credentials: 'include'
    })
    .then(response => {
        console.log('Logout response status:', response.status);
        return response.text();
    })
    .then(text => {
        console.log('Logout response text:', text);
        try {
            const data = JSON.parse(text);
            if (data.success) {
                console.log('Logout successful, redirecting to login page');
                window.location.href = 'login.html';
            } else {
                console.error('Logout failed:', data.message);
            }
        } catch (error) {
            console.error('Error parsing JSON:', error);
            console.error('Received HTML instead of JSON:', text);
        }
    })
    .catch(error => {
        console.error('Logout fetch error:', error);
    });
}

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, checking login status...');
    checkLoginStatus();

    const logoutButton = document.getElementById('logoutButton');
    if (logoutButton) {
        logoutButton.addEventListener('click', logout);
    } else {
        console.error('Logout button not found');
    }
});