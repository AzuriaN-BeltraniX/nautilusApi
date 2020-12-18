/**
 *  Asistente para:
 *      - Validar si existe un token proporcionado en la petición,
 *      - Extraer los datos del usuario desde el token.
*/

// Importaciones
const { response, request } = require('express');
const jwt = require('jsonwebtoken');

// Validando si existe el Token:
const existeJWT = (req = request, res = response, next) => {
    // Requiere leer el TOKEN del HEADER:
    const token = req.header('x-token');
    if (!token) { // Si no existe un token, entonces
        return res.status(401).json({ // Retorna el error de servicios
            ok: false,
            header: 'Falta algo...',
            msg: 'Añade un token a los datos en la petición.'
        }); // Imrpime el mensaje de error.
    };

    const valido = jwt.verify(token, process.env.JWT_SECRET);

    if (!valido) {
        res.status(404).json({
            ok: false,
            msg: 'El token no es correcto, inicia sesión de nuevo y proporciona el que se muestra en la respuesta.'
        });
    } else {
        next();
    };

    /** PRUEBA: Imprime el TOKEN en consola. */
    // console.log(token);
};

// Función que extrae los datos del usuario en sesión desde el Token:
const getUserData = (xToken) => {
    /** PRUEBA: Imprime en consola el token recibido. */
    // console.log(`>>> Token: ${xToken}`);

    // Promesa...
    return new Promise ((resolve, reject) => {
        jwt.verify(xToken, process.env.JWT_SECRET, (err, decoded) => {
            const userData = decoded.user;
            /** PRUEBA: Imprime en consola el token recibido. */
            // console.log('>>> Usuario:', userData);

            // Si no hay datos de usuario en el token, entonces muestra el error, si hay, retorna los datos:
            if (!userData) {
                reject(err);
            } else {
                return resolve(userData);
            };
        });
    });

};

// Exportaciones
module.exports = {
    existeJWT,
    getUserData
};