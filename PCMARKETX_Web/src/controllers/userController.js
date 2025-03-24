const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');

// JWT Token oluşturma
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// @desc    Kullanıcı kaydı
// @route   POST /api/users/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  // Tüm alanların doldurulduğunu kontrol et
  if (!username || !email || !password) {
    res.status(400);
    throw new Error('Lütfen tüm alanları doldurun');
  }

  // Şifre gereksinimlerini kontrol et
  if (password.length < 6) {
    res.status(400);
    throw new Error('Şifre en az 6 karakter olmalıdır');
  }

  // Kullanıcının zaten var olup olmadığını kontrol et
  const userExists = await User.findOne({ $or: [{ email }, { username }] });

  if (userExists) {
    res.status(400);
    throw new Error('Bu kullanıcı adı veya e-posta adresi zaten kullanılıyor');
  }

  // Yeni kullanıcı oluştur
  const user = await User.create({
    username,
    email,
    password
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      role: user.role,
      token: generateToken(user._id)
    });
  } else {
    res.status(400);
    throw new Error('Geçersiz kullanıcı bilgileri');
  }
});

// @desc    Kullanıcı girişi
// @route   POST /api/users/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // E-posta ile kullanıcıyı bul
  const user = await User.findOne({ email });

  // Kullanıcı varsa ve şifre doğruysa
  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      role: user.role,
      token: generateToken(user._id)
    });
  } else {
    res.status(401);
    throw new Error('Geçersiz e-posta veya şifre');
  }
});

// @desc    Kullanıcı profilini getir
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      addresses: user.addresses,
      role: user.role
    });
  } else {
    res.status(404);
    throw new Error('Kullanıcı bulunamadı');
  }
});

// @desc    Kullanıcı profilini güncelle
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.firstName = req.body.firstName || user.firstName;
    user.lastName = req.body.lastName || user.lastName;
    user.phone = req.body.phone || user.phone;
    
    // E-posta değiştirilmek isteniyorsa, benzersiz olduğunu kontrol et
    if (req.body.email && req.body.email !== user.email) {
      const emailExists = await User.findOne({ email: req.body.email });
      if (emailExists) {
        res.status(400);
        throw new Error('Bu e-posta adresi zaten kullanılıyor');
      }
      user.email = req.body.email;
    }
    
    // Kullanıcı adı değiştirilmek isteniyorsa, benzersiz olduğunu kontrol et
    if (req.body.username && req.body.username !== user.username) {
      const usernameExists = await User.findOne({ username: req.body.username });
      if (usernameExists) {
        res.status(400);
        throw new Error('Bu kullanıcı adı zaten kullanılıyor');
      }
      user.username = req.body.username;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      phone: updatedUser.phone,
      role: updatedUser.role,
      token: generateToken(updatedUser._id)
    });
  } else {
    res.status(404);
    throw new Error('Kullanıcı bulunamadı');
  }
});

// @desc    Kullanıcı şifresini güncelle
// @route   PUT /api/users/password
// @access  Private
const updateUserPassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  
  if (!currentPassword || !newPassword) {
    res.status(400);
    throw new Error('Lütfen tüm alanları doldurun');
  }
  
  if (newPassword.length < 6) {
    res.status(400);
    throw new Error('Şifre en az 6 karakter olmalıdır');
  }
  
  const user = await User.findById(req.user._id);
  
  if (user && (await user.matchPassword(currentPassword))) {
    user.password = newPassword;
    await user.save();
    
    res.json({ message: 'Şifre başarıyla güncellendi' });
  } else {
    res.status(401);
    throw new Error('Mevcut şifre yanlış');
  }
});

// @desc    Tüm kullanıcıları getir
// @route   GET /api/users
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({}).select('-password');
  res.json(users);
});

// @desc    Kullanıcı sil
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    await user.remove();
    res.json({ message: 'Kullanıcı silindi' });
  } else {
    res.status(404);
    throw new Error('Kullanıcı bulunamadı');
  }
});

// @desc    Kullanıcı adreslerini getir
// @route   GET /api/users/addresses
// @access  Private
const getUserAddresses = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  
  if (user) {
    res.json(user.addresses);
  } else {
    res.status(404);
    throw new Error('Kullanıcı bulunamadı');
  }
});

// @desc    Kullanıcıya adres ekle
// @route   POST /api/users/addresses
// @access  Private
const addUserAddress = asyncHandler(async (req, res) => {
  const { title, street, city, state, postalCode, country } = req.body;
  
  if (!street || !city || !state) {
    res.status(400);
    throw new Error('Lütfen gerekli alanları doldurun');
  }
  
  const user = await User.findById(req.user._id);
  
  if (user) {
    const address = {
      title: title || 'Adres ' + (user.addresses.length + 1),
      street,
      city,
      state,
      postalCode,
      country: country || 'Türkiye'
    };
    
    user.addresses.push(address);
    await user.save();
    
    res.status(201).json(user.addresses);
  } else {
    res.status(404);
    throw new Error('Kullanıcı bulunamadı');
  }
});

// @desc    Kullanıcı adresini güncelle
// @route   PUT /api/users/addresses/:id
// @access  Private
const updateUserAddress = asyncHandler(async (req, res) => {
  const { title, street, city, state, postalCode, country } = req.body;
  const addressId = req.params.id;
  
  const user = await User.findById(req.user._id);
  
  if (user) {
    const addressIndex = user.addresses.findIndex(
      (a) => a._id.toString() === addressId
    );
    
    if (addressIndex === -1) {
      res.status(404);
      throw new Error('Adres bulunamadı');
    }
    
    user.addresses[addressIndex] = {
      _id: addressId,
      title: title || user.addresses[addressIndex].title,
      street: street || user.addresses[addressIndex].street,
      city: city || user.addresses[addressIndex].city,
      state: state || user.addresses[addressIndex].state,
      postalCode: postalCode || user.addresses[addressIndex].postalCode,
      country: country || user.addresses[addressIndex].country
    };
    
    await user.save();
    
    res.json(user.addresses);
  } else {
    res.status(404);
    throw new Error('Kullanıcı bulunamadı');
  }
});

// @desc    Kullanıcı adresini sil
// @route   DELETE /api/users/addresses/:id
// @access  Private
const deleteUserAddress = asyncHandler(async (req, res) => {
  const addressId = req.params.id;
  
  const user = await User.findById(req.user._id);
  
  if (user) {
    const addressIndex = user.addresses.findIndex(
      (a) => a._id.toString() === addressId
    );
    
    if (addressIndex === -1) {
      res.status(404);
      throw new Error('Adres bulunamadı');
    }
    
    user.addresses.splice(addressIndex, 1);
    await user.save();
    
    res.json(user.addresses);
  } else {
    res.status(404);
    throw new Error('Kullanıcı bulunamadı');
  }
});

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  updateUserPassword,
  getUsers,
  deleteUser,
  getUserAddresses,
  addUserAddress,
  updateUserAddress,
  deleteUserAddress
}; 