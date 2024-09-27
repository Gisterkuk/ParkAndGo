import express from 'express';
import JsonWebToken from 'jsonwebtoken';
import dotenv from 'dotenv'
import bcrypt from "bcryptjs";

dotenv.config()
const app = express();

export async function loguearse(pool, req, res) {
    const datos = req.body;
    
    let contralogin = datos.passlogin;
    let emaillogin = datos.correologin;
    
    let validarLogin = 'SELECT * FROM users WHERE Email = ?';
    
    try {
        // Realizar la consulta usando el pool
        const [results] = await pool.query(validarLogin, [emaillogin]);
        
        if (results.length === 0) {
            console.log("correo no existe");
            return res.redirect(`/login?error=${encodeURIComponent('Datos no coinciden.')}`);
        }

        const hashAlmacenado = results[0].password;
        
        // Comparar la contraseña proporcionada con el hash almacenado
        const resultado = await bcrypt.compare(contralogin, hashAlmacenado);
        
        if (resultado) {
            console.log("Logueo existoso.");
            
            // Generar el token JWT
            const token = JsonWebToken.sign({ user: emaillogin }, process.env.JWT_SECRET, {
                expiresIn: process.env.JWT_VENC
            });

            // Configurar las opciones de la cookie
            const cookieOption = {
                expires: new Date(Date.now() + process.env.COOKIE_VENC * 24 * 60 * 60 * 1000), // Ajustar correctamente la expiración
                httpOnly: true,
                path: "/"
            };

            // Enviar la cookie con el token
            res.cookie('jwt', token, cookieOption);
            
            // Redirigir a home después del login exitoso
            return res.redirect(`/`);
        } else {
            return res.status(401).json({ success: false, message: 'Datos no coinciden.' });
        }
    } catch (error) {
        console.error('Error en la consulta de login:', error);
        return res.status(500).json({ success: false, message: 'Error en la consulta de la base de datos.' });
    }
}