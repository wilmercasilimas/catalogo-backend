import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]; // Bearer token

  if (!token) {
    return res.status(401).json({ error: "Token no proporcionado." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = decoded; // Adjunta el payload del token
    next();
  } catch (error) {
    return res.status(401).json({ error: "Token inválido." });
  }
};

export default authMiddleware;
