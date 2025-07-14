import mongoose from "mongoose";

const itemSchema = new mongoose.Schema(
  {
    producto: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Producto",
      required: true,
    },
    variante: {
      modelo: { type: String },
      medida: { type: String },
      material: { type: String },
      descripcion: { type: String },
    },
    cantidad: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  { _id: false }
);

const pedidoSchema = new mongoose.Schema(
  {
    cliente: {
      nombre: { type: String, required: true },
      email: { type: String, required: true },
      telefono: { type: String, required: true },
      empresa: { type: String },
    },
    items: [itemSchema],
    estado: {
      type: String,
      enum: ["pendiente", "procesado", "cancelado"],
      default: "pendiente",
    },
    codigo: {
      type: String,
      unique: true,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Pedido", pedidoSchema);
