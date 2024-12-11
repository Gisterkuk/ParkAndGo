import mysql from 'mysql2/promise';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { Registrarse } from './controllers/Authentication/ControllerRegistro.js';
import { loguearse } from './controllers/Authentication/ControllerLogin.js';
import {transporter} from './public/JS/ScriptValideEmail.js';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';

dotenv.config();

// export const pool = mysql.createPool({
//     user: process.env.DB_NAME_USER,
//     host: process.env.DB_HOST,
//     password: process.env.DB_PASSWORD,
//     database: process.env.DB_NAME,
//     port: process.env.DB_PORT,
//     waitForConnections: true,
//     connectionLimit: 10,
//     queueLimit: 0
// });

export const pool = mysql.createPool({
    user: process.env.LOCALHOST_USER_NAME,
    host: process.env.LOCALHOST_NAME,
    password: process.env.LOCALHOST_PASSWORD,
    database: process.env.LOCALHOST_DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});
pool.getConnection()
    .then(conn => {
        console.log("Conexión a la base de datos exitosa");
        conn.release();
    })
    .catch(err => {
        console.error("Error al conectar a la base de datos:", err);
    });

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());


// O define una ruta específica para servir el archivo geojson
app.use(express.static(path.join(__dirname, '/')));
 
const PORT = process.env.PORT || 8200; // Cambia a 8101 o otro puerto
app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://${process.env.LOCALHOST_NAME}:${PORT}`);
});
app.get("/login", function (req, res) {
    res.sendFile(path.join(__dirname, "/public/pages/Entrada/login.html"));
});
app.post("/VerificarLogin", async (req, res) => {
    loguearse(pool,req, res);
});
app.get("/registro", function (req, res) {
    res.sendFile(path.join(__dirname, "/public/pages/Entrada/register.html"));
});
app.get("/", function (req, res) {
    res.sendFile(path.join(__dirname, "/public/pages/home/map.html"));
});
app.get("/CorreoValido", async function (req, res) {
    const tokenValido = req.query.token;
    const correo = req.query.correo;
    
    console.log("Token recibido:", tokenValido);
    console.log("Correo recibido:", correo);
    
    const validarToken = 'SELECT token FROM TokenUs WHERE token = ? AND FechaVenc >= NOW()';
    const estadoValido = 'UPDATE usuarios SET CodEst = 1 WHERE Correo = ? AND CodEst = 3';
    const insertarUsuarioConfirmado = `
        INSERT INTO users (name, surname, email, password, CodEst)
        SELECT NombreUs, ApellUs, Correo, Clave, CodEst
        FROM usuarios
        WHERE Correo = ? AND CodEst = 1`;
    const DelUsuarioTemp = "DELETE FROM usuarios WHERE Correo = ?"

    try {
        // Validar token
        const [rows] = await pool.query(validarToken, [tokenValido]);
        
        if (rows.length === 0) {
            let mensajeError = 'El token no es válido, vuelva a intentar';
            console.log("Token no está en la BD");
            return res.redirect(`/?error=${encodeURIComponent(mensajeError)}`);
        }

        // Actualizar estado
        await pool.query(estadoValido, [correo]);

        // Insertar en la tabla de usuarios confirmados
        await pool.query(insertarUsuarioConfirmado, [correo]);

        // Eliminar el registro temporal
        await pool.query(DelUsuarioTemp, [correo]);

        // Enviar archivo
        res.sendFile(path.join(__dirname, "/public/pages/Email/CorreoValidado.html"));
    } catch (error) {
        console.error('Error en la consulta o en el manejo de datos:', error);
        return res.redirect(`/?error=${encodeURIComponent('Error en la base de datos')}`);
    }
});

app.get("/ValidarCorreo", function (req, res) {
    res.sendFile(path.join(__dirname, "/public/pages/Email/validarEmail.html"));
});
app.get('/api/routing', async (req, res) => {
    const { nameA, nameB } = req.query;

    if (!nameA || !nameB) {
        return res.status(400).json({ error: 'Faltan parámetros de consulta: nameA o nameB' });
    }

    const query = 'SELECT name, latitud, longitud FROM puntos_interes WHERE name = ? OR name = ?';
    try {
        const [results] = await pool.query(query, [nameA, nameB]); // Pasa los parámetros al query
        res.json(results);
    } catch (err) {
        console.error('Error en la consulta:', err);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

app.get('/api/puntos-interes', async (req, res) => {
    const query = 'SELECT name, descrip, latitud, longitud, categoria,Ubicacion,Accesibilidad,zoom, sector, imagen_url FROM puntos_interes' ;

    try {
        const [results] = await pool.query(query); // Usa await para la consulta
        res.json(results);
    } catch (err) {
        console.error('Error en la consulta:', err);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});
app.get('/api/puntos-interes/search', async (req, res) => {
    const query = req.query.query; // Toma el término de búsqueda desde la URL
    const sql = `
        SELECT name, descrip, latitud, longitud, categoria,Ubicacion,Accesibilidad, Visibilidad, zoom, sector, imagen_url 
        FROM puntos_interes
        WHERE (name LIKE ?)
    `;
    const params = [`%${query}%`, `%${query}%`, `%${query}%`]; // Usa el término de búsqueda para name, categoria, y sector
    
    try {
        const [results] = await pool.query(sql, params); // Ejecuta la consulta con los parámetros
        res.json(results); // Devuelve los resultados como JSON
    } catch (err) {
        console.error('Error en la consulta:', err);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

// app.get('/api/MultiLineStringWithOrientation.geojson', (req, res) => {
//     const filePath = path.join(__dirname, 'MultiLineStringWithOrientation.geojson');
//     res.sendFile(filePath, (err) => {
//         if (err) {
//             console.error('Error al enviar el archivo GeoJSON:', err);
//             res.status(500).send('Error al enviar el archivo GeoJSON');
//         }
//     });
// });

// Verificar la conexión realizando una consulta simple
async function verificarPool() {
    try {
        // Hacemos una consulta simple directamente con el pool
        const [rows] = await pool.query('SELECT 1 + 1 AS resultado');
        console.log('Resultado de la prueba de consulta:', rows);
    } catch (error) {
        console.error('Error conectando a la base de datos:', error);
    }
}
verificarPool();

transporter.verify((error, success) => {
    if (error) {
        console.error('Error al conectar con el servidor de correo:', error);
    } else {
        console.log('Servidor de correo listo para enviar mensajes', success);
    }
});
Registrarse(app, pool);
