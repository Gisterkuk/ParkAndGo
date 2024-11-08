import {mostrarOpcionesUbicacionB,mostrarOpcionesUbicacionA, routingSugerencias } from "../../../controllers/SettingMap/Search.js";
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

    routingMenuBtn.addEventListener("click", () => {
        routingMenuBtn.style.display = "none";
        routingForm.style.display = 'flex';
    });

    closeBtn.addEventListener('click', () => {
        routingForm.style.display = 'none';
        routingMenuBtn.style.display = "block";
    });

    inputA.addEventListener('focus', () => {

        if (inputA.value.trim() === '') {
            mostrarOpcionesUbicacionA();
        }
        sugerenciaAContainer.style.visibility = 'visible';
        sugerenciaBContainer.style.visibility = 'hidden';
        
    });
    


    inputB.addEventListener('focus', () => {
        if (inputB.value.trim() === '') {
            mostrarOpcionesUbicacionB();
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
