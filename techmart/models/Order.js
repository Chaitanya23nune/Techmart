const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name: String,
    price: Number,
    quantity: Number,
    image: String
  }],
  address: {
    name: String,
    phone: String,
    street: String,
    city: String,
    state: String,
    zip: String
  },
  paymentMethod: { type: String, default: 'Demo Payment' },
  totalAmount: { type: Number, required: true },
  deliveryType: { type: String, enum: ['standard', 'pickup'], default: 'standard' },
  status: {
    type: String,
    enum: ['Placed', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'],
    default: 'Placed'
  },
  orderId: { type: String, unique: true }
}, { timestamps: true });

orderSchema.pre('save', function(next) {
  if (!this.orderId) {
    this.orderId = 'TM' + Date.now().toString().slice(-8) + Math.floor(Math.random() * 1000);
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);
