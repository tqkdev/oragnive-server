const { middlewareAdminController } = require('../controllers/middlewareController');
const adminController = require('../controllers/adminController');

const router = require('express').Router();

// LOGIN
router.post('/login', adminController.adminLogin);

// REGESTER
router.post('/register', adminController.adminRegister);

// refresh token

router.post('/refresh', adminController.requestRefreshToken);

// LOGOUT
router.post('/logout', middlewareAdminController.verifyToken, adminController.adminLogout);

module.exports = router;
