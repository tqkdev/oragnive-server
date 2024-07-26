const Product = require('../model/ProductModel');
const { sendSuccessResponse, sendErrorResponse } = require('../utils/respone');

const searchproductController = {
    // SEARCH PRODUCT
    searchProduct: async (req, res) => {
        // http://localhost:3001/api/search/keyword?q=a&page=1&limit=3
        try {
            const q = req.query.q;
            const page = parseInt(req.query.page) || 1; // Trang hiện tại (mặc định là 1)
            const limit = parseInt(req.query.limit) || 10; // Số sản phẩm trên mỗi trang (mặc định là 10)

            const skip = (page - 1) * limit; // Số bản ghi cần bỏ qua để lấy bản ghi tiếp theo

            // Tìm kiếm sản phẩm có tên hoặc mô tả chứa từ khóa không dấu
            const searchproducts = await Product.find({
                $or: [
                    { name: { $regex: q, $options: 'i' } }, // Tìm theo tên, không phân biệt chữ hoa chữ thường
                    { category: { $regex: q, $options: 'i' } }, // Tìm theo thể loại, không phân biệt chữ hoa chữ thường
                    { description: { $regex: q, $options: 'i' } }, // Tìm theo mô tả, không phân biệt chữ hoa chữ thường
                ],
            })
                .skip(skip)
                .limit(limit)
                .exec();

            // Tính tổng số lượng sản phẩm khớp với từ khóa tìm kiếm
            const totalProducts = await Product.countDocuments({
                $or: [
                    { name: { $regex: q, $options: 'i' } },
                    { category: { $regex: q, $options: 'i' } },
                    { description: { $regex: q, $options: 'i' } },
                ],
            });

            const totalPages = Math.ceil(totalProducts / limit);

            const response = {
                currentPage: page,
                totalPages: totalPages,
                totalProducts: totalProducts,
                products: searchproducts,
            };

            sendSuccessResponse(res, response, 'Products retrieved successfully');
        } catch (error) {
            sendErrorResponse(res, 'Error retrieving products');
        }
    },
};

module.exports = searchproductController;
