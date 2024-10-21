document.addEventListener('DOMContentLoaded', function() {
    const firstName = localStorage.getItem('firstName');
    const loginNavItem = document.getElementById('loginNavItem');
    const userDropdown = document.getElementById('userDropdown');
    const userFirstName = document.getElementById('userFirstName');
    const logoutButton = document.getElementById('logoutButton');
    const loginSection = document.getElementById('loginSection');

    function updateNavbar() {
        if (firstName) {
            loginNavItem.style.display = 'none';
            userDropdown.style.display = 'block';
            userFirstName.textContent = `Hi ${firstName}`;
            if (loginSection) loginSection.style.display = 'none';
        } else {
            loginNavItem.style.display = 'block';
            userDropdown.style.display = 'none';
            if (loginSection) loginSection.style.display = 'block';
        }
    }

    updateNavbar();

    if (logoutButton) {
        logoutButton.addEventListener('click', function(e) {
            e.preventDefault();
            localStorage.removeItem('firstName');
            localStorage.removeItem('token');
            updateNavbar();
            window.location.href = 'index.html'; // Redirect to home page after logout
        });
    }

    // Initialize Bootstrap dropdowns
    var dropdownElementList = [].slice.call(document.querySelectorAll('.dropdown-toggle'))
    var dropdownList = dropdownElementList.map(function (dropdownToggleEl) {
        return new bootstrap.Dropdown(dropdownToggleEl)
    })
});