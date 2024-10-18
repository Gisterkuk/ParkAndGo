mapboxgl.accessToken = 'pk.eyJ1IjoiYWxjYW5kZWpzIiwiYSI6ImNtMWNxa3p6cDExdnoyam9mbjlpYmNncjAifQ.CjlYg9fh0dxJ49BDuACykw';

window.onload = function() {
    // Inicializa el mapa
    const map = new mapboxgl.Map({
        container: 'mapa', // ID del contenedor
        style: 'mapbox://styles/mapbox/streets-v11', // Estilo del mapa
        center: [-54.454692, -25.683152], // Longitud y latitud
        zoom: 13, // Nivel de zoom
        maxBounds: [
            [-54.500, -25.720], // Suroeste (más al oeste y al sur)
            [-54.400, -25.630]  // Noreste (más al este y al norte)
        ] // Nivel de zoom
    });

    const geocoder = new MapboxGeocoder({
        accessToken: mapboxgl.accessToken,
        mapboxgl: mapboxgl,
        marker: false, // No agregar automáticamente un marcador
        placeholder: 'Busca un lugar en el mapa' // Texto de sugerencia
    });

    // Añadir el control de búsqueda al mapa
    map.addControl(geocoder, 'top-right');

    map.on('load', function() {

        map.addSource('CataratasDelIguazu', {
            'type': 'vector',
            'url': 'mapbox://alcandejs.cm2coubw706nl1tlkfdrxxr6k-5tdje' // ID del tileset de Mapbox
        });
        
        map.addLayer({
            'id': 'rutas-layer',
            'type': 'line',  // Tipo de geometría (puede ser 'fill', 'line', 'circle', etc.)
            'source': 'CataratasDelIguazu',
            'source-layer': 'CataratasDelIguazu', // Nombre de la capa dentro de tu tileset
            'layout': {
                'line-join': 'round',
                'line-cap': 'round'
            },
            'paint': {
                'line-color': '#ff1', // Color de la línea
                'line-width': 3           // Grosor de la línea
            }
        });

        fetch('/api/puntos-interes')
        .then(response =>{
            if(!response.ok){
                throw new Error('La respuesta a la api no funciono');
            }
            return response.json()
        })
        .then(data =>{
            data.forEach(punto => {
                const coordinates = [punto.longitud,punto.latitud];
                
                const marker = new mapboxgl.Marker()
                .setLngLat(coordinates)
                .setPopup(new mapboxgl.Popup().setHTML(`
                    <img src="${punto.imagen_url}" alt="${punto.name}" style="width:100%;">
                    <h3>${punto.name}</h3>
                    <p>${punto.descrip}</p>
                    `
                ))
                .addTo(map);
            });
        })
        .catch(error => {
            console.error('Error al cargar los puntos de interés:', error);
        });
        
    });
};
