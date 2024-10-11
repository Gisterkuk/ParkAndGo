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
            'data': './controllers/rutas.geojson'    
        });
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
                    <h3>${punto.name}</h3>
                    <p>${punto.descrip}</p>
                    <img src="${punto.imagen_url}" alt="${punto.name}" style="width:100px;">`
                ))
                .addTo(map);
            });
        })
        .catch(error => {
            console.error('Error al cargar los puntos de interés:', error);
        });
    });
};
