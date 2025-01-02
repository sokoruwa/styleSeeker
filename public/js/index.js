// Add click event handler for the button
document.addEventListener('DOMContentLoaded', function() {
    const button = document.querySelector('.top-right-button');
    
    button.addEventListener('click', function() {
        window.location.href = '/fit_calculator';  // Navigate to fit calculator
    });
});
