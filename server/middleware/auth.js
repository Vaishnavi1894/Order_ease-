const jwt = require('jsonwebtoken');
require('dotenv').config();

// Protect seller routes
const sellerAuth = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Access denied. No token.' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.role !== 'seller') {
            return res.status(403).json({ message: 'Not authorized as seller.' });
        }
        req.seller = decoded;
        next();
    } catch (err) {
        res.status(401).json({ message: 'Invalid token.' });
    }
};

// Protect customer routes
const customerAuth = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Access denied. No token.' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.role !== 'customer') {
            return res.status(403).json({ message: 'Not authorized as customer.' });
        }
        req.customer = decoded;
        next();
    } catch (err) {
        res.status(401).json({ message: 'Invalid token.' });
    }
};

module.exports = { sellerAuth, customerAuth };