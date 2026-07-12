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