const db = require('../db');

// Get all products
const getAllProducts = (req, res) => {
    const { category, minPrice, maxPrice, search } = req.query;
    let sql = 'SELECT * FROM products WHERE 1=1';
    const params = [];

    if (category) { sql += ' AND category = ?';  params.push(category); }
    if (minPrice) { sql += ' AND price >= ?';     params.push(minPrice); }
    if (maxPrice) { sql += ' AND price <= ?';     params.push(maxPrice); }
    if (search)   { sql += ' AND name LIKE ?';    params.push(`%${search}%`); }

    sql += ' ORDER BY created_at DESC';
    db.query(sql, params, (err, results) => {
        if (err) return res.status(500).json({ message: 'Error fetching products.' });
        res.json(results);
    });
};

// Get single product
const getProduct = (req, res) => {
    db.query('SELECT * FROM products WHERE id = ?', [req.params.id], (err, results) => {
        if (err) return res.status(500).json({ message: 'Error.' });
        if (results.length === 0) return res.status(404).json({ message: 'Product not found.' });
        res.json(results[0]);
    });
};

// Add product (seller only)
const addProduct = (req, res) => {
    const { name, description, price, category, stock } = req.body;
    const image = req.file ? req.file.path : 'https://placehold.co/300x200';

    if (!name || !price || !category) {
        return res.status(400).json({ message: 'Name, price and category are required.' });
    }

    const sql = 'INSERT INTO products (name, description, price, category, stock, image) VALUES (?, ?, ?, ?, ?, ?)';
    db.query(sql, [name, description, price, category, stock || 0, image], (err, result) => {
        if (err) return res.status(500).json({ message: 'Failed to add product.' });
        res.status(201).json({ message: 'Product added!', id: result.insertId });
    });
};

// Edit product (seller only)
const editProduct = (req, res) => {
    const { name, description, price, category, stock } = req.body;
    const image = req.file ? req.file.path : null;

    let sql = 'UPDATE products SET name=?, description=?, price=?, category=?, stock=?';
    const params = [name, description, price, category, stock];

    if (image) { sql += ', image=?'; params.push(image); }
    sql += ' WHERE id=?';
    params.push(req.params.id);

    db.query(sql, params, (err) => {
        if (err) return res.status(500).json({ message: 'Update failed.' });
        res.json({ message: 'Product updated!' });
    });
};

// Delete product (seller only)
const deleteProduct = (req, res) => {
    db.query('DELETE FROM order_items WHERE product_id = ?', [req.params.id], (err) => {
        if (err) return res.status(500).json({ message: 'Delete failed.' });
        db.query('DELETE FROM products WHERE id = ?', [req.params.id], (err) => {
            if (err) return res.status(500).json({ message: 'Delete failed.' });
            res.json({ message: 'Product deleted!' });
        });
    });
};

module.exports = { getAllProducts, getProduct, addProduct, editProduct, deleteProduct };