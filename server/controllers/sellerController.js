const db      = require('../db');
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
require('dotenv').config();

// REGISTER
const registerSeller = (req, res) => {
    const { name, email, password, shop_name, shop_description, phone } = req.body;

    if (!name || !email || !password || !shop_name) {
        return res.status(400).json({ message: 'Please fill all required fields.' });
    }

    db.query('SELECT id FROM seller WHERE email = ?', [email], (err, results) => {
        if (err) return res.status(500).json({ message: 'Database error.' });
        if (results.length > 0) return res.status(400).json({ message: 'Email already registered.' });

        const hashedPassword = bcrypt.hashSync(password, 10);

        const sql = `INSERT INTO seller (name, email, password, shop_name, shop_description, phone)
                     VALUES (?, ?, ?, ?, ?, ?)`;
        db.query(sql, [name, email, hashedPassword, shop_name, shop_description, phone], (err) => {
            if (err) return res.status(500).json({ message: 'Registration failed.' });
            res.status(201).json({ message: 'Seller registered successfully!' });
        });
    });
};

// LOGIN
const loginSeller = (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password required.' });
    }

    db.query('SELECT * FROM seller WHERE email = ?', [email], (err, results) => {
        if (err) return res.status(500).json({ message: 'Database error.' });
        if (results.length === 0) return res.status(404).json({ message: 'Seller not found.' });

        const seller = results[0];
        const isMatch = bcrypt.compareSync(password, seller.password);
        if (!isMatch) return res.status(401).json({ message: 'Wrong password.' });

        const token = jwt.sign(
            { id: seller.id, role: 'seller', shop_name: seller.shop_name },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            message: 'Login successful!',
            token,
            seller: {
                id:        seller.id,
                name:      seller.name,
                shop_name: seller.shop_name,
                email:     seller.email
            }
        });
    });
};

// DASHBOARD STATS
const getDashboard = (req, res) => {
    const totalOrders   = 'SELECT COUNT(*) AS total FROM orders';
    const pendingOrders = "SELECT COUNT(*) AS pending FROM orders WHERE status = 'Pending'";
    const totalRevenue  = 'SELECT SUM(total_amount) AS revenue FROM orders';
    const lowStock      = 'SELECT COUNT(*) AS low FROM products WHERE stock < 5';

    db.query(totalOrders, (err, t) => {
        db.query(pendingOrders, (err, p) => {
            db.query(totalRevenue, (err, r) => {
                db.query(lowStock, (err, l) => {
                    res.json({
                        total_orders:   t[0].total,
                        pending_orders: p[0].pending,
                        total_revenue:  r[0].revenue || 0,
                        low_stock:      l[0].low
                    });
                });
            });
        });
    });
};

module.exports = { registerSeller, loginSeller, getDashboard };