/**
 *  Axiliar para
 *      - Generar un nuevo TOKEN de inicio de sesión a un usuario.
 */

// Importaciones
const jwt = require('jsonwebtoken');

// Genera un TOKEN con JsonWebToken:
const generarJWT = (user) => {
    // Promesa...
    return new Promise( (resolve, reject) => {
        // Requeire de un Payload para generar el token, entonces:
        const payload = {
            user
        };
        const seed = process.env.JWT_SECRET;
        const expires = '30d'; // Con caducidad de 24 Horas.

        // Cargado el PAYLOAD, genera el Token
        jwt.sign(payload, seed, {expiresIn: expires}, (err, token) => {
            if (err) { // Si hay un error, entonces...
                console.log(err); // Imprime el error
                reject('No se pudo generar el Token...') // Rechaza la generación del TOKEN con un mensaje de error
            } else { // Si no hay error, entonces... 
                resolve(token) // Muestra el token del usuario autenticado.
            }
        });
    });
}

// Exportaciones
module.exports = {
    generarJWT
}