import Usuario from "../../models/Usuario.js";
import jwt from "jsonwebtoken";

const generarToken = (usuario) => {
  return jwt.sign(
    { id: usuario._id, rol: usuario.rol },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

// ✅ Registro de administrador
export const registrarAdmin = async (req, res) => {
  try {
    const { nombre, email, password } = req.body;

    if (!nombre || !email || !password) {
      return res
        .status(400)
        .json({ error: "Todos los campos son obligatorios." });
    }

    const existe = await Usuario.findOne({ email });
    if (existe) {
      return res.status(400).json({ error: "Este email ya está registrado." });
    }

    const nuevoAdmin = new Usuario({ nombre, email, password, rol: "admin" });
    await nuevoAdmin.save();

    res.status(201).json({
      mensaje: "Administrador registrado correctamente.",
      usuario: {
        id: nuevoAdmin._id,
        nombre: nuevoAdmin.nombre,
        email: nuevoAdmin.email,
        rol: nuevoAdmin.rol,
        token: generarToken(nuevoAdmin),
      },
    });
  } catch (error) {
    console.error("Error al registrar admin:", error);
    res.status(500).json({ error: "Error del servidor." });
  }
};

// ✅ Login de administrador
export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const usuario = await Usuario.findOne({ email });
    if (!usuario) {
      return res.status(404).json({ error: "Usuario no encontrado." });
    }

    const passwordValido = await usuario.compararPassword(password);
    if (!passwordValido) {
      return res.status(401).json({ error: "Contraseña incorrecta." });
    }

    res.status(200).json({
      mensaje: "Login exitoso.",
      usuario: {
        id: usuario._id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
        token: generarToken(usuario),
      },
    });
  } catch (error) {
    console.error("Error al logear admin:", error);
    res.status(500).json({ error: "Error del servidor." });
  }
};

// ✅ Crear otro administrador (solo admins con token)
export const crearOtroAdmin = async (req, res) => {
  try {
    const { nombre, email, password } = req.body;

    if (!nombre || !email || !password) {
      return res
        .status(400)
        .json({ error: "Todos los campos son obligatorios." });
    }

    const existe = await Usuario.findOne({ email });
    if (existe) {
      return res.status(400).json({ error: "Este email ya está registrado." });
    }

    const nuevoAdmin = new Usuario({ nombre, email, password, rol: "admin" });
    await nuevoAdmin.save();

    res.status(201).json({
      mensaje: "Nuevo administrador creado exitosamente.",
    });
  } catch (error) {
    console.error("Error al crear otro admin:", error);
    res.status(500).json({ error: "Error del servidor." });
  }
};

// ✅ Listar administradores (solo admins con token)
export const listarAdministradores = async (req, res) => {
  try {
    const admins = await Usuario.find({ rol: "admin" })
      .select("-password")
      .sort({ createdAt: -1 });

    res.status(200).json(admins);
  } catch (error) {
    console.error("Error al listar administradores:", error);
    res
      .status(500)
      .json({ error: "Error del servidor al listar administradores." });
  }
};

// ✅ Actualizar perfil de administrador (solo admins con token)
export const actualizarPerfil = async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.usuario.id);
    if (!usuario) {
      return res.status(404).json({ error: "Administrador no encontrado." });
    }

    const { nombre, email, password } = req.body;

    if (nombre) usuario.nombre = nombre;
    if (email) usuario.email = email;
    if (password) usuario.password = password;

    const actualizado = await usuario.save();

    res.status(200).json({
      mensaje: "Perfil actualizado correctamente.",
      usuario: {
        id: actualizado._id,
        nombre: actualizado.nombre,
        email: actualizado.email,
        rol: actualizado.rol,
      },
    });
  } catch (error) {
    console.error("Error al actualizar perfil:", error);
    res.status(500).json({ error: "Error del servidor al actualizar perfil." });
  }
};
