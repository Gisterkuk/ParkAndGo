import fs from 'fs/promises'; 
import { pool } from '../../../index.js';

// Función para insertar rutas
export const insertRutas = async (req, res) => {
    try {
        // Leer el archivo GeoJSON
        const data = await fs.readFile('./app/controllers/rutas.geojson', 'utf8');
        const geojson = JSON.parse(data);

        // Mapeamos las rutas
        const rutas = geojson.features.map(feature => {
            const nombre = feature.properties.name;
            const coordenadas = feature.geometry.coordinates.map(coord => `${coord[0]} ${coord[1]}`);
            const lineString = `LINESTRING(${coordenadas.join(', ')})`;
            return [nombre, lineString];
        });

        // Preparar los valores para la inserción
        const valores = rutas.map(ruta => [
            ruta[0],
            `ST_GeomFromText('${ruta[1]}')` // Uso de ST_GeomFromText para la geometría
        ]);

        // Usar console.log para mostrar los valores
        console.log(valores);
        // Crear la consulta de inserción
        const insertRutaSQL = `
        INSERT INTO rutas (nombre_ruta, coordenadas)
        VALUES ?`;

        // Ejecutar la consulta
        await pool.query(insertRutaSQL, [valores]); // Agregar corchetes alrededor de valores

        res.status(200).json({ message: 'Rutas insertadas correctamente' });
    } catch (err) {
        console.error('Error al insertar las rutas:', err.message); // Mensaje de error detallado
        res.status(500).json({ message: 'Error al insertar las rutas en la base de datos', error: err.message });
    }
};
