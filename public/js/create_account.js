document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('createAccountForm');
    
    if (!form) {
        console.error('Create account form not found');
        return;
    }

    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        // Get form values directly from the form
        const formData = new FormData(form);
        const username = formData.get('username');
        const password = formData.get('password');
        const email = formData.get('email');
        const firstName = formData.get('firstName');
        const lastName = formData.get('lastName');

        if (!username || !password || !email || !firstName || !lastName) {
            const errorDiv = document.getElementById('signupError');
            if (errorDiv) {
                errorDiv.textContent = 'All fields are required';
                errorDiv.style.display = 'block';
            }
            return;
        }

        try {
            const response = await fetch('/api/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username,
                    password,
                    email,
                    firstName,
                    lastName
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
