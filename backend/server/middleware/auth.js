// backend/server/middleware/auth.js
// Middleware de autenticação JWT para rotas protegidas

import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

export const requireAuth = (req, res, next) => {
  let token = req.cookies?.token;
  if (!token) {
    const authHeader = req.headers.authorization;
    if (authHeader) {
      token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader;
    }
  }

  if (!token) {
    return res.status(401).json({ error: 'Sessão inválida ou não autorizada.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido ou expirado.' });
  }
};