export function buscarPunto(query, map) {
    if (!map) {
        console.error('El mapa no está disponible.');
        return;
    }

    fetch(`/api/puntos-interes/search?query=${encodeURIComponent(query)}`)
        .then(response => response.json())
        .then(data => {
            if (data.length > 0) {
                const firstPoint = data[0];
                const coordinates = [firstPoint.longitud, firstPoint.latitud];
                map.flyTo({ center: coordinates, zoom: 18.5 });
            } else {
                alert('No se encontraron resultados.');
            }
        })
        .catch(error => {
            console.error('Error al buscar puntos de interés:', error);
        });
}

export function actualizarSugerencias(query, suggestionsContainer, searchInput, map) {
    fetch(`/api/puntos-interes/search?query=${encodeURIComponent(query)}`)
    .then(response => response.json())
    .then(data => {
        // Limpiar el contenedor de sugerencias
        suggestionsContainer.innerHTML = '';

        if (data.length > 0) {
            suggestionsContainer.style.display = 'block'; // Mostrar el contenedor de sugerencias

            data.forEach(punto => {
                const suggestionItem = document.createElement('div');
                suggestionItem.style.display = 'flex'; // Para alinear imagen y texto horizontalmente
                suggestionItem.style.alignItems = 'center'; // Centrar verticalmente
                suggestionItem.style.padding = '10px';
                suggestionItem.style.cursor = 'pointer';
                suggestionItem.style.borderBottom = '1px solid #ccc';

                // Crear el elemento de imagen
                const img = document.createElement('img');
                img.src = punto.imagen_url; // URL de la imagen
                img.style.width = '40px'; // Ancho de la imagen
                img.style.height = '40px'; // Alto de la imagen
                img.style.marginRight = '10px'; // Espacio entre la imagen y el texto

                // Crear el elemento de texto
                const name = document.createElement('span');
                name.textContent = punto.name;

                // Añadir imagen y texto al ítem de sugerencia
                suggestionItem.appendChild(img);
                suggestionItem.appendChild(name);

                // Resaltar el ítem cuando pasas el ratón
                suggestionItem.onmouseenter = () => {
                    suggestionItem.style.backgroundColor = '#eee';
                };
                suggestionItem.onmouseleave = () => {
                    suggestionItem.style.backgroundColor = '#fff';
                };

                // Evento al hacer clic en una sugerencia
                suggestionItem.onclick = () => {
                    searchInput.value = punto.name; // Actualizar el input de búsqueda con el nombre seleccionado
                    buscarPunto(punto.name, map); // Buscar el punto en el mapa
                    suggestionsContainer.style.display = 'none'; // Ocultar las sugerencias
                };

                suggestionsContainer.appendChild(suggestionItem);
            });
        } else {
            suggestionsContainer.style.display = 'none'; // Ocultar si no hay sugerencias
        }
    })
    .catch(error => {
        console.error('Error al buscar sugerencias:', error);
    });
}

export function routeo(puntoA,puntoB,map){
    fetch(`https://api.mapbox.com/directions/v5/mapbox/driving/${puntoA.join(',')};${puntoB.join(',')}?geometries=geojson&access_token=TU_ACCESS_TOKEN_AQUI`)
    .then(response => response.json())
    .then(data => {
        // Comprueba si hay rutas disponibles
        if (data.routes.length > 0) {
            // Obtiene la geometría de la ruta
            const ruta = data.routes[0].geometry;

            // Añade la fuente de datos de la ruta al mapa
            map.addSource('ruta', {
                type: 'geojson',
                data: {
                    type: 'Feature',
                    geometry: ruta
                }
            });

            // Añade una capa para dibujar la ruta
            map.addLayer({
                id: 'ruta',
                type: 'line',
                source: 'ruta',
                layout: {
                    'line-join': 'round',
                    'line-cap': 'round'
                },
                paint: {
                    'line-color': '#ff1',
                    'line-width': 4
                }
            });

            // Opcional: ajusta el mapa para mostrar la ruta
            const bounds = new mapboxgl.LngLatBounds();
            ruta.coordinates.forEach(coord => bounds.extend(coord));
            map.fitBounds(bounds, { padding: { top: 10, bottom: 25, left: 15, right: 5 } });
        } else {
            console.error('No se encontraron rutas.');
        }
    })
    .catch(error => {
        console.error('Error al obtener la ruta:', error);
    });
}