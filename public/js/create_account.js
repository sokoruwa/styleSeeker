document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('createAccountForm');
    
    if (!form) {
        console.error('Create account form not found');
        return;
    }

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        console.log('Form submitted');

        // Get form values directly from the form
        const formData = new FormData(form);
        const username = formData.get('username');
        const password = formData.get('password');

        if (!username || !password) {
            const errorDiv = document.getElementById('signupError');
            if (errorDiv) {
                errorDiv.textContent = 'Username and password are required';
                errorDiv.style.display = 'block';
            }
            return;
        }

        try {
            console.log('Sending signup request:', { username });

            const response = await fetch('/api/signup', {
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

            if (response.ok) {
                window.location.href = '/login.html';
            } else {
                const errorDiv = document.getElementById('signupError');
                if (errorDiv) {
                    errorDiv.textContent = data.message || 'Error creating account';
                    errorDiv.style.display = 'block';
                }
            }
        } catch (error) {
            console.error('Signup error:', error);
            const errorDiv = document.getElementById('signupError');
            if (errorDiv) {
                errorDiv.textContent = 'An error occurred during signup';
                errorDiv.style.display = 'block';
            }
        }
    });
});