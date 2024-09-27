import nodemailer from 'nodemailer';
import crypto from "crypto"

export function generadorToken() {
    return crypto.randomBytes(32).toString('hex');
}
export function linktoken(generadorToken,correo) {
    return `http://localhost:8000/CorreoValido?token=${generadorToken}&correo=${correo}`;
}

export const transporter = nodemailer.createTransport({
    host:"smtp.gmail.com",
    port: 465,
    secure: true,
    service: 'gmail', // Puedes usar otro servicio como 'Yahoo', 'Outlook', etc.
    auth: {
        user: 'pathandgo@gmail.com', // Tu correo electrónico
        pass: 'vket sqeu yftu eiwr',       // Tu contraseña o una contraseña de aplicación
    }
});
export function MensajeCorreo(correo, linkVerificacion) {
    const correoOBJ = {
        from: 'pathandgo@gmail.com', // Dirección de correo del remitente
        to: correo, // Dirección de correo del destinatario
        subject: 'Bienvenido a Path And Go', // Asunto del correo
        text: `¡Bienvenido a Path And Go!\n\nEstamos emocionados de tenerte con nosotros. En Path And Go, nuestro objetivo es hacer que tus viajes sean inolvidables ofreciéndote rutas personalizadas basadas en tus intereses y preferencias.\n\nPara comenzar a explorar el mundo a tu medida, visita el siguiente enlace: ${linkVerificacion}`, // Cuerpo del correo en texto plano
        html: `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
    font-family: Arial, sans-serif;
    margin: 0;
    padding: 0;
    background-color: #f4f4f4;
}
.head-container{
    display: flex;
    align-items: center;
}
.head-container > img{
    max-width: 120px;
    max-height: 120px;
    transform: translateX(15px);
}
.container {
    max-width: 600px;
    margin: 0 auto;
    padding: 20px;
    background-color: #ffffff;
    border-radius: 8px;
    box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
}
h1 {
    color: #333333;
}
p {
    color: #555555;
    line-height: 1.6;
}
.button{
    display: inline-block;
    padding: 10px 20px;
    margin-top: 20px;
    background-color: #007BFF;
    text-decoration: none;
    border-radius: 5px;
    border: none;
    color: #fff;
}
.footer {
    margin-top: 20px;
    padding-top: 20px;
    border-top: 1px solid #dddddd;
    text-align: center;
    color: #888888;
    font-size: 12px;
}
    </style>    
</head>
<body>
    <div class="container">
        <div class="head-container">
            <h1>¡Bienvenido a Path And Go!</h1>
            <img src="/intento/logo.png" alt="">
        </div>
        <p>Estamos emocionados de tenerte con nosotros. En Path And Go, nuestro objetivo es hacer que tus viajes sean inolvidables ofreciéndote rutas personalizadas basadas en tus intereses y preferencias.</p>
        <p>Para comenzar a explorar el mundo a tu medida, haz clic en el siguiente botón:</p>
        <a href="${linkVerificacion}"><button class="button">Comienza tu aventura</button></a>
        <div class="footer">
            <p>Si tienes alguna pregunta, no dudes en <a href="mailto:pathandgo@gmail.com">contactarnos</a>.</p>
            <p>&copy; 2024 Path And Go. Todos los derechos reservados.</p>
        </div>
    </div>
</body>
</html>`, // Cuerpo del correo en formato HTML (opcional)
    };
    return correoOBJ;
}
export async function validateEmail(email) {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(email);
}

export async function validateNombre(nombre,apellido) {
    // Expresión regular para detectar números y caracteres no alfabéticos
    const invalidCharPattern = /[^A-Za-z]/;
    let test = false;
    
    // Devuelve true si encuentra un carácter no válido (número o carácter no alfabético)
    let testnombre=!invalidCharPattern.test(nombre);
    let testapellido = !invalidCharPattern.test(apellido);
    if(testnombre == false || testapellido == false){
        test = true;
    }
    return test;
}

