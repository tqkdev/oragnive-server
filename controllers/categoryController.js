const { json } = require('body-parser');
const Category = require('../model/CategoryModel');

const categoryController = {
    // ADD CATEGORY
    addCategory: async (req, res) => {
        try {
            const newCategory = new Category(req.body);
            const saveCategory = await newCategory.save();
            res.status(200).json(saveCategory);
        } catch (err) {
            res.status(500).json(err);
        }
    },

    // GET ALL CATEGORY
    getAllCategory: async (req, res) => {
        try {
            const categories = await Category.find();
            res.status(200).json(categories);
        } catch (error) {
            res.status(500).json(err);
        }
    },

    // GET AN CATEGORY
    getAnCategory: async (req, res) => {
        try {
            const category = await Category.findOne({ slug: req.params.slug }).populate('id_product');
            res.status(200).json(category);
        } catch (error) {
            res.status(500), json(error);
        }
    },

    // UPDATE CATEGORY
    updateCategory: async (req, res) => {
        try {
            const updatecategory = await Category.findOne({ slug: req.params.slug });
            await updatecategory.updateOne({ $set: req.body });
            res.status(200).json('update successfully');
        } catch (error) {
            res.status(500).json(error);
        }
    },

    // DELETE CATEGORY
    deleteProduct: async (req, res) => {
        try {
            await Category.findOneAndDelete({ slug: req.params.slug });
            res.status(200).json('delete successfully');
        } catch (error) {
            res.status(500).json(error);
        }
    },
};

module.exports = categoryController;
