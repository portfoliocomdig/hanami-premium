const express = require('express');
const rateLimit = require('express-rate-limit');
const { register, login, me } = require('../controllers/authController');
const { registerRules, loginRules } = require('../validators/authValidator');
const validate = require('../middlewares/validate');
const { authenticate } = require('../middlewares/auth');

const router = express.Router();

// Limita tentativas de login/registro para dificultar força bruta
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, standardHeaders: true });

router.post('/register', authLimiter, registerRules, validate, register);
router.post('/login', authLimiter, loginRules, validate, login);
router.get('/me', authenticate, me);

module.exports = router;
