import Usuario from "../models/Usuario.js";
import bcrypt from "bcrypt";

// Crear nuevo usuario
export const crearUsuario = async (req, res) => {
  try {
    const { nombre, email, password, rol } = req.body;

    if (!nombre || !email || !password || !rol) {
      return res.status(400).json({ message: "Todos los campos son obligatorios." });
    }

    const existe = await Usuario.findOne({ email });
    if (existe) {
      return res.status(409).json({ message: "El correo ya está registrado." });
    }

    const hash = await bcrypt.hash(password, 10);

    const nuevo = new Usuario({ nombre, email, password: hash, rol });
    await nuevo.save();

    res.status(201).json({ message: "Usuario creado correctamente." });
  } catch (error) {
    res.status(500).json({ message: "Error al crear usuario." });
  }
};

// Editar usuario (excepto super admin por otros)
export const editarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, email, password, rol } = req.body;
    const solicitante = req.usuario; // desde middleware

    const usuario = await Usuario.findById(id);
    if (!usuario) {
      return res.status(404).json({ message: "Usuario no encontrado." });
    }

    if (
      usuario.email === "wilmercasilimas@gmail.com" &&
      solicitante.email !== "wilmercasilimas@gmail.com"
    ) {
      return res.status(403).json({ message: "No tienes permiso para editar al super admin." });
    }

    if (nombre) usuario.nombre = nombre;
    if (email) usuario.email = email;
    if (rol) usuario.rol = rol;
    if (password) usuario.password = await bcrypt.hash(password, 10);

    await usuario.save();

    res.json({ message: "Usuario actualizado." });
  } catch (error) {
    res.status(500).json({ message: "Error al editar usuario." });
  }
};

// Eliminar usuario (excepto super admin)
export const eliminarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const usuario = await Usuario.findById(id);
    if (!usuario) {
      return res.status(404).json({ message: "Usuario no encontrado." });
    }

    if (usuario.email === "wilmercasilimas@gmail.com") {
      return res.status(403).json({ message: "No se puede eliminar al super admin." });
    }

    await Usuario.findByIdAndDelete(id);

    res.json({ message: "Usuario eliminado correctamente." });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar usuario." });
  }
};

// Listar todos
export const listarUsuarios = async (req, res) => {
  try {
    const usuarios = await Usuario.find().select("-password");
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener usuarios." });
  }
};
