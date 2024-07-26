const Category = require('../model/CategoryModel');
const { sendSuccessResponse, sendErrorResponse, sendNotFoundResponse } = require('../utils/respone');

const categoryController = {
    // ADD CATEGORY

    addCategory: async (req, res) => {
        try {
            const newCategory = new Category(req.body);
            const saveCategory = await newCategory.save();
            sendSuccessResponse(res, saveCategory, 'Category added successfully');
        } catch (err) {
            sendErrorResponse(res, 'Error adding category');
        }
    },

    // GET ALL CATEGORY
    getAllCategory: async (req, res) => {
        try {
            const categories = await Category.find();
            sendSuccessResponse(res, categories, 'Categories retrieved successfully');
        } catch (error) {
            sendErrorResponse(res, 'Error retrieving categories');
        }
    },

    // GET AN CATEGORY
    getAnCategory: async (req, res) => {
        try {
            const category = await Category.findOne({ slug: req.params.slug }).populate('id_product');
            if (!category) {
                sendNotFoundResponse(res, 'Category not found');
                return;
            }
            sendSuccessResponse(res, category, 'Category retrieved successfully');
        } catch (error) {
            sendErrorResponse(res, 'Error retrieving category');
        }
    },

    // UPDATE CATEGORY
    updateCategory: async (req, res) => {
        try {
            const updateCategory = await Category.findOne({ slug: req.params.slug });
            if (!updateCategory) {
                sendNotFoundResponse(res, 'Category not found');
                return;
            }
            await updateCategory.updateOne({ $set: req.body });
            sendSuccessResponse(res, null, 'Category updated successfully');
        } catch (error) {
            sendErrorResponse(res, 'Error updating category');
        }
    },

    // DELETE CATEGORY
    deleteCategory: async (req, res) => {
        try {
            const deleteCategory = await Category.findOneAndDelete({ slug: req.params.slug });
            if (!deleteCategory) {
                sendNotFoundResponse(res, 'Category not found');
                return;
            }
            sendSuccessResponse(res, null, 'Category deleted successfully');
        } catch (error) {
            sendErrorResponse(res, 'Error deleting category');
        }
    },
};

module.exports = categoryController;
