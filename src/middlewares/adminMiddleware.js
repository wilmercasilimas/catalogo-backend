const adminMiddleware = (req, res, next) => {
  if (req.usuario?.rol !== "admin") {
    return res.status(403).json({ error: "Acceso denegado: solo administradores." });
  }
  next();
};

export default adminMiddleware;
