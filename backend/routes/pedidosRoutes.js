const router = require('express').Router();
const crypto = require('crypto');
const mongoose = require('mongoose');
const Pedido = require('../models/Pedido');
const Producto = require('../models/Product');
const { verificarToken } = require('../middleware/auth');

//Crear errores HTTP compatibles con el manejador central
function crearErrorHttp(status, mensaje, codigo = null) {
    const err = new Error(mensaje);
    err.status = status;
    err.esErrorPedido = true;
    if (codigo) err.codigo = codigo;
    return err;
}

// Convierte pesos a centavos enteros redondeando al centavo mas cercano
function pesosACentavos(precio) {
    const [mantisa, exponente = '0'] = String(precio).toLowerCase().split('e');
    const [enteros, decimales = ''] = mantisa.split('.');
    const digitos = BigInt(enteros + decimales);
    const escala = Number(exponente) - decimales.length + 2;
    let centavos;
    if (escala >= 0) {
        centavos = digitos * 10n ** BigInt(escala);
    } else {
        const divisor = 10n ** BigInt(-escala);
        centavos = digitos / divisor;
        if ((digitos % divisor) * 2n >= divisor) centavos += 1n;
    }
    if (centavos > BigInt(Number.MAX_SAFE_INTEGER)) {
        throw crearErrorHttp(400, 'El precio de uno o más productos no es válido');
    }
    return Number(centavos);
}

//Genera una huella de los productos solicitados para validar reintentos
function calcularHashSolicitud(itemsNormalizados) {
    return crypto
    .createHash('sha256')
    .update(JSON.stringify(itemsNormalizados))
    .digest('hex');
}

