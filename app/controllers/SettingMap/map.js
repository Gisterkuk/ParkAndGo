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

        map.addSource('puntos', {
            'type': 'geojson',
            'data': './controllers/puntos.geojson'    
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
        fetch('/api/rutas')
        .then(response => response.json())
        .then(data => {
            data.forEach(ruta => {
                const coordinates = JSON.parse(ruta.geojson).coordinates;
                
                // Añadir la ruta al mapa
                map.addSource(ruta.nombre_ruta, {
                    type: 'geojson',
                    data: {
                        type: 'Feature',
                        geometry: {
                            type: 'LineString',
                            coordinates: coordinates
                        },
                        properties: {
                            nombre: ruta.nombre_ruta
                        }
                    }
                });

                // Añadir la capa para mostrar la ruta
                map.addLayer({
                    id: ruta.nombre_ruta,
                    type: 'line',
                    source: ruta.nombre_ruta,
                    layout: {
                        'line-join': 'round',
                        'line-cap': 'round'
                    },
                    paint: {
                        'line-color': '#888',
                        'line-width': 4
                    }
                });
            });
        })
        .catch(error => console.error('Error al obtener las rutas:', error));
    });
};
