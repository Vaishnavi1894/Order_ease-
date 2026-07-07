const db     = require('../db');
const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
require('dotenv').config();

// Register
const registerCustomer = (req, res) => {
    const { name, email, password, phone, address } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Name, email and password required.' });
    }

    db.query('SELECT id FROM customers WHERE email = ?', [email], (err, results) => {
        if (err) return res.status(500).json({ message: 'Database error.' });
        if (results.length > 0) return res.status(400).json({ message: 'Email already registered.' });

        const hashedPassword = bcrypt.hashSync(password, 10);
        const sql = 'INSERT INTO customers (name, email, password, phone, address) VALUES (?, ?, ?, ?, ?)';
        db.query(sql, [name, email, hashedPassword, phone, address], (err) => {
            if (err) return res.status(500).json({ message: 'Registration failed.' });
            res.status(201).json({ message: 'Customer registered successfully!' });
        });
    });
};

// Login
const loginCustomer = (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password required.' });

    db.query('SELECT * FROM customers WHERE email = ?', [email], (err, results) => {
        if (err) return res.status(500).json({ message: 'Database error.' });
        if (results.length === 0) return res.status(404).json({ message: 'Customer not found.' });

        const customer = results[0];
        const isMatch = bcrypt.compareSync(password, customer.password);
        if (!isMatch) return res.status(401).json({ message: 'Wrong password.' });

        const token = jwt.sign(
            { id: customer.id, role: 'customer', name: customer.name },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            message: 'Login successful!',
            token,
            customer: {
                id:    customer.id,
                name:  customer.name,
                email: customer.email
            }
        });
    });
};

// Get customer orders
const getMyOrders = (req, res) => {
    const sql = `
        SELECT o.*, GROUP_CONCAT(p.name SEPARATOR ', ') AS product_names
        FROM orders o
        JOIN order_items oi ON o.id = oi.order_id
        JOIN products p ON oi.product_id = p.id
        WHERE o.customer_id = ?
        GROUP BY o.id
        ORDER BY o.created_at DESC
    `;
    db.query(sql, [req.customer.id], (err, results) => {
        if (err) return res.status(500).json({ message: 'Error fetching orders.' });
        res.json(results);
    });
};

module.exports = { registerCustomer, loginCustomer, getMyOrders };