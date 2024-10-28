import { setLiveLocation } from "./CoordState.js";

let userMarker = null; // Guardará el marcador del usuario

// Función para obtener la ubicación del usuario y actualizar el marcador
export function trackUserLocation(map) {
    if ("geolocation" in navigator) {
        navigator.geolocation.watchPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                console.log(`Ubicación del usuario: ${latitude}, ${longitude}`);

                // Crear o actualizar el marcador del usuario
                if (userMarker) {
                    userMarker.setLngLat([longitude, latitude]);
                } else {
                    userMarker = new mapboxgl.Marker({ color: 'blue' })
                        .setLngLat([longitude, latitude])
                        .addTo(map);
                }
                setLiveLocation(latitude,longitude);
                // Opcional: Centrar el mapa en la ubicación del usuario
                // map.flyTo({
                //     center: [longitude, latitude],
                //     zoom: 14, // Ajusta el nivel de zoom según lo necesario
                //     speed: 1.2,
                // });
            },
            (error) => {
                console.error("Error al obtener la ubicación del usuario:", error);
            },
            {
                enableHighAccuracy: true, // Mayor precisión
                timeout: 5000, // Espera máxima para obtener la ubicación
                maximumAge: 0, // No usar posiciones en caché
            }
        );
    } else {
        console.error("La geolocalización no está disponible en este navegador.");
    }
}
