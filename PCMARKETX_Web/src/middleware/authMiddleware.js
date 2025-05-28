const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');

// Korumalı rotalar için kimlik doğrulama
const protect = asyncHandler(async (req, res, next) => {
    let token;

    // Token'ı header'dan al
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Token'ı ayır (Bearer TOKEN)
            token = req.headers.authorization.split(' ')[1];

            if (!token) {
                res.status(401);
                throw new Error('Token bulunamadı');
            }

            if (!process.env.JWT_SECRET) {
                console.warn('JWT_SECRET environment variable is not set. Using default secret key.');
            }

            // Token'ı doğrula
            const decoded = jwt.verify(
                token,
                process.env.JWT_SECRET || 'pcmarketx_jwt_secret_key_2024'
            );

            // Kullanıcıyı bul ve şifre hariç bilgileri al
            const user = await User.findById(decoded.id).select('-password');

            if (!user) {
                res.status(401);
                throw new Error('Kullanıcı bulunamadı');
            }

            req.user = user;
            next();
        } catch (error) {
            console.error('Token doğrulama hatası:', error);
            res.status(401);
            if (error.name === 'JsonWebTokenError') {
                throw new Error('Geçersiz token formatı');
            } else if (error.name === 'TokenExpiredError') {
                throw new Error('Token süresi dolmuş');
            } else {
                throw new Error('Yetkilendirme başarısız: ' + error.message);
            }
        }
    } else {
        res.status(401);
        throw new Error('Authorization header bulunamadı');
    }
});

// Admin yetkisi kontrolü
const admin = (req, res, next) => {
    if (req.user && req.user.isAdmin) {
        next();
    } else {
        res.status(403);
        throw new Error('Admin yetkisi gerekli');
    }
};

module.exports = { protect, admin }; 