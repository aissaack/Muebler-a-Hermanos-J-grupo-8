// frontend/src/components/Navbar.jsx

import { Link } from 'react-router-dom';

// Barra de navegación: permite acceder a las páginas y consultar el carrito.
// Recibe items, el array con los productos agregados al carrito.
function Navbar({ items }) {
  // Suma los precios de todos los productos del carrito.
  const total = items.reduce((acc, item) => acc + item.precio, 0);

  return (
    <header>
      <nav>
        <h1>Mueblería Hermanos Jota</h1>

        {/* Link cambia de ruta sin recargar toda la página. */}
        <ul>
          <li>
            <Link className="link-nav" to="/">Inicio</Link>
          </li>
          <li>
            <Link className="link-nav" to="/productos">Productos</Link>
          </li>
          <li>
            <Link className="link-nav" to="/contacto">Contacto</Link>
          </li>
          {/* Acceso al formulario de alta de productos (ruta /admin/crear-producto). */}
          <li>
            <Link className="link-nav" to="/admin/crear-producto">Crear producto</Link>
          </li>
        </ul>

        {/* Muestra la cantidad de productos y el importe total del carrito. */}
        <Link className="boton carrito-boton" to="/carrito">
          🛒 Carrito ({items.length}) — $
          {total.toLocaleString('es-AR')}
        </Link>
      </nav>
    </header>
  );
}

export default Navbar;