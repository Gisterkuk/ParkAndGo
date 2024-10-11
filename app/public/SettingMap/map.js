mapboxgl.accessToken = 'pk.eyJ1IjoiYWxjYW5kZWpzIiwiYSI6ImNtMWNxa3p6cDExdnoyam9mbjlpYmNncjAifQ.CjlYg9fh0dxJ49BDuACykw';

window.onload = function() {
    // Inicializa el mapa
    const map = new mapboxgl.Map({
        container: 'mapa', // ID del contenedor
        style: 'mapbox://styles/mapbox/streets-v11', // Estilo del mapa
        center: [-54.454692, -25.683152], // Longitud y latitud
        zoom: 12 // Nivel de zoom
    });

    map.on('load', function() {
        map.addSource('rutas', {
            'type': 'geojson',
            'data': '/app/public/rutas.geojson'    
        });
        map.addSource('rutas', {
            'type': 'geojson',
            'data': '/app/public/puntos.geojson'    
        });

        
    });
};
