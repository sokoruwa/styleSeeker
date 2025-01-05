document.addEventListener('DOMContentLoaded', function() {
    // Check login status when page loads
    checkLoginStatus();

    // Add logout button event listener
    const logoutButton = document.getElementById('logoutButton');
    if (logoutButton) {
        logoutButton.addEventListener('click', function(e) {
            e.preventDefault(); // Prevent default anchor behavior
            console.log('Logout button clicked'); // Debug log
            handleLogout();
        });
    }
});

function checkLoginStatus() {
    console.log('Checking login status...');
    return fetch('/api/check-login', {
        method: 'GET',
        credentials: 'include'
    })
    .then(response => response.json())
    .then(data => {
        console.log('Login status data:', data);
        updateUIBasedOnLoginStatus(data.isLoggedIn, data.username);
        return data.isLoggedIn;
    })
    .catch(error => {
        console.error('Error checking login status:', error);
        updateUIBasedOnLoginStatus(false, null);
        return false;
    });
}

function handleLogout() {
    console.log('Handling logout...'); // Debug log
    fetch('/api/logout', {
        method: 'POST',
        credentials: 'include'
    })
    .then(response => response.json())
    .then(data => {
        console.log('Logout response:', data); // Debug log
        if (data.success) {
            // Update UI first
            updateUIBasedOnLoginStatus(false);
            // Show feedback to user
            alert('Successfully logged out!');
            // Then redirect
            window.location.href = '/login.html';
        } else {
            console.error('Logout failed:', data.message);
            alert('Failed to logout. Please try again.');
        }
    })
    .catch(error => {
        console.error('Logout error:', error);
        alert('Error during logout. Please try again.');
    });
}

function updateUIBasedOnLoginStatus(isLoggedIn, username) {
    const loginNavItem = document.getElementById('loginNavItem');
    const userDropdown = document.getElementById('userDropdown');
    const usernameSpan = document.getElementById('username');

    // Check if elements exist before trying to use them
    if (!loginNavItem || !userDropdown || !usernameSpan) {
        console.log('Navbar elements not found, skipping UI update');
        return;
    }

    console.log('Updating UI:', { isLoggedIn, username });

    if (isLoggedIn && username) {
        loginNavItem.style.display = 'none';
        userDropdown.style.display = 'block';
        usernameSpan.textContent = `Hi ${username}`;
    } else {
        loginNavItem.style.display = 'block';
        userDropdown.style.display = 'none';
        usernameSpan.textContent = 'Hi User';
    }
}