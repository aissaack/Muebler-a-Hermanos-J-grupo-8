# AGENTS.md — Backend de Mueblería Hermanos Jota

## Qué es este proyecto
API REST de un e-commerce de muebles. Express + MongoDB (Atlas) con Mongoose.
El frontend (React, en /frontend) consume esta API.

## Stack (no cambiar versiones ni agregar librerías sin pedirlo)
- Node 24 · Express 5 · Mongoose 9 · CommonJS (`require` / `module.exports`). No se usa `import`.
- Variables de entorno con dotenv, que ya está instalado. No agregar otras librerías.
- El servidor se arranca con `npm run dev` (nodemon sobre server.js).
- Pruebas: `node --test` (sin Jest, sin Mocha). Se corren con `npm test`.

## Estructura
- `server.js`: arma la app, middlewares, routers, 404 y manejador de errores.
- `config/db.js`: conexión a MongoDB (server.js la llama con connectDB). No se toca la conexión.
- `models/`: un archivo por modelo (Product.js, Categoria.js, ...). Un solo modelo por recurso.
  Nunca definir modelos en data/ ni en routes/.
- `routes/`: un router de Express por recurso, con el nombre `<recurso>Routes.js`
  (productosRoutes.js). No hay controllers/: la lógica de base de datos va en routes, nunca en server.js.
- `data/`: solo datos (productosSeed.js). Nunca definir modelos ahí.
- `seed.js`: carga datos iniciales. Se ejecuta con `npm run seed`.
- `docs/` y `tests/`: la spec y las pruebas del contrato. No se modifican.

## Equivalencias con docs/spec-categorias.md
La spec usa nombres genéricos. En este proyecto significan:
- `index.js` → `server.js`
- `routes/categorias.js` → `routes/categoriasRoutes.js` (se monta en server.js como `/api/categorias`)
- "manejador central de errores" → el middleware de errores del final de server.js
Ante cualquier otra diferencia entre la spec y este archivo, no decidas solo: preguntá.

## Reglas de la API
- Rutas bajo `/api/<recurso-en-plural>`.
- Errores SIEMPRE con la forma `{ "error": "mensaje en español", "message": "el mismo mensaje" }`.
  `message` se mantiene porque el frontend lo lee.
- Códigos: 200 ok · 201 creado · 400 datos inválidos o id mal formado ·
  404 id con formato válido que no existe · 409 duplicado · 500 error del servidor.
- Los errores se traducen en el manejador central de server.js. Hoy solo usa `err.status` y
  responde `{ message }`. Se extiende en la Fase 2 de la spec, no antes: tiene que agregar la
  clave `error` SIN quitar `message`, y traducir ValidationError → 400, CastError → 400 y
  código 11000 → 409. Las rutas nuevas no repiten esa lógica: dejan pasar el error y el manejador lo traduce.
  Las rutas que ya existen no se reescriben.
- Si una ruta tiene que rechazar algo por su cuenta (por ejemplo, una categoría que no existe),
  crea un Error con la propiedad `status` y lo lanza o lo pasa con `next(error)`, como las rutas actuales.
  El manejador central arma la respuesta.
- Nombres de campos en español, como el modelo Product: nombre, descripcion, precio, stock, imagenUrl.

## Límites negativos (lo que NO hay que hacer)
- NO agregar try/catch nuevos en las rutas: Express 5 manda solo los errores de rutas async al manejador.
  Las rutas que ya existen no se reescriben.
- NO usar `{ new: true }` en findByIdAndUpdate: está deprecado en Mongoose 9. Usar `returnDocument: 'after'` y `runValidators: true`.
- NO devolver 500 cuando un recurso no existe: es 404.
- NO poner rutas fijas (ej. `/ofertas`) después de `/:id` en un router: Express tomaría "ofertas" como id.
- NO escribir el connection string en el código ni tocar el archivo .env.
- NO ejecutar `npm run seed:prod` ni apuntar a la base de producción. Todo se prueba contra la base de desarrollo.
- NO cambiar nombres de campos ni de rutas que ya existen: el frontend depende de ellos.
- NO modificar nada de /frontend.
- NO modificar tests/ ni docs/ para hacer pasar las pruebas: se arregla el código, no las pruebas.
- NO modificar archivos fuera de lo que pide cada tarea. Si hace falta, preguntar primero.

## Cómo trabajar
- Una tarea por vez. Al terminar cada una, listar qué archivos cambiaste y por qué.
- Si cambiás seed.js, mantené la protección que impide correrlo contra producción sin `--prod`.
  Si el seed carga categorías, tiene que borrarlas antes de cargarlas (el nombre es único),
  igual que ya hace con los productos.
- Antes de dar algo por terminado: `npm test` tiene que pasar (con el servidor prendido).