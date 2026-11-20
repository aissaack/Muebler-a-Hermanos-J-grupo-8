const jwt = require('jsonwebtoken');

function verificarToken(req, res, next) {
    const autorizacion = req.get('Authorization');
    const partes = autorizacion && autorizacion.match(/^Bearer\s+(\S+)$/i);
    if (!partes) {
        const error = new Error('Token inválido o ausente');
        error.status = 401;
        return next(error);
    }

    try {
        req.usuario = jwt.verify(partes[1], process.env.JWT_SECRET);
    } catch (error) {
        const rechazo = new Error('Token inválido o vencido');
        rechazo.status = 401;
        return next(rechazo);
    }
    next();
}

function soloAdmin(req, res, next) {
    if (req.usuario.rol !== 'admin') {
        const error = new Error('Acceso restringido a administradores');
        error.status = 403;
        return next(error);
    }
    next();
}

module.exports = { verificarToken, soloAdmin };
