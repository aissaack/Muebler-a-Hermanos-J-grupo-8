import { createContext, useCallback, useContext, useEffect, useState } from 'react';

const AuthContext = createContext(null);
const API_URL = import.meta.env.VITE_API_URL || '';
const CLAVE = 'muebleria_token';

function vencimiento(token) {
  try {
    const parte = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(parte)).exp * 1000 || 0;
  } catch {
    return 0;
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => sessionStorage.getItem(CLAVE));
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(Boolean(token));

  const cerrarSesion = useCallback(() => {
    sessionStorage.removeItem(CLAVE);
    setToken(null);
    setUsuario(null);
    setCargando(false);
  }, []);

  const iniciarSesion = (nuevoToken, nuevoUsuario) => {
    sessionStorage.setItem(CLAVE, nuevoToken);
    setCargando(true);
    setUsuario(nuevoUsuario);
    setToken(nuevoToken);
  };

  useEffect(() => {
    if (!token) return;
    const demora = vencimiento(token) - Date.now();
    if (demora <= 0) {
      cerrarSesion();
      return;
    }
    const controlador = new AbortController();
    const temporizador = setTimeout(cerrarSesion, demora);
    fetch(`${API_URL}/api/usuarios/perfil`, {
      headers: { Authorization: `Bearer ${token}` }, signal: controlador.signal,
    }).then(async (res) => {
      if (res.status === 401) return cerrarSesion();
      if (!res.ok) throw new Error('No se pudo verificar la sesión');
      setUsuario(await res.json());
      setCargando(false);
    }).catch((error) => {
      if (error.name !== 'AbortError') cerrarSesion();
    });
    return () => { controlador.abort(); clearTimeout(temporizador); };
  }, [token, cerrarSesion]);

  const fetchAutenticado = async (url, opciones = {}) => {
    const headers = new Headers(opciones.headers);
    if (token) headers.set('Authorization', `Bearer ${token}`);
    const respuesta = await fetch(url, { ...opciones, headers });
    if (respuesta.status === 401) cerrarSesion();
    return respuesta;
  };

  return <AuthContext.Provider value={{ usuario, cargando, iniciarSesion, cerrarSesion, fetchAutenticado }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
