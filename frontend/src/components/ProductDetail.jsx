import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || '';

// ProductDetail obtiene el ID de la URL y consulta el producto correspondiente.
function ProductDetail() {
  // Extrae el parámetro definido en la ruta /productos/:id (es el _id del producto).
  const { id } = useParams();

  const [producto, setProducto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [errorEliminar, setErrorEliminar] = useState(null);
  const navigate = useNavigate();

  // Pide confirmación, elimina el producto (DELETE) y vuelve al catálogo.
  const eliminarProducto = async () => {
    if (!window.confirm(`¿Seguro que querés eliminar "${producto.nombre}"?`)) {
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/productos/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.message || 'No se pudo eliminar el producto');
      }

      navigate('/productos', {
        state: { mensaje: 'Producto eliminado correctamente' },
      });
    } catch (err) {
      setErrorEliminar(err.message);
    }
  };

  // Consulta nuevamente cuando cambia el identificador de la URL.
  useEffect(() => {
    setLoading(true);
    setError(null);
    setProducto(null);

    fetch(`${API_URL}/api/productos/${id}`)
      .then((res) => {
        // 404 o 400 (id mal formado) significan que el producto no existe.
        if (res.status === 404 || res.status === 400) {
          throw new Error('Producto no encontrado');
        }

        if (!res.ok) {
          throw new Error('No se pudo cargar el producto');
        }

        return res.json();
      })
      .then((data) => setProducto(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  // Estados de carga y error.
  if (loading) return <p>Cargando producto...</p>;

  if (error) {
    return (
      <section>
        <p>{error}</p>
        <Link to="/productos">Volver al catálogo</Link>
      </section>
    );
  }

  // Evita intentar mostrar datos si la respuesta está vacía.
  if (!producto) {
    return <p>Producto no encontrado.</p>;
  }

  return (
    <article className="product-detail">
      <img src={producto.imagenUrl} alt={producto.nombre} />

      <h2>{producto.nombre}</h2>

      <p>
        {producto.precio !== undefined
          ? `$${producto.precio.toLocaleString('es-AR')}`
          : 'Consultar precio'}
      </p>

      {/* Acciones de administración: editar (PUT) y eliminar (DELETE). */}
      <p>
        <Link className="boton" to={`/admin/editar-producto/${producto._id}`}>
          Editar
        </Link>{' '}
        <button className="boton" onClick={eliminarProducto}>
          Eliminar
        </button>
      </p>

      {errorEliminar && <p role="alert">Error: {errorEliminar}</p>}

      <Link to="/productos">Volver al catálogo</Link>
    </article>
  );
}

export default ProductDetail;