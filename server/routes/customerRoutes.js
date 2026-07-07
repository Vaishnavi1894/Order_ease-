const express = require('express');
const router  = express.Router();
const { registerCustomer, loginCustomer, getMyOrders } = require('../controllers/customerController');
const { customerAuth } = require('../middleware/auth');

router.post('/register', registerCustomer);
router.post('/login',    loginCustomer);
router.get('/orders',    customerAuth, getMyOrders);

module.exports = router;