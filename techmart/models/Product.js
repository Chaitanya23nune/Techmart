const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  originalPrice: { type: Number, default: 0 },
  category: { type: String, required: true, enum: ['Mobile', 'Laptop', 'TV', 'Audio', 'Gaming', 'Accessories'] },
  brand: { type: String, required: true },
  image: { type: String, default: '' },
  sku: { 
    type: String, 
    unique: true, 
    required: true 
  },

  stock: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  isFeatured: { type: Boolean, default: false },
  isTopItem: { type: Boolean, default: false },
  tags: [String],
  source: { type: String, enum: ['manual', 'api'], default: 'manual' }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
