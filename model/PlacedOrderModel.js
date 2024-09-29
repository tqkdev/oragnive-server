const mongoose = require('mongoose');

const placedOrderSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    order_items: [
        {
            product_id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
                required: true,
            },
            product_name: {
                type: String,
                required: true,
            },
            product_category: {
                type: String,
                required: true,
            },
            product_image: {
                type: String,
                required: true,
            },
            product_price: {
                type: Number,
                required: true,
            },
            quantity: {
                type: Number,
                required: true,
                default: 1,
            },
        },
    ],
    order_date: {
        type: Date,
        default: Date.now,
    },
    status: {
        type: String,
        enum: ['pending', 'shipped', 'delivered', 'cancelled'],
        default: 'pending',
    },
    total_amount: {
        type: Number,
        required: true,
    },
    total_quantity: {
        type: Number,
        required: true,
        default: 0, // Mặc định là 0, có thể được cập nhật khi tạo đơn hàng
    },
});

module.exports = mongoose.model('PlacedOrder', placedOrderSchema);
