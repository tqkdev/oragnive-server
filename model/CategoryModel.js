const mongoose = require('mongoose');

const Category = new mongoose.Schema({
    name: {
        type: String,
        require: true,
    },
    slug: {
        type: String,
        require: true,
    },

    product: [
        {
            type: String,
            ref: 'Product',
        },
    ],

    id_product: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
        },
    ],
    created_at: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Category', Category);
