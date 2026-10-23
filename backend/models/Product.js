// backend/models/Product.js
// Modelo de Mongoose para los productos de la mueblería.

// Importamos mongoose para definir el esquema y el modelo
const mongoose = require('mongoose');

// El Schema define qué campos tiene un producto y de qué tipo es cada uno
const productSchema = new mongoose.Schema(
  {
    // Nombre del producto (texto, obligatorio)
    nombre: { type: String, required: true },

    // Descripción del producto (texto, opcional)
    descripcion: { type: String },

    // Precio del producto (número, obligatorio)
    precio: { type: Number, required: true },

    // Cantidad disponible en inventario (número, opcional)
    stock: { type: Number },

    // Ruta o enlace de la imagen del producto (texto, opcional)
    imagenUrl: { type: String },
  },
  {
    // Al convertir un producto a JSON (lo que devuelve la API),
    // se elimina el campo interno __v que agrega Mongoose
    toJSON: {
      transform: (doc, ret) => {
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Creamos el modelo "Product"; Mongoose usa la colección "products" en la base de datos
module.exports = mongoose.model('Product', productSchema);