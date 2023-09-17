const categoryController = require('../controllers/categoryController');

const router = require('express').Router();

// ADD CATEGORY
router.post('/', categoryController.addCategory);

// GET ALL CATEGORY
router.get('/', categoryController.getAllCategory);

// GET AN CATEGORY
router.get('/:slug', categoryController.getAnCategory);

// UPDATE CATEGORY
router.put('/:slug', categoryController.updateCategory);

//DELETE CATEGORY
router.delete('/:slug', categoryController.deleteProduct);

module.exports = router;
