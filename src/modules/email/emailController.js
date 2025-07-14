import EmailLog from '../../models/EmailLog.js';

export const listarLogsCorreo = async (req, res) => {
  try {
    const { desde, hasta, cliente, tipo } = req.query;

    const filtro = {};

    // 📅 Filtrar por fecha
    if (desde || hasta) {
      filtro.createdAt = {};
      if (desde) filtro.createdAt.$gte = new Date(desde);
      if (hasta) filtro.createdAt.$lte = new Date(hasta);
    }

    // 👤 Filtrar por nombre de cliente (coincidencia parcial en el resumen)
    if (cliente) {
      filtro.resumen = { $regex: cliente, $options: 'i' };
    }

    // 📌 Filtrar por tipo de evento de correo (pedido_creado, pedido_editado)
    if (tipo && ['pedido_creado', 'pedido_editado'].includes(tipo)) {
      filtro.tipo = tipo;
    }

    const logs = await EmailLog.find(filtro)
      .sort({ createdAt: -1 })
      .limit(100);

    res.status(200).json(logs);
  } catch (error) {
    console.error('Error al listar logs de correo:', error);
    res.status(500).json({ error: 'Error del servidor al obtener los logs.' });
  }
};
