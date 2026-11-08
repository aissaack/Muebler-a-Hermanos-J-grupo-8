// Cargamos las variables de entorno desde el archivo .env a process.env
// (Debe ir lo más arriba posible para que estén disponibles en toda la aplicación)
require('dotenv').config();

// Importamos la función de conexión a la base de datos que creamos en config/db.js
const connectDB = require('./config/db');

// Ejecutamos la función para iniciar la conexión con MongoDB al arrancar el servidor
connectDB();


const express = require("express");
const mongoose = require("mongoose");
const productosR = require("./routes/productosRoutes");
const categoriasR = require("./routes/categoriasRoutes");
const logger = require("./routes/logger");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

// Lee la variable de entorno que se definio en el .env
const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI;

//Conexión a MongoDB Atlas
mongoose.connect(MONGO_URI)
    .then(() => console.log("Conectado exitosamente a MongoDB"))
    .catch((err) => console.error("Error al conectar a MongoDB:", err.message));

// CORS: solo acepta pedidos del frontend definido en CLIENT_URL (la URL de Vercel).
// Si no está definida (desarrollo local), acepta cualquier origen.
app.use(cors({ origin: process.env.CLIENT_URL || '*' }));

//Middlewares de las rutas
app.use(logger);
app.use(express.json());
app.use('/api/productos', productosR);
app.use('/api/categorias', categoriasR);

//Middlewares de rutas inexistentes
app.use((req, res, next) => {
    const error = new Error(`Ruta no encontrada: ${req.method} ${req.originalUrl}`);
    error.status = 404;
    next(error);
});

//middleware centralizado de errores
//captura 400, 404, 409, 500
app.use((err, req, res, next) => {
    let statusCode = err.status || 500;
    let message = err.message || 'Ha ocurrido un error en el servidor.';
    if (err.name === 'ValidationError') {
        statusCode = 400;
        message = 'Los datos ingresados no son válidos.';
    } else if (err.name === 'CastError') {
        statusCode = 400;
        message = 'El identificador o dato ingresado no es válido.';
    } else if (err.code === 11000) {
        statusCode = 409;
        message = 'El recurso ya existe.';
    }

    console.error(err.message, err.stack);

    res.status(statusCode).json({
    error: message,
    message
    });
});

app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
