document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('createAccountForm');
    
    if (!form) {
        console.error('Create account form not found');
        return;
    }

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        console.log('Form submitted');

        // Get form elements
        const username = document.getElementById('username');
        const password = document.getElementById('password');
        const email = document.getElementById('email');
        const firstName = document.getElementById('firstName');
        const lastName = document.getElementById('lastName');

        // Check if elements exist
        if (!username || !password || !email || !firstName || !lastName) {
            console.error('Form fields not found:', {
                username: !!username,
                password: !!password,
                email: !!email,
                firstName: !!firstName,
                lastName: !!lastName
            });
            alert('Form error: Missing fields');
            return;
        }

        // Get values
        const data = {
            username: username.value.trim(),
            password: password.value.trim(),
            email: email.value.trim(),
            firstName: firstName.value.trim(),
            lastName: lastName.value.trim()
        };

        // Validate values
        if (!data.username || !data.password || !data.email || !data.firstName || !data.lastName) {
            alert('Please fill in all fields');
            return;
        }

        console.log('Sending account data:', {
            ...data,
            password: '****'
        });

        fetch('/api/create-account', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Account created successfully! Please log in.');
                window.location.href = '/login.html';
            } else {
                throw new Error(data.message || 'Error creating account');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert(error.message);
        });
    });
});