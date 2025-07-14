import express from "express";
import upload from "../../middlewares/upload.js";
import { 
  crearProducto, 
  editarProducto, 
  eliminarProducto,
  listarProductos,
  obtenerProductoPorId,
  cambiarEstadoProducto,
} from "./productoController.js";
import authMiddleware from "../../middlewares/authMiddleware.js";
import adminMiddleware from "../../middlewares/adminMiddleware.js";

const router = express.Router();

// Rutas públicas
router.get("/", listarProductos);
router.get("/:id", obtenerProductoPorId);

// Rutas protegidas (solo admin)
router.post("/", authMiddleware, adminMiddleware, upload.single("imagen"), crearProducto);
router.put("/:id", authMiddleware, adminMiddleware, upload.single("imagen"), editarProducto);
router.delete("/:id", authMiddleware, adminMiddleware, eliminarProducto);
router.patch("/:id/estado", authMiddleware, adminMiddleware, cambiarEstadoProducto);

export default router;
