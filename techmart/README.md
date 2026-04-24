# TechMart - E-Commerce & Admin System

## Setup & Installation

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Configure environment (`.env` already pre-configured):
```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/techmart
SESSION_SECRET=techmart_super_secret_key_2024
ADMIN_EMAIL=admin@techmart.com
ADMIN_PASSWORD=Admin@123
```

3. Run the server:
```bash
npm run dev   # Development (nodemon)
npm start     # Production
```

4. Visit: http://localhost:3000

## Admin Access
- URL: http://localhost:3000/auth/admin-login
- Email: admin@techmart.com
- Password: Admin@123

## Project Structure
```
techmart/
├── server.js           # Entry point
├── .env                # Environment variables
├── config/
│   └── seed.js         # Admin seeder
├── models/
│   ├── User.js
│   ├── Product.js
│   └── Order.js
├── routes/
│   ├── index.js        # Home
│   ├── auth.js         # Login/Register
│   ├── products.js     # Product browsing
│   ├── cart.js         # Cart management
│   ├── orders.js       # Order flow
│   ├── user.js         # User profile
│   └── admin.js        # Admin panel
├── middleware/
│   └── auth.js         # Auth guards
├── views/
│   ├── index.ejs       # Homepage
│   ├── 404.ejs
│   ├── partials/       # Header/Footer
│   ├── auth/           # Login/Register pages
│   ├── user/           # User-facing pages
│   └── admin/          # Admin panel pages
└── public/
    ├── css/style.css   # Main styles
    ├── css/admin.css   # Admin styles
    ├── js/main.js      # Frontend JS
    └── js/admin.js     # Admin JS
```

## Features
### User Side
- Register / Login
- Browse products with filters (price, brand, rating, category)
- Product detail page
- Add to cart, update qty, remove items
- Checkout with address form + demo payment
- Order confirmation with status tracker
- User profile & order history

### Admin Side
- Dashboard with stats, revenue, order overview
- Add/Edit/Delete products (with image upload)
- Import products from FakeStore API
- View & manage all orders
- Update order status (Placed → Shipped → Delivered)
- View all users

## Tech Stack
- Frontend: HTML5, CSS3, JS (ES6+), Bootstrap 5, EJS templates
- Backend: Node.js + Express.js
- Database: MongoDB + Mongoose
- Auth: Session-based with bcrypt
- File Upload: Multer
