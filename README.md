# Mueblería Hermanos Jota — E-commerce (Sprint 5 y 6)

Aplicación full stack (MERN) desarrollada en el curso Full Stack Developer. El frontend en **React** consume una **API REST propia** hecha con **Node.js y Express**, que guarda los productos en **MongoDB Atlas** usando **Mongoose**. La aplicación permite crear, ver, editar y eliminar productos (CRUD completo).

## Integrantes

- Florencia Vilacahua
- Gonzalo Olima
- Isaac Alvarez
- Maximo Fox
- Sofia Belen Gomez German

## Demo en producción

- **Frontend (Vercel):** https://muebleria-hermanos-jota-frontend.vercel.app
- **Backend (Render):** https://muebleria-hermanos-jota-backend-514j.onrender.com

> ⚠️ El backend está desplegado en el plan gratuito de Render, que "duerme" el servidor tras un período de inactividad. La primera petición después de un tiempo sin uso puede tardar entre 30 y 50 segundos en responder mientras el servicio se reactiva.

## Arquitectura del proyecto

```
React (Vercel)  ⇄  Express API (Render)  ⇄  MongoDB Atlas
```

```
/backend   → API REST con Node.js, Express y Mongoose
/frontend  → Aplicación cliente con React (Vite) y React Router
```

### Backend — Express + MongoDB

- Conexión a MongoDB Atlas con Mongoose (`config/db.js`), configurada con variables de entorno.
- Modelo `Product` (`models/Product.js`):

| Campo | Tipo | Obligatorio |
|---|---|---|
| `nombre` | String | Sí |
| `descripcion` | String | No |
| `precio` | Number | Sí |
| `stock` | Number | No |
| `imagenUrl` | String | No |

- Endpoints (`routes/productosRoutes.js`):

| Método | Ruta | Descripción | Respuestas |
|---|---|---|---|
| GET | `/api/productos` | Devuelve todos los productos | 200 |
| GET | `/api/productos/:id` | Devuelve un producto por `_id` | 200 · 400 id inválido · 404 |
| POST | `/api/productos` | Crea un producto | 201 · 400 datos inválidos |
| PUT | `/api/productos/:id` | Actualiza un producto | 200 · 400 · 404 |
| DELETE | `/api/productos/:id` | Elimina un producto | 200 · 400 · 404 |

  Los errores se responden como `{ "message": "..." }`.
- Middleware global de logging, `express.json()`, rutas con `express.Router`, 404 para rutas inexistentes y manejador de errores centralizado.
- CORS limitado al frontend desplegado mediante la variable `CLIENT_URL`.
- Script `seed.js` para cargar los productos iniciales en la base.

### Frontend — React

- Navegación con **React Router DOM**:

| Ruta | Página |
|---|---|
| `/` | Inicio |
| `/productos` | Catálogo |
| `/productos/:id` | Detalle del producto (`useParams`) |
| `/contacto` | Formulario de contacto |
| `/carrito` | Carrito |
| `/admin/crear-producto` | Alta de producto |
| `/admin/editar-producto/:id` | Edición de producto |

- Catálogo y detalle consumen la API con `fetch`, con estados de carga y error.
- Formulario controlado para crear y editar productos (POST y PUT), con validaciones, mensajes de éxito o error y redirección con `useNavigate`.
- Eliminación de productos desde el detalle, con confirmación (DELETE).
- Formulario de contacto controlado, con validaciones y mensaje de confirmación.
- Carrito de compras como estado en `App.jsx`, con contador y total en el `Navbar`.

## Instalación y ejecución en local

El proyecto requiere correr **dos servidores en simultáneo**: el backend (API) y el frontend (interfaz).

### 1. Clonar el repositorio

```bash
git clone https://github.com/aissaack/Muebler-a-Hermanos-J-grupo-8.git
cd Muebler-a-Hermanos-J-grupo-8
```

### 2. Backend

```bash
cd backend
npm install
```

