const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');
const multer = require("multer");
const path = require("path");
const { isAdmin } = require('../middleware/auth');
const cloudinary = require("../config/cloudinary");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });
// Dashboard
router.get('/dashboard', isAdmin, async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();
    const totalUsers = await User.countDocuments({ role: 'user' });
    const orders = await Order.find().sort({ createdAt: -1 });
    const revenue = orders.filter(o => o.status !== 'Cancelled')
      .reduce((sum, o) => sum + o.totalAmount, 0);

    const statusCount = {
      Placed: await Order.countDocuments({ status: 'Placed' }),
      Confirmed: await Order.countDocuments({ status: 'Confirmed' }),
      Shipped: await Order.countDocuments({ status: 'Shipped' }),
      Delivered: await Order.countDocuments({ status: 'Delivered' }),
      Cancelled: await Order.countDocuments({ status: 'Cancelled' })
    };

    const recentOrders = await Order.find().sort({ createdAt: -1 }).limit(8).populate('user', 'name email');
    const lowStock = await Product.find({ stock: { $lt: 10 } }).limit(5);

    res.render('admin/dashboard', {
      title: 'Admin Dashboard',
      totalProducts, totalOrders, totalUsers, revenue,
      statusCount, recentOrders, lowStock
    });
  } catch (err) {
    res.redirect('/');
  }
});

// Products List
router.get('/products', isAdmin, async (req, res) => {
  try {
    const { search, category } = req.query;
    let query = {};
    if (search) query.name = new RegExp(search, 'i');
    if (category) query.category = category;
    const products = await Product.find(query).sort({ createdAt: -1 });
    res.render('admin/products', { title: 'Manage Products', products, filters: req.query });
  } catch (err) {
    res.redirect('/admin/dashboard');
  }
});

// Add product form
router.get('/products/add', isAdmin, (req, res) => {
  res.render('admin/product-form', {
    title: 'Add Product',
    product: null,
    error: null   // 🔥 ADD THIS
  });
});

// Add product post
router.post("/products/add", upload.single("image"), async (req, res) => {
  try {
    const skuvalue = req.body.sku || ("TM-" + Date.now());

    const {
      name,
      description,
      price,
      originalPrice,
      category,
      brand,
      stock,
      rating,
      isFeatured,
      isTopItem
    } = req.body;

if (!req.file) {
  return res.render("admin/product-form", {
    title: "Add Product",
    product: null,
    error: "Please upload a product image"
  });
}

const result = await cloudinary.uploader.upload(req.file.path, {
  folder: "techmart_products"
});

const product = new Product({
  name,
  description,
  price: Number(price),
  originalPrice: Number(originalPrice) || 0,
  category,
  brand,
  stock: Number(stock),
  rating: Number(rating) || 0,
  image: result.secure_url,
  sku: skuvalue,
  isFeatured: isFeatured === "on",
  isTopItem: isTopItem === "on"
});

    await product.save();

    res.redirect("/admin/products");

  } catch (err) {
    console.log(err);

    res.render("admin/product-form", {
      title: "Add Product",
      product: null,
      error: err.message
    });
  }
});
// Edit product form
router.get('/products/edit/:id', async (req, res) => {
  const product = await Product.findById(req.params.id);

  res.render('admin/product-form', {
    title: 'Edit Product',
    product,
    error: null   // 🔥 ADD THIS
  });
});

// Edit product post
router.post('/products/edit/:id', isAdmin, upload.single('image'), async (req, res) => {
  try {
    const { name, description, price, originalPrice, category, brand, stock, rating, isFeatured, isTopItem } = req.body;
    const update = { name, description, price: Number(price), originalPrice: Number(originalPrice || 0), category, brand, stock: Number(stock), rating: Number(rating || 0), isFeatured: !!isFeatured, isTopItem: !!isTopItem };
    if (req.file) {
  const result = await cloudinary.uploader.upload(req.file.path, {
  folder: "techmart_products"
});

update.image = result.secure_url;
}
    await Product.findByIdAndUpdate(req.params.id, update);
    res.redirect('/admin/products');
  } catch (err) {
  console.log(err);

  const product = await Product.findById(req.params.id);

  res.render('admin/product-form', {
    title: 'Edit Product',
    product,
    error: 'Failed to update product'
  });
}
});

// Delete product
router.post('/products/delete/:id', isAdmin, async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.redirect('/admin/products');
});

// Import from fake API
router.get('/products/import-api', isAdmin, async (req, res) => {
  try {
    const fetch = require('node-fetch');
    const response = await fetch('https://fakestoreapi.com/products?limit=10');
    const items = await response.json();
    let imported = 0;
    for (const item of items) {
      const exists = await Product.findOne({ name: item.title });
      if (!exists) {
        await Product.create({
          name: item.title.substring(0, 100),
          description: item.description,
          price: item.price,
          originalPrice: (item.price * 1.2).toFixed(2),
          category: item.category === "electronics" ? "Accessories" :
                    item.category === "men's clothing" ? "Accessories" : "Accessories",
          brand: 'Imported',
          image: item.image,
          stock: Math.floor(Math.random() * 50) + 10,
          rating: item.rating ? item.rating.rate : 4,
          reviewCount: item.rating ? item.rating.count : 0,
          source: 'api'
        });
        imported++;
      }
    }
    res.redirect('/admin/products?imported=' + imported);
  } catch (err) {
    res.redirect('/admin/products?error=import_failed');
  }
});

// Orders
router.get('/orders', isAdmin, async (req, res) => {
  try {
    const { status, search } = req.query;
    let query = {};
    if (status) query.status = status;
    const orders = await Order.find(query).sort({ createdAt: -1 }).populate('user', 'name email');
    res.render('admin/orders', { title: 'Manage Orders', orders, filters: req.query });
  } catch (err) {
    res.redirect('/admin/dashboard');
  }
});

// Order detail
router.get('/orders/:id', isAdmin, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email phone');
    res.render('admin/order-detail', { title: 'Order Detail', order });
  } catch (err) {
    res.redirect('/admin/orders');
  }
});

// Update order status
router.post('/orders/:id/status', isAdmin, async (req, res) => {
  try {
    await Order.findByIdAndUpdate(req.params.id, { status: req.body.status });
    res.redirect('/admin/orders/' + req.params.id);
  } catch (err) {
    res.redirect('/admin/orders');
  }
});

// Users
router.get('/users', isAdmin, async (req, res) => {
  try {
    const users = await User.find({ role: 'user' }).sort({ createdAt: -1 });
    res.render('admin/users', { title: 'Manage Users', users });
  } catch (err) {
    res.redirect('/admin/dashboard');
  }
});

module.exports = router;
