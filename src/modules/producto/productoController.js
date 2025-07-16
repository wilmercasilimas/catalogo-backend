// @ts-nocheck
import Producto from "../../models/Producto.js";
import cloudinary from "../../config/cloudinary.js";
import streamifier from "streamifier";

// Helper para subir a Cloudinary desde buffer
function subirACloudinary(buffer) {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: "catalogo-productos" },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
}

// ✅ Crear producto
export const crearProducto = async (req, res) => {
  try {
    const { nombre, descripcion, categoria, tipo, variantes } = req.body;

    if (!nombre || !categoria) {
      return res
        .status(400)
        .json({ error: "El nombre y la categoría son obligatorios." });
    }

    let imagen = {};
    if (req.file) {
      const result = await subirACloudinary(req.file.buffer);
      imagen = {
        url: result.secure_url,
        public_id: result.public_id,
      };
    }

    const nuevoProducto = new Producto({
      nombre,
      descripcion,
      categoria,
      tipo,
      imagen: Object.keys(imagen).length ? imagen : undefined,
      variantes: variantes ? JSON.parse(variantes) : [],
    });

    const productoGuardado = await nuevoProducto.save();
    res.status(201).json(productoGuardado);
  } catch (error) {
    console.error("Error al crear producto:", error);
    res.status(500).json({ error: "Error del servidor." });
  }
};

// ✅ Editar producto
export const editarProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, categoria, tipo, variantes } = req.body;

    const producto = await Producto.findById(id);
    if (!producto) {
      return res.status(404).json({ error: "Producto no encontrado." });
    }

    if (req.file) {
      if (producto.imagen?.public_id) {
        await cloudinary.uploader.destroy(producto.imagen.public_id);
      }

      const result = await subirACloudinary(req.file.buffer);
      producto.imagen = {
        url: result.secure_url,
        public_id: result.public_id,
      };
    }

    producto.nombre = nombre || producto.nombre;
    producto.descripcion = descripcion || producto.descripcion;
    producto.categoria = categoria || producto.categoria;
    producto.tipo = tipo || producto.tipo;
    producto.variantes = variantes ? JSON.parse(variantes) : producto.variantes;

    const actualizado = await producto.save();
    return res.status(200).json(actualizado);
  } catch (error) {
    console.error("Error al editar producto:", error);
    res.status(500).json({ error: "Error del servidor al editar producto." });
  }
};

// ✅ Eliminar producto
export const eliminarProducto = async (req, res) => {
  try {
    const { id } = req.params;

    const producto = await Producto.findById(id);
    if (!producto) {
      return res.status(404).json({ error: "Producto no encontrado." });
    }

    if (producto.imagen?.public_id) {
      await cloudinary.uploader.destroy(producto.imagen.public_id);
    }

    await producto.deleteOne();
    res.status(200).json({ mensaje: "Producto eliminado correctamente." });
  } catch (error) {
    console.error("Error al eliminar producto:", error);
    res.status(500).json({ error: "Error del servidor al eliminar producto." });
  }
};

// ✅ Listar producto
export const listarProductos = async (req, res) => {
  try {
    const { categoria, tipo, estado } = req.query;

    const filtro = {};

    // Solo productos activos por defecto
    filtro.estado = estado !== undefined ? estado === "true" : true;

    if (categoria) {
      filtro.categoria = categoria;
    }

    if (tipo) {
      filtro.tipo = tipo;
    }

    const productos = await Producto.find(filtro).sort({ createdAt: -1 });

    res.status(200).json(productos);
  } catch (error) {
    console.error("Error al listar productos:", error);
    res.status(500).json({ error: "Error del servidor al listar productos." });
  }
};

// ✅ Obtener producto por ID
export const obtenerProductoPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const producto = await Producto.findById(id);
    if (!producto) {
      return res.status(404).json({ error: "Producto no encontrado." });
    }

    res.status(200).json(producto);
  } catch (error) {
    console.error("Error al obtener producto:", error);
    res.status(500).json({ error: "Error del servidor al obtener producto." });
  }
};
// ✅ Cambiar estado del producto
export const cambiarEstadoProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    if (typeof estado !== "boolean") {
      return res
        .status(400)
        .json({ error: "El campo 'estado' debe ser booleano (true o false)." });
    }

    const producto = await Producto.findById(id);
    if (!producto) {
      return res.status(404).json({ error: "Producto no encontrado." });
    }

    producto.estado = estado;
    const actualizado = await producto.save();

    res.status(200).json({
      mensaje: `Producto ${estado ? "activado" : "desactivado"} correctamente.`,
      producto: actualizado,
    });
  } catch (error) {
    console.error("Error al cambiar estado del producto:", error);
    res.status(500).json({ error: "Error del servidor al cambiar estado." });
  }
};
