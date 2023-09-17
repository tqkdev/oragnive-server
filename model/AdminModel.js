const mongoose = require('mongoose');

const Admin = new mongoose.Schema({
    username: {
        type: String,
        require: true,
        unique: true,
    },

    email: {
        type: String,
        require: true,
    },

    password: {
        type: String,
        require: true,
    },
    created_at: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Admin', Admin);
