const express = require('express');
const { webhook } = require('../controllers/paymentController');

const router = express.Router();

// Endpoint público — chamado pelo PagBank, não pelo front-end.
// Em produção, valide a assinatura/segredo do webhook antes de confiar no payload.
router.post('/webhook', webhook);

module.exports = router;
