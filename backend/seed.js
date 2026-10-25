// backend/seed.js
// Carga los productos iniciales en MongoDB.
// Uso:
//   npm run seed        -> carga la base a la que apunte el .env (pensado para desarrollo)
//   npm run seed:prod   -> permite cargar la base de producción (<NO ejecutar>, solo para producción/Entrega final)

// Carga las variables del .env (necesitamos MONGODB_URI)
require('dotenv').config();

// Mongoose conecta Node con MongoDB
const mongoose = require('mongoose');

// Modelo Product: define cómo se guarda cada producto
const Product = require('./models/Product');

// Array con los productos actuales, que usamos como datos de prueba
const productos = require('./data/productosSeed');

// Nombre de la base de producción: el seed no puede tocarla sin el flag --prod
const PROD_DB_NAME = 'muebleria';

// Indica si se pasó el flag --prod al ejecutar el script
const permitirProduccion = process.argv.includes('--prod');

const seed = async () => {
    try {
    // 1. Conectarse a la base indicada en el .env
    await mongoose.connect(process.env.MONGODB_URI);

    // mongoose.connection.name devuelve el nombre de la base a la que nos conectamos
    const dbName = mongoose.connection.name;
    console.log(`Conectado a la base: ${dbName}`);

    // 2. Protección: si es la base de producción y no se pasó --prod, abortar
    if (dbName === PROD_DB_NAME && !permitirProduccion) {
        console.error(
        `Abortado: "${dbName}" es la base de producción. ` +
        'Si realmente querés cargarla, usá "npm run seed:prod".'
    );
    process.exitCode = 1;
      return; // el bloque finally igualmente cierra la conexión
    }

    // 3. Borrar los productos existentes para no duplicarlos al ejecutar el script otra vez
    await Product.deleteMany({});
    console.log('Productos anteriores eliminados');

    // 4. Adaptar cada producto al formato del modelo:
    //    - se descarta el "id" numérico (MongoDB crea su propio _id)
    //    - se renombra "imagenURL" a "imagenUrl", como lo define el modelo
    //    - se incluyen descripcion y stock, que también forman parte del modelo
    const docs = productos.map(({ nombre, descripcion, precio, stock, imagenURL }) => ({
        nombre,
        descripcion,
        precio,
        stock,
        imagenUrl: imagenURL,
    }));

    // 5. Insertar todos los productos de una sola vez
    await Product.insertMany(docs);
    console.log(`${docs.length} productos cargados correctamente`);
} catch (error) {
    // Si algo falla, se informa el error y se marca el script como fallido
    console.error('Error en el seed:', error.message);
    process.exitCode = 1;
} finally {
    // 6. Cerrar la conexión siempre; si no, el script queda colgado
    await mongoose.disconnect();
}
};

seed();