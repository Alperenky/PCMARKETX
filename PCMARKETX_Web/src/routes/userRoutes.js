const express = require('express');
const router = express.Router();
const { 
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
} = require('../controllers/userController');
const { protect, admin } = require('../middleware/authMiddleware');

// Kullanıcı kaydı ve girişi
router.post('/register', registerUser);
router.post('/login', loginUser);

// Kullanıcı profili
router.get('/profile', protect, getUserProfile);

// @route   PUT /api/users/profile
router.put('/profile', protect, updateUserProfile);

// @route   PUT /api/users/password
router.put('/password', protect, updateUserPassword);

// Kullanıcı adresleri
router.route('/addresses')
  .get(protect, getUserAddresses)
  .post(protect, addUserAddress);

router.route('/addresses/:id')
  .put(protect, updateUserAddress)
  .delete(protect, deleteUserAddress);

// @route   GET & DELETE /api/users
router.route('/')
  .get(protect, admin, getUsers);

// @route   DELETE /api/users/:id
router.route('/:id')
  .delete(protect, admin, deleteUser);

module.exports = router; 