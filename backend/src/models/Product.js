const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

/**
 * Categorias válidas — espelham as categorias do cardápio original (script.js).
 */
const CATEGORIAS = [
  'sushi', 'sashimi', 'chuukaman', 'temaki',
  'nigiri', 'quentes', 'entradas', 'sobremesas'
];

class Product extends Model {}

Product.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(150),
      allowNull: false,
      validate: { notEmpty: true }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    category: {
      type: DataTypes.ENUM(...CATEGORIAS),
      allowNull: false
    },
    price: {
      // preço em reais, com 2 casas decimais (DECIMAL evita erro de ponto flutuante)
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: { min: 0.01 }
    },
    stock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: { min: 0 }
    },
    featured: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'featured'
    },
    imageUrl: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'image_url'
    },
    active: {
      // soft-delete: produtos "excluídos" ficam inativos em vez de removidos
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    }
  },
  {
    sequelize,
    modelName: 'Product',
    tableName: 'products'
  }
);

Product.CATEGORIAS = CATEGORIAS;

module.exports = Product;
