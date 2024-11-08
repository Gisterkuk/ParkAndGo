import { mostrarOpcionesUbicacion, routingSugerencias } from "../../../controllers/SettingMap/Search.js";
document.addEventListener('DOMContentLoaded', function() {

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
    let query = '';
    let ubiSugerencia;
    let clickOnMap;

    routingMenuBtn.addEventListener("click", () => {
        routingMenuBtn.style.display = "none";
        routingForm.style.display = 'flex';
    });

    closeBtn.addEventListener('click', () => {
        routingForm.style.display = 'none';
        routingMenuBtn.style.display = "block";
    });

    inputA.addEventListener('input', () => {
        query = inputA.value;
        console.log(query);
        if (query.length > 0) { 
            routingSugerencias(query, inputA, sugerenciasA);
            sugerenciaAContainer.style.visibility = 'visible';
        } else {
            sugerenciasA.innerHTML = ''; // Limpiar sugerencias anteriores
            mostrarOpcionesUbicacion(sugerenciasA);
            sugerenciaAContainer.style.visibility = 'visible';
        }
    });

    inputA.addEventListener('focus', () => {

        if (inputA.value.trim() === '') {
            mostrarOpcionesUbicacion(sugerenciasA);
        }
        sugerenciaAContainer.style.visibility = 'visible';
        sugerenciaBContainer.style.visibility = 'hidden';
        
    });
    

    inputB.addEventListener('input', () => {
        query = inputB.value;
        console.log(query);
        if (query.length > 0) {
            routingSugerencias(query, inputB, sugerenciasB);
            sugerenciaBContainer.style.visibility = 'visible';
        } else {
            sugerenciasB.innerHTML = ''; // Limpiar sugerencias anteriores
            mostrarOpcionesUbicacion(sugerenciasB);
            sugerenciaBContainer.style.visibility = 'visible';
        }
    });

    inputB.addEventListener('focus', () => {
        if (inputB.value.trim() === '') {
            mostrarOpcionesUbicacion(sugerenciasB);
        }
        sugerenciaBContainer.style.visibility = 'visible';
        sugerenciaAContainer.style.visibility = 'hidden';
    });

    document.addEventListener('click', (event) => {
        if (!routingForm.contains(event.target) && event.target !== inputA && event.target !== inputB) {
            sugerenciaAContainer.style.visibility = 'hidden';
            sugerenciaBContainer.style.visibility = 'hidden';
        }
    });

});
