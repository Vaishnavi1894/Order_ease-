const express = require('express');
const router  = express.Router();
const { registerSeller, loginSeller, getDashboard } = require('../controllers/sellerController');
const { sellerAuth } = require('../middleware/auth');

router.post('/register',  registerSeller);
router.post('/login',     loginSeller);
router.get('/dashboard',  sellerAuth, getDashboard);

module.exports = router;