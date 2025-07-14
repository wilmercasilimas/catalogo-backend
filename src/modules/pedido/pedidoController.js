import Pedido from "../../models/Pedido.js";
import Producto from "../../models/Producto.js";
import enviarCorreoPedido from "../../helpers/enviarCorreoPedido.js";

export const crearPedido = async (req, res) => {
  try {
    const { cliente, items } = req.body;

    // Validar datos básicos
    if (
      !cliente?.nombre ||
      !cliente?.email ||
      !cliente?.telefono ||
      !items ||
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return res.status(400).json({
        error: "Datos del cliente e items del pedido son obligatorios.",
      });
    }

    // Validar que los productos existan
    for (const item of items) {
      const producto = await Producto.findById(item.producto);
      if (!producto) {
        return res
          .status(400)
          .json({ error: `Producto no válido: ${item.producto}` });
      }
    }

    // Generar código único tipo CAT-XXXX
    let codigoGenerado;
    let existeCodigo = true;

    while (existeCodigo) {
      const random = Math.floor(1000 + Math.random() * 9000);
      codigoGenerado = `CAT-${random}`;
      const yaExiste = await Pedido.findOne({ codigo: codigoGenerado });
      if (!yaExiste) existeCodigo = false;
    }

    // Crear el pedido con código incluido
    const nuevoPedido = new Pedido({
      cliente,
      items,
      codigo: codigoGenerado,
    });

    const pedidoGuardado = await nuevoPedido.save();

    // 📨 Enviar correo de confirmación
    await enviarCorreoPedido({
      cliente,
      items,
      tipo: "pedido_creado",
      codigo: codigoGenerado,
    });

    res.status(201).json({
      mensaje: "Pedido recibido correctamente.",
      codigo: codigoGenerado,
      pedido: pedidoGuardado,
    });
  } catch (error) {
    console.error("Error al crear pedido:", error);
    res.status(500).json({ error: "Error del servidor al registrar pedido." });
  }
};

// Función para listar todos los pedidos
// Incluye detalles de los productos en cada item
export const listarPedidos = async (req, res) => {
  try {
    const { desde, hasta, cliente, codigo } = req.query;
    const filtro = {};

    // 📅 Filtrar por fecha de creación
    if (desde || hasta) {
      filtro.createdAt = {};
      if (desde) filtro.createdAt.$gte = new Date(desde);
      if (hasta) filtro.createdAt.$lte = new Date(hasta);
    }

    // 👤 Filtrar por nombre parcial del cliente
    if (cliente) {
      filtro["cliente.nombre"] = { $regex: cliente, $options: "i" };
    }

    // 🆔 Filtrar por código exacto (ej. CAT-6104)
    if (codigo) {
      filtro.codigo = codigo.trim().toUpperCase();
    }

    const pedidos = await Pedido.find(filtro)
      .sort({ createdAt: -1 })
      .populate("items.producto", "nombre imagen categoria tipo");

    res.status(200).json(pedidos);
  } catch (error) {
    console.error("Error al listar pedidos:", error);
    res.status(500).json({ error: "Error del servidor al obtener pedidos." });
  }
};


// Función para listar pedidos de un cliente por email
// Esta ruta es pública y no requiere autenticación
export const listarPedidosPublico = async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ error: "El email del cliente es requerido." });
    }

    const pedidos = await Pedido.find({ "cliente.email": email.trim().toLowerCase() })
      .sort({ createdAt: -1 })
      .select("codigo estado createdAt items cliente")
      .populate("items.producto", "nombre");

    res.status(200).json(pedidos);
  } catch (error) {
    console.error("Error al listar pedidos del cliente:", error);
    res.status(500).json({ error: "Error del servidor al obtener los pedidos." });
  }
};



