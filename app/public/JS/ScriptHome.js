window.onload = function() {
    mapboxgl.accessToken = 'pk.eyJ1IjoiYWxjYW5kZWpzIiwiYSI6ImNtMWNxa3p6cDExdnoyam9mbjlpYmNncjAifQ.CjlYg9fh0dxJ49BDuACykw';

    const map = new mapboxgl.Map({
        container: 'mapa', // ID del contenedor
        style: 'mapbox://styles/mapbox/streets-v11', // Estilo del mapa
        center: [-54.4419, -25.6953], // Longitud y latitud
        zoom: 9 // Nivel de zoom
    });


    const logoutButton = document.getElementById("logout");
    
    if (logoutButton) {  // Verificamos que el elemento exista
        logoutButton.addEventListener("click", (event) => {
            event.preventDefault(); // Evita que el enlace redirija automáticamente
            document.cookie = 'jwt=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT'; // Elimina la cookie
            document.location.href = "/login"; // Redirige a la página de login
        });
    }
};