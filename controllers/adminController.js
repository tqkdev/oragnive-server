const Admin = require('../model/AdminModel');
const RefreshTokenAdminModel = require('../model/refreshTokenAdminModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {
    sendSuccessResponse,
    sendErrorResponse,
    sendNotFoundResponse,
    sendValidationErrorResponse,
    sendUnauthorizedResponse,
} = require('../utils/respone');

const adminController = {
    // REGISTER
    adminRegister: async (req, res) => {
        try {
            const { username, email, password } = req.body;

            // Kiểm tra xem email đã tồn tại hay chưa
            const existingAdmin = await Admin.findOne({ email: email });
            if (existingAdmin) {
                return sendValidationErrorResponse(res, [], 'Email already exists');
            }

            const salt = await bcrypt.genSalt(10);
            const hashed = await bcrypt.hash(password, salt);

            // Tạo quản trị viên mới
            const newAdmin = new Admin({
                username: username,
                email: email,
                password: hashed,
            });

            // Lưu quản trị viên
            const admin = await newAdmin.save();
            sendSuccessResponse(res, admin, 'Admin registered successfully');
        } catch (err) {
            sendErrorResponse(res, 'Error registering admin');
        }
    },

    // GENERATE ACCESS TOKEN
    generateAccessToken: (admin) => {
        return jwt.sign(
            {
                id: admin.id,
            },
            process.env.JWT_ACCESS_KEY,
            { expiresIn: '300s' },
        );
    },

    // GENERATE REFRESH TOKEN
    generateRefreshToken: (admin) => {
        return jwt.sign(
            {
                id: admin.id,
            },
            process.env.JWT_REFRESH_KEY,
            { expiresIn: '365d' },
        );
    },

    // LOGIN
    adminLogin: async (req, res) => {
        try {
            const admin = await Admin.findOne({ email: req.body.email });
            if (!admin) {
                return sendNotFoundResponse(res, 'Incorrect email');
            }
            const validPassword = await bcrypt.compare(req.body.password, admin.password);
            if (!validPassword) {
                return sendValidationErrorResponse(res, [], 'Incorrect password');
            }
            if (admin && validPassword) {
                // Generate access token
                const accessToken = adminController.generateAccessToken(admin);
                // Generate refresh token
                const refreshToken = adminController.generateRefreshToken(admin);

                // Lưu refresh token vào cơ sở dữ liệu
                const refreshTokenDocument = new RefreshTokenAdminModel({
                    adminId: admin._id,
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
                const { password, ...others } = admin._doc;
                return sendSuccessResponse(res, { ...others, accessToken }, 'Login successful');
            }
        } catch (err) {
            sendErrorResponse(res, 'Error logging in');
        }
    },

    requestRefreshToken: async (req, res) => {
        const adminIdslug = req.body.adminid;
        // Take refresh token from admin
        const refreshToken = req.cookies.refreshToken;
        // Send error if token is not valid
        if (!refreshToken) return sendUnauthorizedResponse(res, 'No refresh token provided');
        const isRefreshTokenValid = await RefreshTokenAdminModel.exists({ refreshToken: refreshToken });
        if (!isRefreshTokenValid) {
            return sendUnauthorizedResponse(res, 'Refresh token is invalid');
        }

        jwt.verify(refreshToken, process.env.JWT_REFRESH_KEY, (err, admin) => {
            if (err) {
                return sendErrorResponse(res, 'Invalid refresh token');
            }

            // Hàm xóa refreshToken ở cơ sở dữ liệu
            async function deleteDocumentByRefreshToken(refreshToken) {
                try {
                    await RefreshTokenAdminModel.deleteOne({ refreshToken: refreshToken });
                } catch (error) {
                    console.error('Error:', error);
                }
            }
            deleteDocumentByRefreshToken(refreshToken);

            // Create new access token, refresh token and send to admin
            const newAccessToken = adminController.generateAccessToken(admin);
            const newRefreshToken = adminController.generateRefreshToken(admin);

            // Hàm lưu refreshToken vào cơ sở dữ liệu
            async function saveRefreshTokenToDatabase(id, newRefreshToken) {
                try {
                    const refreshTokenDocument = new RefreshTokenAdminModel({
                        adminId: id,
                        refreshToken: newRefreshToken,
                    });
                    await refreshTokenDocument.save();
                } catch (error) {
                    console.log(error);
                }
            }
            saveRefreshTokenToDatabase(adminIdslug, newRefreshToken);

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
    adminLogout: async (req, res) => {
        const refreshToken = req.cookies.refreshToken;
        try {
            // Xóa mã thông báo làm mới khỏi cơ sở dữ liệu và xóa cookie
            await RefreshTokenAdminModel.deleteOne({ refreshToken: refreshToken });
            res.clearCookie('refreshToken');
            sendSuccessResponse(res, null, 'Logout successful');
        } catch (error) {
            sendErrorResponse(res, 'Error logging out');
        }
    },
};

module.exports = adminController;
