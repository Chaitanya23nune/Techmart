require('dotenv').config();
const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const mongoose = require('mongoose');
const path = require('path');

const app = express();

// Connect MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('MongoDB Error:', err));

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
console.log("Serving static from:", path.join(__dirname, 'public'));
// Session
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
  mongoUrl: process.env.MONGO_URI
}),
  cookie: { maxAge: 1000 * 60 * 60 * 24 }
}));

// Global variables middleware
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  res.locals.isAdmin = req.session.isAdmin || false;
  res.locals.cartCount = req.session.cart ? req.session.cart.reduce((a, i) => a + i.quantity, 0) : 0;
  next();
});

// Seed Admin & Sample Products
const { seedAdmin, seedProducts } = require('./config/seed');
mongoose.connection.once('open', () => {
  seedAdmin();
  seedProducts();
});

// Routes
app.use('/', require('./routes/index'));
app.use('/auth', require('./routes/auth'));
app.use('/products', require('./routes/products'));
app.use('/cart', require('./routes/cart'));
app.use('/orders', require('./routes/orders'));
app.use('/admin', require('./routes/admin'));
app.use('/user', require('./routes/user'));

// 404
app.use((req, res) => {
  res.status(404).render('404', { title: '404 - Page Not Found' });
});
app.use((req, res, next) => {
  res.locals.title = 'TechMart';
  next();
});

app.use((req, res, next) => {
  res.locals.error = null;
  next();
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 TechMart running on http://localhost:${PORT}`));
