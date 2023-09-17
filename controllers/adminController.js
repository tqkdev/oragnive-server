const { json } = require('body-parser');
const Admin = require('../model/AdminModel');
const RefreshTokenAdminModel = require('../model/refreshTokenAdminModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const adminController = {
    // REGISTER
    adminRegister: async (req, res) => {
        try {
            const salt = await bcrypt.genSalt(10);
            const hashed = await bcrypt.hash(req.body.password, salt);

            // create admin
            const newAdmin = await new Admin({
                username: req.body.username,
                email: req.body.email,
                password: hashed,
            });

            //Save admin
            const admin = await newAdmin.save();
            res.status(200).json(admin);
        } catch (err) {
            res.status(500).json(err);
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

    generateRefreshToken: (admin) => {
        return jwt.sign(
            {
                id: admin.id,
            },
            process.env.JWT_REFRESH_KEY,
            { expiresIn: '365d' },
        );
    },

    //LOGIN
    adminLogin: async (req, res) => {
        try {
            const admin = await Admin.findOne({ username: req.body.username });
            if (!admin) {
                res.status(404).json('Incorrect username');
            }
            const validPassword = await bcrypt.compare(req.body.password, admin.password);
            if (!validPassword) {
                res.status(404).json('Incorrect password');
            }
            if (admin && validPassword) {
                //Generate access token
                const accessToken = adminController.generateAccessToken(admin);
                //Generate refresh token
                const refreshToken = adminController.generateRefreshToken(admin);

                // Lưu refresh token vào cơ sở dữ liệu
                const refreshTokenDocument = await new RefreshTokenAdminModel({
                    adminId: admin._id,
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
                const { password, ...others } = admin._doc;
                return res.status(200).json({ ...others, accessToken });
            }
        } catch (err) {
            res.status(500).json(err);
        }
    },

    requestRefreshToken: async (req, res) => {
        //Take refresh token from admin

        const refreshToken = req.cookies.refreshToken;
        //Send error if token is not valid
        if (!refreshToken) return res.status(401).json('dayy');
        const isRefreshTokenValid = await RefreshTokenAdminModel.exists({ refreshToken: refreshToken });
        if (!isRefreshTokenValid) {
            return res.status(401).json('refreshToken is invalid');
        }

        jwt.verify(refreshToken, process.env.JWT_REFRESH_KEY, (err, admin) => {
            if (err) {
                console.log(err);
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

            //create new access token, refresh token and send to admin
            const newAccessToken = adminController.generateAccessToken(admin);
            const newRefreshToken = adminController.generateRefreshToken(admin);

            // Hàm lưu refreshToken vào cơ sở dữ liệu
            async function saveRefreshTokenToDatabase(id, newRefreshToken) {
                try {
                    const refreshTokenDocument = await new RefreshTokenAdminModel({
                        adminId: id,
                        refreshToken: newRefreshToken,
                    });
                    await refreshTokenDocument.save();
                } catch (error) {
                    console.log(error);
                }
            }

            const idAdmin = admin.id.toString();
            saveRefreshTokenToDatabase(idAdmin, newRefreshToken);

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
    adminLogout: async (req, res) => {
        const refreshToken = req.cookies.refreshToken;
        try {
            // Xóa mã thông báo làm mới khỏi cơ sở dữ liệu và xóa cookie
            await RefreshTokenAdminModel.deleteOne({ refreshToken: refreshToken });
            res.clearCookie('refreshToken');
            res.status(200).json('Logout successful');
        } catch (error) {
            res.status(500).json(error);
        }
    },
};

module.exports = adminController;
