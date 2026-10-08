// Navbar: barra superior con el título y el contador del carrito.
// Recibe cantidad (número de productos en el carrito) por props.
import { useState } from 'react';
import Carrito from './Carrito';

// Navbar: barra superior con el título, navegación y el carrito desplegable.
// Recibe items (array del carrito) y onEliminar (función) por props.
function Navbar({ items, onEliminar, vista, setVista }) {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const total = items.reduce((acc, item) => acc + item.precio, 0);

  const irA = (nuevaVista) => {
    setVista(nuevaVista);
    setMenuAbierto(false); // Cierra el menú al hacer clic en una opción
  };

  return (
    <header>
      <nav className="navbar-container">
        {/* Costado Izquierdo: Botón Hamburguesa (solo visible en celular) */}
        <button 
          className="menu-hamburguesa"
          onClick={() => setMenuAbierto(!menuAbierto)}
          aria-label="Abrir menú"
        >
          {menuAbierto ? '✕' : '☰'}
        </button>

        {/* Título Central */}
        <h1 onClick={() => irA('inicio')} style={{ cursor: 'pointer' }}>
          Mueblería Hermanos Jota
        </h1>

        {/* Enlaces de Navegación (se despliegan al presionar el menú) */}
        <ul className={`nav-links ${menuAbierto ? 'nav-links-abierto' : ''}`}>
          <li>
            <button className="link-nav" onClick={() => irA('inicio')}>
              Inicio
            </button>
          </li>
          <li>
            <button className="link-nav" onClick={() => irA('inicio')}>
              Productos
            </button>
          </li>
          <li>
            <button className="link-nav" onClick={() => irA('contacto')}>
              Contacto
            </button>
          </li>
        </ul>

        {/* Costado Derecho: Botón Carrito */}
        <div className="carrito-wrapper">
          <button
            className="boton carrito-boton"
            onClick={() => irA('carrito')}
          >
            🛒 <span className="carrito-texto">Carrito ({items.length}) — ${total.toLocaleString('es-AR')}</span>
            <span className="carrito-icono-movil">({items.length})</span>
          </button>
        </div>
      </nav>
    </header>
  );
}

export default Navbar;