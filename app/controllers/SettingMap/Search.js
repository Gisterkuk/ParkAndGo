import {setCoordenadasSeleccionadas } from "./intermediariosVAR.js";
import { dijkstra, drawRoute, findClosestPoint } from "./Routing.js";

export function abrirInfo(punto){
    const info = document.getElementsByClassName('info-span')
    const nombre = document.getElementById('name');
    const imagen = document.getElementById('imagen');
    imagen.src = punto.imagen_url;
    info[0].textContent = punto.Ubicacion;
    info[1].textContent = punto.Accesibilidad;
    info[2].textContent = punto.sector;
    info[3].textContent= punto.descrip;
    nombre.textContent =punto.name;
}


let currentMarkers = []; // Almacenar los marcadores actuales
export function buscarPunto(query,map) { 

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


export function actualizarSugerencias(query,map) {
    fetch(`/api/puntos-interes/search?query=${encodeURIComponent(query)}`)
    .then(response => response.json())
    .then(data => {
        const suggestionsContainer = document.getElementById('suggestions-container');
        const searchInput = document.getElementById('search-input');
        const searchContainer = document.getElementById('searchContainer');

        console.log('Datos recibidos:', data);  // Ver qué datos se reciben exactamente

        suggestionsContainer.innerHTML = '';  // Limpiar el contenedor de sugerencias

        if (data && data.length > 0) {
            suggestionsContainer.style.display = 'block';  // Mostrar el contenedor de sugerencias
            suggestionsContainer.style.borderRadius = '0px 0px 0px 20px';
            suggestionsContainer.style.maxHeight = '300px';
            suggestionsContainer.style.overflow = 'scroll';
            searchContainer.style.borderRadius = '15px 15px 0px 0px';
            suggestionsContainer.style.overflowX ='hidden';

            const openBtn = document.getElementById('open-aside');
            const routingBtn = document.getElementById('Routing');
            openBtn.style.top = '355px';
            routingBtn.style.top = '400px'; 

            data.forEach(punto => {
                console.log('Procesando punto:', punto);  // Ver los datos de cada punto

                const suggestionItem = document.createElement('item');
                suggestionItem.style.display = 'flex';
                suggestionItem.style.alignItems = 'center';
                suggestionItem.style.padding = '5px 0px';
                suggestionItem.style.cursor = 'pointer';
                suggestionItem.style.zIndex = '45';
                suggestionItem.style.paddingLeft = '7px';
                

                const infoContainer = document.createElement('div');
                infoContainer.style.display = "flex";
                infoContainer.style.flexDirection = "column";

                const sector = document.createElement('span');
                sector.textContent = punto.sector;  
                sector.style.color = "grey";
                sector.style.fontSize = "13px"

                const name = document.createElement('span');
                name.textContent = punto.name;
                infoContainer.appendChild(name);
                infoContainer.appendChild(sector);

                const img = document.createElement('img');
                img.src = punto.imagen_url;
                img.style.width = '60px';
                img.style.height = '60px';
                img.style.marginRight = '10px';
                img.style.borderRadius = '10px'


                suggestionItem.appendChild(img);
                suggestionItem.appendChild(infoContainer);

                suggestionItem.addEventListener('click', (event) => {
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

                    abrirInfo(punto);
                    abrirAside(event);
                    routingBtn.style.top = '60px'; 
                    const longitudParsed = parseFloat(punto.longitud.trim());
                    const latitudParsed = parseFloat(punto.latitud.trim());
                    setCoordenadasSeleccionadas(longitudParsed,latitudParsed);
                    console.log("Coordenadas del punto:",latitudParsed,longitudParsed);
                
                });
                suggestionsContainer.appendChild(suggestionItem);
            });
        } else {
            suggestionsContainer.style.display = 'none';  // Ocultar si no hay sugerencias
            openBtn.style.top = '60px';
            routingBtn.style.top = '105px'; 
  
        }

        // console.log('Contenido final del contenedor:', suggestionsContainer.innerHTML);  // Debería mostrar el HTML interno
    })
    .catch(error => {
        console.error('Error al buscar sugerencias:', error);
    });
}

export function routingSugerencias(query, input, container,map) {

    fetch(`/api/puntos-interes/search?query=${encodeURIComponent(query)}`)
        .then(response => response.json())
        .then(data => {
            console.log(container);
            container.innerHTML = ''; // Limpiar el contenedor de sugerencias
            


            if (data && data.length > 0) {
                container.style.display = 'block'; // Mostrar el contenedor de sugerencias
                console.log(data);

                data.forEach(punto => {
                    const suggestionItem = document.createElement('div');
                    suggestionItem.style.display = 'flex';
                    suggestionItem.style.alignItems = 'center';
                    suggestionItem.style.padding = '5px 0px';
                    suggestionItem.style.cursor = 'pointer';
                    suggestionItem.style.zIndex = '45';
                    suggestionItem.style.paddingLeft = '7px';
                    suggestionItem.style.backgroundColor = 'white';

                    const infoContainer = document.createElement('div');
                    infoContainer.style.display = "flex";
                    infoContainer.style.flexDirection = "column";

                    const sector = document.createElement('span');
                    sector.textContent = punto.sector;
                    sector.style.color = "grey";
                    sector.style.fontSize = "13px";

                    const name = document.createElement('span');
                    name.textContent = punto.name;
                    infoContainer.appendChild(name);
                    infoContainer.appendChild(sector);

                    const img = document.createElement('img');
                    img.src = punto.imagen_url;
                    img.style.width = '60px';
                    img.style.height = '60px';
                    img.style.marginRight = '10px';
                    img.style.borderRadius = '10px';

                    suggestionItem.appendChild(img);
                    suggestionItem.appendChild(infoContainer);

                    // Añadir evento de click a la sugerencia
                    suggestionItem.addEventListener('click', () => {
                        input.value = punto.name; // Actualizar el input de búsqueda con el nombre seleccionado
                        container.style.display = 'none'; // Ocultar las sugerencias
                        container.innerHTML = ''; // Limpiar las sugerencias
                        buscarPunto(punto.name,map)
                        // Aquí podrías llamar a la lógica específica para Punto A o Punto B dependiendo de si el input es `#start` o `#end`.
                        console.log(`Punto seleccionado: ${punto.name}`);
                    });

                    container.appendChild(suggestionItem);
                });
            } else {
                if(container.classList.contains('sugerenciasRutaA')){

                    mostrarOpcionesUbicacionA();
                }else{
                    mostrarOpcionesUbicacionB();
                }
            }
        })
        .catch(error => {
            console.error('Error al buscar sugerencias:', error);
        });
}
export function mostrarOpcionesUbicacionA() {
    const container =document.querySelector('.sugerenciasRutaA');
    container.style.display = 'block';

    // Verificar si los elementos ya existen en el contenedor
    if (!document.getElementById('ubiSugerenciaA')) {
        const ubicacionActualItem = document.createElement('div');
        ubicacionActualItem.id = 'ubiSugerenciaA';
        ubicacionActualItem.textContent = 'Usar mi ubicación actual';
        ubicacionActualItem.style.padding = '10px';
        ubicacionActualItem.style.cursor = 'pointer';
        ubicacionActualItem.style.backgroundColor = 'white';
        ubicacionActualItem.style.borderBottom = '1px solid #ccc';

        ubicacionActualItem.addEventListener('click', () => {
            console.log('Usar mi ubicación actual');
            // Aquí puedes agregar la lógica para obtener la ubicación actual del usuario
            container.style.display = 'none';
        });

        container.appendChild(ubicacionActualItem);
    }

    if (!document.getElementById('clickOnMapA')) {
        const clicMapaItem = document.createElement('div');
        clicMapaItem.id = 'clickOnMapA';
        clicMapaItem.textContent = 'Hacer clic en el mapa para seleccionar ubicación';
        clicMapaItem.style.padding = '10px';
        clicMapaItem.style.cursor = 'pointer';
        clicMapaItem.style.backgroundColor = 'white';

        clicMapaItem.addEventListener('click', () => {
            console.log('Hacer clic en el mapa para seleccionar ubicación');
            // Aquí puedes agregar la lógica para permitir que el usuario seleccione la ubicación en el mapa
            container.style.display = 'none';
        });

        container.appendChild(clicMapaItem);
    }
}

export function mostrarOpcionesUbicacionB() {
const container = document.querySelector('.sugerenciasRutaB');
    container.style.display = 'block';

    // Verificar si los elementos ya existen en el contenedor
    if (!document.getElementById('ubiSugerenciaB')) {
        const ubicacionActualItem = document.createElement('div');
        ubicacionActualItem.id = 'ubiSugerenciaB';
        ubicacionActualItem.textContent = 'Usar mi ubicación actual';
        ubicacionActualItem.style.padding = '10px';
        ubicacionActualItem.style.cursor = 'pointer';
        ubicacionActualItem.style.backgroundColor = 'white';
        ubicacionActualItem.style.borderBottom = '1px solid #ccc';

        ubicacionActualItem.addEventListener('click', () => {
            console.log('Usar mi ubicación actual');
            // Aquí puedes agregar la lógica para obtener la ubicación actual del usuario
            container.style.display = 'none';
        });

        container.appendChild(ubicacionActualItem);
    }

    if (!document.getElementById('clickOnMapB')) {
        const clicMapaItem = document.createElement('div');
        clicMapaItem.id = 'clickOnMapB';
        clicMapaItem.textContent = 'Hacer clic en el mapa para seleccionar ubicación';
        clicMapaItem.style.padding = '10px';
        clicMapaItem.style.cursor = 'pointer';
        clicMapaItem.style.backgroundColor = 'white';

        clicMapaItem.addEventListener('click', () => {
            console.log('Hacer clic en el mapa para seleccionar ubicación');
            // Aquí puedes agregar la lógica para permitir que el usuario seleccione la ubicación en el mapa
            container.style.display = 'none';
        });

        container.appendChild(clicMapaItem);
    }
}
export function obtenerPuntosDeInteres(nameA, nameB,graph,map) {
    const url = `/api/routing?nameA=${encodeURIComponent(nameA)}&nameB=${encodeURIComponent(nameB)}`;

    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al obtener los puntos de interés');
            }
            return response.json();
        })
        .then(data => {
            console.log('Datos recibidos:', data);

            if (data.length >= 2) {
                const puntoA = data.find(p => p.name === nameA);
                const puntoB = data.find(p => p.name === nameB);

                if (puntoA && puntoB) {
                    coordA = [parseFloat(puntoA.longitud), parseFloat(puntoA.latitud)];
                    coordB = [parseFloat(puntoB.longitud), parseFloat(puntoB.latitud)];
                    // Guardar las coordenadas para aplicar Dijkstra
                    const puntoACoords = findClosestPoint(coordA,graph,100);
                    const puntoBCoords = findClosestPoint(coordB,graph,100);

                    console.log('Coordenadas de Punto A:', puntoACoords);
                    console.log('Coordenadas de Punto B:', puntoBCoords);
                    console.log(graph)
                    const path = dijkstra(graph,puntoACoords,puntoBCoords);
                    if (path.length > 0) {
                        drawRoute(map, path);                  
                    }
                }
            } else {
                console.error('No se encontraron ambos puntos de interés.');
            }
        })
        .catch(error => {
            console.error('Error al realizar la solicitud:', error);
        });
}

