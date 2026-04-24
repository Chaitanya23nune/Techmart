const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

router.get('/', async (req, res) => {
  try {
    const featured = await Product.find({ isFeatured: true }).limit(8);
    const categories = ['Mobile', 'Laptop', 'TV', 'Audio', 'Gaming', 'Accessories'];
    const topItems = await Product.find({ isTopItem: true }).limit(4);
    res.render('index', { title: 'TechMart - Home', featured, categories, topItems });
  } catch (err) {
    res.render('index', { title: 'TechMart - Home', featured: [], categories: [], topItems: [] });
  }
});

module.exports = router;
