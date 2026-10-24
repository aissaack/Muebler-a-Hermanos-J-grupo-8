import { useState } from 'react';

const FORM_VACIO = { nombre: '', email: '', mensaje: '' };

// Formulario de contacto controlado: un solo estado para todos los campos.
function ContactForm() {
  const [form, setForm] = useState(FORM_VACIO);
  const [error, setError] = useState(null);
  // Datos del último envío, para mostrar la confirmación.
  const [enviado, setEnviado] = useState(null);

  // Un solo manejador para todos los campos: usa el atributo name del input.
  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((actual) => ({ ...actual, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setError(null);
    setEnviado(null);

    // required y minLength no detectan campos con solo espacios.
    if (!form.nombre.trim()) {
      setError('Ingresá tu nombre');
      return;
    }

    if (form.mensaje.trim().length < 10) {
      setError('El mensaje debe tener al menos 10 caracteres');
      return;
    }

    // La API no tiene endpoint de contacto: se confirma el envío y se limpia el formulario.
    setEnviado({ nombre: form.nombre.trim(), email: form.email });
    setForm(FORM_VACIO);
  };

  return (
    <section className="contacto-form">
      <h2>Contacto</h2>

      {enviado && (
        <p role="status">
          ¡Gracias, {enviado.nombre}! Recibimos tu mensaje y te vamos a
          responder a {enviado.email}.
        </p>
      )}

      <form onSubmit={handleSubmit}>
        <label htmlFor="nombre">Nombre</label>
        <input
          id="nombre"
          name="nombre"
          value={form.nombre}
          onChange={handleChange}
          required
        />

        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          required
        />

        <label htmlFor="mensaje">Mensaje</label>
        <textarea
          id="mensaje"
          name="mensaje"
          value={form.mensaje}
          onChange={handleChange}
          minLength={10}
          required
        />

        {error && <p role="alert">Error: {error}</p>}

        <button type="submit" className="boton">
          Enviar
        </button>
      </form>
    </section>
  );
}

export default ContactForm;
