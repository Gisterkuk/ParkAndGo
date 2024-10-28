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

    // Verificar que los elementos existen en el DOM
    if (asideInfo && closeButton && openButton && searchContainer && searchInput && searchBtn && suggestionsContainer && routeBtn) {

        // Función para ocultar el aside
        closeButton.addEventListener('click', () => {
            cerrarAside();
        });
        // Función para mostrar el aside
        openButton.addEventListener('click', (event) => {
        abrirAside(openButton,asideInfo,closeButton,searchContainer,searchInput,event);
        })

        // Evento para el botón de búsqueda
        searchBtn.addEventListener('click', (event) => {
            event.stopPropagation(); // Detiene la propagación para evitar que se active el evento del documento
            searchContainer.classList.toggle('expanded');

            if (searchContainer.classList.contains('expanded')) {
                suggestionsContainer.style.display = 'block';
                searchInput.style.display = "block";
                setTimeout(() => {
                    searchInput.placeholder = 'Busca en el parque...';
                }, 200);
                searchInput.focus(); // Enfocar en el input si se expande
            } else {
                suggestionsContainer.innerHTML = '';
                suggestionsContainer.style.display = 'none';
                searchInput.value = '';
                searchContainer.style.borderRadius = '20px';
                searchInput.style.display = "none";
                searchInput.placeholder = '';
            }
        });
        
    } else {
        console.error('Uno o más elementos no se encontraron en el DOM.');
    }
});
