const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  deleteProduct,
  createProduct,
  updateProduct,
  createProductReview,
  getFeaturedProducts
} = require('../controllers/productController');
const { protect, admin } = require('../middleware/authMiddleware');

// @route   GET /api/products
router.route('/')
  .get(getProducts)
  .post(protect, admin, createProduct);

// @route   GET /api/products/featured
router.get('/featured', getFeaturedProducts);

// @route   GET, PUT, DELETE /api/products/:id
router.route('/:id')
  .get(getProductById)
  .put(protect, admin, updateProduct)
  .delete(protect, admin, deleteProduct);

// @route   POST /api/products/:id/reviews
router.route('/:id/reviews')
  .post(protect, createProductReview);

module.exports = router; 