export function abrirAside(event){
    const asideInfo = document.getElementById('aside-info');
    const closeButton = document.getElementById('close-aside');
    const openButton = document.getElementById('open-aside');
    const searchContainer = document.getElementById('searchContainer')
    const searchInput =document.getElementById('search-input');
    const direcBtn = document.getElementById('Direction');

    //event.stopPropagation(); // Detiene la propagación para evitar que se active el evento del documento
    asideInfo.style.display = "flex";
    openButton.style.display = 'none'; // Ocultar el botón de abrir
    closeButton.style.display = 'flex';
    console.log(direcBtn);
    // Expander el contenedor de búsqueda si no está expandido
    if (!searchContainer.classList.contains('expanded')) {
        searchContainer.classList.add('expanded');
        searchInput.style.display = "block";
        

        setTimeout(() => {
            searchInput.placeholder = 'Busca en el parque...';
        }, 200);
        searchInput.focus(); // Enfocar en el input para permitir búsqueda
    }
    direcBtn.style.display = 'flex';

}
export function cerrarAside(){
    const asideInfo = document.getElementById('aside-info');
    const closeButton = document.getElementById('close-aside');
    const openButton = document.getElementById('open-aside');
    const searchContainer = document.getElementById('searchContainer')
    const searchInput =document.getElementById('search-input');
    const suggestionsContainer = document.getElementById('suggestions-container')

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