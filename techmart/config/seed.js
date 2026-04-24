const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Product = require('../models/Product');

async function seedAdmin() {
  try {
    // Always ensure admin exists with correct password
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@techmart.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123';

    const hashed = await bcrypt.hash(adminPassword, 10);

    const existing = await User.findOne({ email: adminEmail });
    if (existing) {
      // Update password hash in case it changed
      await User.findOneAndUpdate(
        { email: adminEmail },
        { password: hashed, role: 'admin', name: 'Admin' }
      );
      console.log('✅ Admin credentials refreshed:', adminEmail);
    } else {
      await User.create({
        name: 'Admin',
        email: adminEmail,
        password: hashed,
        role: 'admin'
      });
      console.log('✅ Admin created:', adminEmail);
    }
  } catch (err) {
    console.error('Seed admin error:', err.message);
  }
}

async function seedProducts() {
  try {
    const count = await Product.countDocuments();
    if (count > 0) {
      console.log(`ℹ️  Products already seeded (${count} found), skipping.`);
      return;
    }

    const products = [
      // Mobile
      { name: 'Samsung Galaxy S24 Ultra', description: 'The ultimate Galaxy experience with a built-in S Pen, 200MP camera, and powerful AI features. 6.8" Dynamic AMOLED display with 120Hz refresh rate.', price: 1199.99, originalPrice: 1399.99, category: 'Mobile', brand: 'Samsung', stock: 40, rating: 4.8, reviewCount: 2341, isFeatured: true, isTopItem: true, image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400&q=80' },
      { name: 'iPhone 15 Pro Max', description: 'Titanium design, A17 Pro chip, 48MP main camera with 5x optical zoom. The most powerful iPhone ever made.', price: 1299.00, originalPrice: 1299.00, category: 'Mobile', brand: 'Apple', stock: 25, rating: 4.9, reviewCount: 4102, isFeatured: true, isTopItem: true, image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400&q=80' },
      { name: 'Google Pixel 8 Pro', description: 'Google AI-powered camera, 7 years of OS updates, temperature sensor. 6.7" LTPO OLED display.', price: 799.00, originalPrice: 999.00, category: 'Mobile', brand: 'Google', stock: 60, rating: 4.6, reviewCount: 987, isFeatured: true, image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=400&q=80' },
      { name: 'OnePlus 12', description: 'Snapdragon 8 Gen 3, 100W SUPERVOOC charging, Hasselblad-tuned cameras. 6.82" 2K ProXDR display.', price: 649.00, originalPrice: 799.00, category: 'Mobile', brand: 'OnePlus', stock: 35, rating: 4.5, reviewCount: 654, isFeatured: false, image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&q=80' },
      { name: 'Xiaomi 14 Ultra', description: 'Leica quad camera system with 1-inch main sensor. Snapdragon 8 Gen 3 processor, 5000mAh battery.', price: 999.00, originalPrice: 1099.00, category: 'Mobile', brand: 'Xiaomi', stock: 20, rating: 4.7, reviewCount: 432, isFeatured: false, image: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=400&q=80' },
      // Laptop
      { name: 'MacBook Pro 16" M3 Max', description: 'Apple M3 Max chip with up to 40-core GPU, Liquid Retina XDR display, 22-hour battery life.', price: 3499.00, originalPrice: 3699.00, category: 'Laptop', brand: 'Apple', stock: 15, rating: 4.9, reviewCount: 1876, isFeatured: true, isTopItem: true, image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&q=80' },
      { name: 'Dell XPS 15 OLED', description: 'Intel Core i9-13900H, 32GB RAM, 1TB SSD, OLED InfinityEdge display. Premium build with aluminum chassis.', price: 1999.00, originalPrice: 2299.00, category: 'Laptop', brand: 'Dell', stock: 18, rating: 4.6, reviewCount: 745, isFeatured: true, image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&q=80' },
      { name: 'ASUS ROG Zephyrus G16', description: 'AMD Ryzen 9 7940HS, RTX 4090, 240Hz QHD+ display. The ultimate gaming laptop.', price: 2499.00, originalPrice: 2799.00, category: 'Laptop', brand: 'ASUS', stock: 12, rating: 4.7, reviewCount: 512, isFeatured: false, image: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=400&q=80' },
      { name: 'Lenovo ThinkPad X1 Carbon', description: 'Ultra-light business laptop, Intel Core i7, 16GB RAM, military-grade durability.', price: 1399.00, originalPrice: 1699.00, category: 'Laptop', brand: 'Lenovo', stock: 22, rating: 4.5, reviewCount: 893, isFeatured: false, image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400&q=80' },
      // TV
      { name: 'Samsung 65" Neo QLED 8K', description: '8K resolution, Quantum Matrix Technology, 4000-nit brightness, Object Tracking Sound+.', price: 2499.00, originalPrice: 3499.00, category: 'TV', brand: 'Samsung', stock: 8, rating: 4.8, reviewCount: 321, isFeatured: true, image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829e1?w=400&q=80' },
      { name: 'LG C3 OLED 55"', description: 'OLED evo panel, Dolby Vision, Dolby Atmos, 120Hz, HDMI 2.1. Perfect blacks and infinite contrast.', price: 1299.00, originalPrice: 1799.00, category: 'TV', brand: 'LG', stock: 14, rating: 4.9, reviewCount: 1243, isFeatured: true, image: 'https://images.unsplash.com/photo-1461151304267-38535e780c79?w=400&q=80' },
      { name: 'Sony Bravia XR A95L 65"', description: 'QD-OLED with Cognitive Processor XR, Acoustic Surface Audio+, Google TV. 2024 model.', price: 2799.00, originalPrice: 3299.00, category: 'TV', brand: 'Sony', stock: 6, rating: 4.8, reviewCount: 276, isFeatured: false, image: 'https://images.unsplash.com/photo-1571415060716-baff5f717c37?w=400&q=80' },
      // Audio
      { name: 'Sony WH-1000XM5', description: 'Industry-leading noise cancellation with 8 mics, 30hr battery, Auto NC Optimizer.', price: 349.00, originalPrice: 399.00, category: 'Audio', brand: 'Sony', stock: 50, rating: 4.8, reviewCount: 3421, isFeatured: true, isTopItem: true, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80' },
      { name: 'Apple AirPods Pro 2nd Gen', description: 'Active Noise Cancellation, Transparency mode, Adaptive Audio, MagSafe/USB-C charging.', price: 249.00, originalPrice: 249.00, category: 'Audio', brand: 'Apple', stock: 80, rating: 4.7, reviewCount: 5632, isFeatured: true, image: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=400&q=80' },
      { name: 'Bose QuietComfort Ultra', description: 'Immersive Audio, world-class noise cancellation, CustomTune technology. 24hr battery.', price: 429.00, originalPrice: 429.00, category: 'Audio', brand: 'Bose', stock: 35, rating: 4.7, reviewCount: 876, isFeatured: false, image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=400&q=80' },
      { name: 'JBL Flip 6 Bluetooth Speaker', description: 'IP67 waterproof, 12hrs playtime, PartyBoost to link multiple speakers. Bold JBL Pro Sound.', price: 129.00, originalPrice: 149.00, category: 'Audio', brand: 'JBL', stock: 100, rating: 4.5, reviewCount: 2109, isFeatured: false, image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&q=80' },
      // Gaming
      { name: 'PlayStation 5 Slim', description: 'PS5 Slim console with Ultra HD Blu-ray disc drive, DualSense controller, 1TB SSD.', price: 449.99, originalPrice: 499.99, category: 'Gaming', brand: 'Sony', stock: 20, rating: 4.9, reviewCount: 4521, isFeatured: true, isTopItem: true, image: 'https://images.unsplash.com/photo-1607853202273-797f1c22a38e?w=400&q=80' },
      { name: 'Xbox Series X', description: '12 teraflops of power, 4K gaming at 120fps, 1TB SSD, Quick Resume, backward compatibility.', price: 499.99, originalPrice: 499.99, category: 'Gaming', brand: 'Microsoft', stock: 18, rating: 4.8, reviewCount: 2876, isFeatured: true, image: 'https://images.unsplash.com/photo-1621259182978-fbf93132d53d?w=400&q=80' },
      { name: 'Nintendo Switch OLED', description: '7-inch OLED screen, enhanced audio, 64GB internal storage, wide adjustable stand.', price: 349.99, originalPrice: 349.99, category: 'Gaming', brand: 'Nintendo', stock: 30, rating: 4.7, reviewCount: 6543, isFeatured: false, image: 'https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=400&q=80' },
      { name: 'Razer DeathAdder V3 Pro', description: 'Wireless esports mouse, 30K DPI optical sensor, 90-hour battery, ultra-lightweight 63g.', price: 149.00, originalPrice: 179.00, category: 'Gaming', brand: 'Razer', stock: 55, rating: 4.6, reviewCount: 1234, isFeatured: false, image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&q=80' },
      // Accessories
      { name: 'Apple Watch Series 9 GPS 45mm', description: 'S9 chip, Double Tap gesture, Crash Detection, ECG app, Blood Oxygen. Carbon neutral.', price: 429.00, originalPrice: 499.00, category: 'Accessories', brand: 'Apple', stock: 45, rating: 4.8, reviewCount: 2109, isFeatured: true, image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=400&q=80' },
      { name: 'Samsung Galaxy Watch 6 Classic', description: 'Rotating Bezel, Advanced Sleep Coaching, Body Composition, Sapphire Crystal glass. 47mm.', price: 329.00, originalPrice: 399.00, category: 'Accessories', brand: 'Samsung', stock: 38, rating: 4.5, reviewCount: 876, isFeatured: false, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80' },
      { name: 'Anker 65W GaN USB-C Charger', description: 'Compact 3-port charger (2×USB-C, 1×USB-A), PowerIQ 4.0, compatible with all laptops.', price: 45.99, originalPrice: 59.99, category: 'Accessories', brand: 'Anker', stock: 150, rating: 4.7, reviewCount: 3421, isFeatured: false, image: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400&q=80' },
      { name: 'Logitech MX Keys S', description: 'Comfortable typing, smart backlighting, Bluetooth multi-device, USB-C rechargeable. Mac & PC.', price: 109.00, originalPrice: 129.00, category: 'Accessories', brand: 'Logitech', stock: 70, rating: 4.6, reviewCount: 1876, isFeatured: false, image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400&q=80' },
      { name: 'WD My Passport 4TB Portable SSD', description: 'USB 3.2 Gen 2, up to 1050MB/s, password protection, hardware encryption. Pocket-sized.', price: 99.00, originalPrice: 129.00, category: 'Accessories', brand: 'WD', stock: 65, rating: 4.4, reviewCount: 987, isFeatured: false, image: 'https://images.unsplash.com/photo-1597852074816-d933c7d2b988?w=400&q=80' },
    ];

    await Product.insertMany(products);
    console.log(`✅ Seeded ${products.length} sample products`);
  } catch (err) {
    console.error('Seed products error:', err.message);
  }
}

module.exports = { seedAdmin, seedProducts };
