const express  = require('express');
const router   = express.Router();
const multer   = require('multer');
const path     = require('path');
const { getAllProducts, getProduct, addProduct, editProduct, deleteProduct } = require('../controllers/productController');
const { sellerAuth } = require('../middleware/auth');

// Multer setup for image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'public/images/'),
    filename:    (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

router.get('/',       getAllProducts);
router.get('/:id',    getProduct);
router.post('/',      sellerAuth, upload.single('image'), addProduct);
router.put('/:id',    sellerAuth, upload.single('image'), editProduct);
router.delete('/:id', sellerAuth, deleteProduct);

module.exports = router;