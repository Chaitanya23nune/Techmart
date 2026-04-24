const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { isGuest } = require('../middleware/auth');

// ── Register ─────────────────────────────────
router.get('/register', isGuest, (req, res) =>
  res.render('auth/register', { title: 'Register', error: null })
);

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.render('auth/register', { title: 'Register', error: 'All fields are required' });

    const exists = await User.findOne({ email: email.toLowerCase().trim() });
    if (exists)
      return res.render('auth/register', { title: 'Register', error: 'Email already registered. Please login.' });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name: name.trim(), email: email.toLowerCase().trim(), password: hashed });

    req.session.user = { id: user._id, name: user.name, email: user.email, role: user.role };
    if (!req.session.cart) req.session.cart = [];
    res.redirect('/');
  } catch (err) {
    console.error('Register error:', err);
    res.render('auth/register', { title: 'Register', error: 'Registration failed. Please try again.' });
  }
});

// ── User Login ───────────────────────────────
router.get('/login', isGuest, (req, res) =>
  res.render('auth/login', { title: 'Login', error: null })
);

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.render('auth/login', { title: 'Login', error: 'Email and password are required' });

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      console.log('Login: user not found for email:', email);
      return res.render('auth/login', { title: 'Login', error: 'Invalid email or password' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      console.log('Login: password mismatch for:', email);
      return res.render('auth/login', { title: 'Login', error: 'Invalid email or password' });
    }

    req.session.user = { id: user._id, name: user.name, email: user.email, role: user.role };
    if (!req.session.cart) req.session.cart = [];

    // If admin logs in via /auth/login, redirect to admin panel
    if (user.role === 'admin') {
      req.session.isAdmin = true;
      return res.redirect('/admin/dashboard');
    }

    const returnTo = req.session.returnTo || '/';
    delete req.session.returnTo;
    res.redirect(returnTo);
  } catch (err) {
    console.error('Login error:', err);
    res.render('auth/login', { title: 'Login', error: 'Login failed. Please try again.' });
  }
});

// ── Admin Login ──────────────────────────────
router.get('/admin-login', (req, res) => {
  if (req.session.isAdmin) return res.redirect('/admin/dashboard');
  res.render('auth/admin-login', { title: 'Admin Login', error: null });
});

router.post('/admin-login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.render('auth/admin-login', { title: 'Admin Login', error: 'Email and password are required' });

    const cleanEmail = email.toLowerCase().trim();
    console.log('Admin login attempt:', cleanEmail);

    const user = await User.findOne({ email: cleanEmail, role: 'admin' });
    if (!user) {
      console.log('Admin login: no admin user found for:', cleanEmail);
      return res.render('auth/admin-login', { title: 'Admin Login', error: 'Invalid admin credentials' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      console.log('Admin login: password mismatch for:', cleanEmail);
      return res.render('auth/admin-login', { title: 'Admin Login', error: 'Invalid admin credentials' });
    }

    req.session.user    = { id: user._id, name: user.name, email: user.email, role: user.role };
    req.session.isAdmin = true;
    if (!req.session.cart) req.session.cart = [];

    console.log('Admin login success:', cleanEmail);
    res.redirect('/admin/dashboard');
  } catch (err) {
    console.error('Admin login error:', err);
    res.render('auth/admin-login', { title: 'Admin Login', error: 'Login failed. Please try again.' });
  }
});

// ── Logout ───────────────────────────────────
router.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) console.error('Logout error:', err);
    res.redirect('/');
  });
});

// ── Reset Admin (emergency endpoint) ─────────
router.get('/reset-admin', async (req, res) => {
  try {
    const { seedAdmin } = require('../config/seed');
    await seedAdmin();
    res.json({ success: true, message: 'Admin reset. Use admin@techmart.com / Admin@123' });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

module.exports = router;
