const jwt = require('jsonwebtoken');

const middlewareAdminController = {
    //verifyToken
    verifyToken: (req, res, next) => {
        const token = req.headers.token;
        if (token) {
            const accesstoken = token.split(' ')[1];
            jwt.verify(accesstoken, process.env.JWT_ACCESS_KEY, (err, admin) => {
                if (err) {
                    res.status(403).json('Token is not valid');
                } else {
                    req.admin = admin;
                    next();
                }
            });
        } else {
            res.status(401).json("You're not authenticated");
        }
    },
};

const middlewareUserController = {
    //verifyToken
    verifyToken: (req, res, next) => {
        const token = req.headers.token;
        if (token) {
            const accesstoken = token.split(' ')[1];
            jwt.verify(accesstoken, process.env.JWT_ACCESS_KEY, (err, user) => {
                if (err) {
                    res.status(403).json('Token is not valid');
                } else {
                    req.user = user;
                    next();
                }
            });
        } else {
            res.status(401).json("You're not authenticated");
        }
    },
};

module.exports = {
    middlewareUserController,
    middlewareAdminController,
};
