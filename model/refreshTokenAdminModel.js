const mongoose = require('mongoose');

const RefreshTokenAdmin = new mongoose.Schema({
    adminId: { type: String, required: true },
    refreshToken: { type: String, required: true },
    created_at: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('RefreshTokenAdmin', RefreshTokenAdmin);
