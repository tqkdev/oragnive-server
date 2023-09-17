const { json } = require('body-parser');
// const Product = require('../model/ProductModel');
// const User = require('../model/UserModel');
const Order = require('../model/OrdersModel');

// const unorm = require('unorm');

const OrderController = {
    // // ADD PRODUCT
    // addOrder: async (req, res) => {
    //     try {
    //         const newOder = new Order(req.body);
    //         const saveOrder = await newOder.save();
    //         res.status(200).json(saveOrder);
    //     } catch (err) {
    //         res.status(500).json(err);
    //     }
    // },

    // GET AN ORDER
    getOrder: async (req, res) => {
        try {
            const order = await Order.findOne({ user_id: req.params.slug });
            // console.log(order.order);
            res.status(200).json(order);
        } catch (error) {
            res.status(500).json(error);
        }
    },

    // UPDATE PRODUCT
    updateOrder: async (req, res) => {
        try {
            const updateorder = await Order.findOne({ user_id: req.params.slug });
            await updateorder.order.push(req.body);
            await updateorder.save();
            res.status(200).json(updateorder);
        } catch (error) {
            res.status(500).json(error);
        }
    },

    // UPDATE qualyti
    updatequality: async (req, res) => {
        try {
            const updateOrder = await Order.findOne({ user_id: req.params.slug });
            const quality = req.body.quality;
            // Tìm sản phẩm cần cập nhật trong đơn hàng
            const productToUpdate = updateOrder.order.find((orderItem) => orderItem.product_id === req.body.product_id);
            if (!productToUpdate) {
                return res.status(404).json({ message: 'Không tìm thấy sản phẩm trong đơn hàng' });
            }

            // Cập nhật trường quality thành 5
            productToUpdate.quality = quality;

            await updateOrder.save();

            res.status(200).json(updateOrder);
        } catch (error) {
            res.status(500).json(error);
        }
    },

    // DELETE PRODUCT
    deleteOrder: async (req, res) => {
        try {
            const deleteOrder = await Order.findOne({ user_id: req.params.slug });

            // Tìm sản phẩm cần xóa trong đơn hàng
            const productToRemoveIndex = deleteOrder.order.findIndex(
                (orderItem) => orderItem.product_id === req.body.product_id,
            );

            if (productToRemoveIndex === -1) {
                return res.status(404).json({ message: 'Không tìm thấy sản phẩm trong đơn hàng' });
            }

            // Xóa sản phẩm ra khỏi đơn hàng
            deleteOrder.order.splice(productToRemoveIndex, 1);

            await deleteOrder.save();
            res.status(200).json(deleteOrder);
        } catch (error) {
            res.status(500).json(error);
        }
    },
};

module.exports = OrderController;
