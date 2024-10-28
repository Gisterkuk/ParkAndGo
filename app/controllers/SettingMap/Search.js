import { setCoordenadasSeleccionadas } from "./CoordState.js";

export function abrirInfo(imagen,nombre,info,aside,punto){
    imagen.src = punto.imagen_url;
    info[0].textContent = punto.Ubicacion;
    info[1].textContent = punto.Accesibilidad;
    info[2].textContent = punto.sector;
    info[3].textContent= punto.descrip;
    nombre.textContent =punto.name;
    abrirAside
}


let currentMarkers = []; // Almacenar los marcadores actuales
export function buscarPunto(query, map) { 
    if (!map) {
        console.error('El mapa no está disponible.');
        return;
    }

    fetch(`/api/puntos-interes/search?query=${encodeURIComponent(query)}`)
        .then(response => response.json())
        .then(data => {
            // Limpiar todos los marcadores actuales del mapa
            if (currentMarkers.length > 0) {
                currentMarkers.forEach(marker => marker.remove());
                currentMarkers = [];
            }
            if (data.length > 0) {
                if (data.length === 1) {
                    // Si solo hay un punto, hacer un flyTo con zoom 16.5
                    const firstPoint = data[0];
                    const coordinates = [firstPoint.longitud, firstPoint.latitud];
                    
                    map.flyTo({ center: coordinates, zoom: data[0].zoom+.5 });
                } else {
                    // Si hay múltiples puntos, hacer un flyTo con zoom 15 y añadir marcadores
                    const bounds = new mapboxgl.LngLatBounds();
                    data.forEach(punto => {
                        console.log(punto.name)
                        const coordinates = [punto.longitud, punto.latitud];
                        bounds.extend(coordinates);

                        // Crear un marcador para cada punto
                        const marker = new mapboxgl.Marker()
                            .setLngLat(coordinates)
                            .addTo(map);

                        // Almacenar el marcador en el array de marcadores actuales
                        currentMarkers.push(marker);
                    });

                    // Ajustar el mapa para mostrar todos los puntos con un zoom adecuado
                    map.fitBounds(bounds, { padding: 50, maxZoom: 15 });
                }
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
                    console.log("LA FUNCION BUSCARA EL NOMBRE DE ", punto.name)
                    buscarPunto(searchInput.value,map) // Función para hacer zoom al POI
                    
                    console.log(punto)

                    suggestionsContainer.style.display = 'none'; // Ocultar las sugerencias
                    searchInput.value = '';
                    suggestionsContainer.innerHTML = '';
                    searchContainer.style.borderRadius = '20px';
                    
                    const info = document.getElementsByClassName('info-span')
                    const aside = document.getElementById('aside-info')
                    const nombre = document.getElementById('name');
                    const imagen = document.getElementById('imagen');
                    
                    abrirInfo(imagen,nombre,info,aside,punto);
                    const longitudParsed = parseFloat(punto.longitud.trim());
                    const latitudParsed = parseFloat(punto.latitud.trim());
                   setCoordenadasSeleccionadas(longitudParsed,latitudParsed,);
                   console.log("Coordenadas del punto:",latitudParsed,longitudParsed);
                });
                suggestionsContainer.appendChild(suggestionItem);
            });
        } else {
            suggestionsContainer.style.display = 'none';  // Ocultar si no hay sugerencias
            
        }

        // console.log('Contenido final del contenedor:', suggestionsContainer.innerHTML);  // Debería mostrar el HTML interno
    })
    .catch(error => {
        console.error('Error al buscar sugerencias:', error);
    });
}

export function abrirAside(openButton,asideInfo,closeButton,searchContainer,searchInput,event){

    event.stopPropagation(); // Detiene la propagación para evitar que se active el evento del documento
    asideInfo.style.display = "block";
    openButton.style.display = 'none'; // Ocultar el botón de abrir
    closeButton.style.display = 'flex';

    // Expander el contenedor de búsqueda si no está expandido
    if (!searchContainer.classList.contains('expanded')) {
        searchContainer.classList.add('expanded');
        searchInput.style.display = "block";
        setTimeout(() => {
            searchInput.placeholder = 'Busca en el parque...';
        }, 200);
        searchInput.focus(); // Enfocar en el input para permitir búsqueda
    }

}
export function cerrarAside(closeButton,asideInfo,openButton,searchContainer,searchInput,suggestionsContainer){
    
    asideInfo.style.display = 'none';
    openButton.style.display = 'flex'; // Mostrar el botón de abrir
    closeButton.style.display = 'none';
    if (searchContainer.classList.contains('expanded')) {
        searchContainer.classList.remove('expanded');
        searchInput.style.display = "none";
        searchInput.placeholder = '';
        suggestionsContainer.style.display = 'none'; // Ocultar sugerencias
        suggestionsContainer.innerHTML = ''; // Limpiar sugerencias
    }
}