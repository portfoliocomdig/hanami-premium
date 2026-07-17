const { body, param } = require('express-validator');
const Product = require('../models/Product');

const createRules = [
  body('name').trim().notEmpty().withMessage('Nome é obrigatório.').isLength({ max: 150 }),
  body('description').optional({ nullable: true }).isString(),
  body('category').isIn(Product.CATEGORIAS).withMessage(`Categoria deve ser uma de: ${Product.CATEGORIAS.join(', ')}.`),
  body('price').isFloat({ min: 0.01 }).withMessage('Preço deve ser um número positivo.'),
  body('stock').isInt({ min: 0 }).withMessage('Estoque deve ser um inteiro maior ou igual a 0.'),
  body('featured').optional().isBoolean(),
  body('imageUrl').optional({ nullable: true }).isString()
];

// PUT/PATCH: todos os campos são opcionais, mas se enviados devem ser válidos
const updateRules = [
  param('id').isUUID().withMessage('ID de produto inválido.'),
  body('name').optional().trim().isLength({ min: 1, max: 150 }),
  body('description').optional({ nullable: true }).isString(),
  body('category').optional().isIn(Product.CATEGORIAS),
  body('price').optional().isFloat({ min: 0.01 }),
  body('stock').optional().isInt({ min: 0 }),
  body('featured').optional().isBoolean(),
  body('imageUrl').optional({ nullable: true }).isString(),
  body('active').optional().isBoolean()
];

const idRule = [param('id').isUUID().withMessage('ID de produto inválido.')];

module.exports = { createRules, updateRules, idRule };
