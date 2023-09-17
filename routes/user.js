const userController = require('../controllers/userController');
const { middlewareUserController } = require('../controllers/middlewareController');

const router = require('express').Router();

// REGISTER
router.post('/register', userController.userRegister);

// LOGIN
router.post('/login', userController.userLogin);

// refresh tokeb
router.post('/refresh', userController.requestRefreshToken);

// LOGIN
router.post('/logout', middlewareUserController.verifyToken, userController.userLogout);

module.exports = router;
