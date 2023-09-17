const { json } = require('body-parser');
const User = require('../model/UserModel');
const Order = require('../model/OrdersModel');
const RefreshTokenUserModel = require('../model/refreshTokenUserModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const userController = {
    // REGISTER
    userRegister: async (req, res) => {
        try {
            const salt = await bcrypt.genSalt(10);
            const hashed = await bcrypt.hash(req.body.password, salt);

            // create user
            const newUser = await new User({
                username: req.body.username,
                email: req.body.email,
                password: hashed,
            });

            //Save user
            const user = await newUser.save();
            // create order
            const newOder = new Order({ user_id: user._id });
            await newOder.save();
            res.status(200).json(user);
        } catch (err) {
            res.status(500).json(err);
        }
    },
    // GENERATE ACCESS TOKEN
    generateAccessToken: (user) => {
        return jwt.sign(
            {
                id: user._id,
            },
            process.env.JWT_ACCESS_KEY,
            {
                expiresIn: '30000s',
            },
        );
    },

    // GENERATE REFRESH TOKEN
    generateRefreshToken: (user) => {
        return jwt.sign(
            {
                id: user._id,
            },
            process.env.JWT_REFRESH_KEY,
            {
                expiresIn: '365d',
            },
        );
    },

    //LOGIN
    userLogin: async (req, res) => {
        try {
            const user = await User.findOne({ username: req.body.username });
            if (!user) {
                res.status(404).json('Incorrect username');
            }
            const validPassword = await bcrypt.compare(req.body.password, user.password);
            if (!validPassword) {
                res.status(404).json('Incorrect password');
            }
            if (user && validPassword) {
                //Generate access token
                const accessToken = userController.generateAccessToken(user);
                //Generate refresh token
                const refreshToken = userController.generateRefreshToken(user);

                // Lưu refresh token vào cơ sở dữ liệu
                const refreshTokenDocument = await new RefreshTokenUserModel({
                    userId: user._id,
                    refreshToken: refreshToken,
                });
                await refreshTokenDocument.save();
                // STORE REFRESH TOKEN IN COOKIE
                res.cookie('refreshToken', refreshToken, {
                    httpOnly: true,
                    secure: false,
                    path: '/',
                    sameSite: 'strict',
                });
                const { password, ...others } = user._doc;
                return res.status(200).json({ ...others, accessToken });
            }
        } catch (err) {
            res.status(500).json(err);
        }
    },

    requestRefreshToken: async (req, res) => {
        //Take refresh token from user

        const refreshToken = req.cookies.refreshToken;
        //Send error if token is not valid
        if (!refreshToken) return res.status(401).json('dayy');
        const isRefreshTokenValid = await RefreshTokenUserModel.exists({ refreshToken: refreshToken });
        if (!isRefreshTokenValid) {
            return res.status(401).json('refreshToken is invalid');
        }

        jwt.verify(refreshToken, process.env.JWT_REFRESH_KEY, (err, user) => {
            if (err) {
                console.log(err);
            }

            // Hàm xóa refreshToken ở cơ sở dữ liệu
            async function deleteDocumentByRefreshToken(refreshToken) {
                try {
                    await RefreshTokenUserModel.deleteOne({ refreshToken: refreshToken });
                } catch (error) {
                    console.error('Error:', error);
                }
            }
            deleteDocumentByRefreshToken(refreshToken);

            //create new access token, refresh token and send to user
            const newAccessToken = userController.generateAccessToken(user);
            const newRefreshToken = userController.generateRefreshToken(user);

            // Hàm lưu refreshToken vào cơ sở dữ liệu
            async function saveRefreshTokenToDatabase(id, newRefreshToken) {
                try {
                    const refreshTokenDocument = await new RefreshTokenUserModel({
                        userId: id,
                        refreshToken: newRefreshToken,
                    });
                    await refreshTokenDocument.save();
                } catch (error) {
                    console.log(error);
                }
            }

            const idUser = user.id.toString();
            saveRefreshTokenToDatabase(idUser, newRefreshToken);

            res.cookie('refreshToken', newRefreshToken, {
                httpOnly: true,
                secure: false,
                path: '/',
                sameSite: 'strict',
            });
            res.status(200).json({
                accessToken: newAccessToken,
                refreshToken: newRefreshToken,
            });
        });
    },

    // LOGOUT
    userLogout: async (req, res) => {
        const refreshToken = req.cookies.refreshToken;
        try {
            // Xóa mã thông báo làm mới khỏi cơ sở dữ liệu và xóa cookie
            await RefreshTokenUserModel.deleteOne({ refreshToken: refreshToken });
            res.clearCookie('refreshToken');
            res.status(200).json('Logout successful');
        } catch (error) {
            res.status(500).json(error);
        }
    },
};

module.exports = userController;
