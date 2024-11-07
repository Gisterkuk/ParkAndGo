import mysql from 'mysql2/promise';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { Registrarse } from './controllers/Authentication/ControllerRegistro.js';
import { loguearse } from './controllers/Authentication/ControllerLogin.js';
import { transporter } from './public/JS/ScriptValideEmail.js';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { Connector } from '@google-cloud/cloud-sql-connector';
import fs from 'fs';
import os from 'os'; // Importar el módulo 'os'

dotenv.config();

async function initializeApp() {
    try {
        // Crear el archivo de credenciales en la carpeta temporal del sistema
        const credentialsPath = path.join(os.tmpdir(), 'google-credentials.json');
        fs.writeFileSync(credentialsPath, process.env.GOOGLE_APPLICATION_CREDENTIALS_CONTENT);
        process.env.GOOGLE_APPLICATION_CREDENTIALS = credentialsPath;

        // Crear conector y pool de conexiones MySQL
        const connector = new Connector();
        const clientOpts = await connector.getOptions({
            instanceConnectionName: process.env.CONEXION_CLOUD, // Usa la variable de entorno
            ipType: 'PUBLIC',
        });

        const pool = mysql.createPool({
            ...clientOpts,
            user: process.env.DB_NAME_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        });

        // Inicializar Express
        const app = express();
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = dirname(__filename);

        app.use(express.static(path.join(__dirname, 'public')));
        app.use(express.urlencoded({ extended: false }));
        app.use(express.json());
        app.use(cookieParser());

        const PORT = process.env.PORT || 8200;
        app.listen(PORT, () => {
            console.log(`Servidor escuchando en http://localhost:${PORT}`);
        });

        // Definir rutas de la aplicación
        app.get("/login", function (req, res) {
            res.sendFile(path.join(__dirname, "/public/pages/Entrada/login.html"));
        });

        app.post("/VerificarLogin", async (req, res) => {
            loguearse(pool, req, res);
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
            const DelUsuarioTemp = "DELETE FROM usuarios WHERE Correo = ?";

            try {
                const [rows] = await pool.query(validarToken, [tokenValido]);

                if (rows.length === 0) {
                    let mensajeError = 'El token no es válido, vuelva a intentar';
                    console.log("Token no está en la BD");
                    return res.redirect(`/?error=${encodeURIComponent(mensajeError)}`);
                }

                await pool.query(estadoValido, [correo]);
                await pool.query(insertarUsuarioConfirmado, [correo]);
                await pool.query(DelUsuarioTemp, [correo]);

                res.sendFile(path.join(__dirname, "/public/pages/Email/CorreoValidado.html"));
            } catch (error) {
                console.error('Error en la consulta o en el manejo de datos:', error);
                return res.redirect(`/?error=${encodeURIComponent('Error en la base de datos')}`);
            }
        });

        app.get("/ValidarCorreo", function (req, res) {
            res.sendFile(path.join(__dirname, "/public/pages/Email/validarEmail.html"));
        });

        app.get('/api/puntos-interes', async (req, res) => {
            const query = 'SELECT name, descrip, latitud, longitud, categoria, Ubicacion, Accesibilidad, zoom, sector, imagen_url FROM puntos_interes';

            try {
                const [results] = await pool.query(query);
                res.json(results);
            } catch (err) {
                console.error('Error en la consulta:', err);
                res.status(500).json({ error: 'Error en el servidor' });
            }
        });

        app.get('/api/puntos-interes/search', async (req, res) => {
            const query = req.query.query;
            const sql = `
                SELECT name, descrip, latitud, longitud, categoria, Ubicacion, Accesibilidad, Visibilidad, zoom, sector, imagen_url 
                FROM puntos_interes
                WHERE (name LIKE ? OR categoria LIKE ? OR sector LIKE ?)
                AND Visibilidad = 1
            `;
            const params = [`%${query}%`, `%${query}%`, `%${query}%`];

            try {
                const [results] = await pool.query(sql, params);
                res.json(results);
            } catch (err) {
                console.error('Error en la consulta:', err);
                res.status(500).json({ error: 'Error en el servidor' });
            }
        });

        // Verificar conexión al pool
        try {
            const [rows] = await pool.query('SELECT 1 + 1 AS resultado');
            console.log('Resultado de la prueba de consulta:', rows);
        } catch (error) {
            console.error('Error conectando a la base de datos:', error);
        }

        transporter.verify((error, success) => {
            if (error) {
                console.error('Error al conectar con el servidor de correo:', error);
            } else {
                console.log('Servidor de correo listo para enviar mensajes', success);
            }
        });

        Registrarse(app, pool);

    } catch (error) {
        console.error('Error durante la inicialización de la aplicación:', error);
    }
}

// Ejecutar la inicialización
initializeApp();
