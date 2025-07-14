import express from 'express';
import { registrarAdmin, loginAdmin } from './authController.js';
import authMiddleware from '../../middlewares/authMiddleware.js';
import adminMiddleware from '../../middlewares/adminMiddleware.js';
import { crearOtroAdmin } from './authController.js';
import { actualizarPerfil } from './authController.js';


const router = express.Router();

// Ruta para registro inicial de admin
router.post('/registro', registrarAdmin);

// Ruta para login
router.post('/login', loginAdmin);

// Crear otro administrador (solo para admins autenticados)
router.post('/admin/crear', authMiddleware, adminMiddleware, crearOtroAdmin);

// Actualizar perfil del administrador autenticado
router.put('/perfil', authMiddleware, adminMiddleware, actualizarPerfil);


export default router;

