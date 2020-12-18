// Importaciones
const mongoose = require('mongoose');

// Promesa de conexión a MongoDB
const dbConnection = async () => {

    // path: 'mongodb+srv://AzBel_admin:e4Pc4rXetVSACZVf@cluster0.ha0bs.mongodb.net/test'

    try {
        // await mongoose.connect('mongodb://localhost:27020/adminPro',
        await mongoose.connect('mongodb+srv://AzBel_admin:e4Pc4rXetVSACZVf@cluster0.ha0bs.mongodb.net/nautilusData',
        {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        
        console.log('DB Online'); // Mensaje de conexión exitosa!!!
    } catch(err) {
        console.log(err);
        throw new Error('Error al iniciar la Base de Datos, ver "logs"') // Mensaje de error...
    }

}

// EnsureIndex Solition
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);

// Modulos exportados
module.exports = {
    dbConnection
}