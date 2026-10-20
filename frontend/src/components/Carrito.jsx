// Carrito: muestra los productos agregados y permite eliminarlos.
// Recibe items (array) y onEliminar (función) por props.
function Carrito({ items, onEliminar }) {
  if (items.length === 0) return <p>El carrito está vacío.</p>;

  const total = items.reduce((acc, item) => acc + item.precio, 0);

  return (
    <section className="carrito-detalle">
      <h2>Tu carrito</h2>
      <ul>
        {items.map((item, index) => (
          <li key={`${item._id}-${index}`} className="carrito-item">
            <span>{item.nombre}</span>
            <span>${item.precio.toLocaleString('es-AR')}</span>
            <button className="boton" onClick={() => onEliminar(index)}>Eliminar</button>
          </li>
        ))}
      </ul>
      <p className="carrito-total">
        <strong>Total: ${total.toLocaleString('es-AR')}</strong>
      </p>
    </section>
  );
}

export default Carrito;