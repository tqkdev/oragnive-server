const User = require('../model/UserModel');
const Order = require('../model/OrdersModel');
const RefreshTokenUserModel = require('../model/refreshTokenUserModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {
    sendSuccessResponse,
    sendErrorResponse,
    sendNotFoundResponse,
    sendValidationErrorResponse,
    sendUnauthorizedResponse,
} = require('../utils/respone');

const userController = {
    // REGISTER
    userRegister: async (req, res) => {
        try {
            const { username, email, password } = req.body;

            // Kiểm tra xem email đã tồn tại hay chưa
            const existingUser = await User.findOne({ email: email });
            if (existingUser) {
                return sendValidationErrorResponse(res, [], 'Email already exists');
            }

            const salt = await bcrypt.genSalt(10);
            const hashed = await bcrypt.hash(password, salt);

            // Tạo người dùng mới
            const newUser = new User({
                username: username,
                email: email,
                password: hashed,
            });

            // Lưu người dùng
            const user = await newUser.save();
            // Tạo đơn hàng mới
            const newOrder = new Order({ user_id: user._id });
            await newOrder.save();

            sendSuccessResponse(res, user, 'User registered successfully');
        } catch (err) {
            sendErrorResponse(res, 'Error registering user');
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
                expiresIn: '300s',
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

    // LOGIN
    userLogin: async (req, res) => {
        try {
            const user = await User.findOne({ email: req.body.email });
            if (!user) {
                return sendNotFoundResponse(res, 'Incorrect email');
            }
            const validPassword = await bcrypt.compare(req.body.password, user.password);
            if (!validPassword) {
                return sendValidationErrorResponse(res, [], 'Incorrect password');
            }
            if (user && validPassword) {
                // Generate access token
                const accessToken = userController.generateAccessToken(user);
                // Generate refresh token
                const refreshToken = userController.generateRefreshToken(user);

                // Lưu refresh token vào cơ sở dữ liệu
                const refreshTokenDocument = new RefreshTokenUserModel({
                    userId: user._id,
                    refreshToken: refreshToken,
                });
                await refreshTokenDocument.save();
                // STORE REFRESH TOKEN IN COOKIE
                res.cookie('refreshToken', refreshToken, {
                    httpOnly: true,
                    secure: true,
                    path: '/',
                    sameSite: 'none',
                });
                const { password, ...others } = user._doc;
                return sendSuccessResponse(res, { ...others, accessToken }, 'Login successful');
            }
        } catch (err) {
            sendErrorResponse(res, 'Error logging in');
        }
    },

    requestRefreshToken: async (req, res) => {
        const userIdslug = req.body.userid;
        //Take refresh token from user
        const refreshToken = req.cookies.refreshToken;
        //Send error if token is not valid
        if (!refreshToken) return sendUnauthorizedResponse(res, 'No refresh token provided');

        const isRefreshTokenValid = await RefreshTokenUserModel.exists({ refreshToken: refreshToken });
        if (!isRefreshTokenValid) {
            return sendUnauthorizedResponse(res, 'Refresh token is invalid');
        }

        jwt.verify(refreshToken, process.env.JWT_REFRESH_KEY, (err, user) => {
            if (err) {
                return sendErrorResponse(res, 'Invalid refresh token');
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
                    const refreshTokenDocument = new RefreshTokenUserModel({
                        userId: id,
                        refreshToken: newRefreshToken,
                    });
                    await refreshTokenDocument.save();
                } catch (error) {
                    console.log(error);
                }
            }

            saveRefreshTokenToDatabase(userIdslug, newRefreshToken);

            res.cookie('refreshToken', newRefreshToken, {
                httpOnly: true,
                secure: true,
                path: '/',
                sameSite: 'none',
            });
            sendSuccessResponse(
                res,
                { accessToken: newAccessToken, refreshToken: newRefreshToken },
                'Token refreshed successfully',
            );
        });
    },

    // LOGOUT
    userLogout: async (req, res) => {
        const refreshToken = req.cookies.refreshToken;
        try {
            // Xóa mã thông báo làm mới khỏi cơ sở dữ liệu và xóa cookie
            await RefreshTokenUserModel.deleteOne({ refreshToken: refreshToken });
            res.clearCookie('refreshToken');
            sendSuccessResponse(res, null, 'Logout successful');
        } catch (error) {
            sendErrorResponse(res, 'Error logging out');
        }
    },
};

module.exports = userController;
