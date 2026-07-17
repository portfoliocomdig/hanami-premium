const { validationResult } = require('express-validator');

/**
 * Executa as regras do express-validator declaradas na rota e, se houver
 * erro, responde 422 com a lista de campos inválidos. Caso contrário, segue.
 */
function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: 'Dados inválidos.',
      errors: errors.array().map((e) => ({ campo: e.path, mensagem: e.msg }))
    });
  }
  next();
}

module.exports = validate;