// POST /api/pedidos
router.post('/', verificarToken, async (req, res) => {
    //Validar Idempotency-Key
    const rawKey = req.get('Idempotency-Key');
    if (typeof rawKey !== 'string' || rawKey.trim() === '') {
    throw crearErrorHttp(400, 'El encabezado Idempotency-Key es obligatorio');
    }
    const idempotencyKey = rawKey.trim();

    //Validar forma del cuerpo (productos, ObjectId, cantidad, repetidos, precioEsperadoCentavos)
    const { productos } = req.body || {};
    if (!Array.isArray(productos) || productos.length === 0) {
    throw crearErrorHttp(400, 'El pedido debe incluir al menos un producto');
    }

    const idsVistos = new Set();
    const itemsLimpios = [];

    for (const item of productos) {
    if (!item || typeof item !== 'object') {
    throw crearErrorHttp(400, 'El producto indicado no es válido');
    }

    const { producto, cantidad, precioEsperadoCentavos } = item;

    if (typeof producto !== 'string' || !mongoose.Types.ObjectId.isValid(producto)) {
    throw crearErrorHttp(400, 'El producto indicado no es válido');
    }

    const productoNormalizado = producto.toLowerCase();
    if (idsVistos.has(productoNormalizado)) {
    throw crearErrorHttp(400, 'No se puede repetir el mismo producto en el pedido');
    }
    idsVistos.add(productoNormalizado);

    if (!Number.isInteger(cantidad) || cantidad < 1) {
    throw crearErrorHttp(400, 'La cantidad debe ser un número entero mayor o igual a 1');
    }

    if (!Number.isInteger(precioEsperadoCentavos) || precioEsperadoCentavos < 0) {
    throw crearErrorHttp(400, 'El precio esperado no es válido');
    }

    itemsLimpios.push({
    producto: productoNormalizado,
    cantidad,
    precioEsperadoCentavos,
    });
    }

    const usuarioId = req.usuario.id;
    const payloadHash = calcularHashSolicitud(itemsLimpios);
    res.locals.intentoPedido = { usuarioId, idempotencyKey, payloadHash };

    // 3. Verificar si la clave de intento ya fue usada por este usuario
    const pedidoExistente = await Pedido.findOne({ usuario: usuarioId, idempotencyKey });
    if (pedidoExistente) {
    if (pedidoExistente.payloadHash === payloadHash) {
    return res.status(201).json(pedidoExistente);
    }
    throw crearErrorHttp(
    409,
    'La clave de intento ya se usó con otros datos',
    'CLAVE_REUTILIZADA'
    );
    }

    //Ejecutar validación de catalogo, precios, stock y guardado en una transaccion
    const session = await mongoose.startSession();
    let pedidoCreado = null;

    try {
    await session.withTransaction(async () => {

    const duplicadoEnTx = await Pedido.findOne({
        usuario: usuarioId,
        idempotencyKey,
    }).session(session);

    if (duplicadoEnTx) {
        if (duplicadoEnTx.payloadHash === payloadHash) {
        pedidoCreado = duplicadoEnTx;
        return;
        }
        throw crearErrorHttp(
        409,
        'La clave de intento ya se usó con otros datos',
        'CLAVE_REUTILIZADA'
        );
    }

    const idsSolicitados = itemsLimpios.map((i) => i.producto);
    const productosDB = await Producto.find({ _id: { $in: idsSolicitados } }).session(session);

    //Validar que todos los productos existan
    if (productosDB.length !== itemsLimpios.length) {
        throw crearErrorHttp(400, 'Uno o más productos no existen');
    }

    const mapaProductos = new Map(productosDB.map((p) => [p._id.toString(), p]));
    const itemsParaGuardar = [];
    let totalCentavos = 0;

    for (const item of itemsLimpios) {
        const prodDB = mapaProductos.get(item.producto);

        //Validar precio de catálogo
        if (
        typeof prodDB.precio !== 'number' ||
        !Number.isFinite(prodDB.precio) ||
        prodDB.precio <= 0
        ) {
        throw crearErrorHttp(400, 'El precio de uno o más productos no es válido');
        }

        //Validar stock
        if (
        prodDB.stock === undefined ||
        prodDB.stock === null ||
        prodDB.stock === '' ||
        typeof prodDB.stock !== 'number' ||
        Number.isNaN(prodDB.stock)
        ) {
        throw crearErrorHttp(
            409,
            'El producto no tiene stock informado',
            'STOCK_NO_INFORMADO'
        );
        }

        //Validar stock suficiente
        if (prodDB.stock < item.cantidad) {
        throw crearErrorHttp(
            409,
            `Stock insuficiente para ${prodDB.nombre}`,
            'STOCK_INSUFICIENTE'
        );
        }

        //Convertir precio a centavos y comparar contra el precio confirmado por el cliente
        const precioUnitarioCentavos = pesosACentavos(prodDB.precio);
        if (precioUnitarioCentavos !== item.precioEsperadoCentavos) {
        throw crearErrorHttp(
            409,
            'Los precios cambiaron. Revisá el carrito antes de confirmar',
            'PRECIO_CAMBIADO'
        );
        }

        //Descontar stock atómicamente verificando que no haya bajado en simultaneo
        const actualizado = await Producto.findOneAndUpdate(
        { _id: prodDB._id, stock: { $gte: item.cantidad } },
        { $inc: { stock: -item.cantidad } },
        { returnDocument: 'after', runValidators: true, session }
        );

        if (!actualizado) {
        throw crearErrorHttp(
            409,
            `Stock insuficiente para ${prodDB.nombre}`,
            'STOCK_INSUFICIENTE'
        );
        }

        const subtotalCentavos = precioUnitarioCentavos * item.cantidad;
        totalCentavos += subtotalCentavos;

        itemsParaGuardar.push({
        producto: prodDB._id,
        nombre: prodDB.nombre,
        precioUnitarioCentavos,
        cantidad: item.cantidad,
        subtotalCentavos,
        });
    }

    const [nuevoPedido] = await Pedido.create(
        [
        {
            usuario: usuarioId,
            productos: itemsParaGuardar,
            totalCentavos,
            estado: 'pendiente',
            idempotencyKey,
            payloadHash,
        },
        ],
        { session }
    );

    pedidoCreado = nuevoPedido;
    });
    } finally {
    await session.endSession();
    }

    return res.status(201).json(pedidoCreado);
});

// GET /api/pedidos Consultar los pedidos propios del usuario autenticado
router.get('/', verificarToken, async (req, res) => {
        const pedidos = await Pedido.find({ usuario: req.usuario.id })
            .sort({ createdAt: -1 });

        return res.status(200).json(pedidos);
});

// Una colisión simultánea de la clave se resuelve antes del manejador central.
router.use(async (err, req, res, next) => {
    const intento = res.locals.intentoPedido;
    if (err.code !== 11000 || !intento) return next(err);
    const pedido = await Pedido.findOne({ usuario: intento.usuarioId, idempotencyKey: intento.idempotencyKey });
    if (!pedido) return next(err);
    if (pedido.payloadHash === intento.payloadHash) return res.status(201).json(pedido);
    return next(crearErrorHttp(409, 'La clave de intento ya se usó con otros datos', 'CLAVE_REUTILIZADA'));
});

module.exports = router;
