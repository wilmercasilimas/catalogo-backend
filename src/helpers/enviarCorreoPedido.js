import nodemailer from "nodemailer";
import EmailLog from "../models/EmailLog.js";
import Producto from "../models/Producto.js";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Enviar resumen de pedido al cliente y registrar el envío
 */
const enviarCorreoPedido = async ({
  cliente,
  items,
  tipo = "pedido_creado",
  codigo = "CAT-0000", // 👈 Se recibe el código
}) => {
  const { nombre, email, telefono, empresa } = cliente;

  const resumen = await Promise.all(
    items.map(async (item) => {
      const producto = await Producto.findById(item.producto).lean();
      const nombreProducto = producto?.nombre || "Producto desconocido";

      return `
        <li>
          <strong>${nombreProducto}</strong><br>
          Modelo: ${item.variante?.modelo || "-"} |
          Medida: ${item.variante?.medida || "-"} |
          Material: ${item.variante?.material || "-"}<br>
          Cantidad: <strong>${item.cantidad}</strong>
        </li>
      `;
    })
  );

  const htmlResumen = resumen.join("");

  const html = `
    <h2>Gracias por tu pedido, ${nombre}</h2>
    <p>Confirmamos que hemos recibido tu solicitud.</p>
    <p><strong>Número de pedido:</strong> <span style="color: green">${codigo}</span></p>
    <p><strong>Resumen:</strong></p>
    <ul>${htmlResumen}</ul>
    <p><strong>Datos de contacto:</strong><br>
      Email: ${email}<br>
      Teléfono: ${telefono}<br>
      ${empresa ? `Empresa: ${empresa}` : ""}
    </p>
    <p>Fecha: ${new Date().toLocaleString()}</p>
  `;

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      bcc: process.env.ADMIN_EMAIL,
      subject: "🧾 Confirmación de tu pedido - Catálogo",
      html,
    });

    // Registro exitoso
    await EmailLog.create({
      tipo,
      destinatarios: [email, process.env.ADMIN_EMAIL],
      estado: "enviado",
      resumen: `Pedido de ${nombre} con ${items.length} productos.`,
    });
  } catch (error) {
    console.error("❌ Error al enviar correo:", error);

    // Registro de error
    await EmailLog.create({
      tipo,
      destinatarios: [email, process.env.ADMIN_EMAIL],
      estado: "fallo",
      error: error.message,
      resumen: `Fallo al enviar pedido de ${nombre}`,
    });
  }
};

export default enviarCorreoPedido;
