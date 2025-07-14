import mongoose from 'mongoose';

const varianteSchema = new mongoose.Schema({
  modelo: { type: String, required: true },
  medida: { type: String },
  material: { type: String },
  descripcion: { type: String },
}, { _id: false });

const productoSchema = new mongoose.Schema({
  nombre: { type: String, required: true, trim: true },
  descripcion: { type: String },
  categoria: { type: String, required: true },
  tipo: { type: String },
  imagen: {
    url: { type: String },
    public_id: { type: String }, // Cloudinary ID
  },
  variantes: [varianteSchema],
  estado: { type: Boolean, default: true }, // activo/inactivo
}, {
  timestamps: true,
});

export default mongoose.model('Producto', productoSchema);
