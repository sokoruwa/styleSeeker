document.addEventListener('DOMContentLoaded', function() {
    fetchProfileData();
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
        displayProfileData(data);
    })
    .catch(error => {
        console.error('Error fetching profile data:', error);
        let errorMessage = 'Error loading profile data. Please try again later.';
        if (error.message.includes('401')) {
            errorMessage = 'You are not logged in. Please log in to view your profile.';
        }
        document.getElementById('profileData').innerHTML = `<p>${errorMessage}</p>`;
    });
}

function displayProfileData(data) {
    const profileDiv = document.getElementById('profileData');
    
    if (!data || !data.username) {
        profileDiv.innerHTML = '<p>No profile data available. Please complete your measurements in the Fit Calculator.</p>';
        return;
    }

    let measurementsHtml = '<p>No measurements data available.</p>';
    if (data.measurements) {
        measurementsHtml = `
            <ul>
                <li>Height: ${data.measurements.height || 'Not provided'}</li>
                <li>Bust: ${data.measurements.bust || 'Not provided'}</li>
                <li>Waist: ${data.measurements.waist || 'Not provided'}</li>
                <li>Hips: ${data.measurements.hips || 'Not provided'}</li>
                <li>Hip Dips: ${data.measurements.hipDips ? 'Yes' : 'No'}</li>
            </ul>
        `;
    }

    profileDiv.innerHTML = `
        <h2>Welcome, ${data.username}!</h2>
        <h3>Your Measurements</h3>
        ${measurementsHtml}
        <h3>Your Body Type</h3>
        <p>${data.bodyType || 'Not determined yet'}</p>
        <h3>Recommended Outfit</h3>
        <p>${data.outfit || 'No recommendations yet'}</p>
    `;
}
