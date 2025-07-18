import express from 'express';
import authMiddleware from '../../middlewares/authMiddleware.js';
import adminMiddleware from '../../middlewares/adminMiddleware.js';
import upload from '../../middlewares/upload.js';
import {
  crearUsuario,
  editarUsuario,
  eliminarUsuario,
  listarUsuarios
} from './userController.js';

const router = express.Router();

// Todas protegidas por admin
router.get('/', authMiddleware, adminMiddleware, listarUsuarios);
router.post('/', authMiddleware, adminMiddleware, upload.single('imagen'), crearUsuario);
router.put('/:id', authMiddleware, adminMiddleware, upload.single('imagen'), editarUsuario);
router.delete('/:id', authMiddleware, adminMiddleware, eliminarUsuario);

export default router;
