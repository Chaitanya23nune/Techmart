const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const { isAuth } = require('../middleware/auth');

// Checkout page
router.get('/checkout', isAuth, (req, res) => {
  const cart = req.session.cart || [];
  if (cart.length === 0) return res.redirect('/cart');
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  res.render('user/checkout', { title: 'Checkout', cart, total, user: req.session.user });
});

// Place order
router.post('/place', isAuth, async (req, res) => {
  try {
    const { name, phone, street, city, state, zip, deliveryType } = req.body;
    const cart = req.session.cart || [];
    if (cart.length === 0) return res.redirect('/cart');

    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const order = await Order.create({
      user: req.session.user.id,
      items: cart.map(i => ({
        product: i.productId,
        name: i.name,
        price: i.price,
        quantity: i.quantity,
        image: i.image
      })),
      address: { name, phone, street, city, state, zip },
      totalAmount: total,
      deliveryType: deliveryType || 'standard'
    });

    // Update stock
    for (const item of cart) {
      await Product.findByIdAndUpdate(item.productId, { $inc: { stock: -item.quantity } });
    }

    req.session.cart = [];
    res.redirect('/orders/confirmation/' + order._id);
  } catch (err) {
    res.redirect('/orders/checkout');
  }
});

// Order confirmation
router.get('/confirmation/:id', isAuth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order || order.user.toString() !== req.session.user.id.toString())
      return res.redirect('/');
    res.render('user/order-confirmation', { title: 'Order Confirmed', order });
  } catch (err) {
    res.redirect('/');
  }
});

// User's orders
router.get('/', isAuth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.session.user.id }).sort({ createdAt: -1 });
    res.render('user/orders', { title: 'My Orders', orders });
  } catch (err) {
    res.redirect('/');
  }
});

// Single order
router.get('/:id', isAuth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order || order.user.toString() !== req.session.user.id.toString())
      return res.redirect('/orders');
    res.render('user/order-detail', { title: 'Order Details', order });
  } catch (err) {
    res.redirect('/orders');
  }
});

module.exports = router;
