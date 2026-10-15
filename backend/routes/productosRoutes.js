const express = require('express'); //importa express
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
router.get('/:id',(req,res, next)=>{
    const id = Number(req.params.id)

    const producto = productos.find(p => p.id === id);

    if(!producto){
        const error = new Error("Producto no encontrado.");
        error.status = 404;

        return next(error);
    };

    res.json(producto);
});

module.exports = router;