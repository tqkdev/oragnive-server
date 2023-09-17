const mongoose = require('mongoose');

const Product = new mongoose.Schema({
    name: {
        type: String,
        require: true,
    },

    description: {
        type: String,
        require: true,
    },

    price: {
        type: Number,
        require: true,
    },

    image_url: {
        type: String,
        require: true,
    },

    khoiluong: {
        type: String,
        require: true,
    },

    nguongoc: {
        type: String,
        require: true,
    },

    slug: {
        type: String,
        require: true,
    },

    category: {
        type: String,
        ref: 'Category',
    },
    created_at: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Product', Product);
