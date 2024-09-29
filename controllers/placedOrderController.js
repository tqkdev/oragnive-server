const PlacedOrder = require('../model/PlacedOrderModel');
const OrdersModel = require('../model/OrdersModel');
const { sendSuccessResponse, sendErrorResponse, sendNotFoundResponse } = require('../utils/respone');
// const defaultCategories = ['Rau', 'Củ', 'Quả', 'Trái cây', 'Khác'];

const placedOrderController = {
    // Tạo đơn hàng mới
    createPlacedOrder: async (req, res) => {
        try {
            const { user_id, order_items } = req.body;

            console.log(user_id);
            console.log(order_items);

            // Tính toán tổng số lượng và tổng số tiền
            let total_quantity = 0;
            let total_amount = 0;

            order_items.forEach((item) => {
                total_quantity += item.quantity;
                total_amount += item.product_price * item.quantity;
            });

            // Tạo đơn hàng mới
            const newOrder = new PlacedOrder({
                user_id,
                order_items,
                total_quantity,
                total_amount,
            });

            await newOrder.save();

            // Tìm đơn hàng của người dùng
            const deleteOrder = await OrdersModel.findOne({ user_id: user_id });

            // Kiểm tra xem đơn hàng có tồn tại không
            if (!deleteOrder) {
                return sendNotFoundResponse(res, 'Order not found');
            }

            // Xóa tất cả sản phẩm trong đơn hàng
            deleteOrder.order = []; // Đặt lại mảng sản phẩm thành rỗng

            // Lưu lại thay đổi
            await deleteOrder.save();

            sendSuccessResponse(res, newOrder, 'Order placed successfully');
        } catch (err) {
            console.error('Error while saving order:', err); // In lỗi ra console
            sendErrorResponse(res, 'Error creating order');
        }
    },

    // // Lấy đơn hàng theo ID người dùng với phân trang
    // getPlacedOrder: async (req, res) => {
    //     try {
    //         const { userId } = req.params;
    //         console.log(userId);

    //         // Lấy page và limit từ query parameters (nếu có), nếu không có sẽ mặc định là trang 1 và 5 đơn hàng
    //         const page = parseInt(req.query.page) || 1;
    //         const limit = parseInt(req.query.limit) || 5;

    //         // Tính toán số lượng đơn hàng cần bỏ qua để lấy đúng trang
    //         const skip = (page - 1) * limit;

    //         // Lấy tổng số lượng đơn hàng của người dùng này để tính tổng số trang
    //         const totalOrders = await PlacedOrder.countDocuments({ user_id: userId });

    //         // Lấy danh sách đơn hàng của người dùng theo userId với phân trang và populate user_id
    //         const orders = await PlacedOrder.find({ user_id: userId }).populate('user_id').skip(skip).limit(limit);

    //         if (!orders.length) {
    //             return sendNotFoundResponse(res, 'No orders found for this user');
    //         }

    //         // Tính toán tổng số trang
    //         const totalPages = Math.ceil(totalOrders / limit);

    //         // Trả về dữ liệu phân trang
    //         const result = {
    //             currentPage: page,
    //             totalPages: totalPages,
    //             totalOrders: totalOrders,
    //             orders: orders,
    //         };

    //         // Trả về phản hồi thành công
    //         sendSuccessResponse(res, result, 'Orders retrieved successfully with pagination');
    //     } catch (err) {
    //         console.log('---------------------', err);
    //         sendErrorResponse(res, 'Error retrieving orders');
    //     }
    // },

    // Lấy đơn hàng theo ID người dùng với phân trang và sắp xếp theo thời gian (gần nhất lên đầu)
    getPlacedOrder: async (req, res) => {
        try {
            const { userId } = req.params;
            console.log(userId);

            // Lấy page và limit từ query parameters (nếu có), nếu không có sẽ mặc định là trang 1 và 5 đơn hàng
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 5;

            // Tính toán số lượng đơn hàng cần bỏ qua để lấy đúng trang
            const skip = (page - 1) * limit;

            // Lấy tổng số lượng đơn hàng của người dùng này để tính tổng số trang
            const totalOrders = await PlacedOrder.countDocuments({ user_id: userId });

            // Lấy danh sách đơn hàng của người dùng theo userId với phân trang, sắp xếp theo order_date (gần nhất lên đầu) và populate user_id
            const orders = await PlacedOrder.find({ user_id: userId })
                .populate('user_id')
                .sort({ order_date: -1 }) // Sắp xếp theo order_date, -1 nghĩa là theo thứ tự giảm dần (gần nhất lên đầu)
                .skip(skip)
                .limit(limit);

            if (!orders.length) {
                return sendNotFoundResponse(res, 'No orders found for this user');
            }

            // Tính toán tổng số trang
            const totalPages = Math.ceil(totalOrders / limit);

            // Trả về dữ liệu phân trang
            const result = {
                currentPage: page,
                totalPages: totalPages,
                totalOrders: totalOrders,
                orders: orders,
            };

            // Trả về phản hồi thành công
            sendSuccessResponse(res, result, 'Orders retrieved successfully with pagination and sorting');
        } catch (err) {
            console.log('---------------------', err);
            sendErrorResponse(res, 'Error retrieving orders');
        }
    },

    // // Lấy tất cả đơn hàng của tất cả người dùng với phân trang
    // getAllPlacedOrders: async (req, res) => {
    //     try {
    //         // Lấy page và limit từ query parameters (nếu có), nếu không có sẽ mặc định là trang 1 và 5 đơn hàng
    //         const page = parseInt(req.query.page) || 1;
    //         const limit = parseInt(req.query.limit) || 5;

    //         // Tính toán số lượng đơn hàng cần bỏ qua để lấy đúng trang
    //         const skip = (page - 1) * limit;

    //         // Lấy tổng số lượng đơn hàng để tính tổng số trang
    //         const totalOrders = await PlacedOrder.countDocuments();

    //         // Lấy danh sách đơn hàng với phân trang và populate user_id
    //         const orders = await PlacedOrder.find().populate('user_id').skip(skip).limit(limit);

    //         // Tính toán tổng số trang
    //         const totalPages = Math.ceil(totalOrders / limit);

    //         // Trả về dữ liệu phân trang
    //         const result = {
    //             currentPage: page,
    //             totalPages: totalPages,
    //             totalOrders: totalOrders,
    //             orders: orders,
    //         };

    //         // Trả về phản hồi thành công
    //         sendSuccessResponse(res, result, 'Orders retrieved successfully with pagination');
    //     } catch (err) {
    //         console.log(err);
    //         sendErrorResponse(res, 'Error retrieving orders');
    //     }
    // },

    // Lấy tất cả đơn hàng của tất cả người dùng với phân trang và sắp xếp theo thời gian (gần nhất lên đầu)
    getAllPlacedOrders: async (req, res) => {
        try {
            // Lấy page và limit từ query parameters (nếu có), nếu không có sẽ mặc định là trang 1 và 5 đơn hàng
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 5;

            // Tính toán số lượng đơn hàng cần bỏ qua để lấy đúng trang
            const skip = (page - 1) * limit;

            // Lấy tổng số lượng đơn hàng để tính tổng số trang
            const totalOrders = await PlacedOrder.countDocuments();

            // Lấy danh sách đơn hàng với phân trang, sắp xếp theo order_date (gần nhất lên đầu) và populate user_id
            const orders = await PlacedOrder.find()
                .populate('user_id')
                .sort({ order_date: -1 }) // Sắp xếp theo order_date, -1 nghĩa là theo thứ tự giảm dần (gần nhất lên đầu)
                .skip(skip)
                .limit(limit);

            // Tính toán tổng số trang
            const totalPages = Math.ceil(totalOrders / limit);

            // Trả về dữ liệu phân trang
            const result = {
                currentPage: page,
                totalPages: totalPages,
                totalOrders: totalOrders,
                orders: orders,
            };

            // Trả về phản hồi thành công
            sendSuccessResponse(res, result, 'Orders retrieved successfully with pagination and sorting');
        } catch (err) {
            console.log(err);
            sendErrorResponse(res, 'Error retrieving orders');
        }
    },

    // numberCategory: async (req, res) => {
    //     try {
    //         // Lấy ngày hiện tại
    //         const currentDate = new Date();
    //         // Tạo ngày bắt đầu là 7 ngày trước
    //         const sevenDaysAgo = new Date();
    //         sevenDaysAgo.setDate(currentDate.getDate() - 7);

    //         // Tìm tất cả các đơn hàng trong vòng 7 ngày gần nhất
    //         const orders = await PlacedOrder.find({
    //             order_date: { $gte: sevenDaysAgo, $lte: currentDate },
    //         });

    //         // Tạo object để lưu tổng số lượng và tổng giá trị của từng category
    //         const categoryData = {};
    //         let totalQuantity = 0; // Tổng số lượng sản phẩm từ tất cả đơn hàng
    //         let totalPrice = 0; // Tổng giá trị của tất cả sản phẩm từ tất cả đơn hàng

    //         // Khởi tạo tất cả các category với value = 0
    //         defaultCategories.forEach((category) => {
    //             categoryData[category] = {
    //                 totalQuantity: 0,
    //             };
    //         });

    //         // Lặp qua tất cả các đơn hàng
    //         orders.forEach((order) => {
    //             // Lặp qua từng sản phẩm trong order_items
    //             order.order_items.forEach((item) => {
    //                 const category = item.product_category;
    //                 const quantity = item.quantity;
    //                 const price = item.product_price * quantity;

    //                 // Tăng tổng số lượng và giá trị của tất cả đơn hàng
    //                 totalQuantity += quantity;
    //                 totalPrice += price;

    //                 // Nếu category tồn tại trong categoryData, tăng số lượng
    //                 if (categoryData[category] !== undefined) {
    //                     categoryData[category].totalQuantity += quantity;
    //                 } else {
    //                     // Nếu category không nằm trong defaultCategories, thêm vào và gán số lượng
    //                     categoryData[category] = {
    //                         totalQuantity: quantity,
    //                     };
    //                 }
    //             });
    //         });

    //         // Chuyển object thành mảng BasicPie dưới dạng { id, value, label }
    //         const BasicPie = Object.keys(categoryData).map((category, index) => {
    //             return {
    //                 id: index,
    //                 value: categoryData[category].totalQuantity, // Tổng số lượng sản phẩm trong danh mục
    //                 label: category, // Tên danh mục
    //             };
    //         });

    //         // Tạo object kết quả trả về
    //         const result = {
    //             total_price: totalPrice, // Tổng giá trị của tất cả sản phẩm trong đơn hàng
    //             total_quantity: totalQuantity, // Tổng số lượng sản phẩm trong tất cả đơn hàng
    //             BasicPie: BasicPie, // Mảng các danh mục với số lượng sản phẩm
    //         };

    //         // Trả về kết quả dưới dạng JSON
    //         sendSuccessResponse(res, result, 'Category data retrieved successfully');
    //     } catch (err) {
    //         sendErrorResponse(res, 'Error retrieving category data');
    //     }
    // },

    numberCategory: async (req, res) => {
        try {
            const currentDate = new Date();
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(currentDate.getDate() - 6);

            // Tìm tất cả các đơn hàng trong vòng 7 ngày gần nhất
            const orders = await PlacedOrder.find({
                order_date: { $gte: sevenDaysAgo, $lte: currentDate },
            });

            let totalQuantity = 0; // Tổng số lượng sản phẩm từ tất cả đơn hàng
            let totalPrice = 0; // Tổng giá trị của tất cả sản phẩm từ tất cả đơn hàng

            // Object để tính tổng tiền và số lượng theo ngày
            const dailyData = {};
            // Mảng để chứa dữ liệu cho biểu đồ BasicPie
            const categoryData = {
                Rau: 0,
                Củ: 0,
                Quả: 0,
                'Trái cây': 0,
                Khác: 0,
            };

            // Khởi tạo mảng chứa tổng số lượng và giá trị sản phẩm theo ngày
            const TickPlacementBars = [];

            // Khởi tạo các ngày trong khoảng 7 ngày gần nhất với giá trị mặc định
            for (let i = 0; i < 7; i++) {
                const date = new Date();
                date.setDate(sevenDaysAgo.getDate() + i);
                const formattedDate = date.toISOString().split('T')[0]; // Định dạng yyyy-mm-dd

                dailyData[formattedDate] = {
                    totalprice: 0,
                    totalquantity: 0,
                    day: formattedDate,
                };
            }

            // Lặp qua tất cả các đơn hàng
            orders.forEach((order) => {
                const orderDate = order.order_date.toISOString().split('T')[0]; // Lấy ngày từ order_date

                // Lặp qua từng sản phẩm trong order_items
                order.order_items.forEach((item) => {
                    const quantity = item.quantity;
                    const price = item.product_price * quantity;

                    // Tăng tổng số lượng và giá trị của tất cả đơn hàng
                    totalQuantity += quantity;
                    totalPrice += price;

                    // Nếu đơn hàng thuộc ngày hiện tại, tăng tổng số lượng và giá trị cho ngày đó
                    if (dailyData[orderDate]) {
                        dailyData[orderDate].totalprice += price;
                        dailyData[orderDate].totalquantity += quantity;
                    }

                    // Tăng giá trị cho các loại sản phẩm trong categoryData
                    switch (item.product_category) {
                        case 'Rau':
                            categoryData.Rau += quantity;
                            break;
                        case 'Củ':
                            categoryData.Củ += quantity;
                            break;
                        case 'Quả':
                            categoryData.Quả += quantity;
                            break;
                        case 'Trái cây':
                            categoryData['Trái cây'] += quantity;
                            break;
                        default:
                            categoryData.Khác += quantity;
                            break;
                    }
                });
            });

            // Chuyển dailyData thành mảng TickPlacementBars
            for (const day in dailyData) {
                TickPlacementBars.push(dailyData[day]);
            }

            // Chuyển categoryData thành mảng BasicPie
            const BasicPie = Object.keys(categoryData).map((key, index) => ({
                id: index,
                value: categoryData[key],
                label: key,
            }));

            // Trả về kết quả với tổng giá trị, tổng số lượng và dữ liệu biểu đồ
            const result = {
                product_price: totalPrice, // Tổng giá trị của tất cả sản phẩm trong đơn hàng
                quantity: totalQuantity, // Tổng số lượng sản phẩm trong tất cả đơn hàng
                BasicPie: BasicPie, // Mảng tổng số lượng sản phẩm theo loại
                TickPlacementBars: TickPlacementBars, // Mảng tổng giá trị và số lượng sản phẩm theo ngày
            };

            sendSuccessResponse(res, result, 'Category data with daily totals retrieved successfully');
        } catch (err) {
            sendErrorResponse(res, 'Error retrieving category data');
        }
    },
};

module.exports = placedOrderController;
