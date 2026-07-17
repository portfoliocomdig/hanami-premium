const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class OrderItem extends Model {}

OrderItem.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    orderId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'order_id'
    },
    productId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'product_id'
    },
    // Congelamos nome e preço no momento da compra (o produto pode mudar depois)
    productName: {
      type: DataTypes.STRING(150),
      allowNull: false,
      field: 'product_name'
    },
    unitPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      field: 'unit_price'
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 1 }
    }
  },
  {
    sequelize,
    modelName: 'OrderItem',
    tableName: 'order_items'
  }
);

module.exports = OrderItem;
