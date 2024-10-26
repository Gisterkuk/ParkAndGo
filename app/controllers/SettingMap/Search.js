export function buscarPunto(query, map) {
    if (!map) {
        console.error('El mapa no está disponible.');
        return;
    }

    fetch(`/api/puntos-interes/search?query=${encodeURIComponent(query)}`)
        .then(response => response.json())
        .then(data => {
            if (data.length > 0) {
                const firstPoint = data[0];
                const coordinates = [firstPoint.longitud, firstPoint.latitud];
                map.flyTo({ center: coordinates, zoom: 18.5 });
            } else {
                alert('No se encontraron resultados.');
            }
        })
        .catch(error => {
            console.error('Error al buscar puntos de interés:', error);
        });
}

export function actualizarSugerencias(query, suggestionsContainer, searchInput,searchContainer, map) {
    fetch(`/api/puntos-interes/search?query=${encodeURIComponent(query)}`)
    .then(response => response.json())
    .then(data => {
        console.log('Datos recibidos:', data);  // Ver qué datos se reciben exactamente

        suggestionsContainer.innerHTML = '';  // Limpiar el contenedor de sugerencias

        if (data && data.length > 0) {
            suggestionsContainer.style.display = 'block';  // Mostrar el contenedor de sugerencias
            searchContainer.style.borderRadius = '15px 15px 0px 0px';
            data.forEach(punto => {
                console.log('Procesando punto:', punto);  // Ver los datos de cada punto

                const suggestionItem = document.createElement('item');
                suggestionItem.style.display = 'flex';
                suggestionItem.style.alignItems = 'center';
                suggestionItem.style.padding = '10px';
                suggestionItem.style.cursor = 'pointer';
                suggestionItem.style.borderBottom = '1px solid #ccc';

                const img = document.createElement('img');
                img.src = punto.imagen_url;
                img.style.width = '40px';
                img.style.height = '40px';
                img.style.marginRight = '10px';

                const name = document.createElement('span');
                name.textContent = punto.name;

                suggestionItem.appendChild(img);
                suggestionItem.appendChild(name);

                suggestionItem.addEventListener('click', () => {
                    searchInput.value = punto.name; // Actualizar el input de búsqueda con el nombre seleccionado
                    buscarPunto(searchInput.value,map) // Función para hacer zoom al POI
                    suggestionsContainer.style.display = 'none'; // Ocultar las sugerencias
                    searchInput.value = '';
                    suggestionsContainer.innerHTML = '';
                });

                suggestionsContainer.appendChild(suggestionItem);
            });
        } else {
            suggestionsContainer.style.display = 'none';  // Ocultar si no hay sugerencias
            
        }

        console.log('Contenido final del contenedor:', suggestionsContainer.innerHTML);  // Debería mostrar el HTML interno
    })
    .catch(error => {
        console.error('Error al buscar sugerencias:', error);
    });
}

