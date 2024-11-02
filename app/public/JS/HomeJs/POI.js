
import { setCoordenadasSeleccionadas } from "../../../controllers/SettingMap/intermediariosVAR.js";
import { abrirAside, abrirInfo } from "../../../controllers/SettingMap/Search.js";


export function addPOI(map) {
    fetch('/api/puntos-interes')
        .then(response => {
            if (!response.ok) {
                throw new Error('La respuesta a la API no funcionó');
            }
            return response.json();
        })
        .then(data => {
            const markers = []; // Array para almacenar los marcadores
            const iconosPorCategoria = {
                "Saltos": "fas fa-water",
                "Sendero": "fas fa-hiking",
                "Sanitarios": "fas fa-restroom",
                "CajeroAutomatico": "fas fa-money-bill-wave",
                "Restaurantes": "fas fa-utensils",
                "TicketTren": "fas fa-ticket",
                "Tren": "fas fa-train",
                "Jungle Iguazu": "fas fa-anchor",
                "Museo": "fas fa-landmark",
                "Tiendas": "fas fa-store",
                "Fotografia": "fas fa-camera",
                "Hoteles": "fas fa-hotel",
                "Pabellon": "fas fa-building",  // Pabellón
                "Transporte": "fas fa-bus",  // Transporte
                "AtencionPublico": "fas fa-info-circle",
                "AtencionMedica": "fas fa-clinic-medical",
                "VentaTicket" : "fas fa-ticket"
            };
            const coloresPorCategoria = {
                "Saltos": "blue",
                "Sendero": "green",
                "Sanitarios": "purple",
                "CajeroAutomatico": "gold",
                "Restaurantes": "darkred",
                "TicketTren": "orange",
                "Tren": "gray",
                "Jungle Iguazu": "darkgreen",
                "Museo": "darkblue",
                "Tiendas": "brown",
                "Fotografia": "black",
                "Hoteles": "teal",
                "Pabellon": "slategray",
                "Transporte": "navy",
                "AtencionPublico": "indigo",
                "AtencionMedica": "red",
                "VentaTicket" : "orange"
            };
            

            data.forEach(punto => {
                const coordinates = [punto.longitud, punto.latitud];
            
                // Crear el contenedor del marcador
                const markerContainer = document.createElement('div');
                markerContainer.className = 'marker-icon';
                markerContainer.style.display = 'flex';
                markerContainer.style.flexDirection = 'column';
                markerContainer.style.alignItems = 'center';
                
            
                // Seleccionar el ícono y el color basados en la categoría
                const iconClass = iconosPorCategoria[punto.categoria] || 'fas fa-map-marker-alt';
                const iconColor = coloresPorCategoria[punto.categoria] || 'black';
            
                const iconElement = document.createElement('i');
                iconElement.className = iconClass;
                iconElement.style.fontSize = '30px';
                iconElement.style.color = iconColor;  // Asignar color según la categoría
            
                // Crear el elemento para el nombre del POI
                const nameElement = document.createElement('span');
                nameElement.textContent = punto.name;
                nameElement.style.marginTop = '5px';
                nameElement.style.fontSize = '12px';
                nameElement.style.color = 'grey';  // Nombre en negro para mayor legibilidad
                nameElement.style.textAlign = 'center';
                nameElement.style.display = "none";
            
                // Añadir ícono y nombre al contenedor del marcador
                markerContainer.appendChild(iconElement);
                markerContainer.appendChild(nameElement);
            
                // Crear y agregar el marcador al mapa
                const marker = new mapboxgl.Marker(markerContainer)
                    .setLngLat(coordinates)
                    .addTo(map);
            
                // Agregar el marcador al array con su zoom correspondiente
                markers.push({
                    marker: marker,
                    zoom: punto.zoom || 0
                });
                markerContainer.addEventListener('click',(event)=>{
                    abrirInfo(punto);
                    abrirAside(event);
                    const longitudParsed = parseFloat(punto.longitud.trim());
                    const latitudParsed = parseFloat(punto.latitud.trim());
                    setCoordenadasSeleccionadas(longitudParsed,latitudParsed,);
                    console.log("Coordenadas del punto:",latitudParsed,longitudParsed);
                })
            });
            
            

            // Evento para controlar la visibilidad según el zoom
            map.on('zoom', () => {
                const currentZoom = map.getZoom();
                // console.log(currentZoom);
                markers.forEach(({ marker, zoom }) => {
                    marker.getElement().style.display = currentZoom >= zoom ? 'flex' : 'none';
                });
                document.querySelectorAll('.marker-icon span').forEach(nameElement => {
                    nameElement.style.display = currentZoom >= 16 ? 'block' : 'none';  // Mostrar a partir de zoom 16
                });
            
                // Ajustar el tamaño de los íconos con un límite máximo
                document.querySelectorAll('.marker-icon i').forEach(icon => {
                    const scale = Math.min(2, currentZoom / 20);  // Límite máximo de escala a 2x
                    icon.style.transform = `scale(${scale})`;  // Escala con suavidad
                });
            });
            
            
            

            // Configurar la visibilidad inicial según el zoom actual
            const initialZoom = map.getZoom();
            markers.forEach(({ marker, zoom }) => {
                marker.getElement().style.display = initialZoom >= zoom ? 'flex' : 'none';
            });
        })
        .catch(error => {
            console.error('Error al cargar los puntos de interés:', error);
        });
}

export function agregarMarcador(map, coordenadas) {
    if (!map) {
        console.error("El mapa no está disponible.");
        return;
    }
    console.log(coordenadas);
    new mapboxgl.Marker({ color: "red" })
        .setLngLat(coordenadas)
        .addTo(map);
}
