import { actualizarSugerencias, buscarPunto } from "./Search.js";
import {createGraph,setupMapEvents,visualizeRoutesOnMap} from "./Routing.js";
import { trackUserLocation } from "./LiveLocation.js";
//import fs from 'fs';
let map; // Declarar map de manera global
let geojsonData; // También almacenar el GeoJSON de manera global
const TOLERANCE_RADIUS = 100; // Tolerancia en metros

mapboxgl.accessToken = 'pk.eyJ1IjoiYWxjYW5kZWpzIiwiYSI6ImNtMWNxa3p6cDExdnoyam9mbjlpYmNncjAifQ.CjlYg9fh0dxJ49BDuACykw';

window.onload = function() {
    const map = new mapboxgl.Map({
        container: 'mapa',
        style: 'mapbox://styles/alcandejs/cm2oxvu73008801qifmae69zs',
        center: [-54.454692, -25.683152],   
        zoom: 12
        
        // ,maxBounds: [
        //     [-54.500, -25.720],
        //     [-54.400, -25.630]
        // ]
    });
    
    // const geocoder = new MapboxGeocoder({
    //     accessToken: mapboxgl.accessToken,
    //     mapboxgl: mapboxgl,
    //     marker: false,
    //     placeholder: 'Busca un lugar en el mapa'
    // });

    // map.addControl(geocoder, 'top-right');
    
    map.on('load', function() {

        map.addSource('geojsonSource', {
            type: 'geojson',
            data: {
                type: 'FeatureCollection',
                features: [],
            },
        });
    
        // Añadir el layer
        map.addLayer({
            id: 'route',
            type: 'line',
            source: 'geojsonSource',
            layout: {
                'line-join': 'round',
                'line-cap': 'round'
            },
            paint: {
                'line-color': '#0aa3ef', // Cambia a rojo para visibilidad
                'line-width': 6 // Aumenta el ancho
            }
        });
    
        // Verificar si la fuente y el layer existen
        if (map.getSource('geojsonSource')) {
            console.log("La fuente 'geojsonSource' se ha agregado correctamente.");
        }
    
        if (map.getLayer('route')) {
            console.log("El layer 'route' se ha agregado correctamente.");
        }
        trackUserLocation(map);
    
        //const filePath = path.join(__dirname, 'MultiLineStringWithOrientation.geojson');

        // fs.access(filePath, fs.constants.F_OK, (err) => {
        //     console.log(err ? 'El archivo no existe' : 'El archivo está presente');
        // });
        fetch('http://localhost:8200/MultiLineStringWithOrientation.geojson')
        .then(response => {
            console.log(response);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('GeoJSON cargado:', data);
            geojsonData = data; // Guardar el GeoJSON de manera global
        // Verificar si las características son LineString o MultiLineString
        if (data.features && data.features.length > 0) {
            // Iterar sobre cada LineString y añadir orientación directamente
            data.features.forEach((feature) => {
                if (feature.geometry.type === 'LineString') {
                    const coordinates = feature.geometry.coordinates;
                    if (coordinates.length > 1) {
                        const from = coordinates[0];
                        const to = coordinates[coordinates.length - 1];

                        // Agregar la orientación a las propiedades
                        feature.properties.orientation = {
                            from: { lat: from[1], lon: from[0] },
                            to: { lat: to[1], lon: to[0] }
                        };
                    }
                } else if (feature.geometry.type === 'MultiLineString') {
                    console.warn("Encontrado MultiLineString, se ignorará por esta implementación.");
                }
            });

            //console.log("GeoJSON actualizado con orientaciones:", data);
            
            const graph = createGraph(data); // Crear el grafo
            //visualizeRoutesOnMap(map,data); // Visualizar las rutas en el mapa
            setupMapEvents(map,graph); // Configurar eventos después de cargar el mapa

        } else {
            console.error("El archivo GeoJSON no contiene LineStrings o no es válido.");
        }
    })
    .catch(error => {
        console.error("Error al cargar el archivo GeoJSON:", error);
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
                //console.log(currentZoom);
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
            buscarPunto(query,map); // Llamar a la función para buscar
            suggestionsContainer.style.display = 'none'; // Ocultar las sugerencias
        }
    });

        // Realiza la solicitud a la API de direcciones
    map.on('error', function(e) {
        console.error('Error al cargar el mapa:', e.error.message);
    });
};
