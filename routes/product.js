const productController = require('../controllers/productController');
const { middlewareAdminController } = require('../controllers/middlewareController');

const router = require('express').Router();

// ADD PRODUCT
router.post('/', middlewareAdminController.verifyToken, productController.addProduct);

// GET ALL PRODUCT
router.get('/', productController.getProduct);

// GET ALL PRODUCT OF CATEGORY
router.get('/category/:slug', productController.getProductsCategory);

// GET A PRODUCT
router.get('/:slug', productController.getAnProduct);

// UPDATE PRODUCT
router.put('/:slug', middlewareAdminController.verifyToken, productController.updateProduct);

//DELETE PRODUCT
router.delete('/:slug', middlewareAdminController.verifyToken, productController.deleteProduct);

module.exports = router;
