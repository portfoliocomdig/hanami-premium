const jwt = require('jsonwebtoken');
const { User } = require('../models');

/**
 * Exige um Bearer token JWT válido. Anexa `req.user` (sem hash de senha).
 */
async function authenticate(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const [scheme, token] = header.split(' ');

    if (scheme !== 'Bearer' || !token) {
      return res.status(401).json({ success: false, message: 'Token de autenticação ausente.' });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(payload.sub);

    if (!user) {
      return res.status(401).json({ success: false, message: 'Usuário não encontrado.' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Token inválido ou expirado.' });
  }
}

/**
 * Exige que o usuário autenticado tenha papel 'admin'.
 * Deve ser usado depois de `authenticate`.
 */
function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Acesso restrito a administradores.' });
  }
  next();
}

module.exports = { authenticate, requireAdmin };
