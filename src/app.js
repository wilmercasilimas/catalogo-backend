import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./modules/auth/authRoutes.js";
import productoRoutes from "./modules/producto/productoRoutes.js";
import usuarioRoutes from "./modules/usuarios/usuarioRoutes.js";
import pedidoRoutes from "./modules/pedido/pedidoRoutes.js";
import emailRoutes from "./modules/email/emailRoutes.js";

// Cargar variables de entorno
dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas de autenticación
app.use("/api/auth", authRoutes);

// Rutas de productos
app.use("/api/productos", productoRoutes);

// Ruta de prueba
app.get("/", (req, res) => {
  res.send("✅ API Catálogo funcionando correctamente");
});

app.use("/api/usuarios", usuarioRoutes);

// Rutas de pedidos
// Esta ruta es pública, no requiere autenticación
app.use("/api/pedidos", pedidoRoutes);

// Rutas de logs de correo
// Esta ruta es protegida, solo accesible por admins
app.use("/api/email-logs", emailRoutes);

// Conexión a MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("✅ Conectado a MongoDB Atlas");
    app.listen(process.env.PORT, () => {
      console.log(
        `🚀 Servidor corriendo en http://localhost:${process.env.PORT}`
      );
    });
  })
  .catch((error) => {
    console.error("❌ Error al conectar a MongoDB:", error);
  });
