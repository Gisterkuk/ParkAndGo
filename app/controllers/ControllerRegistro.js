import { validateEmail, validateNombre, transporter, MensajeCorreo } from '../public/JS/ScriptValideEmail.js';
import bcryptjs from 'bcryptjs';
import { generadorToken, linktoken } from '../public/JS/ScriptValideEmail.js';

export async function Registrarse(app, pool) {
    app.post("/VerificarRegister", async (req, res) => {
        const datos = req.body;
        const Nombre = datos.Nom;
        const Apellido = datos.Apell;
        const Correo = datos.Email;
        const Clave = datos.Pass;

        let mensajeError = '';

        // Validar nombre y apellido
        if (!validateNombre(Nombre, Apellido)) {
            mensajeError = "El nombre o el apellido no cumple con los requisitos válidos";
            return res.redirect(`/?error=${encodeURIComponent(mensajeError)}`);
        }

        try {
            // Consultar si el correo ya está registrado
            const Validar = `
            (
                SELECT 'users' AS source, email
                FROM users
                WHERE email = ?
            )
            UNION
            (
                SELECT 'usuarios' AS source, Correo AS email
                FROM usuarios
                WHERE Correo = ? AND CodEst = 3
            )
        `;
            const [rows] = await pool.query(Validar, [Correo,Correo]);

            if (rows.length > 0) {
                mensajeError = 'El correo ya existente.';
                console.log(rows)
                console.log("Correo ya existe");
                return res.redirect(`/?error=${encodeURIComponent(mensajeError)}`);
                
            }

            // Validar formato del correo
            if (!validateEmail(Correo)) {
                mensajeError = "El correo no cumple con los requisitos válidos!";
                console.log("El correo no cumple los parámetros requeridos");
                return res.redirect(`/?error=${encodeURIComponent(mensajeError)}&nombre=${encodeURIComponent(Nombre)}&apell=${encodeURIComponent(Apellido)}&clave=${encodeURIComponent(Clave)}`);
            }

            // Hashear la contraseña
            const salt = await bcryptjs.genSalt(10);
            const ClaveHasheada = await bcryptjs.hash(Clave, salt);

            // Generar el token y el enlace de verificación
            const token = generadorToken();
            const linkVerificacion = linktoken(token, Correo);
            console.log("Token enviado del registro: " + token);
            console.log("Correo enviado: " + Correo);
            const EnvioCorreo = MensajeCorreo(Correo, linkVerificacion);

            // Enviar correo de verificación
            await transporter.sendMail(EnvioCorreo);
            console.log('Correo enviado');

            // Insertar el usuario en la tabla usuarios
            const registrarUsuario = "INSERT INTO usuarios (NombreUs, ApellUs, Correo, Clave, CodEst) VALUES (?, ?, ?, ?, 3)";
            await pool.query(registrarUsuario, [Nombre, Apellido, Correo, ClaveHasheada]);

            // Insertar el token en la tabla TokensUs
            const fechaVencimiento = new Date(Date.now() + 3600000).toISOString().slice(0, 19).replace('T', ' ');
            const insertarToken = "INSERT INTO TokenUs (token,Correo, FechaVenc, Created_at) VALUES (?, ?,?, NOW())";
            await pool.query(insertarToken, [token,Correo, fechaVencimiento]);
            
            console.log("Datos almacenados correctamente");
            res.redirect('/ValidarCorreo');

        } catch (error) {
            console.error('Error en el registro:', error);
            res.redirect(`/?error=${encodeURIComponent('Error al registrar usuario')}`);
        }
    });
}
