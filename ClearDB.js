const mysql = require('mysql');

// Configurar conexión a la base de datos
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'tu_usuario',
    password: 'tu_contraseña',
    database: 'tu_base_de_datos'
});

// Conectar a la base de datos
connection.connect((err) => {
    if (err) {
        console.error('Error conectando a la base de datos:', err);
        return;
    }
    console.log('Conectado a la base de datos');
    
    // Eliminar usuarios con token vencido
    const query = `
        DELETE usuarios
        FROM usuarios
        INNER JOIN TokenUs ON usuarios.CodToken = TokenUs.CodToken
        WHERE TokenUs.FechaVenc < NOW()
    `;

    connection.query(query, (err, result) => {
        if (err) {
            console.error('Error ejecutando la consulta:', err);
        } else {
            console.log(`Registros eliminados: ${result.affectedRows}`);
        }

        // Cerrar la conexión
        connection.end();
    });
});