require("dotenv").config(); //LEER EL .ENV
const express = require("express");
const mongoose = require("mongoose");
const productosR = require("./routes/productosRoutes");
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