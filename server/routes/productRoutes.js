const express    = require('express');
const router     = express.Router();
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer     = require('multer');
const { getAllProducts, getProduct, addProduct, editProduct, deleteProduct } = require('../controllers/productController');
const { sellerAuth } = require('../middleware/auth');
require('dotenv').config();

// Cloudinary config
cloudinary.config({
    cloud_name : process.env.vknbc4nh,
    api_key    : process.env.295639296734389,
    api_secret : process.env.V1BjXAAKk-GA6DumA-HXQzk9pFg
});

// Multer Cloudinary storage
const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder        : 'orderease',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation : [{ width: 500, height: 500, crop: 'limit' }]
    }
});

const upload = multer({ storage });

router.get('/',       getAllProducts);
router.get('/:id',    getProduct);
router.post('/',      sellerAuth, upload.single('image'), addProduct);
router.put('/:id',    sellerAuth, upload.single('image'), editProduct);
router.delete('/:id', sellerAuth, deleteProduct);

module.exports = router;