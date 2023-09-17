const { json } = require('body-parser');
const Product = require('../model/ProductModel');
const Category = require('../model/CategoryModel');
// const unorm = require('unorm');

const productController = {
    // ADD PRODUCT
    addProduct: async (req, res) => {
        try {
            const newProduct = new Product(req.body);
            const saveProduct = await newProduct.save();
            if (req.body.category) {
                const category = await Category.findOne({ name: req.body.category });
                await category.updateOne({ $push: { id_product: saveProduct._id } });
            }

            res.status(200).json(saveProduct);
        } catch (err) {
            res.status(500).json(err);
        }
    },

    // GET PRODUCT
    getProduct: async (req, res) => {
        // Phân Trang
        //http://localhost:3001/api/product?page=1&limit=2
        // Sort
        // http://localhost:3001/api/product?sortBy=price&sortOrder=desc

        const page = parseInt(req.query.page);
        const sortBy = req.query.sortBy || 'name'; // Theo mặc định, sẽ sắp xếp theo tên

        if (page && sortBy) {
            // http://localhost:3001/api/product?sortBy=price&sortOrder=desc&page=1&limit=3

            try {
                const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1; // Theo mặc định, sẽ sắp xếp tăng dần (1)
                const limit = parseInt(req.query.limit) || 10; // Số sản phẩm trên mỗi trang (mặc định là 10)

                const skip = (page - 1) * limit; // Số bản ghi cần bỏ qua để lấy bản ghi tiếp theo

                const sortOptions = {};
                sortOptions[sortBy] = sortOrder;

                const products = await Product.find().sort(sortOptions).skip(skip).limit(limit).exec();

                res.status(200).json(products);
            } catch (error) {
                res.status(500).json({ message: 'Lỗi sort product' });
            }
        } else if (page) {
            try {
                const limit = parseInt(req.query.limit) || 2; // Số sản phẩm trên mỗi trang

                const skip = (page - 1) * limit; // Số bản ghi cần bỏ qua để lấy bản ghi tiếp theo

                const products = await Product.find().skip(skip).limit(limit).exec();

                res.status(200).json(products);
            } catch (error) {
                res.status(500).json({ message: 'Lỗi phân trang' });
            }
        } else if (sortBy) {
            try {
                // const sortBy = req.query.sortBy || 'name'; // Theo mặc định, sẽ sắp xếp theo tên

                const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1; // Theo mặc định, sẽ sắp xếp tăng dần (1)

                const sortOptions = {};
                sortOptions[sortBy] = sortOrder;

                const products = await Product.find().sort(sortOptions);

                res.status(200).json(products);
            } catch (error) {
                res.status(500).json({ message: 'Lỗi sort product' });
            }
        } else {
            // GET ALL PRUDUCT
            try {
                const products = await Product.find();
                res.status(200).json(products);
            } catch (error) {
                res.status(500).json(err);
            }
        }
    },

    // GET AN PRODUCT
    getAnProduct: async (req, res) => {
        try {
            const product = await Product.findOne({ slug: req.params.slug });
            res.status(200).json(product);
        } catch (error) {
            res.status(500), json(error);
        }
    },

    // UPDATE PRODUCT
    updateProduct: async (req, res) => {
        try {
            const updateproduct = await Product.findOne({ slug: req.params.slug });
            await updateproduct.updateOne({ $set: req.body });
            res.status(200).json('update successfully');
        } catch (error) {
            res.status(500).json(error);
        }
    },

    // DELETE PRODUCT
    deleteProduct: async (req, res) => {
        try {
            const deleteproduct = await Product.findOne({ _id: req.params.slug });
            await Category.updateMany({ id_product: deleteproduct._id }, { $pull: { id_product: deleteproduct._id } });
            await Product.findOneAndDelete({ _id: req.params.slug });
            res.status(200).json('delete successfully');
        } catch (error) {
            res.status(500).json(error);
        }
    },
};

module.exports = productController;
