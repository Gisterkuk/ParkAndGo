import {createGraph,setupMapEvents} from "./Routing.js";
import { trackUserLocation } from "./LiveLocation.js";
import { addPOI } from "../../public/JS/HomeJs/POI.js";
import {actualizarSugerencias,buscarPunto} from "./Search.js";
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
                    }
                    else if (feature.geometry.type === 'MultiLineString') {
                        console.warn("Encontrado MultiLineString, se ignorará por esta implementación.");
                    }
                });

                //console.log("GeoJSON actualizado con orientaciones:", data);
        
                const graph = createGraph(data); // Crear el grafo
                //visualizeRoutesOnMap(map,data); // Visualizar las rutas en el mapa
                setupMapEvents(map,graph); // Configurar eventos después de cargar el mapa

            } 
            else {
                console.error("El archivo GeoJSON no contiene LineStrings o no es válido.");
            }
        })
        .catch(error => {
            console.error("Error al cargar el archivo GeoJSON:", error);
        });
        
        //AGREGO LOS PUNTOS DE INTERES 
        addPOI(map);
        
        //FUNCIONALIDAD DEL SEARCH
        const searchInput = document.getElementById('search-input');
        const suggestionsContainer = document.getElementById('suggestions-container');
        const suggestionItem = document.createElement('item');
        // Actualiza las sugerencias cada vez que el usuario escribe algo
        searchInput.addEventListener('input', () => {
            const query = searchInput.value;
            if (query.length > 1) { // Evitar búsquedas demasiado frecuentes por cada letra
                actualizarSugerencias(query, suggestionsContainer, searchInput, map);
            } else {
                suggestionsContainer.style.display = 'none'; // Ocultar las sugerencias si el texto es muy corto
            }
        });
        suggestionItem.addEventListener('click',()=>{
            buscarPunto(suggestionItem.span, map);
            suggestionsContainer.style.display = 'none';
        })
        // Opción: buscar el punto directamente al presionar enter
        searchInput.addEventListener('keydown', event => {
            if (event.key === 'Enter') {
                buscarPunto(searchInput.value, map);
                suggestionsContainer.style.display = 'none';
            }
        });
    });

};
