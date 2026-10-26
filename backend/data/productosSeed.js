// backend/data/productosSeed.js
// Productos iniciales que carga el script seed.js en MongoDB.
// El "id" numérico se mantiene solo como referencia: MongoDB crea su propio _id.

const productos = [
    {
    id: 1,
    nombre: "Silla Nórdica",
    descripcion: "Silla de líneas simples en madera clara, ideal para comedor.",
    precio: 45000,
    stock: 12, // unidades disponibles (dato de ejemplo)
    imagenURL: "/images/silla-nordica.jpg"
},
{
    id: 2,
    nombre: "Mesa Ratona",
    descripcion: "Mesa baja para living con tapa de madera y patas de metal.",
    precio: 32000,
    stock: 8,
    imagenURL: "/images/Mesa-Ratona.jpg"
},
{
    id: 3,
    nombre: "Estantería Industrial",
    descripcion: "Estantería de estilo industrial con estructura de hierro y estantes de madera.",
    precio: 58000,
    stock: 5,
    imagenURL: "/images/Estantería-Industria.jpg"
},
{
    id: 4,
    nombre: "Sillon Oslo",
    descripcion: "Sillón de dos cuerpos tapizado, cómodo y de diseño escandinavo.",
    precio: 125000,
    stock: 3,
    imagenURL: "/images/Sillon-Oslo.jpg"
},
{
    id: 5,
    nombre: "Escritorio Nórdico",
    descripcion: "Escritorio amplio con cajón, pensado para home office.",
    precio: 98000,
    stock: 6,
    imagenURL: "/images/Escritorio-Nórdico.jpg"
},
{
    id: 6,
    nombre: "Biblioteca Moderna",
    descripcion: "Biblioteca de cinco estantes con diseño moderno y liviano.",
    precio: 87000,
    stock: 4,
    imagenURL: "/images/Biblioteca-Moderna.jpg"
}
];

// Exportamos el array para que lo use seed.js
module.exports = productos;