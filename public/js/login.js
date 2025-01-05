document.addEventListener('DOMContentLoaded', function() {
    console.log('Login page loaded');
    const loginForm = document.getElementById('loginForm');
    
    // Debug: Check if form exists
    console.log('Login form found:', !!loginForm);
    
    // Debug: Check if inputs exist - use more specific selectors
    const usernameInput = document.querySelector('#loginForm #username');
    const passwordInput = document.querySelector('#loginForm #password');
    console.log('Form elements found:', {
        username: !!usernameInput,
        password: !!passwordInput
    });

    if (!loginForm) {
        console.error('Login form not found');
        return;
    }

    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        console.log('Login form submitted');

        // Get form elements again inside the handler - use more specific selectors
        const usernameInput = document.querySelector('#loginForm #username');
        const passwordInput = document.querySelector('#loginForm #password');

        // Debug: Log the actual elements
        console.log('Form elements on submit:', {
            usernameElement: usernameInput,
            passwordElement: passwordInput
        });

        if (!usernameInput || !passwordInput) {
            console.error('Form fields not found on submit');
            alert('Form error: Missing fields');
            return;
        }

        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();

        // Debug: Log the values (password redacted)
        console.log('Form values:', {
            username,
            password: password ? '***' : 'empty'
        });

        if (!username || !password) {
            alert('Please enter both username and password');
            return;
        }

        fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({ username, password })
        })
        .then(response => response.json())
        .then(data => {
            console.log('Login response:', data);
            if (data.success) {
                console.log('Login successful:', data);
                updateUIBasedOnLoginStatus(true, data.username);
                window.location.href = '/fit_calculator.html';
            } else {
                throw new Error(data.message || 'Login failed');
            }
        })
        .catch(error => {
            console.error('Login error:', error);
            alert(error.message);
        });
    });
});