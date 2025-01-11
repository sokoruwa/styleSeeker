document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    
    if (!loginForm) {
        console.error('Login form not found');
        return;
    }

    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        console.log('Login form submitted');

        // Get form data
        const formData = new FormData(this);
        const username = formData.get('username');
        const password = formData.get('password');

        console.log('Form data collected:', { 
            username: username ? 'exists' : 'missing',
            password: password ? 'exists' : 'missing'
        });

        if (!username || !password) {
            showError('Username and password are required');
            return;
        }

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username,
                    password
                })
            });

            const data = await response.json();
            console.log('Login response:', data);

            if (data.success) {
                console.log('Login successful:', data);
                window.location.href = '/';
            } else {
                showError(data.message || 'Login failed');
            }
        } catch (error) {
            console.error('Login error:', error);
            showError('An error occurred during login');
        }
    });

    function showError(message) {
        let errorDiv = document.getElementById('loginError');
        if (!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.id = 'loginError';
            errorDiv.className = 'alert alert-danger mt-3';
            loginForm.insertBefore(errorDiv, loginForm.firstChild);
        }
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
    }
});