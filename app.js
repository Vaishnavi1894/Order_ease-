const express = require('express');
const cors    = require('cors');
const path    = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files
app.use(express.static(path.join(__dirname, 'public')));

// Serve uploaded images
app.use('/images', express.static(path.join(__dirname, 'public/images')));

// API Routes
app.use('/api/seller',   require('./server/routes/sellerRoutes'));
app.use('/api/products', require('./server/routes/productRoutes'));
app.use('/api/customer', require('./server/routes/customerRoutes'));
app.use('/api/orders',   require('./server/routes/orderRoutes'));

// Serve Frontend Pages
app.get('/',         (req, res) => res.sendFile(path.join(__dirname, 'public/pages/index.html')));
app.get('/products', (req, res) => res.sendFile(path.join(__dirname, 'public/pages/products.html')));
app.get('/cart',     (req, res) => res.sendFile(path.join(__dirname, 'public/pages/cart.html')));
app.get('/checkout', (req, res) => res.sendFile(path.join(__dirname, 'public/pages/checkout.html')));
app.get('/login',    (req, res) => res.sendFile(path.join(__dirname, 'public/pages/login.html')));
app.get('/register', (req, res) => res.sendFile(path.join(__dirname, 'public/pages/register.html')));
app.get('/seller',   (req, res) => res.sendFile(path.join(__dirname, 'public/pages/seller/dashboard.html')));

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ OrderEase server running at http://localhost:${PORT}`);
});