const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

/**
 * Cliente HTTP para a API de Pedidos do PagBank
 * (https://developer.pagbank.com.br/reference/criar-pedido).
 *
 * Fluxo adotado: "Criar e pagar o pedido" em UMA única chamada ao endpoint
 * POST /orders — enviamos o objeto Order já acompanhado do objeto `charges`
 * (cartão) ou `qr_codes` (PIX).
 *
 * Cartão: os dados sensíveis (número, validade, CVV) são criptografados no
 * NAVEGADOR com o SDK JS do PagBank (PagSeguro.encryptCard). O back-end
 * nunca recebe o número do cartão em texto puro — apenas o payload
 * `encryptedCard`, o que reduz o escopo PCI-DSS da aplicação.
 */
const pagbankClient = axios.create({
  baseURL: process.env.PAGBANK_API_URL,
  timeout: 15000,
  headers: {
    Authorization: `Bearer ${process.env.PAGBANK_TOKEN}`,
    'Content-Type': 'application/json',
    Accept: 'application/json'
  }
});

function toCents(value) {
  return Math.round(Number(value) * 100);
}

function buildCustomer(user, order) {
  return {
    name: user.name,
    email: user.email,
    tax_id: (user.taxId || '').replace(/\D/g, ''),
    phones: user.phone
      ? [{ country: '55', area: user.phone.replace(/\D/g, '').slice(0, 2), number: user.phone.replace(/\D/g, '').slice(2), type: 'MOBILE' }]
      : []
  };
}

function buildItems(orderItems) {
  return orderItems.map((it) => ({
    reference_id: it.productId,
    name: it.productName,
    quantity: String(it.quantity),
    unit_amount: toCents(it.unitPrice)
  }));
}

/**
 * Cria e paga um pedido com Cartão de Crédito.
 * `encryptedCard` vem do front-end (PagSeguro.encryptCard()).
 */
async function pagarComCartao({ order, user, orderItems, encryptedCard, holderName, installments = 1 }) {
  const payload = {
    reference_id: order.id,
    customer: buildCustomer(user, order),
    items: buildItems(orderItems),
    shipping: {
      address: {
        street: order.deliveryAddress.street,
        number: order.deliveryAddress.number,
        complement: order.deliveryAddress.complement || '',
        locality: order.deliveryAddress.neighborhood || '',
        city: order.deliveryAddress.city,
        region_code: order.deliveryAddress.state,
        country: 'BRA',
        postal_code: order.deliveryAddress.postalCode.replace(/\D/g, '')
      }
    },
    charges: [
      {
        reference_id: `${order.id}-charge`,
        description: `Pedido Hanami #${order.id.slice(0, 8)}`,
        amount: { value: toCents(order.total), currency: 'BRL' },
        payment_method: {
          type: 'CREDIT_CARD',
          installments,
          capture: true,
          card: {
            encrypted: encryptedCard,
            holder: { name: holderName }
          }
        },
        notification_urls: [`${process.env.PUBLIC_API_URL || ''}/api/payments/webhook`]
      }
    ]
  };

  return sendOrder(payload);
}

/**
 * Cria um pedido com QR Code PIX. Diferente do cartão, não enviamos o
 * objeto `charges` — apenas `qr_codes`, conforme a doc "Criar pedido com QR
 * Code (PIX)". A confirmação do pagamento chega depois via webhook.
 */
async function gerarPix({ order, user, orderItems }) {
  const expiracao = new Date(Date.now() + 30 * 60 * 1000); // QR Code válido por 30 min

  const payload = {
    reference_id: order.id,
    customer: buildCustomer(user, order),
    items: buildItems(orderItems),
    qr_codes: [
      {
        amount: { value: toCents(order.total) },
        expiration_date: expiracao.toISOString()
      }
    ],
    notification_urls: [`${process.env.PUBLIC_API_URL || ''}/api/payments/webhook`]
  };

  return sendOrder(payload);
}

async function sendOrder(payload) {
  try {
    const { data } = await pagbankClient.post('/orders', payload);
    return data;
  } catch (err) {
    const error = new Error('Falha na comunicação com o PagBank.');
    error.isPagBankError = true;
    error.statusCode = err.response?.status || 502;
    error.details = err.response?.data || err.message;
    throw error;
  }
}

/**
 * Consulta um pedido existente no PagBank (usado para reconciliar status).
 */
async function consultarPedido(pagbankOrderId) {
  try {
    const { data } = await pagbankClient.get(`/orders/${pagbankOrderId}`);
    return data;
  } catch (err) {
    const error = new Error('Falha ao consultar pedido no PagBank.');
    error.isPagBankError = true;
    error.statusCode = err.response?.status || 502;
    error.details = err.response?.data || err.message;
    throw error;
  }
}

/**
 * Mapeia o status de charge do PagBank (AUTHORIZED, PAID, DECLINED,
 * CANCELED, IN_ANALYSIS...) para o enum interno de status do pedido.
 */
function mapChargeStatusToOrderStatus(chargeStatus) {
  const map = {
    PAID: 'paid',
    AUTHORIZED: 'paid',
    DECLINED: 'cancelled',
    CANCELED: 'cancelled',
    IN_ANALYSIS: 'pending',
    WAITING: 'pending'
  };
  return map[chargeStatus] || 'pending';
}

module.exports = {
  pagarComCartao,
  gerarPix,
  consultarPedido,
  mapChargeStatusToOrderStatus,
  uuidv4
};
