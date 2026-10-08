// Cargamos las variables de entorno desde el archivo .env a process.env
// (Debe ir lo más arriba posible para que estén disponibles en toda la aplicación)
require('dotenv').config();

// Importamos la función de conexión a la base de datos que creamos en config/db.js
const connectDB = require('./config/db');

// Ejecutamos la función para iniciar la conexión con MongoDB al arrancar el servidor
connectDB();


const express = require("express");
const productosR = require("./routes/productosRoutes");
const logger = require("./routes/logger");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

//Middlewares de las rutas
app.use(logger);
app.use(express.json());
app.use('/api/productos', productosR);

//Middlewares de rutas inexistentes
app.use((req, res, next) => {
    const error = new Error(`Ruta no encontrada: ${req.originalUrl}`);
    error.status = 404;
    next(error);
});

//middleware centralizado de errores
app.use((err, req, res, next) => {
    const statusCode = err.status || 500;

    console.error(err.message, err.stack);

    res.status(statusCode).json({
    message: err.message || 'Ha ocurrido un error en el servidor.'
    });
});

app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});