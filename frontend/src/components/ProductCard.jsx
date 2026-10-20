import { Link } from 'react-router-dom';

// ProductCard presenta los datos de un producto.
// Recibe el identificador, los datos visibles y la función del carrito.
function ProductCard({ id, nombre, precio, imagenUrl, onAgregar }) {
  return (
    <article className="product-card">
      <img src={imagenUrl} alt={nombre} />

      <h3>{nombre}</h3>

      <p>
        {precio !== undefined
          ? `$${precio.toLocaleString('es-AR')}`
          : 'Consultar precio'}
      </p>

      {/* Permite acceder al detalle del producto seleccionado. */}

      <Link className="detalle-link" to={`/productos/${id}`}>
        Ver detalle
      </Link>

      {/* El botón conserva la funcionalidad del carrito. */}
      <button className="boton" onClick={onAgregar}>
        Agregar al carrito
      </button>
    </article>
  );
}

export default ProductCard;