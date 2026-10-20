import { useState, useEffect } from 'react';
import ProductCard from './ProductCard';

// ProductList consulta la API y muestra una tarjeta por producto.
// También administra los estados de carga, error y lista vacía.
function ProductList({ onAgregar }) {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Consulta los productos cuando se monta el componente.
  useEffect(() => {
    const API_URL = import.meta.env.VITE_API_URL || '';

    fetch(`${API_URL}/api/productos`)
      .then((res) => {
        // Si la respuesta no es correcta, mostramos un error.
        if (!res.ok) {
          throw new Error('No se pudieron cargar los productos');
        }

        return res.json();
      })
      .then((data) => {
        // Verificamos que la API devuelva una lista.
        if (!Array.isArray(data)) {
          throw new Error('La respuesta de la API no es válida');
        }

        setProductos(data);
      })
      .catch((err) => setError(err.message))
      // Finaliza la carga tanto si la consulta funciona como si falla.
      .finally(() => setLoading(false));
  }, []);

  // Mensajes para los distintos estados de la consulta.
  if (loading) return <p>Cargando productos...</p>;
  if (error) return <p>Error: {error}</p>;
  if (productos.length === 0) {
    return <p>No hay productos disponibles.</p>;
  }

  return (
    <section className="galeria-productos">
      {productos.map((producto) => (
        <ProductCard
          key={producto._id}
          id={producto._id}
          nombre={producto.nombre}
          precio={producto.precio}
          imagenUrl={producto.imagenUrl}
          onAgregar={() => onAgregar(producto)}
        />
      ))}
    </section>
  );
}

export default ProductList;