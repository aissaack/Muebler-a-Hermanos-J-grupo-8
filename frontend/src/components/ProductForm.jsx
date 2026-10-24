import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || '';

// Mismos nombres de campo que el modelo Product del backend.
const FORM_VACIO = {
  nombre: '',
  descripcion: '',
  precio: '',
  stock: '',
  imagenUrl: '',
};

// ProductForm sirve para crear (/admin/crear-producto)
// y para editar (/admin/editar-producto/:id) un producto.
function ProductForm() {
  // Si la URL trae :id, el formulario está en modo edición.
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState(FORM_VACIO);
  const [loading, setLoading] = useState(Boolean(id));
  const [errorCarga, setErrorCarga] = useState(null);
  const [error, setError] = useState(null);
  const [enviando, setEnviando] = useState(false);

  // En modo edición, trae el producto y precarga el formulario con sus datos.
  useEffect(() => {
    if (!id) return;

    fetch(`${API_URL}/api/productos/${id}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error('No se encontró el producto a editar');
        }

        return res.json();
      })
      .then((producto) =>
        setForm({
          nombre: producto.nombre ?? '',
          descripcion: producto.descripcion ?? '',
          precio: producto.precio ?? '',
          stock: producto.stock ?? '',
          imagenUrl: producto.imagenUrl ?? '',
        })
      )
      .catch((err) => setErrorCarga(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  // Un solo manejador para todos los campos: usa el atributo name del input.
  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((actual) => ({ ...actual, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);

    // required no detecta un nombre con solo espacios.
    if (!form.nombre.trim()) {
      setError('El nombre es obligatorio');
      return;
    }

    // Los inputs devuelven texto, pero el backend espera precio y stock como números.
    const producto = {
      ...form,
      nombre: form.nombre.trim(),
      precio: Number(form.precio),
      stock: form.stock === '' ? undefined : Number(form.stock),
    };

    setEnviando(true);

    try {
      // Crear usa POST /api/productos; editar usa PUT /api/productos/:id.
      const res = await fetch(`${API_URL}/api/productos${id ? `/${id}` : ''}`, {
        method: id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(producto),
      });

      // El backend devuelve los errores como { message }.
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.message || 'No se pudo guardar el producto');
      }

      // Redirige al detalle del producto guardado y le pasa el mensaje de éxito.
      navigate(`/productos/${data._id}`, {
        state: {
          mensaje: id
            ? 'Producto actualizado correctamente'
            : 'Producto creado correctamente',
        },
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  };

  if (loading) return <p>Cargando producto...</p>;

  if (errorCarga) {
    return (
      <section>
        <p>Error: {errorCarga}</p>
        <Link to="/productos">Volver al catálogo</Link>
      </section>
    );
  }

  return (
    <section className="contacto-form">
      <h2>{id ? 'Editar producto' : 'Crear producto'}</h2>

      <form onSubmit={handleSubmit}>
        <label htmlFor="nombre">Nombre *</label>
        <input
          id="nombre"
          name="nombre"
          value={form.nombre}
          onChange={handleChange}
          required
        />

        <label htmlFor="descripcion">Descripción</label>
        <textarea
          id="descripcion"
          name="descripcion"
          value={form.descripcion}
          onChange={handleChange}
        />

        <label htmlFor="precio">Precio *</label>
        <input
          id="precio"
          name="precio"
          type="number"
          min="0.01"
          step="0.01"
          value={form.precio}
          onChange={handleChange}
          required
        />

        <label htmlFor="stock">Stock</label>
        <input
          id="stock"
          name="stock"
          type="number"
          min="0"
          step="1"
          value={form.stock}
          onChange={handleChange}
        />

        <label htmlFor="imagenUrl">Imagen (ruta o URL)</label>
        <input
          id="imagenUrl"
          name="imagenUrl"
          value={form.imagenUrl}
          onChange={handleChange}
          placeholder="/images/silla-nordica.jpg"
        />

        {error && <p role="alert">Error: {error}</p>}

        <button type="submit" className="boton" disabled={enviando}>
          {enviando ? 'Guardando...' : 'Guardar'}
        </button>
      </form>

      <Link to={id ? `/productos/${id}` : '/productos'}>Cancelar</Link>
    </section>
  );
}

export default ProductForm;
