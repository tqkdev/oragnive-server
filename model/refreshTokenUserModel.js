const mongoose = require('mongoose');

const RefreshTokenUser = new mongoose.Schema({
    userId: { type: String, required: true },
    refreshToken: { type: String, required: true },
    created_at: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('RefreshTokenUser', RefreshTokenUser);
