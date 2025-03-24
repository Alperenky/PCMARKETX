const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');

// Korumalı rotalar için kimlik doğrulama
const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Token'ı header'dan al
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Token'ı ayır (Bearer TOKEN)
      token = req.headers.authorization.split(' ')[1];

      // Token'ı doğrula
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Kullanıcıyı bul ve şifre hariç bilgileri al
      req.user = await User.findById(decoded.id).select('-password');

      next();
    } catch (error) {
      console.error(error);
      res.status(401);
      throw new Error('Yetkilendirme başarısız, geçersiz token');
    }
  }

  if (!token) {
    res.status(401);
    throw new Error('Yetkilendirme başarısız, token bulunamadı');
  }
});

// Admin yetkisi kontrolü
const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403);
    throw new Error('Bu işlem için admin yetkisi gerekiyor');
  }
};

module.exports = { protect, admin }; 