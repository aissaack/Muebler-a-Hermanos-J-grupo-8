# Mueblería Hermanos Jota — E-commerce (Sprint 3 y 4)

Aplicación cliente-servidor desarrollada como proyecto final de los Sprints 3 y 4 del curso Full Stack Developer (MERN). El frontend fue reconstruido desde cero con **React**, consumiendo una **API REST propia** construida con **Node.js y Express**.

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
/backend   → API REST con Node.js y Express
/frontend  → Aplicación cliente con React (Vite)
```

### Backend — Express

- Datos de productos servidos desde un archivo `.js` local (array de objetos).
- `GET /api/productos` → listado completo en JSON.
- `GET /api/productos/:id` → producto por id, 404 si no existe.
- Middleware global de logging (método y URL de cada petición).
- Middleware `express.json()` para futuras peticiones POST.
- Rutas organizadas con `express.Router`.
- Manejador de rutas no encontradas (404) y manejador de errores centralizado.
- CORS habilitado para permitir peticiones desde el frontend desplegado en un dominio distinto.

### Frontend — React

- Componentes: `Navbar`, `Footer`, `ProductCard`, `ProductList`, `ProductDetail`, `ContactForm`, `Carrito`.
- Fetch a `GET /api/productos` con manejo de estados de carga y error.
- Renderizado de listas con `.map()` y `key`.
- Navegación entre vistas (Inicio, Carrito, Contacto) mediante renderizado condicional basado en estado, sin librerías de ruteo adicionales.
- Carrito de compras como estado en `App.js`, con contador y total pasados por props al `Navbar`.
- Formulario de contacto controlado con `useState`.

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
npm run dev
```

El servidor queda disponible en `http://localhost:3000`. Podés verificarlo visitando `http://localhost:3000/api/productos`.

### 3. Frontend

En otra terminal:

```bash
cd frontend
npm install
npm run dev
```

La aplicación queda disponible en `http://localhost:5173`. En desarrollo, el frontend se comunica con el backend a través del proxy configurado en Vite (`vite.config.js`), por lo que no es necesario configurar ninguna variable de entorno para correr el proyecto en local.

### Variables de entorno (solo producción)

En producción, el frontend necesita saber la URL pública del backend, ya que ambos quedan desplegados en dominios distintos. Esto se configura mediante la variable `VITE_API_URL` en el entorno de despliegue (Vercel):

```
VITE_API_URL=https://muebleria-hermanos-jota-backend-514j.onrender.com
```

## Estructura de ramas

El proyecto utiliza ramas pensadas para representar **áreas permanentes del sistema**, reutilizables a lo largo de todo el curso (no solo para Sprint 3 y 4), con `develop` como rama de integración y `main` como rama de entrega.

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
Todo lo relacionado con la API y los datos del backend: datos de productos, rutas (`GET /api/productos`, `GET /api/productos/:id` y futuros endpoints), y lógica de obtención/filtrado de productos.

```
backend/
├── data/
│   └── productos.js
└── routes/
    └── productosRoutes.js
```


### `feature/backend-core`
Infraestructura y comportamiento general del servidor Express: configuración de `server.js`, `express.json()`, logger global, middleware de 404, manejador de errores centralizado y futuras configuraciones generales del backend.

Separar `backend-api` de `backend-core` evita que una sola rama concentre todo el backend.


### `feature/react-layout`
Estructura visual y componentes generales de React: configuración inicial de `/frontend`, estructura general de `App.jsx`, `Navbar`, `Footer`, `ContactForm`, estilos generales, layout y navegación.


### `feature/react-products`
Todo lo relacionado con mostrar y consultar productos desde React: `ProductCard`, `ProductList`, `ProductDetail`, fetch de productos, estados de carga/error, `.map()` con `key`, renderizado condicional y consumo de nuevos endpoints de productos.

```
frontend/src/components/
├── ProductCard.jsx
├── ProductList.jsx
└── ProductDetail.jsx
```


### `feature/react-state`
Estado global/de aplicación y comportamiento que conecta componentes: `useState`, carrito, contador del carrito, props entre componentes, eventos de agregar/eliminar productos, e integración de estado entre `App`, `Navbar` y `ProductList`.


## Decisiones técnicas y de arquitectura

- **Renderizado condicional en vez de React Router:** la navegación entre Inicio, Carrito y Contacto se resolvió con un estado de "vista" en `App.jsx`, evitando agregar una librería de ruteo adicional. Esto está alineado con los objetivos de aprendizaje del sprint (renderizado condicional) y simplifica el proyecto para el nivel del curso.
- **CORS:** como el frontend y el backend quedan desplegados en dominios distintos (Vercel y Render respectivamente), fue necesario habilitar CORS en el backend para que el navegador permita las peticiones entre ambos orígenes.
- **Migración del repositorio:** este repositorio es una migración completa (con historial de commits de todos los integrantes preservado) del repositorio original del proyecto, realizada para poder configurar el despliegue en Vercel y Render con los permisos de administración necesarios.
- **Despliegue separado:** se optó por desplegar el backend y el frontend en servicios distintos (Render y Vercel respectivamente), ya que GitHub Pages solo permite servir contenido estático y no puede ejecutar un servidor Node/Express.
