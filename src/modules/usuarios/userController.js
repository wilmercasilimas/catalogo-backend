import Usuario from "../../models/Usuario.js";

import bcrypt from "bcrypt";

// Crear nuevo usuario
export const crearUsuario = async (req, res) => {
  try {
    // Solo el super admin puede crear usuarios
    if (req.usuario.email !== "wilmercasilimas@gmail.com") {
      return res.status(403).json({
        message: "Acceso denegado: solo el super admin puede crear usuarios.",
      });
    }

    const { nombre, email, password, rol } = req.body;

    if (!nombre || !email || !password || !rol) {
      return res
        .status(400)
        .json({ message: "Todos los campos son obligatorios." });
    }

    const existe = await Usuario.findOne({ email });
    if (existe) {
      return res.status(409).json({ message: "El correo ya está registrado." });
    }

    const nuevo = new Usuario({ nombre, email, password, rol }); // ✔️ El hash lo hará el middleware pre("save")
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

    // ❌ Nadie puede editar al super admin, excepto él mismo
    if (
      usuario.email === "wilmercasilimas@gmail.com" &&
      solicitante.email !== "wilmercasilimas@gmail.com"
    ) {
      return res
        .status(403)
        .json({ message: "No tienes permiso para editar al super admin." });
    }

    // ❌ Si no es super admin, solo puede editarse a sí mismo
    if (
      solicitante.email !== "wilmercasilimas@gmail.com" &&
      solicitante.id !== usuario._id.toString()
    ) {
      return res
        .status(403)
        .json({ message: "Solo puedes editar tu propia cuenta." });
    }

    // ✅ Permitir modificación de campos
    if (nombre) usuario.nombre = nombre;
    if (email) usuario.email = email;
    if (rol && solicitante.email === "wilmercasilimas@gmail.com") {
      usuario.rol = rol; // solo el super admin puede cambiar rol
    }
    if (password) {
      usuario.password = password;
    }

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
    const solicitante = req.usuario;

    const usuario = await Usuario.findById(id);
    if (!usuario) {
      return res.status(404).json({ message: "Usuario no encontrado." });
    }

    // ❌ Nadie puede eliminar al super admin (ni él mismo)
    if (usuario.email === "wilmercasilimas@gmail.com") {
      return res
        .status(403)
        .json({ message: "No se puede eliminar al super admin." });
    }

    // ✅ Solo el super admin puede eliminar a otros
    if (solicitante.email !== "wilmercasilimas@gmail.com") {
      return res
        .status(403)
        .json({ message: "Solo el super admin puede eliminar usuarios." });
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
