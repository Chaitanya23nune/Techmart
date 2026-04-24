const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Order = require('../models/Order');
const bcrypt = require('bcryptjs');
const { isAuth } = require('../middleware/auth');

router.get('/profile', isAuth, async (req, res) => {
  try {
    const user = await User.findById(req.session.user.id);
    const orders = await Order.find({ user: user._id }).sort({ createdAt: -1 }).limit(5);
    res.render('user/profile', { title: 'My Profile', user, orders });
  } catch (err) {
    res.redirect('/');
  }
});

router.post('/profile', isAuth, async (req, res) => {
  try {
    const { name, phone, street, city, state, zip } = req.body;
    await User.findByIdAndUpdate(req.session.user.id, {
      name, phone, address: { street, city, state, zip }
    });
    req.session.user.name = name;
    res.redirect('/user/profile');
  } catch (err) {
    res.redirect('/user/profile');
  }
});

router.post('/change-password', isAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.session.user.id);
    if (!await bcrypt.compare(currentPassword, user.password)) {
      return res.redirect('/user/profile?error=wrong_password');
    }
    const hashed = await bcrypt.hash(newPassword, 10);
    await User.findByIdAndUpdate(req.session.user.id, { password: hashed });
    res.redirect('/user/profile?success=password_changed');
  } catch (err) {
    res.redirect('/user/profile');
  }
});

module.exports = router;
