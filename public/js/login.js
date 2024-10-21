document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');

    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        console.log('Attempting login with username:', username);

        fetch('/api/login', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        })
        .then(response => {
            console.log('Login response status:', response.status);
            return response.json();
        })
        .then(data => {
            console.log('Login response data:', data);
            if (data.success) {
                console.log('Login successful');
                window.location.href = 'fit_calculator.html';
            } else {
                throw new Error(data.message || 'Login failed');
            }
        })
        .catch(error => {
            console.error('Login error:', error);
            alert('Login failed: ' + error.message);
        });
    });
});