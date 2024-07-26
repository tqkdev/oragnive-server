const Order = require('../model/OrdersModel');
const { sendSuccessResponse, sendErrorResponse, sendNotFoundResponse } = require('../utils/respone');

const OrderController = {
    // GET AN ORDER
    getOrder: async (req, res) => {
        try {
            const order = await Order.findOne({ user_id: req.params.slug });
            if (!order) {
                return sendSuccessResponse(res, order, 'Not available Order');
            }
            sendSuccessResponse(res, order, 'Order retrieved successfully');
        } catch (error) {
            sendErrorResponse(res, 'Error retrieving order');
        }
    },

    // UPDATE ORDER
    updateOrder: async (req, res) => {
        try {
            let order = await Order.findOne({ user_id: req.params.slug });
            if (!order) {
                // Nếu đơn hàng không tồn tại, tạo đơn hàng mới
                order = new Order({
                    user_id: req.params.slug,
                    order: [req.body],
                });
            } else {
                // Nếu đơn hàng đã tồn tại, kiểm tra xem sản phẩm đã có trong đơn hàng chưa
                const productExists = order.order.some((orderItem) => orderItem.product_id === req.body.product_id);
                if (productExists) {
                    return sendErrorResponse(res, 'Product already exists in the order', 400);
                }

                // Thêm sản phẩm vào đơn hàng nếu chưa tồn tại
                order.order.push(req.body);
            }
            await order.save();
            sendSuccessResponse(res, order, 'Order updated successfully');
        } catch (error) {
            sendErrorResponse(res, error.message);
        }
    },
    // UPDATE QUALITY
    updatequality: async (req, res) => {
        try {
            const updateOrder = await Order.findOne({ user_id: req.params.slug });
            if (!updateOrder) {
                return sendNotFoundResponse(res, 'Order not found');
            }
            const quality = req.body.quality;
            // Tìm sản phẩm cần cập nhật trong đơn hàng
            const productToUpdate = updateOrder.order.find((orderItem) => orderItem.product_id === req.body.product_id);
            if (!productToUpdate) {
                return sendNotFoundResponse(res, 'Product not found in order');
            }

            // Cập nhật trường quality
            productToUpdate.quality = quality;

            await updateOrder.save();
            sendSuccessResponse(res, updateOrder, 'Order quality updated successfully');
        } catch (error) {
            sendErrorResponse(res, 'Error updating order quality');
        }
    },

    // DELETE ORDER
    deleteOrder: async (req, res) => {
        try {
            const deleteOrder = await Order.findOne({ user_id: req.params.slug });
            if (!deleteOrder) {
                return sendNotFoundResponse(res, 'Order not found');
            }

            // Tìm sản phẩm cần xóa trong đơn hàng
            const productToRemoveIndex = deleteOrder.order.findIndex(
                (orderItem) => orderItem.product_id === req.body.product_id,
            );

            if (productToRemoveIndex === -1) {
                return sendNotFoundResponse(res, 'Product not found in order');
            }

            // Xóa sản phẩm ra khỏi đơn hàng
            deleteOrder.order.splice(productToRemoveIndex, 1);

            await deleteOrder.save();
            sendSuccessResponse(res, deleteOrder, 'Order deleted successfully');
        } catch (error) {
            sendErrorResponse(res, 'Error deleting order');
        }
    },
};

module.exports = OrderController;
