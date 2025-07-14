import express from 'express';
import authMiddleware from '../../middlewares/authMiddleware.js';
import adminMiddleware from '../../middlewares/adminMiddleware.js';
import { listarAdministradores } from '../auth/authController.js';

const router = express.Router();

// Ruta para listar todos los administradores
router.get('/', authMiddleware, adminMiddleware, listarAdministradores);

export default router;
