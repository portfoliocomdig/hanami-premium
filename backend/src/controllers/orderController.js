const { sequelize, Order, OrderItem, Product } = require('../models');
const pagbank = require('../services/pagbankService');

const TAXA_ENTREGA = 7.9;

/**
 * POST /api/orders
 * Cria o pedido no banco local (dentro de uma transação, com baixa de
 * estoque) e, em seguida, aciona o PagBank para efetivar o pagamento.
 * Se o PagBank falhar, a transação inteira é revertida (nada fica "meio
 * criado" no banco).
 */
async function create(req, res, next) {
  const t = await sequelize.transaction();
  try {
    const { items, paymentMethod, deliveryAddress, card, installments } = req.body;

    // 1) Carrega produtos e valida estoque/preço a partir do BANCO,
    //    nunca confiando em preço enviado pelo cliente.
    const productIds = items.map((i) => i.productId);
    const products = await Product.findAll({ where: { id: productIds }, transaction: t, lock: t.LOCK.UPDATE });

    if (products.length !== productIds.length) {
      await t.rollback();
      return res.status(404).json({ success: false, message: 'Um ou mais produtos não foram encontrados.' });
    }

    let subtotal = 0;
    const orderItemsData = items.map((reqItem) => {
      const product = products.find((p) => p.id === reqItem.productId);
      if (!product.active) throw badRequest(`Produto "${product.name}" não está mais disponível.`);
      if (product.stock < reqItem.quantity) throw badRequest(`Estoque insuficiente para "${product.name}".`);
      subtotal += Number(product.price) * reqItem.quantity;
      return {
        productId: product.id,
        productName: product.name,
        unitPrice: product.price,
        quantity: reqItem.quantity
      };
    });

    const total = subtotal + TAXA_ENTREGA;

    // 2) Cria o pedido em status "pending"
    const order = await Order.create(
      {
        userId: req.user.id,
        status: 'pending',
        subtotal,
        deliveryFee: TAXA_ENTREGA,
        total,
        paymentMethod,
        deliveryAddress
      },
      { transaction: t }
    );

    await OrderItem.bulkCreate(
      orderItemsData.map((i) => ({ ...i, orderId: order.id })),
      { transaction: t }
    );

    // 3) Baixa de estoque
    for (const reqItem of items) {
      const product = products.find((p) => p.id === reqItem.productId);
      await product.decrement('stock', { by: reqItem.quantity, transaction: t });
    }

    // 4) Aciona o PagBank
    let pagbankResponse;
    if (paymentMethod === 'credit_card') {
      pagbankResponse = await pagbank.pagarComCartao({
        order,
        user: req.user,
        orderItems: orderItemsData,
        encryptedCard: card.encrypted,
        holderName: card.holderName,
        installments: installments || 1
      });
    } else {
      pagbankResponse = await pagbank.gerarPix({ order, user: req.user, orderItems: orderItemsData });
    }

    // 5) Atualiza o pedido com os identificadores do PagBank
    const charge = pagbankResponse.charges?.[0];
    const qrCode = pagbankResponse.qr_codes?.[0];

    await order.update(
      {
        pagbankOrderId: pagbankResponse.id,
        pagbankChargeId: charge?.id || null,
        pixQrCode: qrCode?.text || null,
        status: charge ? pagbank.mapChargeStatusToOrderStatus(charge.status) : 'pending'
      },
      { transaction: t }
    );

    await t.commit();

    const fullOrder = await Order.findByPk(order.id, { include: ['items'] });
    return res.status(201).json({ success: true, order: fullOrder, pagbank: pagbankResponse });
  } catch (err) {
    await t.rollback();
    if (err.statusCode === 400) return res.status(400).json({ success: false, message: err.message });
    next(err);
  }
}

function badRequest(message) {
  const err = new Error(message);
  err.statusCode = 400;
  return err;
}

/** GET /api/orders — pedidos do usuário autenticado (ou todos, se admin + ?all=true) */
async function list(req, res, next) {
  try {
    const where = req.user.role === 'admin' && req.query.all === 'true' ? {} : { userId: req.user.id };
    const orders = await Order.findAll({ where, include: ['items'], order: [['createdAt', 'DESC']] });
    return res.json({ success: true, count: orders.length, orders });
  } catch (err) {
    next(err);
  }
}

/** GET /api/orders/:id */
async function getById(req, res, next) {
  try {
    const order = await Order.findByPk(req.params.id, { include: ['items'] });
    if (!order) return res.status(404).json({ success: false, message: 'Pedido não encontrado.' });
    if (order.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Você não tem acesso a este pedido.' });
    }
    return res.json({ success: true, order });
  } catch (err) {
    next(err);
  }
}

/** PATCH /api/orders/:id/status — somente admin (ex.: preparing, delivering, delivered) */
async function updateStatus(req, res, next) {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Pedido não encontrado.' });
    await order.update({ status: req.body.status });
    return res.json({ success: true, order });
  } catch (err) {
    next(err);
  }
}

/** DELETE /api/orders/:id — cancela um pedido ainda pendente (dono ou admin) */
async function cancel(req, res, next) {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Pedido não encontrado.' });
    if (order.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Você não tem acesso a este pedido.' });
    }
    if (!['pending', 'paid'].includes(order.status)) {
      return res.status(409).json({ success: false, message: 'Este pedido não pode mais ser cancelado.' });
    }
    await order.update({ status: 'cancelled' });
    return res.json({ success: true, message: 'Pedido cancelado.' });
  } catch (err) {
    next(err);
  }
}

module.exports = { create, list, getById, updateStatus, cancel };
