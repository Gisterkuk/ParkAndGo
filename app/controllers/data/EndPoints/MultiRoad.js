import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Definir __dirname manualmente
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const MultiRoad = async () => {
    try {
        // Leer el archivo GeoJSON con las rutas desde la carpeta 'controllers'
        const filePath = path.join(__dirname, 'rutas.geojson'); 
        const rutasGeojson = JSON.parse(fs.readFileSync(filePath, 'utf8')); // Lee el archivo y lo convierte en JSON

        // Inicializa el MultiLineString
        let multiLineString = {
            "type": "MultiLineString",
            "coordinates": []
        };

        // Agregar las coordenadas de cada LineString al MultiLineString
        rutasGeojson.features.forEach(ruta => { 
            if (ruta.geometry.type === "LineString") {
                multiLineString.coordinates.push(ruta.geometry.coordinates);
            }
        });

        // Guardar el nuevo archivo MultiLineString en la carpeta 'controllers'
        const outputFilePath = path.join(__dirname, 'multiLineString.json');
        fs.writeFileSync(outputFilePath, JSON.stringify(multiLineString, null, 2));

        console.log("Conversión completada");
        console.log("Archivo generado en:", outputFilePath);

    } catch (error) {
        console.error("Error en la conversión: ", error);
    }
};

// Llamamos a la función directamente
// MultiRoad();