// Función para editar un pedido por ID
// Solo accesible por administradores
export const editarPedido = async (req, res) => {
  try {
    const { id } = req.params;
    const { cliente, items, estado } = req.body;

    const pedido = await Pedido.findById(id);
    if (!pedido) {
      return res.status(404).json({ error: "Pedido no encontrado." });
    }

    // Actualizar cliente si se envía
    if (cliente) {
      pedido.cliente.nombre = cliente.nombre || pedido.cliente.nombre;
      pedido.cliente.email = cliente.email || pedido.cliente.email;
      pedido.cliente.telefono = cliente.telefono || pedido.cliente.telefono;
      pedido.cliente.empresa = cliente.empresa || pedido.cliente.empresa;
    }

    // Actualizar items si se envía
    if (items && Array.isArray(items) && items.length > 0) {
      pedido.items = items;
    }

    // Actualizar estado si es válido
    if (estado && ["pendiente", "procesado", "cancelado"].includes(estado)) {
      pedido.estado = estado;
    }

    // Guardar cambios
    const actualizado = await pedido.save();

    // 📨 Notificar al cliente y registrar log
    await enviarCorreoPedido({
      cliente: pedido.cliente,
      items: pedido.items,
      tipo: "pedido_editado",
      codigo: pedido.codigo,
    });

    res.status(200).json({
      mensaje: "Pedido actualizado correctamente.",
      pedido: actualizado,
    });
  } catch (error) {
    console.error("Error al editar pedido:", error);
    res.status(500).json({ error: "Error del servidor al editar pedido." });
  }
};

// Función para eliminar un pedido por ID
// Solo accesible por administradores
export const eliminarPedido = async (req, res) => {
  try {
    const { id } = req.params;

    const pedido = await Pedido.findById(id);
    if (!pedido) {
      return res.status(404).json({ error: "Pedido no encontrado." });
    }

    await pedido.deleteOne();

    res.status(200).json({ mensaje: "Pedido eliminado correctamente." });
  } catch (error) {
    console.error("Error al eliminar pedido:", error);
    res.status(500).json({ error: "Error del servidor al eliminar pedido." });
  }
};

// Función para obtener un pedido por ID
export const obtenerPedidoPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const pedido = await Pedido.findById(id).populate(
      "items.producto",
      "nombre imagen categoria tipo"
    );

    if (!pedido) {
      return res.status(404).json({ error: "Pedido no encontrado." });
    }

    res.status(200).json(pedido);
  } catch (error) {
    console.error("Error al obtener pedido:", error);
    res.status(500).json({ error: "Error del servidor al buscar pedido." });
  }
};


export const editarPedidoPublico = async (req, res) => {
  try {
    const { codigo } = req.params;
    const { cliente, items } = req.body;

    const pedido = await Pedido.findOne({ codigo });

    if (!pedido) {
      return res.status(404).json({ error: "Pedido no encontrado con ese código." });
    }

    if (pedido.estado !== "pendiente") {
      return res.status(403).json({ error: "Este pedido ya no puede ser modificado." });
    }

    // Actualizar cliente
    if (cliente) {
      pedido.cliente.nombre = cliente.nombre || pedido.cliente.nombre;
      pedido.cliente.email = cliente.email || pedido.cliente.email;
      pedido.cliente.telefono = cliente.telefono || pedido.cliente.telefono;
      pedido.cliente.empresa = cliente.empresa || pedido.cliente.empresa;
    }

    // Actualizar items
    if (items && Array.isArray(items) && items.length > 0) {
      pedido.items = items;
    }

    const actualizado = await pedido.save();

    // Enviar correo de confirmación al cliente
    await enviarCorreoPedido({
      cliente: pedido.cliente,
      items: pedido.items,
      tipo: "pedido_editado",
      codigo: pedido.codigo,
    });

    res.status(200).json({
      mensaje: "Pedido actualizado correctamente.",
      codigo: pedido.codigo,
      pedido: actualizado,
    });
  } catch (error) {
    console.error("Error al editar pedido público:", error);
    res.status(500).json({ error: "Error del servidor al editar pedido." });
  }
};


