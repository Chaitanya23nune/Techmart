const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// Product listing with filters
router.get('/', async (req, res) => {
  try {
    const { category, brand, minPrice, maxPrice, rating, search, sort } = req.query;
    let query = {};
    if (category) query.category = category;
    if (brand) query.brand = new RegExp(brand, 'i');
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    if (rating) query.rating = { $gte: Number(rating) };
    if (search) query.$or = [
      { name: new RegExp(search, 'i') },
      { description: new RegExp(search, 'i') },
      { brand: new RegExp(search, 'i') }
    ];

    let sortObj = {};
    if (sort === 'price_asc') sortObj = { price: 1 };
    else if (sort === 'price_desc') sortObj = { price: -1 };
    else if (sort === 'rating') sortObj = { rating: -1 };
    else sortObj = { createdAt: -1 };

    const products = await Product.find(query).sort(sortObj);
    const brands = await Product.distinct('brand');
    const categories = ['Mobile', 'Laptop', 'TV', 'Audio', 'Gaming', 'Accessories'];

    res.render('user/products', {
      title: 'Browse Products',
      products, brands, categories,
      filters: req.query
    });
  } catch (err) {
    res.redirect('/');
  }
});

// Single product
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.redirect('/products');
    const related = await Product.find({ category: product.category, _id: { $ne: product._id } }).limit(4);
    res.render('user/product-detail', { title: product.name, product, related });
  } catch (err) {
    res.redirect('/products');
  }
});

module.exports = router;
