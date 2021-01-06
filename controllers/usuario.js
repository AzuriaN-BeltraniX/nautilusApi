/**
 *  Controlador de peticiones para:
 *      - (GET) Listar los usuarios registrados,
 *      - (POST) Registrar a un nuevo usuario,
 *      - (PUT) Actualizar un usuario registrado,
 *      - (DELETE) Eliminar un usuario registrado.
 */

// Importaciones
const { request, response } = require('express');
const bcrypt = require('bcryptjs');

const Usuario = require('../models/usuario');
const { generarJWT } = require('../helpers/jwt');
const { getUserData } = require('../middlewares/existe-jwt');

// Controlador para obtener usuarios:
const obtenerUsuarios = async(req = request, res = response) => {
    /** PRUEBA: Muestra un mensaje en la petición indicando que el servicio funciona. */
    // console.log('Creando usuario...');
   
    // Filtrando número de usuarios mostrados:
    const desde = Number(req.query.desde) || 0; // Obtiene el parámetro y lo transforma a número, si no exite, por defecto es 0
    /** PRUEBA: Imprime en consola el número de página solicitado. */ 
    // console.log(desde);
    // console.log(req.query);

    // Promesa...
    const [usuarios, total] = await Promise.all([ // Muestra el resultado de las siguientes promesas:
        // Lista los usuarios existentes en la base de datos:
        Usuario
            .find({}, 'nombre email role google img') // También filtra parámetros
            .skip(desde) // Muestra desde el número de usuario registrado
            .limit(10), // Limita a 5 resultados
        
        // Conteo de usuarios registrados
        Usuario.countDocuments()
    ]);

    // Obten los datos del usuario desde el token:
    const token = req.header('x-token')
    const userData = await getUserData(token);
    /** PRUEBA: Imprime en consola el token extraído y los datos de usuario. */
    // console.log(token, userData);

    // Si se pudo ejecutar la búsqueda, entonces imprime el resultado de la petición.
    await res.json({
        ok: true,
        usuarios,
        total,
        buscador: {
            usuario: userData.nombre,
            id: userData.userID
        }
    });
};

// Controlador para crear usuarios:
const crearUsuarios = async(req = request, res = response) => {
    /** PRUEBA: Muestra un mensaje en la petición indicando que el servicio funciona. */
    // console.log('Creando usuario...');

    // Captura datos
    const { email, password } = req.body;

    // Promesa...
    try {
        // Busca email en el registro, para evitar duplciados.
        const existeEmail = await Usuario.findOne({ email });

        if (existeEmail) { // Si existe el email, entonces...
            return res.status(400).json({
                ok: false,
                header: '¡Hey!',
                msg: 'El correo que ingresaste ya está registrado, intenta con uno diferente.'
            }); // Retorna el menssaje de error.
        }

        // Creación del Usuario
        const usuario = new Usuario(req.body); // Crea un usuario

        // Encriptación de la contraseña.
        const salt = bcrypt.genSaltSync(); // Genera la encriptación
        usuario.password = bcrypt.hashSync(password, salt); // Determina el parámetro a encriptar
        
        // Guarda al usuario creado
        await usuario.save();

        // Si el correo y contraseñas son válidas, entonces genera un TOKEN (JWT):
        const token = await generarJWT(usuario);

        // Respuesta de la petición al guardar usuario:
        res.json({
            ok: true, // Creación exitosa!!!
            usuario, // Muestra los datos del usuario creado
            token // Muestra el TOKEN generado.
        });
    } catch(error) { // Si no se puede crear usuario, entonces...
        console.log(error); // Imprime el error
        res.status(500).json({
            ok: false,
            header: 'Esto no debería pasar...',
            msg: 'Reporte este error al administrador.'
        }); // Retorna el mensaje de error.
    }
};

