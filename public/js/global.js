document.addEventListener('DOMContentLoaded', async () => {
    const loginStatus = await checkLoginStatus();
    updateUI(loginStatus);

    const logoutButton = document.getElementById('logoutButton');
    if (logoutButton) {
        logoutButton.addEventListener('click', async () => {
            try {
                const response = await fetch('/api/logout', { method: 'POST' });
                if (response.ok) {
                    window.location.href = '/';
                }
            } catch (error) {
                console.error('Logout error:', error);
            }
        });
    }
});

async function checkLoginStatus() {
    try {
        const response = await fetch('/api/check-auth');
        const data = await response.json();
        console.log("Login status data:", data);
        return data;
    } catch (error) {
        console.error("Error checking login status:", error);
        return { isLoggedIn: false };
    }
}

function updateUI(loginStatus) {
    const loginNavItem = document.getElementById('loginNavItem');
    const userDropdown = document.getElementById('userDropdown');
    const usernameSpan = document.getElementById('username');

    if (loginStatus.isLoggedIn) {
        if (loginNavItem) loginNavItem.style.display = 'none';
        if (userDropdown) userDropdown.style.display = 'block';
        if (usernameSpan) usernameSpan.textContent = `Hi ${loginStatus.username}!`;
    } else {
        if (loginNavItem) loginNavItem.style.display = 'block';
        if (userDropdown) userDropdown.style.display = 'none';
        if (usernameSpan) usernameSpan.textContent = '';
    }
}