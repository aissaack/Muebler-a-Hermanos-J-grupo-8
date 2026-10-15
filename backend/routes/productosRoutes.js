const express = require('express'); //importa express
const mongoose = require('mongoose');
const Product = require('../data/productos'); //obtiene el array de productos.js

const router = express.Router(); //crea un router independiente para las rutas de productos


//Esta ruta devuelve el array completo en formato JSON.
// GET /api/productos
router.get('/', async (req, res, next) => {
    try {
        //select especifica los campos que quieres traer
        const productos = await Product.find().select('nombre precio imagenUrl');
        res.json(productos);
    } catch (error) {
        next(error);
    }
});


// GET /api/productos/:id
router.get('/:id', async (req, res, next) => {
    const { id } = req.params;

    // Error 400
    if (!mongoose.Types.ObjectId.isValid(id)) {
        const error = new Error('ID de producto invalido');
        error.status = 400;
        return next(error);
    }

    try {
        const producto = await Product.findById(id);

        // Error 404: el ID no existe en la base
        if (!producto) {
        const error = new Error('Producto no encontrado');
        error.status = 404;
        return next(error);
        }

        res.json(producto);
    } catch (error) {
        next(error);
    }
});

// POST /api/productos (Crear un nuevo producto)
router.post('/', async (req, res, next) => {
    const { nombre, precio, imagenUrl } = req.body;

  //Validación 400
    if (!nombre || !precio) {
        const error = new Error('El nombre y el precio son obligatorios');
        error.status = 400;
        return next(error);
    }

  // Validación 400
    if (typeof precio !== 'number' || precio <= 0) {
        const error = new Error('El precio debe ser un número mayor a cero');
        error.status = 400;
        return next(error);
    }

    try {
    //Crear y guardar el nuevo producto en MongoDB
    const nuevoProducto = new Product({
        nombre,
        precio,
        imagenUrl
    });

    const productoGuardado = await nuevoProducto.save();

    //Estado 201 Created y el producto guardado
    res.status(201).json(productoGuardado);
    } catch (error) {
        // Si Mongoose lanza un error de validacion
        if (error.name === 'ValidationError') {
            error.status = 400;
        }
        next(error);
    }
});

module.exports = router;