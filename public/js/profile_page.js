document.addEventListener('DOMContentLoaded', function() {
    fetchProfileData();
    checkLoginStatus();
});

function fetchProfileData() {
    fetch('/api/user-profile', {
        method: 'GET',
        credentials: 'include'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log('Received profile data:', data);
        displayProfileData(data);
    })
    .catch(error => {
        console.error('Error fetching profile data:', error);
        let errorMessage = 'Error loading profile data. Please try again later.';
        if (error.message.includes('401')) {
            errorMessage = 'Please <a href="login.html">log in</a> to view your profile.';
        }
        document.getElementById('profileData').innerHTML = `
            <div class="alert alert-warning">
                ${errorMessage}
            </div>
        `;
    });
}

function displayProfileData(data) {
    const profileDiv = document.getElementById('profileData');
    console.log('Raw profile data:', data);
    
    if (!data || (!data.measurements && !data.bodyType && !data.outfit)) {
        profileDiv.innerHTML = `
            <div class="profile-section">
                <h2>Welcome to styleSeeker</h2>
                <p>No profile data available yet. Visit the 
                <a href="fit_calculator.html" class="update-measurements-btn">Fit Calculator</a> 
                to get your measurements and recommendations.</p>
            </div>
        `;
        return;
    }

    profileDiv.innerHTML = `
        <div class="profile-grid">
            <div class="measurements-section profile-section" data-title="MEASUREMENTS">
                <h2>Your Measurements</h2>
                ${data.measurements ? `
                    <ul>
                        <li>
                            <span>Height</span>
                            <span>${Math.floor(data.measurements.height / 12)}'${data.measurements.height % 12}"</span>
                        </li>
                        <li>
                            <span>Bust</span>
                            <span>${data.measurements.bust}"</span>
                        </li>
                        <li>
                            <span>Waist</span>
                            <span>${data.measurements.waist}"</span>
                        </li>
                        <li>
                            <span>Hips</span>
                            <span>${data.measurements.hips}"</span>
                        </li>
                        <li>
                            <span>Hip Dips</span>
                            <span>${data.measurements.hipDips ? 'Yes' : 'No'}</span>
                        </li>
                    </ul>
                ` : '<p>No measurements recorded yet.</p>'}
            </div>

            <div class="body-type-section profile-section" data-title="BODY TYPE">
                <h2>Body Type</h2>
                <p>${data.bodyType || 'Not determined yet'}</p>
            </div>

            <div class="recommendations-section profile-section" data-title="STYLE GUIDE">
                <h2>Style Recommendations</h2>
                <p>${data.outfit || 'No recommendations yet'}</p>
                <a href="fit_calculator.html" class="update-measurements-btn">
                    Update Measurements
                </a>
            </div>
        </div>
    `;
}

function checkLoginStatus() {
    return fetch('/api/check-login', {
        method: 'GET',
        credentials: 'include'
    })
    .then(response => response.json())
    .then(data => {
        updateUIBasedOnLoginStatus(data.isLoggedIn, data.username);
        return data.isLoggedIn;
    })
    .catch(error => {
        console.error('Error checking login status:', error);
        updateUIBasedOnLoginStatus(false);
        return false;
    });
}

function updateUIBasedOnLoginStatus(isLoggedIn, username) {
    const loginNavItem = document.getElementById('loginNavItem');
    const userDropdown = document.getElementById('userDropdown');
    const usernameSpan = document.getElementById('username');

    if (isLoggedIn) {
        loginNavItem.style.display = 'none';
        userDropdown.style.display = 'block';
        if (usernameSpan) {
            usernameSpan.textContent = username;
        }
    } else {
        loginNavItem.style.display = 'block';
        userDropdown.style.display = 'none';
    }
}