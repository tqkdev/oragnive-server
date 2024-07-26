const jwt = require('jsonwebtoken');
const { sendUnauthorizedResponse, sendErrorResponse } = require('../utils/respone');

const middlewareAdminController = {
    // verifyToken
    verifyToken: (req, res, next) => {
        const token = req.headers.token;
        if (token) {
            const accessToken = token.split(' ')[1];
            jwt.verify(accessToken, process.env.JWT_ACCESS_KEY, (err, admin) => {
                if (err) {
                    sendErrorResponse(res, 'Token is not valid', 403);
                } else {
                    req.admin = admin;
                    next();
                }
            });
        } else {
            sendUnauthorizedResponse(res, "You're not authenticated");
        }
    },
};

const middlewareUserController = {
    // verifyToken
    verifyToken: (req, res, next) => {
        const token = req.headers.token;
        if (token) {
            const accessToken = token.split(' ')[1];
            jwt.verify(accessToken, process.env.JWT_ACCESS_KEY, (err, user) => {
                if (err) {
                    sendErrorResponse(res, 'Token is not valid', 403);
                } else {
                    req.user = user;
                    next();
                }
            });
        } else {
            sendUnauthorizedResponse(res, "You're not authenticated");
        }
    },
};

module.exports = {
    middlewareUserController,
    middlewareAdminController,
};
