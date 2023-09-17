const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    order: [
        {
            product_id: {
                type: String,
                required: true,
            },
            product_name: {
                type: String,
            },
            product_image: {
                type: String,
            },
            product_price: {
                type: Number,
            },
            product_slug: {
                type: String,
            },
            quality: {
                type: Number,
            },
        },
    ],
    order_date: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Order', orderSchema);
