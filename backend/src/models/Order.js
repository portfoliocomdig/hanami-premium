const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class Order extends Model {}

Order.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'user_id'
    },
    status: {
      // ciclo de vida do pedido
      type: DataTypes.ENUM(
        'pending',    // criado, aguardando pagamento
        'paid',       // pagamento confirmado pelo PagBank
        'preparing',  // em preparo na cozinha
        'delivering', // saiu para entrega
        'delivered',  // entregue
        'cancelled',  // cancelado (pagamento recusado ou cancelamento manual)
        'refunded'    // estornado
      ),
      allowNull: false,
      defaultValue: 'pending'
    },
    subtotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    deliveryFee: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 7.9,
      field: 'delivery_fee'
    },
    total: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    paymentMethod: {
      type: DataTypes.ENUM('credit_card', 'pix'),
      allowNull: false,
      field: 'payment_method'
    },
    // Identificadores retornados pelo PagBank, usados para consulta/estorno/webhook
    pagbankOrderId: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'pagbank_order_id'
    },
    pagbankChargeId: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'pagbank_charge_id'
    },
    pixQrCode: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'pix_qr_code'
    },
    deliveryAddress: {
      type: DataTypes.JSONB,
      allowNull: false,
      field: 'delivery_address'
    }
  },
  {
    sequelize,
    modelName: 'Order',
    tableName: 'orders'
  }
);

module.exports = Order;
