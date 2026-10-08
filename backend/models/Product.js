// Importamos la librería mongoose para definir el esquema y el modelo
const mongoose = require('mongoose');

// Definimos la estructura (Schema) que tendrán los documentos de productos en MongoDB
const productSchema = new mongoose.Schema({
  // Nombre del producto (Texto obligatorio)
    nombre: { 
    type: String, 
    required: true 
},

  // Descripción detallada del producto (Texto opcional)
    descripcion: { 
    type: String 
},

  // Precio del producto (Número obligatorio)
    precio: { 
    type: Number, 
    required: true 
},

  // Cantidad disponible en inventario (Número opcional)
    stock: { 
    type: Number 
},

  // Enlace o ruta de la imagen del producto (Texto opcional)
    imagenUrl: { 
    type: String 
},
});

// Creamos y exportamos el modelo 'Product' basado en el esquema anterior.
// Mongoose buscará o creará automáticamente la colección 'products' en la base de datos.
module.exports = mongoose.model('Product', productSchema);