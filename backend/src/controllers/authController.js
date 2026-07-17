const jwt = require('jsonwebtoken');
const { User } = require('../models');

function signToken(user) {
  return jwt.sign({ sub: user.id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d'
  });
}

/** POST /api/auth/register */
async function register(req, res, next) {
  try {
    const { name, email, password, phone, taxId } = req.body;

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Este e-mail já está cadastrado.' });
    }

    // passwordHash recebe a senha em texto puro aqui; o hook beforeCreate do
    // model faz o hash com bcrypt antes de persistir — a senha em claro
    // nunca chega ao banco.
    const user = await User.create({ name, email, passwordHash: password, phone, taxId });

    const token = signToken(user);
    return res.status(201).json({ success: true, token, user });
  } catch (err) {
    next(err);
  }
}

/** POST /api/auth/login */
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const user = await User.scope('withPassword').findOne({ where: { email } });
    if (!user || !(await user.checkPassword(password))) {
      return res.status(401).json({ success: false, message: 'E-mail ou senha inválidos.' });
    }

    const token = signToken(user);
    const { passwordHash, ...safeUser } = user.toJSON();
    return res.json({ success: true, token, user: safeUser });
  } catch (err) {
    next(err);
  }
}

/** GET /api/auth/me */
async function me(req, res) {
  return res.json({ success: true, user: req.user });
}

module.exports = { register, login, me };
