// frontend/src/components/Home.jsx
// Página de inicio: presenta la mueblería y lleva al catálogo.

import { Link } from 'react-router-dom';

function Home() {
    return (
    <section className="inicio">
      {/* Bloque principal: título, descripción corta y botón al catálogo. */}
        <h2>Bienvenidos a Mueblería Hermanos Jota</h2>
        <p className="inicio-descripcion">
        Somos una mueblería que combina diseño y practicidad. Encontrá sillas,
        mesas, estanterías, sillones y escritorios para armar cada ambiente de
        tu casa o tu oficina.
        </p>

      {/* Link navega al catálogo sin recargar la página. */}
        <Link className="boton" to="/productos">
        Ver productos
        </Link>

      {/* Tres puntos destacados, uno por tarjeta. */}
        <div className="inicio-destacados">
        <article>
            <h3>Estilos para cada espacio</h3>
            <p>Líneas nórdicas, toques industriales y diseños modernos.</p>
        </article>

        <article>
            <h3>Muebles para todo el hogar</h3>
            <p>Living, comedor, escritorio y biblioteca en un solo lugar.</p>
        </article>

        <article>
            <h3>Compra simple</h3>
            <p>Armá tu carrito y mirá el total en todo momento.</p>
        </article>
        </div>
    </section>
    );
}

export default Home;