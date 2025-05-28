const Product = require('../models/Product');
const Category = require('../models/Category');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');

// @desc    Tüm ürünleri getir
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
  try {
    const pageSize = 15;
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
      try {
        // Kategori ID'si verilmişse doğrudan kullan
        if (mongoose.Types.ObjectId.isValid(req.query.category)) {
          filters.category = req.query.category;
        } else {
          // Slug verilmişse önce kategoriyi bul
          const category = await Category.findOne({ slug: req.query.category });
          if (category) {
            filters.category = category._id;
            console.log(`Kategori bulundu: ${category.name}, ID: ${category._id}`);
          } else {
            console.log(`Kategori bulunamadı: ${req.query.category}`);
          }
        }
      } catch (error) {
        console.error('Kategori arama hatası:', error);
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
    
    // Aktif ürünleri filtrele
    filters.isActive = true;
    
    // Log olarak filtreleri ve sorguyu yazdır
    console.log('Ürün filtreleri:', JSON.stringify(filters));
    
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
    console.log(`Toplam bulunan ürün sayısı: ${count}`);
    
    // Ürünleri getir
    const products = await Product.find(filters)
      .sort(sort)
      .limit(pageSize)
      .skip(pageSize * (page - 1))
      .populate('category', 'name slug');
    
    console.log(`Sayfa ${page} için getirilen ürün sayısı: ${products.length}`);
    
    res.json({
      products,
      page,
      pages: Math.ceil(count / pageSize),
      total: count
    });
  } catch (error) {
    console.error('Ürünleri getirme hatası:', error);
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
    console.log("Ürün oluşturma istek gövdesi:", req.body);
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
    
    // Eğer req.file varsa (bir resim yüklenmişse), imageUrl oluştur
    let imageUrl = null;
    if (req.file) {
      // Uygun URL formatı ile resim yolunu oluştur (başında / işareti olmalı)
      imageUrl = `/uploads/${req.file.filename}`;
      console.log("Yüklenen resim dosyası:", req.file.filename);
      console.log("Oluşturulan imageUrl:", imageUrl);
      
      // Yüklenen dosyanın erişilebilir olup olmadığını kontrol et
      const filePath = path.join(__dirname, '../../public/uploads', req.file.filename);
      const fileExists = fs.existsSync(filePath);
      console.log(`Dosya kontrol: ${filePath} - Var mı: ${fileExists ? 'Evet' : 'Hayır'}`);
      
      if (fileExists) {
        // Dosya izinlerini kontrol et
        const stats = fs.statSync(filePath);
        console.log(`Dosya izinleri: ${stats.mode.toString(8)}`);
        console.log(`Dosya boyutu: ${stats.size} bayt`);
        
        // İzinleri düzenle (okuma izni ekle)
        fs.chmodSync(filePath, '0644');
        console.log(`Yeni dosya izinleri: ${fs.statSync(filePath).mode.toString(8)}`);
      } else {
        console.error("HATA: Yüklenen dosya bulunamadı!");
      }
    }
    
    // Specifications kontrolü - String olarak geldiyse JSON olarak parse et ve Map'e dönüştür
    let specsObject = new Map();
    
    if (specifications) {
      try {
        if (typeof specifications === 'string') {
          // JSON string'i parse et
          const parsedSpecs = JSON.parse(specifications);
          
          // Parsed objesindeki her key-value çiftini Map'e ekle
          for (const [key, value] of Object.entries(parsedSpecs)) {
            specsObject.set(key, value);
          }
          
          console.log("Specifications Map'e dönüştürüldü:", specsObject);
        } else if (specifications instanceof Map) {
          // Zaten Map ise doğrudan kullan
          specsObject = specifications;
        } else if (typeof specifications === 'object') {
          // Object ise Map'e dönüştür
          specsObject = new Map(Object.entries(specifications));
        }
      } catch (error) {
        console.error("Specifications dönüştürülürken hata:", error);
        return res.status(400).json({ message: 'Specifications formatı geçersiz', error: error.message });
      }
    }
    
    const product = new Product({
      name,
      description,
      price,
      category,
      brand,
      stock,
      images: images || [],
      imageUrl: imageUrl, // Eğer resim yüklenmişse, imageUrl'i kullan
      specifications: specsObject,
      featured: featured || false,
      discount: discount || 0,
      oldPrice: oldPrice || null,
      isNewProduct: isNewProduct || false
    });
    
    const createdProduct = await product.save();
    console.log("Oluşturulan ürün:", createdProduct);
    res.status(201).json(createdProduct);
  } catch (error) {
    console.error('Ürün oluşturma hatası:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Ürün güncelle
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = async (req, res) => {
  try {
    console.log("Ürün güncelleme isteği alındı, ID:", req.params.id);
    console.log("Ürün güncelleme isteği gövdesi:", req.body);
    console.log("Yüklenen dosya:", req.file ? {
      filename: req.file.filename,
      size: req.file.size,
      mimetype: req.file.mimetype,
      path: req.file.path
    } : "Dosya yok");
    
    const {
      name,
      description,
      price,
      category,
      brand,
      stock,
      specifications,
      featured,
      discount,
      oldPrice,
      isNewProduct,
      status
    } = req.body;
    
    // Ürünü bul
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      console.log("Ürün bulunamadı, ID:", req.params.id);
      return res.status(404).json({ message: 'Ürün bulunamadı' });
    }
    
    console.log("Ürün bulundu:", product.name);
    
    // Eğer req.file varsa (yeni bir resim yüklenmişse), imageUrl ve image güncelle
    let imageUrl = product.imageUrl; // Varsayılan olarak mevcut resmi kullan
    
    if (req.file) {
      try {
        // Uygun URL formatı ile resim yolunu oluştur (başında / işareti olmalı)
        imageUrl = `/uploads/${req.file.filename}`;
        console.log("Yüklenen yeni resim dosyası:", req.file.filename);
        console.log("Oluşturulan resim URL'i:", imageUrl);
        
        // Yüklenen dosyayı kontrol et
        const filePath = path.join(__dirname, '../../public/uploads', req.file.filename);
        console.log("Dosya yolu:", filePath);
        
        const fileExists = fs.existsSync(filePath);
        console.log(`Dosya kontrol: ${filePath} - Var mı: ${fileExists ? 'Evet' : 'Hayır'}`);
        
        if (fileExists) {
          // Dosya izinlerini kontrol et ve ayarla
          try {
            const stats = fs.statSync(filePath);
            console.log(`Dosya izinleri: ${stats.mode.toString(8)}`);
            console.log(`Dosya boyutu: ${stats.size} bayt`);
            
            // İzinleri düzenle (herkes için okuma izni ekle)
            fs.chmodSync(filePath, 0o644);
            console.log(`Yeni dosya izinleri: ${fs.statSync(filePath).mode.toString(8)}`);
          } catch (fileError) {
            console.error("Dosya izinleri ayarlanırken hata:", fileError);
          }
        } else {
          console.error("HATA: Yüklenen dosya bulunamadı!");
          // Dosya eksikse bile devam et, varsayılan resmi kullan
        }
      } catch (imageError) {
        console.error("Resim işlenirken hata:", imageError);
        // Resim işleme hatası olsa bile güncellemeye devam et
      }
    } else {
      console.log("Yeni resim yüklenmedi, mevcut resim korunuyor:", imageUrl);
    }
    
    // Specifications kontrolü - String olarak geldiyse JSON olarak parse et ve Map'e dönüştür
    let specsObject = product.specifications || new Map();
    
    if (specifications) {
      try {
        if (typeof specifications === 'string') {
          // JSON string'i parse et
          const parsedSpecs = JSON.parse(specifications);
          
          // Yeni bir Map oluştur
          specsObject = new Map();
          
          // Parsed objesindeki her key-value çiftini Map'e ekle
          for (const [key, value] of Object.entries(parsedSpecs)) {
            specsObject.set(key, value);
          }
          
          console.log("Specifications Map'e dönüştürüldü");
        } else if (specifications instanceof Map) {
          // Zaten Map ise doğrudan kullan
          specsObject = specifications;
        } else if (typeof specifications === 'object') {
          // Object ise Map'e dönüştür
          specsObject = new Map(Object.entries(specifications));
        }
      } catch (error) {
        console.error("Specifications dönüştürülürken hata:", error);
        return res.status(400).json({ message: 'Specifications formatı geçersiz', error: error.message });
      }
    }
    
    // Status değerini normalize et - ürün modeli enum olarak ['active', 'inactive', 'out_of_stock'] bekliyor
    let normalizedStatus = product.status; // varsayılan olarak mevcut değeri kullan
    
    if (status) {
      // Status değerini küçük harfe çevir (ACTIVE -> active)
      normalizedStatus = status.toLowerCase();
      console.log(`Status değeri normalize edildi: ${status} -> ${normalizedStatus}`);
      
      // Sadece izin verilen değerlerden biri mi kontrolü
      const allowedStatuses = ['active', 'inactive', 'out_of_stock'];
      if (!allowedStatuses.includes(normalizedStatus)) {
        console.warn(`Geçersiz status değeri: ${normalizedStatus}, varsayılan 'active' kullanılıyor`);
        normalizedStatus = 'active';
      }
    }
    
    // Ürün verilerini güncelle
    product.name = name || product.name;
    product.description = description || product.description;
    product.price = price !== undefined ? parseFloat(price) : product.price;
    product.category = category || product.category;
    product.brand = brand || product.brand;
    product.stock = stock !== undefined ? parseInt(stock) : product.stock;
    product.status = normalizedStatus;
    
    // Resim alanlarını güncelle
    if (req.file) {
      product.imageUrl = imageUrl;
      product.image = imageUrl;
      
      // Var olan images dizisini güncelle
      if (!product.images) {
        product.images = [imageUrl];
      } else if (Array.isArray(product.images)) {
        // Eğer yeni resim varsa ve images dizisi yoksa veya boşsa oluştur
        if (product.images.length === 0) {
          product.images = [imageUrl];
        } else {
          // Varolan dizinin ilk elemanını güncelle (ana görsel)
          product.images[0] = imageUrl;
        }
      }
    }
    
    product.specifications = specsObject;
    product.featured = featured === 'true' || featured === true;
    product.discount = discount !== undefined ? parseFloat(discount) : product.discount;
    product.oldPrice = oldPrice !== undefined ? parseFloat(oldPrice) : product.oldPrice;
    product.isNewProduct = isNewProduct === 'true' || isNewProduct === true;
    
    console.log("Güncellenecek ürün bilgileri:", {
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
      image: product.image,
      featured: product.featured,
      stock: product.stock,
      status: product.status
    });
    
    // Güncellenen ürünü kaydet
    try {
      const updatedProduct = await product.save();
      console.log("Ürün başarıyla güncellendi, ID:", updatedProduct._id);
      
      return res.json(updatedProduct);
    } catch (saveError) {
      console.error('Ürün veritabanına kaydedilirken hata:', saveError);
      return res.status(500).json({ message: 'Ürün güncellenemedi', error: saveError.message });
    }
  } catch (error) {
    console.error('Ürün güncelleme hatası:', error);
    return res.status(500).json({ message: 'Ürün güncellenirken bir hata oluştu', error: error.message });
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
    
    // Kullanıcı kimliği kontrolü - req.user varsa
    if (!req.user) {
      return res.status(401).json({ message: 'Değerlendirme yapmak için giriş yapmalısınız' });
    }
    
    // Kullanıcının daha önce değerlendirme yapıp yapmadığını kontrol et
    const alreadyReviewed = product.reviews.find(
      review => review.user && review.user.toString() === req.user._id.toString()
    );
    
    if (alreadyReviewed) {
      return res.status(400).json({ message: 'Bu ürünü zaten değerlendirdiniz' });
    }
    
    const review = {
      name: req.user.name || 'Misafir',
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
    console.error('Değerlendirme ekleme hatası:', error);
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