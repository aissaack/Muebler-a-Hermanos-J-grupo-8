import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

const API_URL = import.meta.env.VITE_API_URL || '';

export default function AuthForm({ registro = false }) {
  const [form, setForm] = useState({ nombre: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);
  const { iniciarSesion } = useAuth();
  const navigate = useNavigate();

  const enviar = async (event) => {
    event.preventDefault();
    setError('');
    setEnviando(true);
    try {
      const res = await fetch(`${API_URL}/api/usuarios/${registro ? 'registro' : 'login'}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registro ? form : { email: form.email, password: form.password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || data.error || 'No se pudo completar la solicitud');
      if (registro) navigate('/login', { state: { mensaje: 'Cuenta creada. Iniciá sesión.' } });
      else { iniciarSesion(data.token, data.usuario); navigate('/productos'); }
    } catch (err) { setError(err.message || 'No se pudo conectar con el servidor'); }
    finally { setEnviando(false); }
  };
  const cambiar = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  return <section className="contacto-form">
    <h2>{registro ? 'Crear cuenta' : 'Iniciar sesión'}</h2>
    <form onSubmit={enviar}>
      {registro && <><label htmlFor="nombre">Nombre</label><input id="nombre" name="nombre" value={form.nombre} onChange={cambiar} required /></>}
      <label htmlFor="email">Email</label><input id="email" name="email" type="email" autoComplete="email" value={form.email} onChange={cambiar} required />
      <label htmlFor="password">Contraseña</label><input id="password" name="password" type="password" autoComplete={registro ? 'new-password' : 'current-password'} value={form.password} onChange={cambiar} required />
      {error && <p role="alert">{error}</p>}
      <button className="boton" disabled={enviando}>{enviando ? 'Enviando...' : registro ? 'Registrarme' : 'Ingresar'}</button>
    </form>
    <Link to={registro ? '/login' : '/registro'}>{registro ? 'Ya tengo cuenta' : 'Crear cuenta'}</Link>
  </section>;
}
