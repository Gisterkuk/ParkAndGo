export function addPOI(map){
    fetch('/api/puntos-interes')
    .then(response => {
        if (!response.ok) {
            throw new Error('La respuesta a la API no funcionó');
        }
        return response.json();
    })
    .then(data => {
        const markers = []; // Inicializa el array para almacenar marcadores
        
        data.forEach(punto => {
            const coordinates = [punto.longitud, punto.latitud];
            
            // Crear un contenedor para el marcador y la etiqueta
            const markerContainer = document.createElement('div');
            markerContainer.style.display = 'flex';
            markerContainer.style.flexDirection = 'column'; // Para apilar verticalmente
            markerContainer.style.alignItems = 'center'; // Centramos el contenido
            
            // Crear un marcador con la imagen personalizada y borde circular
            const markerElement = document.createElement('div');
            markerElement.style.backgroundImage = `url(${punto.imagen_url})`; // URL de la imagen
            markerElement.style.backgroundSize = 'contain'; // Ajustar el tamaño
            markerElement.style.width = '40px'; // Ancho del marcador
            markerElement.style.height = '40px'; // Alto del marcador
            markerElement.style.borderRadius = '50%'; // Hacer que sea circular
            markerElement.style.border = '2px solid white'; // Color y grosor del borde
            markerElement.style.boxShadow = '0 0 5px rgba(0,0,0,0.5)'; // Sombra para efecto de profundidad
            
            // Crear el label
            const label = document.createElement('p');
            label.textContent = punto.name; // Nombre del punto
            label.style.margin = '5px 0 0 0'; // Margen superior para separación
            label.style.color = 'gray'; // Color del texto
            label.style.fontSize = '12px'; // Tamaño de fuente
            label.style.textAlign = 'center'; // Centramos el texto
            
            // Añadir el marcador y la etiqueta al contenedor
            markerContainer.appendChild(markerElement);
            markerContainer.appendChild(label);
            
            // Crear el marcador de Mapbox
            const marker = new mapboxgl.Marker(markerContainer)
            .setLngLat(coordinates)
            .addTo(map);

                // Almacena el marcador y su nivel de zoom
                markers.push({
                marker: marker,
                zoom: punto.zoom // Suponiendo que tienes un campo 'zoom' en tu base de datos
            });
        });

        // Evento para controlar el zoom
        map.on('zoom', function() {
            const currentZoom = map.getZoom();
            //console.log(currentZoom);
            markers.forEach(({ marker, zoom }) => {
                if (currentZoom >= zoom) {
                    marker.getElement().style.display = 'flex'; // Mostrar el marcador si el zoom es suficiente
                } else {
                    marker.getElement().style.display = 'none'; // Ocultar el marcador si el zoom no es suficiente
                }
            });
        });

        // Inicializa la visibilidad de los marcadores según el zoom inicial
        const initialZoom = map.getZoom();
        markers.forEach(({ marker, zoom }) => {
            if (initialZoom >= zoom) {
                marker.getElement().style.display = 'flex'; // Mostrar el marcador si el zoom es suficiente
            } else {
                marker.getElement().style.display = 'none'; // Ocultar el marcador si el zoom no es suficiente
            }
        });
    })
    .catch(error => {
        console.error('Error al cargar los puntos de interés:', error);
    });
}