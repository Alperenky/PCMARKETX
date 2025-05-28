const mongoose = require('mongoose');

const reviewSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    rating: { type: Number, required: true },
    comment: { type: String, required: true },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

const productSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Ürün adı gereklidir'],
      trim: true,
    },
    model: {
      type: String,
      trim: true,
    },
    brand: {
      type: String,
      trim: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
    },
    description: {
      type: String,
      trim: true,
    },
    reviews: [reviewSchema],
    rating: {
      type: Number,
      default: 0,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'Ürün fiyatı gereklidir'],
      min: 0,
      default: 0,
    },
    oldPrice: {
      type: Number,
      min: 0,
      default: 0,
    },
    discount: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    stock: {
      type: Number,
      min: 0,
      default: 0,
    },
    // Image alanı (image yolu)
    image: {
      type: String,
      trim: true,
    },
    // ImageUrl alanı (geriye dönük uyumluluk için)
    imageUrl: {
      type: String,
      trim: true,
    },
    // Birden fazla resim için
    images: [
      {
        type: String,
        trim: true,
      },
    ],
    // Ürün özellikleri için Map kullanımı
    specifications: {
      type: Map,
      of: String,
      default: new Map(),
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isNewProduct: {
      type: Boolean,
      default: false,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    popular: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'out_of_stock'],
      default: 'active',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Pre-save middleware: Set imageUrl to image if image is updated
productSchema.pre('save', function(next) {
  // Eğer image alanı değiştiyse ve imageUrl değişmediyse
  if (this.isModified('image') && !this.isModified('imageUrl')) {
    this.imageUrl = this.image;
  }
  
  // Eğer imageUrl alanı değiştiyse ve image değişmediyse
  if (this.isModified('imageUrl') && !this.isModified('image')) {
    this.image = this.imageUrl;
  }
  
  // Fiyat alanlarını sayı tipine dönüştür
  if (this.price) this.price = parseFloat(this.price);
  if (this.oldPrice) this.oldPrice = parseFloat(this.oldPrice);
  if (this.discount) this.discount = parseFloat(this.discount);
  if (this.stock) this.stock = parseInt(this.stock);
  
  next();
});

// Virtuals: discountedPrice
productSchema.virtual('discountedPrice').get(function() {
  if (this.discount && this.discount > 0) {
    return this.price * (1 - this.discount / 100);
  }
  return this.price;
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product; 