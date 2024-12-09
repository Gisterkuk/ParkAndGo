const searchResp = document.getElementById('search-resp');

searchResp.addEventListener('input', () => {
    const query = searchInput.value;
    if (query.length > 1) { // Evitar búsquedas demasiado frecuentes por cada letra
        actualizarSugerencias(query,map);
        console.log(Informacion);
    } else {
        suggestionsContainer.style.display = 'none'; // Ocultar las sugerencias si el texto es muy corto
    }
});