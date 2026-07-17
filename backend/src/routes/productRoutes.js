const express = require('express');
const ctrl = require('../controllers/productController');
const { createRules, updateRules, idRule } = require('../validators/productValidator');
const validate = require('../middlewares/validate');
const { authenticate, requireAdmin } = require('../middlewares/auth');

const router = express.Router();

// Rotas públicas — vitrine do cardápio (com filtro/ordenação)
router.get('/', ctrl.list);
router.get('/:id', idRule, validate, ctrl.getById);

// Rotas administrativas — CRUD completo de produtos
router.post('/', authenticate, requireAdmin, createRules, validate, ctrl.create);
router.put('/:id', authenticate, requireAdmin, updateRules, validate, ctrl.update);
router.delete('/:id', authenticate, requireAdmin, idRule, validate, ctrl.remove);

module.exports = router;
