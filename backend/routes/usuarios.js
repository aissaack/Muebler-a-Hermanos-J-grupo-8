const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');
const { verificarToken } = require('../middleware/auth');

const router = express.Router();
const credencialesInvalidas = (email, password) =>
    typeof email !== 'string' || !email.trim() ||
    typeof password !== 'string' || !password;

const datosPublicos = (usuario) => ({
    _id: usuario._id,
    nombre: usuario.nombre,
    email: usuario.email,
    rol: usuario.rol,
});

router.post('/registro', async (req, res) => {
    const { nombre, email, password } = req.body || {};
    if (!nombre || credencialesInvalidas(email, password)) {
        const error = new Error('Nombre, email y contraseña son obligatorios');
        error.status = 400;
        throw error;
    }

    const hash = await bcrypt.hash(password, 10);
    const usuario = await Usuario.create({ nombre, email, password: hash });
    res.status(201).json(datosPublicos(usuario));
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body || {};
    if (credencialesInvalidas(email, password)) {
        const error = new Error('Email y contraseña son obligatorios');
        error.status = 400;
        throw error;
    }

    const usuario = await Usuario.findOne({ email: email.trim().toLowerCase() });
    if (!usuario || !(await bcrypt.compare(password, usuario.password))) {
        const error = new Error('Credenciales inválidas');
        error.status = 401;
        throw error;
    }

    const token = jwt.sign({ id: usuario._id.toString(), rol: usuario.rol },
        process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, usuario: datosPublicos(usuario) });
});

router.get('/perfil', verificarToken, async (req, res) => {
    const usuario = await Usuario.findById(req.usuario.id).select('nombre email rol');
    if (!usuario) {
        const error = new Error('Sesión no válida');
        error.status = 401;
        throw error;
    }
    res.json(datosPublicos(usuario));
});

module.exports = router;
