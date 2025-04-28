const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Ürün adı gereklidir'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Ürün açıklaması gereklidir']
  },
  price: {
    type: Number,
    required: [true, 'Ürün fiyatı gereklidir'],
    min: [0, 'Fiyat 0\'dan küçük olamaz']
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Kategori gereklidir']
  },
  brand: {
    type: String,
    required: [true, 'Marka gereklidir']
  },
  stock: {
    type: Number,
    required: [true, 'Stok miktarı gereklidir'],
    default: 0
  },
  images: [
    {
      type: String,
      required: [true, 'Ürün görseli gereklidir']
    }
  ],
  specifications: {
    type: Map,
    of: String
  },
  rating: {
    type: Number,
    default: 0
  },
  numReviews: {
    type: Number,
    default: 0
  },
  reviews: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      name: String,
      rating: Number,
      comment: String,
      date: {
        type: Date,
        default: Date.now
      }
    }
  ],
  featured: {
    type: Boolean,
    default: false
  },
  discount: {
    type: Number,
    default: 0
  },
  oldPrice: {
    type: Number,
    default: null
  },
  isNewProduct: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  suppressReservedKeysWarning: true
});

module.exports = mongoose.model('Product', productSchema); 