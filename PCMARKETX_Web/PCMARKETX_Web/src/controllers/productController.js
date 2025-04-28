const Product = require('../models/Product');
const Category = require('../models/Category');

// @desc    Tüm ürünleri getir
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
  try {
    const pageSize = 12;
    const page = Number(req.query.page) || 1;
    
    // Filtreler
    const filters = {};
    
    // Arama filtresi
    if (req.query.keyword) {
      filters.name = {
        $regex: req.query.keyword,
        $options: 'i'
      };
    }
    
    // Kategori filtresi
    if (req.query.category) {
      // Kategoriyi slug'a göre bul
      const category = await Category.findOne({ slug: req.query.category });
      if (category) {
        filters.category = category._id;
      }
    }
    
    // Marka filtresi
    if (req.query.brands) {
      const brands = req.query.brands.split(',');
      filters.brand = { $in: brands };
    }
    
    // Fiyat aralığı filtresi
    if (req.query.priceMin || req.query.priceMax) {
      filters.price = {};
      
      if (req.query.priceMin) {
        filters.price.$gte = Number(req.query.priceMin);
      }
      
      if (req.query.priceMax) {
        filters.price.$lte = Number(req.query.priceMax);
      }
    }
    
    // Sıralama
    let sort = { createdAt: -1 }; // Varsayılan: En yeniler
    
    if (req.query.sort) {
      switch (req.query.sort) {
        case 'price-asc':
          sort = { price: 1 };
          break;
        case 'price-desc':
          sort = { price: -1 };
          break;
        case 'newest':
          sort = { createdAt: -1 };
          break;
        case 'popular':
          sort = { numReviews: -1 };
          break;
      }
    }
    
    // Toplam ürün sayısı
    const count = await Product.countDocuments(filters);
    
    // Ürünleri getir
    const products = await Product.find(filters)
      .sort(sort)
      .limit(pageSize)
      .skip(pageSize * (page - 1))
      .populate('category', 'name slug');
    
    res.json({
      products,
      page,
      pages: Math.ceil(count / pageSize),
      total: count
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Tek bir ürünü ID'ye göre getir
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category', 'name slug');
    
    if (!product) {
      return res.status(404).json({ message: 'Ürün bulunamadı' });
    }
    
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Ürün sil
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Ürün bulunamadı' });
    }
    
    await product.remove();
    
    res.json({ message: 'Ürün silindi' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Ürün oluştur
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category,
      brand,
      stock,
      images,
      specifications,
      featured,
      discount,
      oldPrice,
      isNewProduct
    } = req.body;
    
    const product = new Product({
      name,
      description,
      price,
      category,
      brand,
      stock,
      images: images || [],
      specifications: specifications || {},
      featured: featured || false,
      discount: discount || 0,
      oldPrice: oldPrice || null,
      isNewProduct: isNewProduct || false,
      user: req.user._id
    });
    
    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Ürün güncelle
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category,
      brand,
      stock,
      images,
      specifications,
      featured,
      discount,
      oldPrice,
      isNewProduct
    } = req.body;
    
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Ürün bulunamadı' });
    }
    
    product.name = name || product.name;
    product.description = description || product.description;
    product.price = price !== undefined ? price : product.price;
    product.category = category || product.category;
    product.brand = brand || product.brand;
    product.stock = stock !== undefined ? stock : product.stock;
    product.images = images || product.images;
    product.specifications = specifications || product.specifications;
    product.featured = featured !== undefined ? featured : product.featured;
    product.discount = discount !== undefined ? discount : product.discount;
    product.oldPrice = oldPrice !== undefined ? oldPrice : product.oldPrice;
    product.isNewProduct = isNewProduct !== undefined ? isNewProduct : product.isNewProduct;
    
    const updatedProduct = await product.save();
    
    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Ürün değerlendirmesi oluştur
// @route   POST /api/products/:id/reviews
// @access  Private
const createProductReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Ürün bulunamadı' });
    }
    
    // Kullanıcının daha önce değerlendirme yapıp yapmadığını kontrol et
    const alreadyReviewed = product.reviews.find(
      review => review.user.toString() === req.user._id.toString()
    );
    
    if (alreadyReviewed) {
      return res.status(400).json({ message: 'Bu ürünü zaten değerlendirdiniz' });
    }
    
    const review = {
      name: req.user.name,
      rating: Number(rating),
      comment,
      user: req.user._id
    };
    
    product.reviews.push(review);
    
    product.numReviews = product.reviews.length;
    
    product.rating = product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length;
    
    await product.save();
    
    res.status(201).json({ message: 'Değerlendirme eklendi' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Öne çıkan ürünleri getir
// @route   GET /api/products/featured
// @access  Public
const getFeaturedProducts = async (req, res) => {
  try {
    const products = await Product.find({ featured: true })
      .limit(8)
      .sort({ createdAt: -1 })
      .populate('category', 'name slug');
    
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getProducts,
  getProductById,
  deleteProduct,
  createProduct,
  updateProduct,
  createProductReview,
  getFeaturedProducts
}; 