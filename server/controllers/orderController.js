const db = require('../db');

// Place order (customer)
const placeOrder = (req, res) => {
    const { items, total_amount, payment_method, delivery_type, delivery_address } = req.body;
    const customer_id = req.customer.id;

    if (!items || items.length === 0) {
        return res.status(400).json({ message: 'Cart is empty.' });
    }

    const orderSql = `INSERT INTO orders 
        (customer_id, total_amount, payment_method, delivery_type, delivery_address)
        VALUES (?, ?, ?, ?, ?)`;

    db.query(orderSql, [customer_id, total_amount, payment_method, delivery_type, delivery_address], (err, result) => {
        if (err) return res.status(500).json({ message: 'Failed to place order.' });

        const orderId = result.insertId;
        const itemValues = items.map(i => [orderId, i.product_id, i.quantity, i.price]);
        const itemSql = 'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ?';

        db.query(itemSql, [itemValues], (err) => {
            if (err) return res.status(500).json({ message: 'Order items failed.' });

            // Update stock
            items.forEach(i => {
                db.query('UPDATE products SET stock = stock - ? WHERE id = ?',
                [i.quantity, i.product_id]);
            });

            res.status(201).json({
                message: 'Order placed successfully!',
                order_id: orderId
            });
        });
    });
};

// Get all orders (seller)
const getAllOrders = (req, res) => {
    const sql = `
        SELECT o.*, c.name AS customer_name, c.phone AS customer_phone,
               GROUP_CONCAT(p.name SEPARATOR ', ') AS products
        FROM orders o
        JOIN customers c ON o.customer_id = c.id
        JOIN order_items oi ON o.id = oi.order_id
        JOIN products p ON oi.product_id = p.id
        GROUP BY o.id
        ORDER BY o.created_at DESC
    `;
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ message: 'Error fetching orders.' });
        res.json(results);
    });
};

// Get single order detail
const getOrderDetail = (req, res) => {
    const orderSql = `
        SELECT o.*, c.name AS customer_name, c.phone AS customer_phone,
               c.email AS customer_email
        FROM orders o
        JOIN customers c ON o.customer_id = c.id
        WHERE o.id = ?
    `;
    const itemsSql = `
        SELECT oi.quantity, oi.price, p.name, p.image
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = ?
    `;
    db.query(orderSql, [req.params.id], (err, order) => {
        if (err || order.length === 0) {
            return res.status(404).json({ message: 'Order not found.' });
        }
        db.query(itemsSql, [req.params.id], (err, items) => {
            res.json({ order: order[0], items });
        });
    });
};

// Update order status (seller)
const updateStatus = (req, res) => {
    const { status, tracking_number } = req.body;
    const validStatuses = ['Pending','Confirmed','Packed','Shipped','Delivered'];

    if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: 'Invalid status.' });
    }

    const sql = 'UPDATE orders SET status = ?, tracking_number = ? WHERE id = ?';
    db.query(sql, [status, tracking_number || null, req.params.id], (err) => {
        if (err) return res.status(500).json({ message: 'Status update failed.' });
        res.json({ message: `Order marked as ${status}` });
    });
};

module.exports = { placeOrder, getAllOrders, getOrderDetail, updateStatus };