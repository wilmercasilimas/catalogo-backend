import mongoose from 'mongoose';

const emailLogSchema = new mongoose.Schema(
  {
    tipo: {
      type: String,
      enum: ['pedido_creado', 'pedido_editado'],
      required: true,
    },
    destinatarios: [String], // emails reales
    estado: {
      type: String,
      enum: ['enviado', 'fallo'],
      default: 'enviado',
    },
    error: { type: String }, // si falla
    resumen: { type: String }, // opcional: "Pedido de Carlos Pérez con 3 productos"
  },
  {
    timestamps: true, // incluye createdAt
  }
);

export default mongoose.model('EmailLog', emailLogSchema);
