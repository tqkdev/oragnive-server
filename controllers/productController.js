const Product = require('../model/ProductModel');
const Category = require('../model/CategoryModel');
const { sendSuccessResponse, sendNotFoundResponse, sendErrorResponse } = require('../utils/respone');

const productController = {
    // ADD PRODUCT
    addProduct: async (req, res) => {
        try {
            const newProduct = new Product(req.body);
            const savedProduct = await newProduct.save();

            if (req.body.category) {
                const category = await Category.findOne({ name: req.body.category });
                if (category) {
                    await category.updateOne({ $push: { id_product: savedProduct._id } });
                }
            }

            sendSuccessResponse(res, savedProduct, 'Product added successfully');
        } catch (err) {
            sendErrorResponse(res, 'Failed to add product');
        }
    },

    // GET PRODUCT
    getProduct: async (req, res) => {
        try {
            const page = parseInt(req.query.page) || 1; // Trang hiện tại (mặc định là 1)
            const limit = parseInt(req.query.limit) || 10; // Số sản phẩm trên mỗi trang (mặc định là 10)
            const sortBy = req.query.sortBy || 'name'; // Theo mặc định, sẽ sắp xếp theo tên
            const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1; // Theo mặc định, sẽ sắp xếp tăng dần (1)

            const skip = (page - 1) * limit; // Số bản ghi cần bỏ qua để lấy bản ghi tiếp theo
            const sortOptions = {};
            sortOptions[sortBy] = sortOrder;

            // Tính tổng số sản phẩm
            const totalProducts = await Product.countDocuments();
            const totalPages = Math.ceil(totalProducts / limit);

            // Lấy các sản phẩm theo trang
            const products = await Product.find().sort(sortOptions).skip(skip).limit(limit).exec();

            // Trả về dữ liệu phân trang và thông tin tổng số trang
            sendSuccessResponse(
                res,
                {
                    products,
                    pagination: {
                        currentPage: page,
                        totalPages,
                        totalProducts,
                    },
                },
                'Products retrieved successfully',
            );
        } catch (error) {
            sendErrorResponse(res, 'Error retrieving products');
        }
    },

    getProductsCategory: async (req, res) => {
        try {
            const category = req.params.slug;
            const page = parseInt(req.query.page) || 1; // Trang hiện tại (mặc định là 1)
            const limit = parseInt(req.query.limit) || 10; // Số sản phẩm trên mỗi trang (mặc định là 10)
            const sortBy = req.query.sortBy || 'name'; // Theo mặc định, sẽ sắp xếp theo tên
            const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1; // Theo mặc định, sẽ sắp xếp tăng dần (1)

            const skip = (page - 1) * limit; // Số bản ghi cần bỏ qua để lấy bản ghi tiếp theo
            const sortOptions = {};
            sortOptions[sortBy] = sortOrder;

            // Tìm category theo name hoặc slug
            const categoryData = await Category.findOne({ slug: category });

            if (!categoryData) {
                return sendErrorResponse(res, 'Category not found');
            }

            // Tìm sản phẩm theo category
            const totalProducts = await Product.countDocuments({ category: categoryData.name });
            const totalPages = Math.ceil(totalProducts / limit);

            const products = await Product.find({ category: categoryData.name })
                .sort(sortOptions)
                .skip(skip)
                .limit(limit)
                .exec();

            // Trả về dữ liệu phân trang và thông tin tổng số trang
            sendSuccessResponse(
                res,
                {
                    products,
                    pagination: {
                        currentPage: page,
                        totalPages,
                        totalProducts,
                    },
                },
                'Products retrieved successfully',
            );
        } catch (error) {
            sendErrorResponse(res, 'Error retrieving products by category');
        }
    },

    // GET AN PRODUCT
    getAnProduct: async (req, res) => {
        try {
            const product = await Product.findOne({ _id: req.params.slug });
            if (product) {
                sendSuccessResponse(res, product, 'Product retrieved successfully');
            } else {
                sendNotFoundResponse(res, 'Product not found');
            }
        } catch (error) {
            sendErrorResponse(res, 'Failed to retrieve product');
        }
    },

    // UPDATE PRODUCT
    updateProduct: async (req, res) => {
        try {
            const updatedProduct = await Product.findOneAndUpdate({ _id: req.params.slug }, req.body, { new: true });
            if (updatedProduct) {
                sendSuccessResponse(res, updatedProduct, 'Product updated successfully');
            } else {
                sendNotFoundResponse(res, 'Product not found');
            }
        } catch (error) {
            sendErrorResponse(res, 'Failed to update product');
        }
    },

    // DELETE PRODUCT
    deleteProduct: async (req, res) => {
        console.log('delete', req.params.slug);
        try {
            const deletedProduct = await Product.findOneAndDelete({ _id: req.params.slug });
            if (deletedProduct) {
                await Category.updateMany(
                    { id_product: deletedProduct._id },
                    { $pull: { id_product: deletedProduct._id } },
                );
                sendSuccessResponse(res, null, 'Product deleted successfully');
            } else {
                sendNotFoundResponse(res, 'Product not found');
            }
        } catch (error) {
            sendErrorResponse(res, 'Failed to delete product');
        }
    },
};

module.exports = productController;
