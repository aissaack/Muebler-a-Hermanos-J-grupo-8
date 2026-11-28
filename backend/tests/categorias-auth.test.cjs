// Sprint 7 y 8: categorías y productos con autenticación de administrador.
// Ejecutar en backend: npm run test:categorias-auth, con el servidor local en desarrollo.
// Configurar TEST_ADMIN_EMAIL y TEST_ADMIN_PASSWORD como variables del proceso.
// Comprueba creación, validación, filtros, populate y permisos; elimina solo sus datos.
// Usa la base muebleria_dev y verifica que la API local consulte esa misma base.
require('dotenv').config({ quiet: true });
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');
const mongoose = require('mongoose');
const Categoria = require('../models/Categoria');
const Product = require('../models/Product');

const API = 'http://127.0.0.1:3000/api';
const marca = `test-categorias-${randomUUID()}`;
let token;
let categoria;
let producto;

async function pedir(metodo, ruta, body, autenticado = false) {
  const headers = { 'Content-Type': 'application/json' };
  if (autenticado) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(API + ruta, { method: metodo, headers, ...(body !== undefined && { body: JSON.stringify(body) }) });
  return { status: res.status, datos: await res.json() };
}

before(async () => {
  assert.ok(process.env.TEST_ADMIN_EMAIL && process.env.TEST_ADMIN_PASSWORD, 'Configurar TEST_ADMIN_EMAIL y TEST_ADMIN_PASSWORD en el entorno del proceso');
  assert.ok(process.env.MONGODB_URI, 'Falta la conexión de desarrollo');
  await mongoose.connect(process.env.MONGODB_URI);
  assert.equal(mongoose.connection.name, 'muebleria_dev', 'La base debe ser muebleria_dev');

  // Se verifica la coincidencia con la API antes de crear datos mediante ella.
  const sonda = await Product.create({ nombre: marca, precio: 1 });
  const consulta = await pedir('GET', `/productos/${sonda._id}`);
  assert.equal(consulta.status, 200, 'La API local debe consultar la misma base de desarrollo');
  assert.equal(consulta.datos.nombre, marca, 'La API local no coincide con la base de desarrollo');

  const login = await pedir('POST', '/usuarios/login', { email: process.env.TEST_ADMIN_EMAIL, password: process.env.TEST_ADMIN_PASSWORD });
  assert.equal(login.status, 200, 'No se pudo iniciar sesión con el administrador de prueba');
  assert.equal(login.datos.usuario?.rol, 'admin', 'La cuenta de prueba debe ser administradora');
  assert.ok(login.datos.token, 'La API no devolvió un token');
  token = login.datos.token;
});

after(async () => {
  if (mongoose.connection.readyState === 1 && mongoose.connection.name === 'muebleria_dev') {
    await Product.deleteMany({ nombre: marca });
    await Categoria.deleteMany({ nombre: marca });
  }
  await mongoose.disconnect();
});

test('categorías: crear, listar, duplicado y nombre obligatorio', async () => {
  const creada = await pedir('POST', '/categorias', { nombre: marca });
  assert.equal(creada.status, 201);
  categoria = creada.datos;
  const lista = await pedir('GET', '/categorias');
  assert.equal(lista.status, 200);
  assert.ok(lista.datos.some((c) => c._id === categoria._id && c.nombre === marca));
  assert.equal((await pedir('POST', '/categorias', { nombre: marca })).status, 409);
  assert.equal((await pedir('POST', '/categorias', {})).status, 400);
});

test('productos: permisos y validación de categorías', async () => {
  assert.ok(categoria, 'La categoría de prueba debe existir');
  const cuerpo = { nombre: marca, precio: 1000, categoria: categoria._id };
  assert.equal((await pedir('POST', '/productos', cuerpo)).status, 401);
  assert.equal((await pedir('DELETE', `/productos/${new mongoose.Types.ObjectId()}`)).status, 401);
  assert.equal((await pedir('POST', '/productos', { ...cuerpo, categoria: 'abc' }, true)).status, 400);
  assert.equal((await pedir('POST', '/productos', { ...cuerpo, categoria: String(new mongoose.Types.ObjectId()) }, true)).status, 400);
  const creada = await pedir('POST', '/productos', cuerpo, true);
  assert.equal(creada.status, 201);
  producto = creada.datos;
});

test('productos: categoría poblada y filtro público', async () => {
  assert.ok(producto && categoria, 'Los datos de prueba deben existir');
  const lista = await pedir('GET', '/productos');
  assert.equal(lista.status, 200);
  assert.equal(lista.datos.find((p) => p._id === producto._id)?.categoria?.nombre, marca);
  const detalle = await pedir('GET', `/productos/${producto._id}`);
  assert.equal(detalle.status, 200);
  assert.equal(detalle.datos.categoria?.nombre, marca);
  const filtro = await pedir('GET', `/productos?categoria=${categoria._id}`);
  assert.equal(filtro.status, 200);
  assert.ok(filtro.datos.some((p) => p._id === producto._id));
  assert.ok(filtro.datos.every((p) => p.categoria?._id === categoria._id));
  assert.equal((await pedir('GET', '/productos?categoria=abc')).status, 400);
});

test('productos: un administrador puede eliminar su producto de prueba', async () => {
  assert.ok(producto, 'El producto de prueba debe existir');
  assert.equal((await pedir('DELETE', `/productos/${producto._id}`, undefined, true)).status, 200);
  assert.equal((await pedir('GET', `/productos/${producto._id}`)).status, 404);
});
