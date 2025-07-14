import express from "express";
import authMiddleware from "../../middlewares/authMiddleware.js";
import adminMiddleware from "../../middlewares/adminMiddleware.js";
import {
  crearPedido,
  listarPedidos,
  eliminarPedido,
  editarPedido,
  obtenerPedidoPorId,
  editarPedidoPublico,
  listarPedidosPublico,
} from "./pedidoController.js";

const router = express.Router();

// Ruta pública: enviar pedido
router.post("/", crearPedido);
router.put("/publico/:codigo", editarPedidoPublico);
router.get("/publico", listarPedidosPublico);

// Rutas protegidas para admin:
router.get("/", authMiddleware, adminMiddleware, listarPedidos);
router.get("/:id", authMiddleware, adminMiddleware, obtenerPedidoPorId);
router.put("/:id", authMiddleware, adminMiddleware, editarPedido);
router.delete("/:id", authMiddleware, adminMiddleware, eliminarPedido);

export default router;
