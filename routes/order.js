const orderController = require('../controllers/orderController');
const { middlewareUserController } = require('../controllers/middlewareController');

const router = require('express').Router();

// ADD Order
// router.post('/', middlewareUserController.verifyToken, orderController.addOrder);

// GET An Order
router.get('/:slug', middlewareUserController.verifyToken, orderController.getOrder);

// UPDATE product in Order
router.put('/:slug', middlewareUserController.verifyToken, orderController.updateOrder);

// UPDATE quality product in order
router.put('/quality/:slug', middlewareUserController.verifyToken, orderController.updatequality);

//DELETE product in Order
router.put('/delete/:slug', middlewareUserController.verifyToken, orderController.deleteOrder);

module.exports = router;
