const searchproductController = require('../controllers/searchproductController');

const router = require('express').Router();

//SEARCH PRODUCT
router.get('/keyword', searchproductController.searchProduct);

module.exports = router;
