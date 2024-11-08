import {createGraph,dijkstra,findClosestPoint,setupMapEvents,drawRoute} from "./Routing.js";
import { trackUserLocation } from "./LiveLocation.js";
import { addPOI, agregarMarcador } from "../../public/JS/HomeJs/POI.js";
import {actualizarSugerencias,buscarPunto, obtenerPuntosDeInteres} from "./Search.js";
import { getCoordenadasSeleccionadas, getLiveLocation} from "./intermediariosVAR.js";
import {mostrarOpcionesUbicacionB,mostrarOpcionesUbicacionA, routingSugerencias } from "./Search.js";
let graph;
let map; // Declarar map de manera global
let geojsonData; // También almacenar el GeoJSON de manera global
const TOLERANCE_RADIUS = 100; // Tolerancia en metros
let Informacion;
let query;


//CODIGO
mapboxgl.accessToken = 'pk.eyJ1IjoiYWxjYW5kZWpzIiwiYSI6ImNtMWNxa3p6cDExdnoyam9mbjlpYmNncjAifQ.CjlYg9fh0dxJ49BDuACykw';

document.addEventListener('DOMContentLoaded', () => {
    
    //ELEMENTOS DE SEARCH
    const searchInput = document.getElementById('search-input');
    const suggestionsContainer = document.getElementById('suggestions-container');
    const suggestionItem = document.createElement('item');

    //ELEMENTOS DE ROUTING A to B

    // const sugerenciaAContainer = document.querySelector('.scrollContainerA');
    // const sugerenciaBContainer = document.querySelector('.scrollContainerB');
    // const routingBtn = document.querySelector('#routeButton');
    // const inputA = document.querySelector('#start');
    // const inputB = document.querySelector('#end');

    //configuracion mapa y funcionalidad    
    const map = new mapboxgl.Map({
        container: 'mapa',
        style: 'mapbox://styles/alcandejs/cm2oxvu73008801qifmae69zs',
        center: [-54.449985515005594,-25.682853268597665],   
        zoom: 14.5
        ,maxBounds: [
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

        document.dispatchEvent(new Event('mapReady'));
        
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
        addPOI(map);
    
        //const filePath = path.join(__dirname, 'MultiLineStringWithOrientation.geojson');

        // fs.access(filePath, fs.constants.F_OK, (err) => {
        //     console.log(err ? 'El archivo no existe' : 'El archivo está presente');
        // });
        // fetch('http://localhost:8000/UltimateRoad4.5.geojson')
        fetch('https://pathandgo.com/UltimateRoad4.5.geojson')
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
        
                graph = createGraph(data); // Crear el grafo
               // visualizeRoutesOnMap(map,data); // Visualizar las rutas en el mapa
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
        
        // let POI = getPOI();
        // const marcador = document.getElementsByClassName('.mapboxgl-icon');
        // console.log(marcador);
        
        // marcador.addEventListener('click',(event)=>{
        //     abrirInfo(POI)
        //     abrirAside(event);
        // });
        
        //FUNCIONALIDAD DEL SEARCH
        
        // Actualiza las sugerencias cada vez que el usuario escribe algo
        searchInput.addEventListener('input', () => {
            const query = searchInput.value;
            if (query.length > 1) { // Evitar búsquedas demasiado frecuentes por cada letra
                actualizarSugerencias(query,map);
                console.log(Informacion);
            } else {
                suggestionsContainer.style.display = 'none'; // Ocultar las sugerencias si el texto es muy corto
            }
        });
        suggestionItem.addEventListener('click',()=>{
            //S
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

        const routeBtn = document.querySelector("#Direction")
        routeBtn.addEventListener('click',()=>{
            // let PuntoA = [-54.45460685091212,-25.68292920945988];
            let PuntoA = getLiveLocation();
            let PuntoB = getCoordenadasSeleccionadas();
            console.log("PUNTO A; ",PuntoA);
            console.log("PUNTO B; ",PuntoB);
            agregarMarcador(map,PuntoA);
            agregarMarcador(map,PuntoB);
            let start = findClosestPoint(PuntoA,graph,TOLERANCE_RADIUS);
            let end = findClosestPoint(PuntoB,graph,TOLERANCE_RADIUS);
            
            if (start && end) {
                const path = dijkstra(graph, start, end);
                if (path.length > 0) {
                    drawRoute(map, path); // Dibujar la ruta
                    //clearMarkers(); // Limpiar los marcadores después de dibujar la ruta
                    // startPoint = null;
                    // endPoint = null; // Resetear los puntos
                }
            } else {
                console.error("No se encontraron puntos dentro del radio de tolerancia.");
               // resetPoints(); // Llamar a la función para resetear puntos
            }

        })

        const sugerenciaAContainer = document.querySelector('.scrollContainerA');
        const sugerenciaBContainer = document.querySelector('.scrollContainerB');
        const sugerenciasA = document.querySelector('.sugerenciasRutaA');
        const sugerenciasB = document.querySelector('.sugerenciasRutaB');
        const routingBtn = document.querySelector('#routeButton');
        const inputA = document.querySelector('#start');
        const inputB = document.querySelector('#end');
        let end; let start;

        inputA.addEventListener('input', () => {
            query = inputA.value;
            inputA.style.border = '1px solid black';
            console.log(query);
            sugerenciasA.innerHTML = ''; // Limpiar sugerencias anteriores
            
            if (query.length > 0) { 
                start = routingSugerencias(query, inputA, sugerenciasA,map);
                sugerenciaAContainer.style.visibility = 'visible';
            } else {
                mostrarOpcionesUbicacionA();
                sugerenciaAContainer.style.visibility = 'visible';
            }
        });

        inputB.addEventListener('input', () => {
            query = inputB.value;
            inputA.style.border = '1px solid black';
            sugerenciasB.innerHTML = ''; // Limpiar sugerencias anteriores
            console.log(query);
            if (query.length > 0) {
                routingSugerencias(query, inputB, sugerenciasB,map);
                sugerenciaBContainer.style.visibility = 'visible';
            } else {
                mostrarOpcionesUbicacionB();
                sugerenciaBContainer.style.visibility = 'visible';
            }
        });

        routingBtn.addEventListener('click',()=>{
            if(inputA.value == ''){
                inputA.style.border = "2px solid red";
                inputA.placeholder = 'Ingrese una ubicacion'
            }
            if(inputB.value == ''){
                inputB.style.border = "2px solid red";
                inputB.placeholder = 'Ingrese una ubicacion'
            }

            obtenerPuntosDeInteres(inputA.value,inputB.value,graph,map)
        })

    });

});
export function getMap() {
    if (!map) {
        console.error("El mapa no está listo aún.");
        return null;
    }
    return map;
}
