import { useState, useEffect } from 'react';

// Componentes de React Router para gestionar la navegación.
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from 'react-router-dom';

// Componentes de la aplicación.
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ContactForm from './components/ContactForm';
import ProductList from './components/ProductList';
import ProductDetail from './components/ProductDetail';
import ProductForm from './components/ProductForm';
import Carrito from './components/Carrito';


// Muestra el mensaje de éxito que se envía al redirigir con useNavigate
// después de crear, editar o eliminar un producto, y lo oculta solo a los pocos segundos.
function MensajeExito() {
  const location = useLocation();
  const navigate = useNavigate();

  // El mensaje viaja en el estado de la navegación (si no hay, vale undefined).
  const mensaje = location.state?.mensaje;

  useEffect(() => {
    // Si no hay mensaje, no hay nada que programar.
    if (!mensaje) return;

    // Después de 4 segundos, se reemplaza la entrada actual del historial
    // por la misma ruta pero sin estado. Eso borra el mensaje de pantalla
    // y evita que reaparezca al recargar la página (F5).
    const temporizador = setTimeout(() => {
      navigate(location.pathname, { replace: true, state: null });
    }, 4000);

    // Si el usuario cambia de página antes de los 4 segundos,
    // se cancela el temporizador pendiente para no dejarlo colgado.
    return () => clearTimeout(temporizador);
    // location.key cambia en cada navegación, así que el tiempo se reinicia
    // si llega un mensaje nuevo mientras todavía se mostraba otro.
  }, [mensaje, location.key, location.pathname, navigate]);

  // La clase "mensaje-exito" define cómo se ve y dónde aparece el aviso.
  return mensaje ? (
    <p className="mensaje-exito" role="status">
      {mensaje}
    </p>
  ) : null;
}

function App() {
  // Guarda los productos agregados al carrito durante la sesión.
  const [carrito, setCarrito] = useState([]);

  // Agrega un producto al carrito sin modificar el estado anterior.
  const agregarAlCarrito = (producto) => {
    setCarrito((actual) => [...actual, producto]);
  };

  // Elimina del carrito el producto ubicado en la posición indicada.
  const eliminarDelCarrito = (indice) => {
    setCarrito((actual) => actual.filter((_, i) => i !== indice));
  };

  return (
    // BrowserRouter habilita la navegación mediante las URLs del navegador.
    <BrowserRouter>
      {/* La barra de navegación está presente en todas las páginas. */}
      <Navbar items={carrito} />

      <main>
        <MensajeExito />

        {/* Routes muestra la ruta que mejor coincide con la URL actual. */}
        <Routes>
          {/* Ruta 1: página de inicio. */}
          <Route
            path="/"
            element={
              <>
                <h2>Bienvenidos a nuestra mueblería</h2>
                <p>Descubrí nuestros muebles.</p>
              </>
            }
          />

          {/* Ruta 2: catálogo con todos los productos disponibles. */}
          <Route
            path="/productos"
            element={<ProductList onAgregar={agregarAlCarrito} />}
          />

          {/* Ruta 3: detalle de un producto identificado por su _id. */}
          <Route
            path="/productos/:id"
            element={<ProductDetail onAgregar={agregarAlCarrito} />}
          />

          {/* Ruta 4: carrito con los productos seleccionados. */}
          <Route
            path="/carrito"
            element={
              <Carrito items={carrito} onEliminar={eliminarDelCarrito} />
            }
          />

          {/* Ruta 5: formulario de contacto. */}
          <Route path="/contacto" element={<ContactForm />} />

          {/* Ruta 6: alta de producto (POST). */}
          {/* Ruta 7: edición de producto (PUT), reutiliza el mismo formulario. */}
          {/* Cada una tiene su key para que, al pasar de editar a crear, el formulario arranque vacío. */}
          <Route
            path="/admin/crear-producto"
            element={<ProductForm key="crear" />}
          />
          <Route
            path="/admin/editar-producto/:id"
            element={<ProductForm key="editar" />}
          />

          {/* Si la URL no coincide con ninguna ruta, vuelve al inicio. */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* El pie de página también se mantiene en todas las rutas. */}
      <Footer />
    </BrowserRouter>
  );
}

export default App;