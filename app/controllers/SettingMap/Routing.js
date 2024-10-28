const TOLERANCE_RADIUS = 100;
export class PriorityQueue {
    constructor() {
        this.elements = [];
    }

    isEmpty() {
        return this.elements.length === 0;
    }

    enqueue(element, priority) {
        this.elements.push({ element, priority });
        this.elements.sort((a, b) => a.priority - b.priority); // Ordenar por prioridad
    }

    dequeue() {
        return this.elements.shift(); // Eliminar y devolver el primer elemento
    }
}
export function createGraph(data) {
    const graph = {};

    data.features.forEach((feature) => {
        const coordinates = feature.geometry.coordinates;

        if (feature.geometry.type === 'MultiLineString') {
            coordinates.forEach((line) => {
                addEdgesToGraph(line, graph, feature);
            });
        } else if (feature.geometry.type === 'LineString') {
            addEdgesToGraph(coordinates, graph, feature);
        }
    });

    //console.log("Grafo dirigido generado:", graph);
    return graph;
}

/**
 * Añade las aristas del LineString al grafo.
 * Si 'oneway' es true, las aristas se agregan en una sola dirección.
 */
export function addEdgesToGraph(line, graph, feature) {
    const isOneway = feature.properties && feature.properties.oneway === true;

    for (let i = 0; i < line.length - 1; i++) {
        const coord1 = line[i];
        const coord2 = line[i + 1];

        const key1 = coord1.join(',');
        const key2 = coord2.join(',');

        // Inicializar los nodos si no existen en el grafo
        if (!graph[key1]) graph[key1] = [];
        if (!graph[key2]) graph[key2] = [];

        // Agregar arista en la dirección de key1 a key2
        if (!graph[key1].includes(key2)) graph[key1].push(key2);

        // Si no es unidireccional, agregar también la arista inversa
        if (!isOneway && !graph[key2].includes(key1)) {
            graph[key2].push(key1);
        }
    }
}


export function connectLineStrings(graph, features, maxDistance) {
    features.forEach(featureA => {
        features.forEach(featureB => {
            if (featureA !== featureB) {
                const coordsA = featureA.geometry.coordinates.flat();
                const coordsB = featureB.geometry.coordinates.flat();

                coordsA.forEach(pointA => {
                    coordsB.forEach(pointB => {
                        const distance = haversineDistance(pointA, pointB);
                        if (distance <= maxDistance) {
                            const keyA = pointA.join(',');
                            const keyB = pointB.join(',');

                            if (!graph[keyA]) graph[keyA] = [];
                            if (!graph[keyB]) graph[keyB] = [];

                            if (!graph[keyA].includes(keyB)) graph[keyA].push(keyB);
                            if (!graph[keyB].includes(keyA)) graph[keyB].push(keyA);
                        }
                    });
                });
            }
        });
    });
}


export function visualizeRoutesOnMap(map,geojson) {
    // Añadir las rutas originales desde el GeoJSON
    map.addSource('routes', {
        'type': 'geojson',
        'data': geojson
    });

    map.addLayer({
        'id': 'routes',
        'type': 'line',
        'source': 'routes',
        'layout': {
            'line-join': 'round',
            'line-cap': 'round'
        },
        'paint': {
            'line-color': '#888',
            'line-width': 2
        }
    });
    //console.log("Visualizacion de rutas agregadas correctamente");
}

export function agregarPunto(coordinates) {
    if (!Array.isArray(coordinates) || coordinates.length !== 2) {
        console.error("Las coordenadas deben ser un array de [lng, lat]");
        return;
    }

    const lng = parseFloat(coordinates[0]);
    const lat = parseFloat(coordinates[1]);

    console.log(lng,lat)
    // Asegúrate de que lng y lat son números
    if (typeof lng !== 'number' || typeof lat !== 'number') {
        console.error("Las coordenadas deben ser números.");
        return;
    }

    // Crear un marcador en el mapa
    new mapboxgl.Marker()
        .setLngLat([lng, lat]) // Asegúrate de usar un array
        .addTo(map); // Asumiendo que tienes una instancia de tu mapa
        console.log("se agrego el punto",coordinates)
}

export function dijkstra(graph, start, end) {
    const distances = {};
    const previous = {};
    const visited = new Set();
    const priorityQueue = new PriorityQueue();

    console.log(`INICIANDO DIJKSTRA\nBuscando ruta desde ${start} hasta ${end}`);

    if (!(start in graph) || !(end in graph)) {
        console.error("El nodo de inicio o fin no está en el grafo.");
        return [];
    }

    // Inicializar distancias
    for (const node of Object.keys(graph)) {
        distances[node] = Infinity;
        previous[node] = null;
    }
    distances[start] = 0;

    priorityQueue.enqueue(start, 0);

    while (!priorityQueue.isEmpty()) {
        const currentNode = priorityQueue.dequeue().element;
        if (visited.has(currentNode)) continue;
        visited.add(currentNode);

        if (currentNode === end) break;

        // Iterar sobre vecinos en la dirección permitida
        for (const neighbor of graph[currentNode] || []) {
            if (visited.has(neighbor)) continue;

            const distance = calculateDistance(currentNode, neighbor);
            const newDistance = distances[currentNode] + distance;
            //console.log(`newDistance: ${newDistance}, distances[${neighbor}]: ${distances[neighbor]}`);

            if (newDistance < distances[neighbor]) {
                distances[neighbor] = newDistance;
                previous[neighbor] = currentNode;
                priorityQueue.enqueue(neighbor, newDistance);
            }
        }
    }

    // Reconstruir la ruta
    const path = [];
    let current = end;

    while (current !== start) {
        if (!previous[current]) {
            console.error("No hay camino válido desde el inicio al fin.");
            return [];
        }
        path.push(current);
        current = previous[current];
    }
    path.push(start);

    //console.log("Ruta encontrada:", path.reverse());
    return path.reverse();
}

