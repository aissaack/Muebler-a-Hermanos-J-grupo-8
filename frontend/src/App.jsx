import { useState } from 'react';

// Componentes de React Router para gestionar la navegación.
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';

// Componentes de la aplicación.
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ContactForm from './components/ContactForm';
import ProductList from './components/ProductList';
import ProductDetail from './components/ProductDetail';
import Carrito from './components/Carrito';

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