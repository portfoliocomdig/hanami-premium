const express = require('express');
const ctrl = require('../controllers/orderController');
const { createRules, statusRules, idRule } = require('../validators/orderValidator');
const validate = require('../middlewares/validate');
const { authenticate, requireAdmin } = require('../middlewares/auth');

const router = express.Router();

router.use(authenticate); // todas as rotas de pedido exigem usuário logado

router.post('/', createRules, validate, ctrl.create);
router.get('/', ctrl.list);
router.get('/:id', idRule, validate, ctrl.getById);
router.patch('/:id/status', requireAdmin, statusRules, validate, ctrl.updateStatus);
router.delete('/:id', idRule, validate, ctrl.cancel);

module.exports = router;
