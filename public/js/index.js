document.addEventListener('DOMContentLoaded', function() {
    const button = document.querySelector('.top-right-button');

    if (!button) {
        return;
    }

    button.addEventListener('click', function() {
        window.location.href = '/fit_calculator.html';
    });
});
