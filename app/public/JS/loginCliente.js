document.addEventListener("DOMContentLoaded", function() {
    const errorDiv = document.getElementById("error");

    const urlParams = new URLSearchParams(window.location.search);
    const errorMessage = urlParams.get('error');

    if (errorMessage) {
        errorDiv.querySelector('label').textContent = errorMessage;
        errorDiv.style.display = 'block';
        errorDiv.style.borderBottom= '1px solid red';
    }
});