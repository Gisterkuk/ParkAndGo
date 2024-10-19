import { actualizarSugerencias, buscarPunto } from "./funcionalidad.js";

mapboxgl.accessToken = 'pk.eyJ1IjoiYWxjYW5kZWpzIiwiYSI6ImNtMWNxa3p6cDExdnoyam9mbjlpYmNncjAifQ.CjlYg9fh0dxJ49BDuACykw';

window.onload = function() {
    const map = new mapboxgl.Map({
        container: 'mapa',
        style: 'mapbox://styles/alcandejs/cm2fa7mpi007d01pbacp8hvpz',
        center: [-54.454692, -25.683152],
        zoom: 15,
        projection: 'globe',
        maxBounds: [
            [-54.500, -25.720],
            [-54.400, -25.630]
        ]
    });
    
    // const geocoder = new MapboxGeocoder({
    //     accessToken: mapboxgl.accessToken,
    //     mapboxgl: mapboxgl,
    //     marker: false,
    //     placeholder: 'Busca un lugar en el mapa'
    // });

    // map.addControl(geocoder, 'top-right');
    
    map.on('load', function() {

        
        map.addSource('ParqueFinal1', {
            'type': 'vector',
            'url': 'mapbox://alcandejs.cm2coubw706nl1tlkfdrxxr6k-9i6l8'
        });
        
        map.addLayer({
            'id': 'rutas-layer',
            'type': 'line',
            'source': 'ParqueFinal1',
            'source-layer': 'ParqueFinal1',
            'layout': {
                'line-join': 'round',
                'line-cap': 'round'
            },
            'paint': {
                'line-color': '#ff1',
                'line-width': 3
            }
        });
        
        fetch('/api/puntos-interes')
        .then(response => {
            if (!response.ok) {
                throw new Error('La respuesta a la API no funcionó');
            }
            return response.json();
        })
        .then(data => {
            const markers = []; // Inicializa el array para almacenar marcadores
            
            data.forEach(punto => {
                const coordinates = [punto.longitud, punto.latitud];
                
                // Crear un contenedor para el marcador y la etiqueta
                const markerContainer = document.createElement('div');
                markerContainer.style.display = 'flex';
                markerContainer.style.flexDirection = 'column'; // Para apilar verticalmente
                markerContainer.style.alignItems = 'center'; // Centramos el contenido
                
                // Crear un marcador con la imagen personalizada y borde circular
                const markerElement = document.createElement('div');
                markerElement.style.backgroundImage = `url(${punto.imagen_url})`; // URL de la imagen
                markerElement.style.backgroundSize = 'contain'; // Ajustar el tamaño
                markerElement.style.width = '40px'; // Ancho del marcador
                markerElement.style.height = '40px'; // Alto del marcador
                markerElement.style.borderRadius = '50%'; // Hacer que sea circular
                markerElement.style.border = '2px solid white'; // Color y grosor del borde
                markerElement.style.boxShadow = '0 0 5px rgba(0,0,0,0.5)'; // Sombra para efecto de profundidad
                
                // Crear el label
                const label = document.createElement('p');
                label.textContent = punto.name; // Nombre del punto
                label.style.margin = '5px 0 0 0'; // Margen superior para separación
                label.style.color = 'gray'; // Color del texto
                label.style.fontSize = '12px'; // Tamaño de fuente
                label.style.textAlign = 'center'; // Centramos el texto
                
                // Añadir el marcador y la etiqueta al contenedor
                markerContainer.appendChild(markerElement);
                markerContainer.appendChild(label);
                
                // Crear el marcador de Mapbox
                const marker = new mapboxgl.Marker(markerContainer)
                .setLngLat(coordinates)
                .setPopup(new mapboxgl.Popup().setHTML(`
                    <img src="${punto.imagen_url}" alt="${punto.name}" style="width:100%;">
                    <h3>${punto.name}</h3>
                    <p>${punto.descrip}</p>
                    `))
                    .addTo(map);

                    // Almacena el marcador y su nivel de zoom
                    markers.push({
                    marker: marker,
                    zoom: punto.zoom // Suponiendo que tienes un campo 'zoom' en tu base de datos
                });
            });

            // Evento para controlar el zoom
            map.on('zoom', function() {
                const currentZoom = map.getZoom();
                console.log(currentZoom);
                markers.forEach(({ marker, zoom }) => {
                    if (currentZoom >= zoom) {
                        marker.getElement().style.display = 'flex'; // Mostrar el marcador si el zoom es suficiente
                    } else {
                        marker.getElement().style.display = 'none'; // Ocultar el marcador si el zoom no es suficiente
                    }
                });
            });

            // Inicializa la visibilidad de los marcadores según el zoom inicial
            const initialZoom = map.getZoom();
            markers.forEach(({ marker, zoom }) => {
                if (initialZoom >= zoom) {
                    marker.getElement().style.display = 'flex'; // Mostrar el marcador si el zoom es suficiente
                } else {
                    marker.getElement().style.display = 'none'; // Ocultar el marcador si el zoom no es suficiente
                }
            });
        })
        .catch(error => {
            console.error('Error al cargar los puntos de interés:', error);
        });

        // Ocultar etiquetas
        map.setLayoutProperty('road-label', 'visibility', 'none');
        map.setLayoutProperty('poi-label', 'visibility', 'none');
        map.setLayoutProperty('country-label', 'visibility', 'none');
        map.setLayoutProperty('transit-label', 'visibility', 'none');
        map.setLayoutProperty('waterway-label', 'visibility', 'none');
        map.setLayoutProperty('natural-line-label', 'visibility', 'none');
        map.setLayoutProperty('natural-point-label', 'visibility', 'none');
        map.setLayoutProperty('water-line-label', 'visibility', 'none');
        map.setLayoutProperty('water-point-label', 'visibility', 'none');
        map.setLayoutProperty('path-pedestrian-label', 'visibility', 'none');
        map.setLayoutProperty('road-number-shield', 'visibility', 'none');
    });

    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = 'Busca un lugar en el mapa';
    searchInput.style.position = 'absolute';
    searchInput.style.top = '10px';
    searchInput.style.right = '10px';
    searchInput.style.zIndex = '1';
    searchInput.style.width = '200px'; // Tamaño del campo de búsqueda
    searchInput.style.padding = '8px'; // Espaciado
    searchInput.style.border = '1px solid #ccc'; // Borde del campo
    searchInput.style.borderRadius = '4px'; // Borde redondeado
    map.getContainer().appendChild(searchInput);

    const suggestionsContainer = document.createElement('div');
    suggestionsContainer.style.position = 'absolute';
    suggestionsContainer.style.top = '40px'; // Debajo del campo de búsqueda
    suggestionsContainer.style.right = '10px';
    suggestionsContainer.style.zIndex = '1';
    suggestionsContainer.style.backgroundColor = '#fff'; // Fondo blanco
    suggestionsContainer.style.border = '1px solid #ccc'; // Borde del contenedor
    suggestionsContainer.style.borderRadius = '4px'; // Borde redondeado
    suggestionsContainer.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.1)'; // Sombra para efecto
    suggestionsContainer.style.maxHeight = '200px'; // Altura máxima
    suggestionsContainer.style.overflowY = 'auto'; // Desplazamiento vertical
    suggestionsContainer.style.display = 'none'; // Oculto por defecto
    map.getContainer().appendChild(suggestionsContainer);
    
    
    // Evento cuando el usuario escribe en el input
    searchInput.addEventListener('input', function() {
        const query = searchInput.value;
        if (query.length > 0) {
            actualizarSugerencias(query,suggestionsContainer, searchInput, map); // Buscar sugerencias
        } else {
            suggestionsContainer.style.display = 'none'; // Ocultar si no hay query
        }
    });

    // Evento para realizar la búsqueda cuando presionas 'Enter'
    searchInput.addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
            const query = searchInput.value; // Obtener el valor del input
            buscarPunto(query); // Llamar a la función para buscar
            suggestionsContainer.style.display = 'none'; // Ocultar las sugerencias
        }
    });

        // Realiza la solicitud a la API de direcciones
    
};