Crear el archivo `backend/.env` copiando `backend/.env.example` y completar `MONGODB_URI` (ver [Variables de entorno](#variables-de-entorno)). Después:

```bash
npm run seed
npm run dev
```

- `npm run seed` (opcional) borra los productos de la base a la que apunta el `.env` y carga los 6 productos iniciales. Sirve para dejar la base de pruebas como al principio.
- `npm run seed:prod` es solo para cargar la base de producción; no usarlo en desarrollo.

El servidor queda disponible en `http://localhost:3000`. Podés verificarlo visitando `http://localhost:3000/api/productos`.

### 3. Frontend

En otra terminal:

```bash
cd frontend
npm install
npm run dev
```

La aplicación queda disponible en `http://localhost:5173`. En desarrollo, el frontend se comunica con el backend a través del proxy configurado en Vite (`vite.config.js`), por lo que no hace falta configurar variables de entorno en el frontend.

## Variables de entorno

Los archivos `.env` **nunca se suben al repositorio** (están en `.gitignore`). Solo se suben los `.env.example`, que muestran qué variables hacen falta.

### Backend — `backend/.env` (en Render: *Environment*)

| Variable | Ejemplo | Descripción |
|---|---|---|
| `PORT` | `3000` | Puerto del servidor en local. En Render no se carga: lo asigna Render. |
| `MONGODB_URI` | `mongodb+srv://USUARIO:CONTRASEÑA@cluster0.xxxxx.mongodb.net/muebleria_dev?appName=Cluster0` | Cadena de conexión de MongoDB Atlas. Incluye el nombre de la base: `muebleria_dev` para pruebas, `muebleria` para producción. |
| `CLIENT_URL` | `https://muebleria-hermanos-jota-frontend.vercel.app` | Origen permitido por CORS, sin `/` al final. Si queda vacía, se acepta cualquier origen (útil en local). |

### Frontend — `frontend/.env` (en Vercel: *Environment Variables*)

| Variable | Ejemplo | Descripción |
|---|---|---|
| `VITE_API_URL` | `https://muebleria-hermanos-jota-backend-514j.onrender.com` | URL pública del backend, sin `/` al final. En local se deja vacía (se usa el proxy de Vite). Vite la incorpora al compilar: si se cambia en Vercel, hay que volver a desplegar. |

## Despliegue

- **Backend en Render:** directorio raíz `backend`, comando de build `npm install` y de inicio `npm start`. Variables: `MONGODB_URI` (base de producción) y `CLIENT_URL` (URL de Vercel). En MongoDB Atlas, *Network Access* debe permitir `0.0.0.0/0`, porque Render no tiene una IP fija en el plan gratuito.
- **Frontend en Vercel:** directorio raíz `frontend`, framework Vite. Variable: `VITE_API_URL` (URL de Render). El archivo `frontend/vercel.json` redirige todas las rutas a `index.html`, para que React Router funcione al recargar la página o al abrir un enlace directo (por ejemplo `/productos/:id`).

## Estructura de ramas

El proyecto utiliza ramas pensadas para representar **áreas permanentes del sistema**, reutilizables a lo largo de todo el curso, con `develop` como rama de integración y `main` como rama de entrega.

```
main
└── develop
    ├── feature/backend-api
    ├── feature/backend-core
    ├── feature/react-layout
    ├── feature/react-products
    └── feature/react-state
```

### `feature/backend-api`
Todo lo relacionado con la API y los datos del backend: rutas del CRUD de productos (`GET`, `POST`, `PUT`, `DELETE` en `/api/productos`) y validaciones de los datos recibidos.

```
backend/
└── routes/
    └── productosRoutes.js
```


### `feature/backend-core`
Infraestructura y comportamiento general del servidor Express: configuración de `server.js`, conexión a MongoDB, modelo `Product`, script de seed, `express.json()`, logger global, middleware de 404 y manejador de errores centralizado.

```
backend/
├── config/
│   └── db.js
├── data/
│   └── productosSeed.js
├── models/
│   └── Product.js
└── seed.js
```

Separar `backend-api` de `backend-core` evita que una sola rama concentre todo el backend.


### `feature/react-layout`
Estructura visual y componentes generales de React: estructura general de `App.jsx`, `Navbar`, `Footer`, `ContactForm`, estilos generales, layout, configuración de despliegue y documentación.


### `feature/react-products`
Todo lo relacionado con mostrar y consultar productos desde React: `ProductCard`, `ProductList`, `ProductDetail`, fetch de productos, estados de carga/error y ruteo del catálogo y el detalle.

```
frontend/src/components/
├── ProductCard.jsx
├── ProductList.jsx
└── ProductDetail.jsx
```


### `feature/react-state`
Estado de la aplicación y formularios que modifican datos: carrito, contador del carrito, y alta, edición y borrado de productos (`ProductForm`).


## Decisiones técnicas y de arquitectura

- **MongoDB Atlas + Mongoose:** la base está en la nube, así que no hace falta instalar MongoDB en cada computadora. Mongoose define un esquema para los productos y valida los campos obligatorios antes de guardarlos.
- **Base de pruebas separada de la de producción:** en desarrollo se usa `muebleria_dev`, compartida por el equipo, y la entrega usa `muebleria`. El script de seed se niega a modificar la base de producción si no se ejecuta con `--prod`.
- **React Router en vez de renderizado condicional:** en los Sprints 3 y 4 la navegación se resolvía con un estado de "vista" en `App.jsx`. Ahora cada página tiene su propia URL, lo que permite rutas dinámicas (`/productos/:id`), enlaces directos y el uso de los botones atrás/adelante del navegador.
- **CORS:** como el frontend y el backend quedan desplegados en dominios distintos (Vercel y Render), el backend habilita CORS solo para el origen definido en `CLIENT_URL`.
- **Migración del repositorio:** este repositorio es una migración completa (con historial de commits de todos los integrantes preservado) del repositorio original del proyecto, realizada para poder configurar el despliegue en Vercel y Render con los permisos de administración necesarios.
- **Despliegue separado:** se optó por desplegar el backend y el frontend en servicios distintos (Render y Vercel respectivamente), ya que GitHub Pages solo permite servir contenido estático y no puede ejecutar un servidor Node/Express.
