/* eslint-disable no-unused-vars */

/**
 * Middleware de erro centralizado. Qualquer `next(err)` ou exceção síncrona
 * em uma rota cai aqui. Mantém mensagens de erro do Sequelize e do PagBank
 * legíveis e nunca expõe stack trace em produção.
 */
function errorHandler(err, req, res, next) {
  console.error(`[ERRO] ${req.method} ${req.originalUrl} ->`, err.message);

  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    return res.status(422).json({
      success: false,
      message: 'Erro de validação no banco de dados.',
      errors: err.errors.map((e) => ({ campo: e.path, mensagem: e.message }))
    });
  }

  if (err.isPagBankError) {
    return res.status(err.statusCode || 502).json({
      success: false,
      message: 'Erro ao comunicar com o PagBank.',
      details: err.details || null
    });
  }

  const statusCode = err.statusCode || 500;
  return res.status(statusCode).json({
    success: false,
    message: statusCode === 500 ? 'Erro interno do servidor.' : err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
}

module.exports = errorHandler;
