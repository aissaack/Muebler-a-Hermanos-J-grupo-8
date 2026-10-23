const express = require('express'); //importa express
const mongoose = require('mongoose');
// Modelo Product: ahora se importa desde la carpeta models
const Product = require('../models/Product');

const router = express.Router(); //crea un router independiente para las rutas de productos


//Esta ruta devuelve el array completo en formato JSON.
// GET /api/productos
router.get('/', async (req, res, next) => {
    try {
        //select especifica los campos que quieres traer
        const productos = await Product.find().select('nombre precio imagenUrl');
        res.json(productos);
    } catch (error) {
        next(error);// Error 500 no previsto
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

// PUT /api/productos/:id (Actualizar un producto existente)
router.put('/:id', async (req, res, next) => {
    const { id } = req.params;
    const { nombre, precio, imagenUrl } = req.body;

    //ID invalido
    if (!mongoose.Types.ObjectId.isValid(id)) {
        const error = new Error('ID de producto invalido');
        error.status = 400;
        return next(error);
    }

    //Por si no agregan los datos
    if (!nombre || precio === undefined) {
        const error = new Error('El nombre y el precio son obligatorios');
        error.status = 400;
        return next(error);
    }

    if (typeof precio !== 'number' || precio <= 0) {
        const error = new Error('El precio ingresado es invalido');
        error.status = 400;
        return next(error);
    }

    try {
        //Actualizar en MongoDB
        //.findByIdAndUpdate busca por ID y actualiza ademas lo guarda
        const productoActualizado = await Product.findByIdAndUpdate(
        id,
        { nombre, precio, imagenUrl },
        { returnDocument: 'after', runValidators: true } //Controla qué documento te devuelve MongoDB y si se validan o no los datos al momento de actualizar
        );

        //El ID no existe en la base de datos
        if (!productoActualizado) {
        const error = new Error('Producto no encontrado');
        error.status = 404;
        return next(error);
        }

        //El producto modificado con exito
        res.json(productoActualizado);
    } catch (error) {
        if (error.name === 'ValidationError') {
        error.status = 400;
        }
        next(error);
    }
});

// DELETE /api/productos/:id (Eliminar un producto existente)
router.delete('/:id', async (req, res, next) => {
    const { id } = req.params;

    //ID invalido
    if (!mongoose.Types.ObjectId.isValid(id)) {
        const error = new Error('ID de producto invalido');
        error.status = 400;
        return next(error);
    }

    try {
        //Buscar y eliminar de MongoDB
        const productoEliminado = await Product.findByIdAndDelete(id);

        //Si el producto no existe
        if (!productoEliminado) {
        const error = new Error('Producto no encontrado');
        error.status = 404;
        return next(error);
        }

        //confirmar la eliminación
        res.json({
        message: 'Producto eliminado correctamente',
        producto: productoEliminado
        });
    } catch (error) {
        next(error); //Error 500 no previsto
    }
});

module.exports = router;