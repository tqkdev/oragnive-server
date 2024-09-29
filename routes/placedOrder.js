const placedOrderController = require('../controllers/PlacedOrderController');
const { middlewareAdminController, middlewareUserController } = require('../controllers/middlewareController');

const router = require('express').Router();
// Route cho đơn hàng
router.post('/create', middlewareUserController.verifyToken, placedOrderController.createPlacedOrder); // Tạo đơn hàng mới
router.get('/getPlacedOrder/:userId', middlewareUserController.verifyToken, placedOrderController.getPlacedOrder); // Lấy đơn hàng theo ID người dùng
router.get('/getAllPlacedOrders', middlewareAdminController.verifyToken, placedOrderController.getAllPlacedOrders); // Lấy tất cả đơn hàng
router.get('/numberCategory', middlewareAdminController.verifyToken, placedOrderController.numberCategory); // Lấy tất cả đơn hàng

module.exports = router;
