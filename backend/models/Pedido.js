// Modelo de Mongoose para los pedidos.

const mongoose = require('mongoose');

const itemPedidoSchema = new mongoose.Schema(
    {
        producto: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Producto',
        required: true,
        },
        nombre: {
        type: String,
        required: true,
        },
        precioUnitarioCentavos: {
        type: Number,
        required: true,
        min: 1,
        },
        cantidad: {
        type: Number,
        required: true,
        min: 1,
        },
        subtotalCentavos: {
        type: Number,
        required: true,
        min: 1,
        },
    },
    { _id: false }
);

const pedidoSchema = new mongoose.Schema(
    {
        usuario: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario',
        required: true,
        index: true,
        },
        productos: {
        type: [itemPedidoSchema],
        required: true,
        },
        totalCentavos: {
        type: Number,
        required: true,
        min: 1,
        },
        estado: {
        type: String,
        enum: ['pendiente'],
        default: 'pendiente',
        },
        idempotencyKey: {
        type: String,
        required: true,
        },
        payloadHash: {
        type: String,
        required: true,
        },
    },
    {
        timestamps: true,
        toJSON: {
        transform: (_doc, ret) => {
            delete ret.__v;
            delete ret.idempotencyKey;
            delete ret.payloadHash;
            return ret;
        },
        },
    }
);

//Unica clave de intento por usuario
pedidoSchema.index({ usuario: 1, idempotencyKey: 1 }, { unique: true });

module.exports = mongoose.model('Pedido', pedidoSchema);
