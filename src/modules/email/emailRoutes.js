import express from 'express';
import { listarLogsCorreo } from './emailController.js';
import authMiddleware from '../../middlewares/authMiddleware.js';
import adminMiddleware from '../../middlewares/adminMiddleware.js';

const router = express.Router();

// Ruta protegida solo para admins
router.get('/', authMiddleware, adminMiddleware, listarLogsCorreo);

export default router;