// Controlador para actualizar usuarios:
const actualizarUsuarios = async(req = request, res = response) => {
    // Requiere de los siguientes datos;
    const token = req.header('x-token')
    const userID = req.params.id;

    // Obtén el ID del usuario en sesión:
    const userData = await getUserData(token)
    const id_userLogged = userData.userID;

    // Promesa...
    try {
        // Busca un usuario existente mediante un ID:
        const usuarioDB = await Usuario.findById(userID);
        // Si no encuentra un usuario, entonces...
        if (!usuarioDB) {
            return res.status(404).json({
                ok: false,
                msg: `No existe un usuario con el id ${userID}, proporciona un ID válido.`
            }); // Imprime el mensaje de error.
        };

        // Verifica si el correo a actualizar ya existe:
        const { password, // ... omite el la actualización a la contraseña
                google, // ... omite la actualización a autenticación por Google
                email, // ... "omite" el email
                ...campos } = req.body; // Requiere el BODY para obtener los campos a actualizar
        // ...Si el correo electrónico es diferente, entonces...
        if (usuarioDB.email !== email) {
            const existeEmail = await Usuario.findOne({email}) // Busca el correo existente, pero...
            if (existeEmail) { // Si existe el correo, entonces...
                return res.status(400).json({
                    ok: false,
                    header: 'Vaya...',
                    msg: 'Ya existe un usuario con el correo electrónico que ingresaste, usa uno diferente o informa al administrador sobre este inconveniente.'
                }); // Retorna un mensaje de error.
            };
        };

        // Verifica si el usuario que intenta actualizar su correo es de Google, si es así, entonces:
        if (!usuarioDB.google) {
            campos.email = email; // Email a actualizar:
        } else if (usuarioDB.email !== email) { // Si el correo de google es diferente e intenta actualizar, entonces:
            return res.status(400).json({
                ok: false,
                header: '¡Te atrapé!',
                msg: 'Eres un usuario de Google, no puedes actualizar tu correo electrónico.'
            }); // Retorna un mensaje de error.
        }

        // Actualiza el usuario requiriendo el ID de usuario
        const usuarioActualizado = await Usuario.findByIdAndUpdate(userID, campos, {new: true});
        /** PRUEBA: Imprime los datos actualizados del usuario. */
        // console.log(usuarioActualizado);

        // Si el usuario actualizó su propia información, lanza un nuevo token con la información actualizada:
        if (userID === id_userLogged) {
            const newToken = await generarJWT(usuarioActualizado);
            /** PRUEBA: Imprime el nuevo Token en Consola. */
            // console.log(newToken);

            return res.json({
                ok: true,
                usuario: usuarioActualizado,
                token: newToken
            });
        // ... si es un administrador modificando un nuevo usuario, entonces:
        } else if (userID !== id_userLogged) {
            return res.json({
                ok: true,
                usuario: usuarioActualizado
            });
        };
    } catch (error) { // Si no se puede actualizar el usuario, entonces...
        console.log(error); // Imprime el error
        res.status(500).json({
            ok: false,
            header: 'Esto no debería pasar...',
            msg: 'El usuario no se ha podido actualizar, reporta este inconveniente al administrador.'
        }); // Retorna el mensaje de error
    }
};

// Controlador para borrar los usuarios:
const borrarUsuarios = async(req, res = response) => {
    // Requiere del ID de usuario
    const userID = req.params.id;

    // Promesa...
    try {
        // Busca un usuario existente mediante un ID:
        const usuarioDB = await Usuario.findById(userID);

        if (!usuarioDB) { // Si no encuentra un usuario, entonces...
            return res.status(404).json({
                ok: false,
                msg: `No existe un usuario con el ID: '${userID}', proporciona un ID válido.`
            }); // Imprime el mensaje de error.
        }

        await Usuario.findByIdAndDelete(userID) // Si existe un usuario

        // /* Prueba de data
            res.json({
                ok: true,
                header: '¡Usuario eliminado correctamente!',
                msg: `El usuario '${userID}', fue eliminado con éxito.`
            })
    } catch(error) { // Si no se puede borrar el usuario entonces...
        console.log(error); // Muestra error
        res.status(500).json({
            ok: false,
            header: 'Esto no debería pasar...',
            msg: 'No se ha podido eliminar el usuario, por favor reporta este inconveniente al administrador.'
        }); // Imprime mensaje de error.
    }
};

// Exportaciones
module.exports = {
    obtenerUsuarios,
    crearUsuarios,
    actualizarUsuarios,
    borrarUsuarios
}