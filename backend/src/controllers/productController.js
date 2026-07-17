const { Product } = require('../models');
const { Op } = require('sequelize');

/** GET /api/products  — filtros: ?category=&sort=price_asc|price_desc|name&featured=true */
async function list(req, res, next) {
  try {
    const { category, sort, featured, search } = req.query;
    const where = { active: true };

    if (category && category !== 'todos') where.category = category;
    if (featured === 'true') where.featured = true;
    if (search) where.name = { [Op.iLike]: `%${search}%` };

    const order = [];
    switch (sort) {
      case 'price_asc': order.push(['price', 'ASC']); break;
      case 'price_desc': order.push(['price', 'DESC']); break;
      case 'name': order.push(['name', 'ASC']); break;
      default: order.push(['createdAt', 'DESC']);
    }

    const products = await Product.findAll({ where, order });
    return res.json({ success: true, count: products.length, products });
  } catch (err) {
    next(err);
  }
}

/** GET /api/products/:id */
async function getById(req, res, next) {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product || !product.active) {
      return res.status(404).json({ success: false, message: 'Produto não encontrado.' });
    }
    return res.json({ success: true, product });
  } catch (err) {
    next(err);
  }
}

/** POST /api/products — somente admin */
async function create(req, res, next) {
  try {
    const product = await Product.create(req.body);
    return res.status(201).json({ success: true, product });
  } catch (err) {
    next(err);
  }
}

/** PUT /api/products/:id — somente admin */
async function update(req, res, next) {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Produto não encontrado.' });
    }
    await product.update(req.body);
    return res.json({ success: true, product });
  } catch (err) {
    next(err);
  }
}

/** DELETE /api/products/:id — somente admin (soft-delete) */
async function remove(req, res, next) {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Produto não encontrado.' });
    }
    await product.update({ active: false });
    return res.json({ success: true, message: 'Produto removido.' });
  } catch (err) {
    next(err);
  }
}

module.exports = { list, getById, create, update, remove };
