// Importamos la librería mongoose para interactuar con MongoDB
const mongoose = require('mongoose');


/**
 * Función asíncrona para establecer la conexión con la base de datos.
 */
const connectDB = async () => {
    try {
    // Intentamos conectar a MongoDB utilizando la URI definida en las variables de entorno (.env)
    await mongoose.connect(process.env.MONGODB_URI);
    // Si la conexión es exitosa, mostramos un mensaje en la consola del servidor
    console.log('MongoDB conectado');
    } catch (error) {
    // Si ocurre algún fallo durante el proceso de conexión, lo capturamos aquí    
    console.error('Error al conectar con MongoDB:', error.message);
    // Detenemos la aplicación por completo con código 1 (indicando fallo o error crítico)
    process.exit(1);
    }
};

// Exportamos la función para poder llamarla desde el archivo principal (por ejemplo, server.js o app.js)
module.exports = connectDB;