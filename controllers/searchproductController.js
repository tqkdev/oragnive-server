const { json } = require('body-parser');
const Product = require('../model/ProductModel');
// const unorm = require('unorm');

const searchproductController = {
    // SEARCH PRODUCT
    searchProduct: async (req, res) => {
        // http://localhost:3001/api/search/keyword?q=a&page=1&limit=3
        try {
            // const q = convertToUnaccented(req.params.q); // Chuyển đổi và chuyển thành chữ thường
            const q = req.query.q;
            const page = parseInt(req.query.page) || 1; // Trang hiện tại (mặc định là 1)
            const limit = parseInt(req.query.limit) || 2; // Số sản phẩm trên mỗi trang (mặc định là 10)

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

            res.status(200).json(searchproducts);
        } catch (error) {
            res.status(500).json(error);
        }
    },
};

module.exports = searchproductController;
