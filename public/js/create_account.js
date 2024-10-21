document.addEventListener('DOMContentLoaded', function() {
    const createAccountForm = document.getElementById('createAccountForm');

    createAccountForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const firstName = document.getElementById('firstName').value;
        const lastName = document.getElementById('lastName').value;
        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        fetch('/api/create-account', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ firstName, lastName, username, email, password }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Account created successfully!');
                window.location.href = '/login.html';
            } else {
                alert('Account creation failed: ' + data.message);
                console.error('Error details:', data.error);
            }
        })
        .catch((error) => {
            console.error('Fetch error:', error);
            alert('An error occurred. Please try again.');
        });
    });
});