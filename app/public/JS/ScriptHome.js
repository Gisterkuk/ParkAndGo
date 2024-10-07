mapboxgl.accessToken = 'pk.eyJ1IjoiYWxjYW5kZWpzIiwiYSI6ImNtMWNxa3p6cDExdnoyam9mbjlpYmNncjAifQ.CjlYg9fh0dxJ49BDuACykw';

// Inicializa el mapa
const map = new mapboxgl.Map({
    container: 'mapa', // ID del contenedor
    style: 'mapbox://styles/mapbox/streets-v11', // Estilo del mapa
    center: [-54.454692, -25.683152], // Longitud y latitud
    zoom:12 // Nivel de zoom
});
map.on('load', function() {
    map.addSource('rutas', {
        'type': 'geojson',
        'data': '../rutas.geojson'    
    });

    map.addLayer({
        'id': 'lineas',
        'type': 'line',
        'source': 'rutas',
        'layout': {
            'line-join': 'round',
            'line-cap': 'round'
        },
        'paint': {
            'line-color': '#000', // Color de la línea
            'line-width': 4 // Grosor de la línea
        }
    });
    console.log("mapa se inicio correctamente");

    map.addLayer({
        'id': 'puntos-interes-layer',
        'type': 'circle',
        'source': 'rutas',
        'paint': {
            'circle-radius': 8,
            'circle-color': '#007cbf'
        }
    });

    const logoutButton = document.getElementById("logout");
    
    if (logoutButton) {  // Verificamos que el elemento exista
        logoutButton.addEventListener("click", (event) => {
            event.preventDefault(); // Evita que el enlace redirija automáticamente
            document.cookie = 'jwt=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT'; // Elimina la cookie
            document.location.href = "/login"; // Redirige a la página de login
        });
    }
});