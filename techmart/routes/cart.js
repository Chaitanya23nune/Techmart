const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { isAuth } = require('../middleware/auth');

// Get cart
router.get('/', isAuth, (req, res) => {
  const cart = req.session.cart || [];
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  res.render('user/cart', { title: 'My Cart', cart, total });
});

// Add to cart
router.post('/add', isAuth, async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const product = await Product.findById(productId);
    if (!product) return res.json({ success: false, message: 'Product not found' });

    if (!req.session.cart) req.session.cart = [];
    const cart = req.session.cart;
    const existing = cart.find(i => i.productId === productId);

    if (existing) {
      existing.quantity += parseInt(quantity);
    } else {
      cart.push({
        productId,
        name: product.name,
        price: product.price,
        image: p.image,
        quantity: parseInt(quantity)
      });
    }

    const cartCount = cart.reduce((a, i) => a + i.quantity, 0);
    res.json({ success: true, cartCount, message: 'Added to cart' });
  } catch (err) {
    res.json({ success: false, message: 'Error adding to cart' });
  }
});

// Update quantity
router.post('/update', isAuth, (req, res) => {
  const { productId, quantity } = req.body;
  const cart = req.session.cart || [];
  const item = cart.find(i => i.productId === productId);
  if (item) {
    if (parseInt(quantity) <= 0) {
      req.session.cart = cart.filter(i => i.productId !== productId);
    } else {
      item.quantity = parseInt(quantity);
    }
  }
  res.redirect('/cart');
});

// Remove item
router.post('/remove', isAuth, (req, res) => {
  const { productId } = req.body;
  req.session.cart = (req.session.cart || []).filter(i => i.productId !== productId);
  res.redirect('/cart');
});

// Clear cart
router.post('/clear', isAuth, (req, res) => {
  req.session.cart = [];
  res.redirect('/cart');
});

module.exports = router;
