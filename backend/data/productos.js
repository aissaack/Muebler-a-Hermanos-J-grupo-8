// backend/data/productos.js
const mongoose = require('mongoose');

// El Schema define que tipos de campos tiene un producto en MongoDB
const productSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    precio: { type: Number, required: true },
    imagenUrl: { type: String }
    }, {
    toJSON: {
        transform: (doc, ret) => {
        ret.id = ret._id; // Crea la propiedad 'id'
        delete ret._id;   // Elimina el '_id' con guion bajo
        }
    }
});

// Modelo de Mongoose
const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

// Exportar el modelo
module.exports = Product;