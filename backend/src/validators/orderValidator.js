const { body, param } = require('express-validator');

const createRules = [
  body('items').isArray({ min: 1 }).withMessage('O pedido deve conter ao menos um item.'),
  body('items.*.productId').isUUID().withMessage('ID de produto inválido em um dos itens.'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantidade deve ser um inteiro >= 1.'),

  body('paymentMethod').isIn(['credit_card', 'pix']).withMessage('Forma de pagamento deve ser credit_card ou pix.'),

  body('deliveryAddress.street').trim().notEmpty().withMessage('Endereço: rua é obrigatória.'),
  body('deliveryAddress.number').trim().notEmpty().withMessage('Endereço: número é obrigatório.'),
  body('deliveryAddress.city').trim().notEmpty().withMessage('Endereço: cidade é obrigatória.'),
  body('deliveryAddress.state').trim().isLength({ min: 2, max: 2 }).withMessage('Endereço: UF deve ter 2 letras.'),
  body('deliveryAddress.postalCode').trim().matches(/^\d{5}-?\d{3}$/).withMessage('CEP inválido.'),

  // Obrigatório apenas quando paymentMethod === 'credit_card'
  body('card.encrypted')
    .if(body('paymentMethod').equals('credit_card'))
    .notEmpty().withMessage('Dados criptografados do cartão são obrigatórios (gerados pelo SDK PagBank no front-end).'),
  body('card.holderName')
    .if(body('paymentMethod').equals('credit_card'))
    .trim().notEmpty().withMessage('Nome impresso no cartão é obrigatório.'),
  body('installments')
    .if(body('paymentMethod').equals('credit_card'))
    .optional().isInt({ min: 1, max: 12 }).withMessage('Parcelas devem ser entre 1 e 12.')
];

const statusRules = [
  param('id').isUUID().withMessage('ID de pedido inválido.'),
  body('status')
    .isIn(['pending', 'paid', 'preparing', 'delivering', 'delivered', 'cancelled', 'refunded'])
    .withMessage('Status inválido.')
];

const idRule = [param('id').isUUID().withMessage('ID de pedido inválido.')];

module.exports = { createRules, statusRules, idRule };
