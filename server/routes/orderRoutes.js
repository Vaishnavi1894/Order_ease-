const express = require('express');
const router  = express.Router();
const { placeOrder, getAllOrders, getOrderDetail, updateStatus } = require('../controllers/orderController');
const { sellerAuth, customerAuth } = require('../middleware/auth');

router.post('/',          customerAuth, placeOrder);
router.get('/',           sellerAuth,   getAllOrders);
router.get('/:id',        sellerAuth,   getOrderDetail);
router.put('/:id/status', sellerAuth,   updateStatus);

// Create Razorpay order
router.post('/create-payment', customerAuth, async (req, res) => {
    const Razorpay = require('razorpay');
    const razorpay = new Razorpay({
        key_id:     process.env.RAZORPAY_KEY_ID,
        key_secret: 'dummy_secret'
    });

    const { amount } = req.body;

    try {
        const order = await razorpay.orders.create({
            amount:   amount * 100,
            currency: 'INR',
            receipt:  'order_' + Date.now()
        });
        res.json(order);
    } catch (err) {
        res.status(500).json({ message: 'Payment initiation failed!' });
    }
});
module.exports = router;