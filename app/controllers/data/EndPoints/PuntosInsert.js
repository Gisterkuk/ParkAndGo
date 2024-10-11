import fs from 'fs/promises';
import { pool } from '../../../index.js';

export const insertPuntos = async (req, res) => {
    console.log('Ruta /Insertar-puntos alcanzada'); // Verifica si se alcanza la ruta

    try {
        // Leer el archivo GeoJSON
        const data = await fs.readFile('./controllers/puntos.geojson', 'utf8');
        console.log('Archivo GeoJSON leído correctamente'); // Confirmación de que se lee el archivo

        const geojson = JSON.parse(data);
        console.log('Archivo GeoJSON parseado correctamente'); // Verifica que el parseo funcione

        const puntosInteres = geojson.features.map(feature => {
            const { name, categoria, descrip, sector, Imagen_url } = feature.properties;
            const [longitud, latitud] = feature.geometry.coordinates;
            const fecha_creacion = new Date().toISOString().slice(0, 19).replace('T', ' ');
            const fecha_actualizacion = fecha_creacion;

            return [name, descrip, latitud, longitud, categoria, sector, Imagen_url, fecha_creacion, fecha_actualizacion];
        });

        console.log('Puntos de interés preparados para insertar:', puntosInteres.length); // Verifica cuántos puntos se van a insertar

        const InsPunto = `INSERT INTO puntos_interes 
        (name, descrip, latitud, longitud, categoria, sector, imagen_url, fecha_creacion, fecha_actualizacion) 
        VALUES ?`;

        // Ejecutar la consulta
        pool.query(InsPunto, [puntosInteres], (err, results) => {
            if (err) {
                console.error('Error al insertar los datos en la base de datos:', err);
                return res.status(500).json({ message: 'Error al insertar los datos en la base de datos', error: err });
            }
            console.log('Datos insertados correctamente:', results.affectedRows);
            res.status(200).json({ message: 'Datos insertados correctamente', affectedRows: results.affectedRows });
        });
    } catch (err) {
        console.error('Error en el bloque catch:', err);
        return res.status(500).json({ message: 'Error al insertar los datos en la base de datos', error: err });
    }
};
