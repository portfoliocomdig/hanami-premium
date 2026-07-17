const { body } = require('express-validator');

const registerRules = [
  body('name').trim().isLength({ min: 2, max: 120 }).withMessage('Nome deve ter entre 2 e 120 caracteres.'),
  body('email').trim().isEmail().withMessage('E-mail inválido.').normalizeEmail(),
  body('password')
    .isLength({ min: 8 }).withMessage('Senha deve ter no mínimo 8 caracteres.')
    .matches(/\d/).withMessage('Senha deve conter ao menos um número.')
    .matches(/[A-Za-z]/).withMessage('Senha deve conter ao menos uma letra.'),
  body('phone').optional().isMobilePhone('pt-BR').withMessage('Telefone inválido.'),
  body('taxId').optional().isLength({ min: 11, max: 14 }).withMessage('CPF/CNPJ inválido.')
];

const loginRules = [
  body('email').trim().isEmail().withMessage('E-mail inválido.').normalizeEmail(),
  body('password').notEmpty().withMessage('Senha é obrigatória.')
];

module.exports = { registerRules, loginRules };
