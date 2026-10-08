// backend/seed.js
// Script que carga los productos iniciales en MongoDB.
// Se ejecuta a mano con "npm run seed"; no forma parte del servidor.

// Carga las variables del archivo .env (necesitamos MONGODB_URI)
require('dotenv').config();

// Mongoose es la librería que conecta Node con MongoDB
const mongoose = require('mongoose');

// Modelo Product: define cómo se guarda un producto en la base
const Product = require('./models/Product');

// Array con los productos actuales (el que usaba el backend antes)
const productos = require('./data/productos');

// Función asíncrona que hace todo el trabajo, paso por paso
const seed = async () => {
    try {
    // 1. Conectarse a MongoDB Atlas con la cadena del .env
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB conectado');

    // 2. Borrar todos los productos que haya en la colección,
    //    para no duplicarlos si el script se ejecuta más de una vez
    await Product.deleteMany({});
    console.log('Productos anteriores eliminados');

    // 3. Adaptar cada producto al formato del modelo:
    //    - se descarta el "id" numérico (MongoDB crea su propio _id)
    //    - se renombra "imagenURL" a "imagenUrl", que es como lo define el modelo
    const docs = productos.map(({ nombre, precio, imagenURL }) => ({
        nombre,
        precio,
        imagenUrl: imagenURL,
    }));

    // 4. Insertar todos los productos en la base de una sola vez
    await Product.insertMany(docs);
    console.log(`${docs.length} productos cargados correctamente`);
} catch (error) {
    // Si algo falla, se muestra el error y se marca el script como fallido
    console.error('Error en el seed:', error.message);
    process.exitCode = 1;
} finally {
    // 5. Cerrar la conexión siempre, haya funcionado o no;
    //    si no, el script quedaría colgado y no terminaría
    await mongoose.disconnect();
}
};

// Ejecutar la función
seed();