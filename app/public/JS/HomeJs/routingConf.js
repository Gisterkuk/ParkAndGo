import { getCoordenadasSeleccionadas, getEnd, getGraph, getMap, getStart, setEnd, setStart } from "../../../controllers/SettingMap/intermediariosVAR.js";
import { dijkstra, findClosestPoint } from "../../../controllers/SettingMap/Routing.js";
import { abrirRouting, cerrarRouting, mostrarOpcionesUbicacion, routingSugerencias } from "../../../controllers/SettingMap/Search.js";
import { agregarMarcador } from "./POI.js";
document.addEventListener('DOMContentLoaded', function() {
    const map = getMap();
    const grafo = getGraph();
    const TOLERANCE_RADIUS = 100;
    
    const routingMenuBtn = document.getElementById("Routing");
    const routingForm = document.getElementById('routingForm');
    const closeBtn = document.getElementById('close-routing');
    const sugerenciaAContainer = document.querySelector('.scrollContainerA');
    const sugerenciaBContainer = document.querySelector('.scrollContainerB');
    const sugerenciasA = document.querySelector('.sugerenciasRutaA');
    const sugerenciasB = document.querySelector('.sugerenciasRutaB');
    const routingBtn = document.querySelector('#routeButton');
    const inputA = document.querySelector('#start');
    const inputB = document.querySelector('#end');
    const latA = document.getElementById("latA");
    const lonA = document.getElementById("longA");
    const latB = document.getElementById("latB");
    const lonB = document.getElementById("longB");
    let query = '';
    let ubiSugerencia;
    let clickOnMap;

    routingMenuBtn.addEventListener("click", () => {
        abrirRouting();
    });

    closeBtn.addEventListener('click', () => {
        cerrarRouting();
    });

    inputA.addEventListener('input', () => {
        query = inputA.value;
        console.log(query);
        if (query.length > 0) { 
            routingSugerencias(query, inputA, sugerenciasA,lat,lon);
            sugerenciaAContainer.style.visibility = 'visible';
            const start = getCoordenadasSeleccionadas();
            console.log(start);

            
        } else {
            sugerenciasA.innerHTML = ''; // Limpiar sugerencias anteriores
            mostrarOpcionesUbicacion(sugerenciasA);
            sugerenciaAContainer.style.visibility = 'visible';
        }
    });


    inputB.addEventListener('input', () => {
        query = inputB.value;
        console.log(query);
        if (query.length > 0) {
            routingSugerencias(query, inputB, sugerenciasB);
            sugerenciaBContainer.style.visibility = 'visible';
            const end = getCoordenadasSeleccionadas();
            console.log(end);
        } else {
            sugerenciasB.innerHTML = ''; // Limpiar sugerencias anteriores
            mostrarOpcionesUbicacion(sugerenciasB);
            sugerenciaBContainer.style.visibility = 'visible';
        }
    });

    inputB.addEventListener('focus', () => {
        if (inputB.value.trim() === '') {
            mostrarOpcionesUbicacion(sugerenciasB);
            sugerenciaBContainer.style.visibility = 'visible';
            sugerenciaAContainer.style.visibility = 'hidden';
        }
    });
    
    
    document.addEventListener('click', (event) => {
        if (!routingForm.contains(event.target) && event.target !== inputA && event.target !== inputB) {
            sugerenciaAContainer.style.visibility = 'hidden';
            sugerenciaBContainer.style.visibility = 'hidden';
        }
    });
    
    routingBtn.addEventListener('click',()=>{
        let end = getEnd();
        let start = getStart();
        console.log("PUNTO A: ",start,"\nPUNTO B:",end)
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
    });
    
    inputA.addEventListener('focus', () => {
    
        if (inputA.value.trim() === '') {
            mostrarOpcionesUbicacion(sugerenciasA);
            sugerenciaAContainer.style.visibility = 'visible';
            sugerenciaBContainer.style.visibility = 'hidden';
        }
    });
    
});
