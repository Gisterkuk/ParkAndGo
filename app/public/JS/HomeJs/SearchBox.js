import { abrirAside,cerrarAside } from "../../../controllers/SettingMap/Search.js";

document.addEventListener('DOMContentLoaded', function() {
    // Elementos del DOM
    const asideInfo = document.getElementById('aside-info');
    const closeButton = document.getElementById('close-aside');
    const openButton = document.getElementById('open-aside');
    const searchContainer = document.querySelector('.search-container');
    const searchInput = document.querySelector('#search-input');
    const searchBtn = document.querySelector('#search-btn');
    const suggestionsContainer = document.querySelector('#suggestions-container');
    const routeBtn = document.querySelector("#Direction");
    const routingBtn = document.getElementById('Routing');
    const routingForm = document.getElementById('routingForm');

    // Verificar que los elementos existen en el DOM
    if (asideInfo && closeButton && openButton && searchContainer && searchInput && searchBtn && suggestionsContainer && routeBtn) {

        // Función para ocultar el aside
        closeButton.addEventListener('click', () => {
            cerrarAside();
            routingBtn.style.top = '105px'; 
        });
        // Función para mostrar el aside
        openButton.addEventListener('click', (event) => {
        abrirAside(openButton,asideInfo,closeButton,searchContainer,searchInput,event);
        routingBtn.style.top = '60px'; 
        routingForm.style.display = 'none';

        })

        // Evento para el botón de búsqueda
        searchBtn.addEventListener('click', (event) => {
            event.stopPropagation(); // Detiene la propagación para evitar que se active el evento del documento
            searchContainer.classList.toggle('expanded');

            if (searchContainer.classList.contains('expanded')) {
                searchInput.style.display = "block";
                setTimeout(() => {
                    searchInput.placeholder = 'Busca en el parque...';
                }, 200);
                searchInput.focus(); // Enfocar en el input si se expande
            } else {
                openButton.style.top = '60px';
                suggestionsContainer.innerHTML = '';
                suggestionsContainer.style.display = 'none';
                searchInput.value = '';
                searchContainer.style.borderRadius = '20px';
                searchInput.style.display = "none";
                searchInput.placeholder = '';

                if(asideInfo.style.display !== 'flex'){
                    routingBtn.style.top = '105px'; 
                }
            }
        });

    } else {
        console.error('Uno o más elementos no se encontraron en el DOM.');
    }
});
