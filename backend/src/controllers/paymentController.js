const { Order } = require('../models');
const pagbank = require('../services/pagbankService');

/**
 * POST /api/payments/webhook
 * Endpoint público chamado pelo PagBank sempre que o status de uma
 * cobrança muda (ex.: PIX pago, cartão autorizado, estorno). Deve
 * responder rápido (2xx) e apenas então processar — aqui processamos
 * de forma síncrona por simplicidade, mas em produção o ideal é
 * enfileirar (ex.: BullMQ) e responder 200 imediatamente.
 */
async function webhook(req, res, next) {
  try {
    const notification = req.body; // payload enviado pelo PagBank (charge ou order)
    const pagbankOrderId = notification.reference_id || notification.id;

    if (!pagbankOrderId) {
      return res.status(400).json({ success: false, message: 'Notificação sem identificador.' });
    }

    // Buscamos o pedido tanto pelo nosso reference_id (=order.id) quanto
    // pelo id retornado pelo PagBank, cobrindo os dois formatos de payload.
    const order = await Order.findOne({
      where: { pagbankOrderId: notification.id }
    }) || await Order.findByPk(notification.reference_id);

    if (!order) {
      // Retornamos 200 mesmo assim para o PagBank não ficar reenviando
      // notificações de pedidos que não são nossos / de ambiente de teste.
      return res.status(200).json({ success: true, message: 'Pedido não localizado, ignorado.' });
    }

    // Consulta o status mais recente diretamente na API (nunca confiamos
    // apenas no corpo do webhook, que pode ser forjado sem validação de
    // assinatura em um ambiente de demonstração).
    const remote = await pagbank.consultarPedido(order.pagbankOrderId);
    const charge = remote.charges?.[0];
    const newStatus = charge ? pagbank.mapChargeStatusToOrderStatus(charge.status) : order.status;

    await order.update({ status: newStatus, pagbankChargeId: charge?.id || order.pagbankChargeId });

    return res.status(200).json({ success: true });
  } catch (err) {
    // Nunca deixamos o webhook travar em erro 500 sem log — o PagBank fará
    // novas tentativas, mas registramos para investigação.
    console.error('Erro ao processar webhook PagBank:', err.message);
    return res.status(200).json({ success: false });
  }
}

module.exports = { webhook };