export function drawRoute(map,path) {
    // console.log(path);
        if (path.length === 0) {
        console.error("No se encontró ninguna ruta");
        return;
    }

    // Asegúrate de que las coordenadas están en  el formato correcto
    const coordinates = path.map(coord => {
        // Convertir la cadena en un array de coordenadas
        if (typeof coord === 'string') {
            return coord.split(',').map(Number); // Convertir a números
        } else if (Array.isArray(coord)) {
            return coord; // Ya es un array de coordenadas
        } else {
            console.error("Formato de coordenada inesperado:", coord);
            return null; // Manejo de error si no es un array ni una cadena
        }
    }).filter(Boolean); // Filtra valores nulos

    if (coordinates.length === 0) {
        console.error("No hay coordenadas válidas para dibujar la ruta");
        return;
    }

    // Crear el objeto de la ruta
    const routeLine = {
        type: 'Feature',
        geometry: {
            type: 'LineString',
            coordinates: coordinates,
        },
    };

    // Asegúrate de que 'geojsonSource' sea el nombre correcto de tu fuente de datos en el mapa
    if (map.getSource('geojsonSource')) {
        map.getSource('geojsonSource').setData(routeLine);
    } else {
        console.error("Fuente de datos 'geojsonSource' no encontrada en el mapa");
    }
    
}
export function findClosestPoint(coords, graph, tolerance) {
    let closestPoint = null;
    let minDistance = Infinity;

    for (const point of Object.keys(graph)) {
        const pointCoords = point.split(',').map(Number);
        const distance = haversineDistance(coords, pointCoords);
        if (distance < tolerance && distance < minDistance) {
            closestPoint = point;
            minDistance = distance;
        }
    }

    return closestPoint;
}

export function haversineDistance(coord1, coord2) {
    const R = 6371e3; // Radio de la Tierra en metros
    const lat1 = coord1[1] * (Math.PI / 180); // Convertir a radianes
    const lat2 = coord2[1] * (Math.PI / 180);
    const deltaLat = (coord2[1] - coord1[1]) * (Math.PI / 180);
    const deltaLon = (coord2[0] - coord1[0]) * (Math.PI / 180);
    
    const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) *
    Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    
    return R * c; // Distancia en metros
}

export function calculateTotalDistance(path) {
    let totalDistance = 0;
    
    for (let i = 0; i < path.length - 1; i++) {
        const coord1 = path[i].split(',').map(Number); // Convertir a números
        const coord2 = path[i + 1].split(',').map(Number); // Convertir a números
        totalDistance += haversineDistance(coord1, coord2);
    }

    return totalDistance; // Distancia total en metros
}
export function calculateDistance(coord1, coord2) {
    // Asegúrate de que coord1 y coord2 sean cadenas
    if (Array.isArray(coord1)) {
        coord1 = coord1.join(',');
    }
    if (Array.isArray(coord2)) {
        coord2 = coord2.join(',');
    }

    const [x1, y1] = coord1.split(',').map(Number);
    const [x2, y2] = coord2.split(',').map(Number);
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

export function setupMapEvents(map, graph) {
    let startPoint = null;
    let endPoint = null;

    const markers = []; // Almacenar los marcadores para poder eliminarlos

    map.on('click', (e) => {
        const coords = [e.lngLat.lng, e.lngLat.lat];

        if (!startPoint) {
            startPoint = coords;
            const startMarker = new mapboxgl.Marker({ color: 'green' })
                .setLngLat(startPoint)
                .addTo(map);
            markers.push(startMarker); // Guardar el marcador

        } else if (!endPoint) {
            endPoint = coords;
            const endMarker = new mapboxgl.Marker({ color: 'red' })
                .setLngLat(endPoint)
                .addTo(map);
            markers.push(endMarker); // Guardar el marcador

            // Buscar el punto más cercano dentro de la tolerancia
            const closestStart = findClosestPoint(startPoint, graph, TOLERANCE_RADIUS);
            const closestEnd = findClosestPoint(endPoint, graph, TOLERANCE_RADIUS);

            if (closestStart && closestEnd) {
                const path = dijkstra(graph, closestStart, closestEnd);
                if (path.length > 0) {
                    drawRoute(map, path); // Dibujar la ruta
                    clearMarkers(); // Limpiar los marcadores después de dibujar la ruta
                    startPoint = null;
                    endPoint = null; // Resetear los puntos
                }
            } else {
                console.error("No se encontraron puntos dentro del radio de tolerancia.");
                resetPoints(); // Llamar a la función para resetear puntos
            }
        }
    });

    // Función para limpiar los marcadores del mapa
    function clearMarkers() {
        markers.forEach(marker => marker.remove());
        markers.length = 0; // Vaciar el array de marcadores
    }

    // Función para resetear los puntos y limpiar los marcadores
    function resetPoints() {
        console.log("Reseteando puntos de inicio y fin para intentar nuevamente.");
        startPoint = null;
        endPoint = null;
        clearMarkers(); // Eliminar los marcadores del mapa
    }
}
