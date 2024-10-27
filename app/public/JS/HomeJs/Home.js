window.addEventListener('load', function() {
    feather.replace(); // Reemplaza los íconos de Feather

    const logoutButton = document.getElementById("logout");
    if (logoutButton) {
        logoutButton.addEventListener("click", (event) => {
            event.preventDefault(); // Evita que el enlace redirija automáticamente
            document.cookie = 'jwt=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT'; // Elimina la cookie
            document.location.href = "/login"; // Redirige a la página de login
        });
    }
});