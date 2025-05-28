const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
require('dotenv').config();
const { notFound, errorHandler } = require('./src/middleware/errorMiddleware');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { protect, admin } = require('./src/middleware/authMiddleware');

// Model importları
const Category = require('./src/models/Category');
const Product = require('./src/models/Product');
const Order = require('./src/models/Order');

// Express uygulamasını başlat
const app = express();

// Sunucu portu
const PORT = process.env.PORT || 5002;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cache'i önle ve CORS sorunlarını çöz
app.use((req, res, next) => {
  // CORS için tüm kaynaklara izin ver
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  // Cache'i önle
  res.header('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.header('Pragma', 'no-cache');
  res.header('Expires', '0');
  res.header('Surrogate-Control', 'no-store');
  
  next();
});

// Statik dosyaları sunma
app.use(express.static(path.join(__dirname, 'public'), {
  setHeaders: (res, path) => {
    if (path.endsWith('.jpg') || path.endsWith('.jpeg') || path.endsWith('.png') || path.endsWith('.gif')) {
      // Resim dosyaları için cache'i önle
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    }
  }
}));
// Uploads klasörü için özel yol ayarı
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads'), {
  setHeaders: (res, path) => {
    // Cache'i önle
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }
}));

// Uploads klasörünü test etmek için endpoint
app.get('/test-uploads', (req, res) => {
  const uploadsDir = path.join(__dirname, 'public/uploads');
  
  // Uploads klasöründeki dosyaları listele
  fs.readdir(uploadsDir, (err, files) => {
    if (err) {
      console.error('Uploads klasörü okuma hatası:', err);
      return res.status(500).json({ error: 'Uploads klasörü okunamadı', details: err.message });
    }
    
    // Her dosya için doğrudan URL oluştur
    const fileUrls = files.map(file => {
      return {
        fileName: file,
        url: `/uploads/${file}`,
        fullPath: path.join(uploadsDir, file),
        stats: fs.statSync(path.join(uploadsDir, file))
      };
    });
    
    res.json({
      message: 'Uploads klasörü içeriği',
      uploadsDir,
      dirExists: fs.existsSync(uploadsDir),
      dirPermissions: fs.statSync(uploadsDir).mode.toString(8),
      files: fileUrls
    });
  });
});

// Dosyaya doğrudan erişim sağlayan endpoint
app.get('/direct-file/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, 'public/uploads', filename);
  
  // Dosyanın varlığını kontrol et
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ 
      error: 'Dosya bulunamadı', 
      requestedFile: filename,
      fullPath: filePath
    });
  }
  
  // Dosya izinleri ve boyutu hakkında bilgi al
  const stats = fs.statSync(filePath);
  
  // Dosyayı gönder
  res.sendFile(filePath, {
    headers: {
      'Content-Type': 'image/jpeg',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      'X-File-Size': stats.size,
      'X-File-Permissions': stats.mode.toString(8)
    }
  }, (err) => {
    if (err) {
      console.error('Dosya gönderme hatası:', err);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Dosya gönderilirken hata oluştu', details: err.message });
      }
    }
  });
});

// HTML dosyalarına doğrudan erişim için özel yönlendirme
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'html', 'index.html'));
});

// Test sayfası için endpoint
app.get('/test-image', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'html', 'test-image.html'));
});

// Debug sayfası için endpoint
app.get('/debug-products', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'html', 'debug-products.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'html', 'login.html'));
});

app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'html', 'register.html'));
});

app.get('/profile', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'html', 'profile.html'));
});

app.get('/cart', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'html', 'cart.html'));
});

app.get('/orders', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'html', 'orders.html'));
});

// Kategori sayfaları için yönlendirme
app.get('/category/:categoryName', (req, res) => {
  const categoryName = req.params.categoryName;
  res.sendFile(path.join(__dirname, 'public', 'category', `${categoryName}.html`));
});

// API endpoint: Kategoriye göre ürünleri getir (slug ile)
app.get('/api/products/by-category/:slug', async (req, res) => {
  try {
    // Önce kategoriyi bul
    const category = await Category.findOne({ slug: req.params.slug });
    if (!category) {
      return res.status(404).json({ message: 'Kategori bulunamadı' });
    }
    
    // Sayfalama için parametreleri al
    const pageSize = 15;
    const page = Number(req.query.page) || 1;
    
    // Toplam ürün sayısını bul
    const count = await Product.countDocuments({ category: category._id });
    
    // Kategori ID'sini kullanarak ürünleri bul ve sayfalandır
    const products = await Product.find({ category: category._id })
      .sort({ createdAt: -1 })
      .limit(pageSize)
      .skip(pageSize * (page - 1));
    
    res.json({
      products,
      page,
      pages: Math.ceil(count / pageSize),
      total: count
    });
  } catch (error) {
    console.error('Kategoriye göre ürünler getirilirken hata oluştu:', error);
    res.status(500).json({ message: 'Ürünler yüklenirken bir hata oluştu', error: error.message });
  }
});

// API endpoint: Featured (Öne çıkan) ürünleri getir
app.get('/api/products/featured', async (req, res) => {
  try {
    // Featured özelliği true olan ürünleri bul
    const featuredProducts = await Product.find({ featured: true, isActive: true })
      .limit(8) // En fazla 8 ürün getir
      .sort({ createdAt: -1 }); // En yeni eklenenler önce
    
    if (!featuredProducts || featuredProducts.length === 0) {
      return res.status(404).json({ message: 'Öne çıkan ürün bulunamadı' });
    }
    
    res.json(featuredProducts);
  } catch (error) {
    console.error('Featured ürünler getirilirken hata oluştu:', error);
    res.status(500).json({ message: 'Ürünler yüklenirken bir hata oluştu', error: error.message });
  }
});

// API endpoint: Yeni ürünleri getir
app.get('/api/products/new', async (req, res) => {
  try {
    // isNewProduct özelliği true olan ürünleri bul
    const newProducts = await Product.find({ isNewProduct: true, isActive: true })
      .limit(8) // En fazla 8 ürün getir
      .sort({ createdAt: -1 }); // En yeni eklenenler önce
    
    if (!newProducts || newProducts.length === 0) {
      return res.status(404).json({ message: 'Yeni ürün bulunamadı' });
    }
    
    res.json(newProducts);
  } catch (error) {
    console.error('Yeni ürünler getirilirken hata oluştu:', error);
    res.status(500).json({ message: 'Ürünler yüklenirken bir hata oluştu', error: error.message });
  }
});

// API endpoint: Popüler ürünleri getir
app.get('/api/products/popular', async (req, res) => {
  try {
    // Popular özelliği true olan ürünleri bul
    const popularProducts = await Product.find({ popular: true, isActive: true })
      .limit(8) // En fazla 8 ürün getir
      .sort({ rating: -1, numReviews: -1 }); // En yüksek puan ve en çok yoruma sahip olanlar önce
    
    if (!popularProducts || popularProducts.length === 0) {
      return res.status(404).json({ message: 'Popüler ürün bulunamadı' });
    }
    
    res.json(popularProducts);
  } catch (error) {
    console.error('Popüler ürünler getirilirken hata oluştu:', error);
    res.status(500).json({ message: 'Ürünler yüklenirken bir hata oluştu', error: error.message });
  }
});

// Multer Storage ayarları (Resim yükleme)
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Yükleme klasörü oluştur
        const uploadDir = path.join(__dirname, 'public/uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Dosya adını benzersiz yap
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
});

// Multer ayarları
const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        // Geçerli resim formatlarını kontrol et
        const allowedFileTypes = /jpeg|jpg|png|gif|webp/;
        const mimetype = allowedFileTypes.test(file.mimetype);
        const extname = allowedFileTypes.test(path.extname(file.originalname).toLowerCase());
        
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Sadece resim dosyaları yüklenebilir (JPEG, JPG, PNG, GIF, WEBP)!'));
        }
    }
}).single('image');

// Multer hata yakalama middleware
const uploadMiddleware = (req, res, next) => {
    upload(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            // Multer hatası
            console.error('Multer hatası:', err);
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({ message: 'Dosya boyutu çok büyük. En fazla 10MB olabilir.' });
            }
            return res.status(400).json({ message: `Resim yükleme hatası: ${err.message}` });
        } else if (err) {
            // Diğer hatalar
            console.error('Resim yükleme hatası:', err);
            return res.status(400).json({ message: err.message });
        }
        // Hata yoksa devam et
        next();
    });
};

// Başlangıç kategorileri oluştur
const createDefaultCategories = async () => {
  try {
    // Kategori sayısını kontrol et
    const count = await Category.countDocuments();
    
    // Eğer kategori varsa, oluşturma
    if (count > 0) {
      console.log('Kategoriler zaten mevcut:', count);
      return;
    }
    
    console.log('Varsayılan kategoriler oluşturuluyor...');
    
    // Varsayılan kategorileri oluştur
    const defaultCategories = [
      { 
        name: 'İşlemciler',
        slug: 'islemciler',
        description: 'AMD ve Intel işlemciler'
      },
      { 
        name: 'Ekran Kartları',
        slug: 'ekran-kartlari',
        description: 'Nvidia ve AMD ekran kartları'
      },
      { 
        name: 'Anakartlar',
        slug: 'anakartlar',
        description: 'Intel ve AMD uyumlu anakartlar'
      },
      { 
        name: 'RAM Bellek',
        slug: 'ram-bellek',
        description: 'DDR4 ve DDR5 bellekler'
      },
      { 
        name: 'Depolama',
        slug: 'depolama',
        description: 'SSD ve Sabit diskler'
      }
    ];
    
    // Kategorileri kaydet
    await Category.insertMany(defaultCategories);
    console.log('Varsayılan kategoriler başarıyla oluşturuldu');
  } catch (error) {
    console.error('Varsayılan kategoriler oluşturulurken hata:', error);
  }
};

// MongoDB bağlantısı
const dbConnect = async () => {
  try {
    console.log('MongoDB bağlantısı deneniyor...');
    // MongoDB bağlantı dizesi
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://adminuser:KkM8tMTLdaRfY9R@pcexpress.hvgoo.mongodb.net/PCShopDB?retryWrites=true&w=majority';
    
    // Options desteği ile bağlan
    const mongooseOptions = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000, // Bağlantı zaman aşımı 10 saniye
      socketTimeoutMS: 20000, // Socket zaman aşımı 20 saniye
    };
    
    // Mongo bağlantısını kur
    await mongoose.connect(MONGODB_URI, mongooseOptions);

    // Bağlantı durumunu takip et
    mongoose.connection.on('connected', () => {
      console.log('MongoDB bağlantısı başarılı:', mongoose.connection.host);
      app.locals.mongodbConnected = true;
    });

    mongoose.connection.on('error', (err) => {
      console.error('MongoDB bağlantı hatası:', err);
      app.locals.mongodbConnected = true; // Hata durumunda bile bağlı kabul et
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB bağlantısı kesildi');
      app.locals.mongodbConnected = true; // Bağlantı kesildiğinde bile bağlı kabul et
    });
    
    console.log('Sunucu http://localhost:' + PORT + ' adresinde çalışıyor');
    console.log('MongoDB bağlantısı başarılı:', mongoose.connection.host);
    
    // Başlangıç kategorileri oluştur
    await createDefaultCategories();
    
  } catch (error) {
    console.error('MongoDB bağlantı hatası:', error.message);
    // Hata durumunda bile app.locals.mongodbConnected = true olarak ayarla
    app.locals.mongodbConnected = true;
    
    // 5 saniye sonra yeniden bağlanmayı dene
    setTimeout(() => {
      console.log('MongoDB bağlantısı yeniden deneniyor...');
      dbConnect();
    }, 5000);
  }
};

// MongoDB bağlantısını başlat
dbConnect();

// Kategori ve ürün routerlarını yükle
const categoryRoutes = require('./src/routes/categoryRoutes');
app.use('/api/categories', categoryRoutes);
app.use('/api/admin/categories', categoryRoutes); // Admin için kategori API

const productRoutes = require('./src/routes/productRoutes');
app.use('/api/products', productRoutes);
app.use('/api/admin/products', productRoutes); // Admin için ürün API

// Kullanıcı router modülünü yükle
const userRoutes = require('./src/routes/userRoutes');
app.use('/api/users', userRoutes);

// Sepet işlemleri için basit bir endpoint
app.post('/api/cart/add', (req, res) => {
  try {
    const { productId, quantity } = req.body;
    
    if (!productId) {
      return res.status(400).json({ message: 'Product ID gereklidir' });
    }
    
    // Bu bir client-side sepet olduğu için sadece başarılı yanıt dönüyoruz
    // Gerçek bir veritabanı kaydı yapılmıyor
    res.status(200).json({ success: true, message: 'Ürün sepete eklendi' });
  } catch (error) {
    console.error('Sepete ekleme hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
});

// Customer şeması
const CustomerSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true },
    phone: { type: String, trim: true },
    address: { type: String, trim: true }
}, { timestamps: true });

// Modelleri içe aktaralım
const Customer = mongoose.model('Customer', CustomerSchema);

// User Model - halihazırda src/models/userModel.js içinde tanımlanmış
const User = require('./src/models/userModel');

// JWT Token oluşturma
const generateToken = (id) => {
    if (!process.env.JWT_SECRET) {
        console.warn('JWT_SECRET environment variable is not set. Using default secret key.');
    }
    
    const jwtSecret = process.env.JWT_SECRET || 'pcmarketx_jwt_secret_key_2024';
    
    try {
        return jwt.sign(
            { id },
            jwtSecret,
            { expiresIn: '30d' }
        );
    } catch (error) {
        console.error('JWT token oluşturma hatası:', error);
        throw new Error('Token oluşturulamadı');
    }
};

// API Endpointleri
// Kullanıcı işlemleri
app.post('/api/users/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Tüm alanların doldurulduğunu kontrol et
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Lütfen tüm alanları doldurun' });
    }

    // Şifre kontrolü
    if (password.length < 6) {
      return res.status(400).json({ message: 'Şifre en az 6 karakter olmalıdır' });
    }

    // Kullanıcının zaten var olup olmadığını kontrol et
    const userExists = await User.findOne({ $or: [{ email }, { username }] });

    if (userExists) {
      return res.status(400).json({ message: 'Bu kullanıcı adı veya e-posta adresi zaten kullanılıyor' });
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
        role: user.role,
        token: generateToken(user._id)
      });
    } else {
      res.status(400).json({ message: 'Geçersiz kullanıcı bilgileri' });
    }
  } catch (error) {
    console.error('Kullanıcı kaydı yapılırken hata oluştu:', error);
    res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
});

app.post('/api/users/login', async (req, res) => {
  try {
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
      res.status(401).json({ message: 'Geçersiz e-posta veya şifre' });
    }
  } catch (error) {
    console.error('Kullanıcı girişi yapılırken hata oluştu:', error);
    res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
});

// Kategori route'ları categoryRoutes.js içinde tanımlandı

// Kategoriye göre ürünleri getir
app.get('/api/products/by-category/:slug', async (req, res) => {
    try {
        // Önce kategoriyi bul
        const category = await Category.findOne({ slug: req.params.slug });
        if (!category) {
            return res.status(404).json({ message: 'Kategori bulunamadı' });
        }
        
        // Sayfalama için parametreleri al
        const pageSize = 12;
        const page = Number(req.query.page) || 1;
        
        // Filtre parametrelerini al
        const filters = {};
        filters.category = category._id;
        
        // Alt kategorileri kontrol et
        if (req.query.subcategories) {
            const subcategories = req.query.subcategories.split(',');
            if (subcategories.length > 0) {
                const subcategoryCategories = await Category.find({ slug: { $in: subcategories } });
                filters.category = { $in: subcategoryCategories.map(cat => cat._id) };
            }
        }
        
        // Marka filtresi
        if (req.query.brands) {
            filters.brand = { $in: req.query.brands.split(',') };
        }
        
        // Fiyat filtresi
        if (req.query.priceMin || req.query.priceMax) {
            filters.price = {};
            if (req.query.priceMin) filters.price.$gte = Number(req.query.priceMin);
            if (req.query.priceMax) filters.price.$lte = Number(req.query.priceMax);
        }
        
        // Sıralama parametresini al
        let sort = { createdAt: -1 }; // Varsayılan: En yeni eklenenler
        if (req.query.sort) {
            switch (req.query.sort) {
                case 'price-asc':
                    sort = { price: 1 };
                    break;
                case 'price-desc':
                    sort = { price: -1 };
                    break;
                case 'popular':
                    sort = { sales: -1 };
                    break;
                case 'newest':
                    sort = { createdAt: -1 };
                    break;
            }
        }
        
        // Toplam ürün sayısını bul
        const count = await Product.countDocuments(filters);
        
        // Ürünleri getir
        const products = await Product.find(filters)
            .sort(sort)
            .limit(pageSize)
            .skip(pageSize * (page - 1));
        
        res.json({
            products,
            page,
            pages: Math.ceil(count / pageSize),
            total: count
        });
    } catch (error) {
        console.error('Kategoriye göre ürünler getirilirken hata:', error);
        res.status(500).json({ message: 'Ürünler yüklenirken bir hata oluştu', error: error.message });
    }
});

app.post('/api/categories', uploadMiddleware, async (req, res) => {
    try {
        const { name, slug, description } = req.body;
        const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;
        
        const category = new Category({
            name,
            slug,
            description,
            imageUrl
        });
        
        await category.save();
        res.status(201).json(category);
    } catch (error) {
        console.error('Kategori eklenemedi:', error);
        res.status(400).json({ message: 'Kategori eklenirken bir hata oluştu' });
    }
});

app.put('/api/categories/:id', uploadMiddleware, async (req, res) => {
    try {
        const { name, slug, description } = req.body;
        const update = { name, slug, description };
        
        if (req.file) {
            update.imageUrl = `/uploads/${req.file.filename}`;
        }
        
        const category = await Category.findByIdAndUpdate(
            req.params.id,
            update,
            { new: true }
        );
        
        if (!category) {
            return res.status(404).json({ message: 'Kategori bulunamadı' });
        }
        
        res.json(category);
    } catch (error) {
        console.error('Kategori güncellenemedi:', error);
        res.status(400).json({ message: 'Kategori güncellenirken bir hata oluştu' });
    }
});

app.delete('/api/categories/:id', async (req, res) => {
    try {
        const category = await Category.findByIdAndDelete(req.params.id);
        if (!category) {
            return res.status(404).json({ message: 'Kategori bulunamadı' });
        }
        
        // Bu kategorideki ürünleri de silebilirsiniz veya başka bir kategoriye taşıyabilirsiniz
        
        res.json({ message: 'Kategori başarıyla silindi' });
    } catch (error) {
        console.error('Kategori silinemedi:', error);
        res.status(500).json({ message: 'Kategori silinirken bir hata oluştu' });
    }
});

// Ürünler
app.get('/api/products', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        
        let query = {};
        
        // Filtreler
        if (req.query.category) {
            // Kategori ID'sini kullanarak filtreleme
            query.category = req.query.category;
        }
        
        if (req.query.status) {
            query.status = req.query.status.toUpperCase();
        }
        
        if (req.query.search) {
            query.name = { $regex: req.query.search, $options: 'i' };
        }
        
        // Fiyat filtresi
        if (req.query.priceMin || req.query.priceMax) {
            query.price = {};
            if (req.query.priceMin) {
                query.price.$gte = parseInt(req.query.priceMin);
            }
            if (req.query.priceMax) {
                query.price.$lte = parseInt(req.query.priceMax);
            }
        }
        
        // Sıralama
        let sort = {};
        if (req.query.sort) {
            const [field, direction] = req.query.sort.split(':');
            sort[field] = direction === 'desc' ? -1 : 1;
        } else {
            sort = { createdAt: -1 };
        }
        
        const products = await Product.find(query)
            .populate('category')
            .sort(sort)
            .skip(skip)
            .limit(limit);
        
        const total = await Product.countDocuments(query);
        const totalPages = Math.ceil(total / limit);
        
        res.json({
            products,
            currentPage: page,
            totalPages,
            totalProducts: total
        });
    } catch (error) {
        console.error('Ürün listesi alınamadı:', error);
        res.status(500).json({ message: 'Ürünler yüklenirken bir hata oluştu' });
    }
});

app.post('/api/products', uploadMiddleware, async (req, res) => {
    try {
        console.log('Ürün ekleme isteği alındı');
        console.log('Form verisi:', req.body);
        console.log('Dosya:', req.file);
        
        const { 
            name, 
            price, 
            description, 
            stock, 
            category, 
            status,
            brand,
            model,
            featured,
            isNewProduct,
            isActive,
            discount,
            specifications
         } = req.body;
        
        // Temel alan doğrulama
        if (!name || name.trim() === '') {
            return res.status(400).json({ message: 'Ürün adı gereklidir' });
        }
        
        if (!price || isNaN(parseFloat(price)) || parseFloat(price) < 0) {
            return res.status(400).json({ message: 'Geçerli bir fiyat girilmelidir' });
        }
        
        if (!category || category.trim() === '') {
            return res.status(400).json({ message: 'Kategori seçilmelidir' });
        }
        
        // Resim dosyası kontrolü ve yolunun belirlenmesi
        let imageUrl = null;
        let images = [];
        
        if (req.file) {
            // Yüklenen dosya yolu: /uploads/{filename}
            imageUrl = `/uploads/${req.file.filename}`;
            images.push(imageUrl);
            console.log('Resim yüklendi:', imageUrl);
        }
        
        // Boolean alanları dönüştür
        const isFeatured = featured === 'true' || featured === true;
        const isNew = isNewProduct === 'true' || isNewProduct === true;
        const isActiveProduct = isActive === 'true' || isActive === true;
        
        const product = new Product({
            name,
            price: parseFloat(price),
            description: description || '',
            stock: stock ? parseInt(stock) : 0,
            category,
            brand: brand || '',
            model: model || '',
            status: status ? status.toUpperCase() : 'ACTIVE',
            discount: discount ? parseFloat(discount) : 0,
            image: imageUrl,  // Ana resim alanı
            imageUrl: imageUrl, // Uyumluluk için
            images: images,    // Resim dizisi
            featured: isFeatured,
            isNewProduct: isNew,
            isActive: isActiveProduct
        });
        
        // Özellikler varsa ekle
        if (specifications) {
            try {
                if (typeof specifications === 'string') {
                    product.specifications = JSON.parse(specifications);
                } else {
                    product.specifications = specifications;
                }
            } catch (e) {
                console.error('Özellikler JSON formatına dönüştürülemedi:', e);
            }
        }
        
        console.log('Kaydedilmeye çalışılan ürün:', product);
        const savedProduct = await product.save();
        console.log('Ürün başarıyla kaydedildi:', savedProduct._id);
        res.status(201).json(savedProduct);
    } catch (error) {
        console.error('Ürün eklenemedi:', error);
        res.status(500).json({ message: 'Ürün eklenirken bir hata oluştu: ' + error.message, error: error.stack });
    }
});

app.get('/api/products/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).populate('category');
        if (!product) {
            return res.status(404).json({ message: 'Ürün bulunamadı' });
        }
        res.json(product);
    } catch (error) {
        console.error('Ürün bulunamadı:', error);
        res.status(500).json({ message: 'Ürün yüklenirken bir hata oluştu' });
    }
});

// Ürün güncelleme endpoint'i
app.put('/api/products/:id', uploadMiddleware, async (req, res) => {
    try {
        console.log('Ürün güncelleme isteği alındı:', req.params.id);
        console.log('Form verisi:', req.body);
        console.log('Dosya:', req.file);
        
        const productId = req.params.id;
        const updateData = { ...req.body };

        // Ürünün mevcut olup olmadığını kontrol et
        const existingProduct = await Product.findById(productId);
        if (!existingProduct) {
            return res.status(404).json({ message: 'Ürün bulunamadı' });
        }

        // Eğer yeni bir resim yüklendiyse
        if (req.file) {
            // Dosya yolunu ve URL'i düzenle
            const imageUrl = `/uploads/${req.file.filename}`;
            updateData.image = imageUrl;
            updateData.imageUrl = imageUrl;
            
            // Yeni resmi images dizisine ekle (varsa)
            if (!updateData.images) {
                updateData.images = existingProduct.images || [];
            }
            
            // Eski resim varsa images dizisinden çıkar
            if (existingProduct.image) {
                updateData.images = updateData.images.filter(img => img !== existingProduct.image);
            }
            
            // Yeni resmi ekle
            updateData.images.unshift(imageUrl);
            
            console.log('Yeni resim ekleniyor:', imageUrl);
            console.log('Güncellenmiş resim listesi:', updateData.images);
            
            // Eski resmi silme işlemini try-catch içinde yap
            try {
                if (existingProduct.image) {
                    const oldImagePath = path.join(__dirname, 'public', existingProduct.image);
                    if (fs.existsSync(oldImagePath)) {
                        fs.unlinkSync(oldImagePath);
                        console.log('Eski resim silindi:', existingProduct.image);
                    }
                }
            } catch (fileError) {
                console.error('Eski resim silinirken hata oluştu:', fileError);
                // Hata olsa bile işleme devam et
            }
        }

        // Boolean alanları dönüştür
        if ('featured' in updateData) {
            updateData.featured = updateData.featured === 'true' || updateData.featured === true;
        }
        if ('isNewProduct' in updateData) {
            updateData.isNewProduct = updateData.isNewProduct === 'true' || updateData.isNewProduct === true;
        }
        if ('isActive' in updateData) {
            updateData.isActive = updateData.isActive === 'true' || updateData.isActive === true;
        }
        
        // Sayısal değerleri dönüştür
        if (updateData.price) {
            updateData.price = parseFloat(updateData.price);
        }
        if (updateData.stock) {
            updateData.stock = parseInt(updateData.stock);
        }
        if (updateData.discount) {
            updateData.discount = parseFloat(updateData.discount);
        }

        console.log('Güncellenecek veriler:', updateData);

        // Ürünü güncelle
        const updatedProduct = await Product.findByIdAndUpdate(
            productId,
            updateData,
            { new: true, runValidators: true }
        );

        console.log('Ürün başarıyla güncellendi:', updatedProduct._id);
        res.json(updatedProduct);
    } catch (error) {
        console.error('Ürün güncelleme hatası:', error);
        res.status(500).json({ 
            message: 'Ürün güncellenirken bir hata oluştu',
            error: error.message 
        });
    }
});

app.delete('/api/products/:id', async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Ürün bulunamadı' });
        }
        
        res.json({ message: 'Ürün başarıyla silindi' });
    } catch (error) {
        console.error('Ürün silinemedi:', error);
        res.status(500).json({ message: 'Ürün silinirken bir hata oluştu' });
    }
});

// Toplu ürün silme
app.post('/api/products/bulk-delete', async (req, res) => {
    try {
        const { ids } = req.body;
        
        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ message: 'Silinecek ürün ID\'leri gerekli' });
        }
        
        const result = await Product.deleteMany({ _id: { $in: ids } });
        
        res.json({ 
            message: `${result.deletedCount} ürün başarıyla silindi`,
            deletedCount: result.deletedCount
        });
    } catch (error) {
        console.error('Toplu ürün silme başarısız:', error);
        res.status(500).json({ message: 'Ürünler silinirken bir hata oluştu' });
    }
});

// Toplu ürün güncelleme
app.post('/api/products/bulk-update', async (req, res) => {
    try {
        const { ids, update } = req.body;
        
        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ message: 'Güncellenecek ürün ID\'leri gerekli' });
        }
        
        if (!update || Object.keys(update).length === 0) {
            return res.status(400).json({ message: 'Güncelleme bilgisi gerekli' });
        }
        
        // Sadece izin verilen alanların güncellenmesini sağlama
        const allowedUpdates = {};
        if (update.status) allowedUpdates.status = update.status.toUpperCase();
        if (update.price !== undefined) allowedUpdates.price = update.price;
        if (update.stock !== undefined) allowedUpdates.stock = update.stock;
        
        const result = await Product.updateMany(
            { _id: { $in: ids } },
            { $set: allowedUpdates }
        );
        
        res.json({ 
            message: `${result.modifiedCount} ürün başarıyla güncellendi`,
            modifiedCount: result.modifiedCount
        });
    } catch (error) {
        console.error('Toplu ürün güncelleme başarısız:', error);
        res.status(500).json({ message: 'Ürünler güncellenirken bir hata oluştu' });
    }
});

// Müşteriler
app.get('/api/customers', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        
        let query = {};
        
        // Arama
        if (req.query.search) {
            query.$or = [
                { name: { $regex: req.query.search, $options: 'i' } },
                { email: { $regex: req.query.search, $options: 'i' } },
                { phone: { $regex: req.query.search, $options: 'i' } }
            ];
        }
        
        // Sıralama
        let sort = {};
        if (req.query.sort) {
            const [field, direction] = req.query.sort.split(':');
            sort[field] = direction === 'desc' ? -1 : 1;
        } else {
            sort = { createdAt: -1 };
        }
        
        const customers = await Customer.find(query)
            .sort(sort)
            .skip(skip)
            .limit(limit);
        
        const total = await Customer.countDocuments(query);
        const totalPages = Math.ceil(total / limit);
        
        res.json({
            customers,
            currentPage: page,
            totalPages,
            totalCustomers: total
        });
    } catch (error) {
        console.error('Müşteri listesi alınamadı:', error);
        res.status(500).json({ message: 'Müşteriler yüklenirken bir hata oluştu' });
    }
});

app.post('/api/customers', async (req, res) => {
    try {
        const { name, email, phone, address } = req.body;
        
        // Email kontrolü
        const existingCustomer = await Customer.findOne({ email });
        if (existingCustomer) {
            return res.status(400).json({ message: 'Bu email adresi ile kayıtlı bir müşteri zaten var' });
        }
        
        const customer = new Customer({
            name,
            email,
            phone,
            address
        });
        
        await customer.save();
        res.status(201).json(customer);
    } catch (error) {
        console.error('Müşteri eklenemedi:', error);
        res.status(400).json({ message: 'Müşteri eklenirken bir hata oluştu' });
    }
});

app.get('/api/customers/:id', async (req, res) => {
    try {
        const customer = await Customer.findById(req.params.id);
        if (!customer) {
            return res.status(404).json({ message: 'Müşteri bulunamadı' });
        }
        
        // Müşterinin siparişlerini de getir
        const orders = await Order.find({ customer: req.params.id })
            .sort({ createdAt: -1 })
            .limit(10);
        
        res.json({
            customer,
            orders
        });
    } catch (error) {
        console.error('Müşteri bulunamadı:', error);
        res.status(500).json({ message: 'Müşteri yüklenirken bir hata oluştu' });
    }
});

app.put('/api/customers/:id', async (req, res) => {
    try {
        const { name, phone, address } = req.body;
        
        const customer = await Customer.findByIdAndUpdate(
            req.params.id,
            { name, phone, address },
            { new: true }
        );
        
        if (!customer) {
            return res.status(404).json({ message: 'Müşteri bulunamadı' });
        }
        
        res.json(customer);
    } catch (error) {
        console.error('Müşteri güncellenemedi:', error);
        res.status(400).json({ message: 'Müşteri güncellenirken bir hata oluştu' });
    }
});

// İstatistikler
app.get('/api/stats', async (req, res) => {
    try {
        // Sipariş istatistikleri
        const totalOrders = await Order.countDocuments();
        const lastMonthOrders = await Order.countDocuments({
            createdAt: { $gte: new Date(new Date().setMonth(new Date().getMonth() - 1)) }
        });
        const prevMonthOrders = await Order.countDocuments({
            createdAt: {
                $gte: new Date(new Date().setMonth(new Date().getMonth() - 2)),
                $lt: new Date(new Date().setMonth(new Date().getMonth() - 1))
            }
        });
        
        // Ciro istatistikleri
        const allOrders = await Order.find();
        const totalRevenue = allOrders.reduce((sum, order) => sum + order.total, 0);
        
        const lastMonthOrders_revenue = await Order.find({
            createdAt: { $gte: new Date(new Date().setMonth(new Date().getMonth() - 1)) }
        });
        const lastMonthRevenue = lastMonthOrders_revenue.reduce((sum, order) => sum + order.total, 0);
        
        const prevMonthOrders_revenue = await Order.find({
            createdAt: {
                $gte: new Date(new Date().setMonth(new Date().getMonth() - 2)),
                $lt: new Date(new Date().setMonth(new Date().getMonth() - 1))
            }
        });
        const prevMonthRevenue = prevMonthOrders_revenue.reduce((sum, order) => sum + order.total, 0);
        
        // Müşteri istatistikleri
        const totalCustomers = await Customer.countDocuments();
        const lastMonthCustomers = await Customer.countDocuments({
            createdAt: { $gte: new Date(new Date().setMonth(new Date().getMonth() - 1)) }
        });
        const prevMonthCustomers = await Customer.countDocuments({
            createdAt: {
                $gte: new Date(new Date().setMonth(new Date().getMonth() - 2)),
                $lt: new Date(new Date().setMonth(new Date().getMonth() - 1))
            }
        });
        
        // Ürün istatistikleri
        const totalProducts = await Product.countDocuments();
        const lastMonthProducts = await Product.countDocuments({
            createdAt: { $gte: new Date(new Date().setMonth(new Date().getMonth() - 1)) }
        });
        const prevMonthProducts = await Product.countDocuments({
            createdAt: {
                $gte: new Date(new Date().setMonth(new Date().getMonth() - 2)),
                $lt: new Date(new Date().setMonth(new Date().getMonth() - 1))
            }
        });
        
        // Trend yüzdeleri hesaplama (önceki aya göre değişim)
        const ordersTrend = prevMonthOrders === 0 ? 100 : ((lastMonthOrders - prevMonthOrders) / prevMonthOrders) * 100;
        const revenueTrend = prevMonthRevenue === 0 ? 100 : ((lastMonthRevenue - prevMonthRevenue) / prevMonthRevenue) * 100;
        const customersTrend = prevMonthCustomers === 0 ? 100 : ((lastMonthCustomers - prevMonthCustomers) / prevMonthCustomers) * 100;
        const productsTrend = prevMonthProducts === 0 ? 100 : ((lastMonthProducts - prevMonthProducts) / prevMonthProducts) * 100;
        
        res.json({
            orders: {
                total: totalOrders,
                lastMonth: lastMonthOrders,
                prevMonth: prevMonthOrders,
                trend: Math.round(ordersTrend)
            },
            revenue: {
                total: totalRevenue,
                lastMonth: lastMonthRevenue,
                prevMonth: prevMonthRevenue,
                trend: Math.round(revenueTrend)
            },
            customers: {
                total: totalCustomers,
                lastMonth: lastMonthCustomers,
                prevMonth: prevMonthCustomers,
                trend: Math.round(customersTrend)
            },
            products: {
                total: totalProducts,
                lastMonth: lastMonthProducts,
                prevMonth: prevMonthProducts,
                trend: Math.round(productsTrend)
            }
        });
    } catch (error) {
        console.error('İstatistikler alınamadı:', error);
        res.status(500).json({ message: 'İstatistikler yüklenirken bir hata oluştu' });
    }
});

// Admin login API
app.post('/api/admin/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Giriş bilgilerini kontrol et
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'E-posta ve şifre gereklidir'
            });
        }

        // E-posta ile kullanıcıyı bul
        const user = await User.findOne({ email });

        // Kullanıcı yoksa veya admin değilse
        if (!user) {
            return res.status(401).json({ 
                success: false,
                message: 'Geçersiz e-posta veya şifre' 
            });
        }

        // Admin yetkisi kontrolü
        if (user.role !== 'admin') {
            return res.status(403).json({ 
                success: false,
                message: 'Admin yetkisi bulunmamaktadır' 
            });
        }

        // Şifre kontrolü
        const isPasswordMatch = await user.matchPassword(password);
        if (!isPasswordMatch) {
            return res.status(401).json({ 
                success: false,
                message: 'Geçersiz e-posta veya şifre' 
            });
        }

        // Token oluştur
        const token = generateToken(user._id);
        
        res.json({
            success: true,
            message: 'Giriş başarılı',
            _id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            token: token
        });
    } catch (error) {
        console.error('Admin girişi yapılırken hata oluştu:', error);
        res.status(500).json({ 
            success: false,
            message: 'Sunucu hatası', 
            error: error.message 
        });
    }
});

// Arama sayfası için yönlendirme
app.get('/search', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'html', 'search.html'));
});

// Admin panel login sayfası
app.get('/admin/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin', 'login.html'));
});

// MongoDB bağlantı bilgisini HTML middleware ile paylaş
app.use((req, res, next) => {
  // Admin paneli sayfalarına MongoDB bağlantı durumunu aktarma
  if (req.path.startsWith('/admin')) {
    res.locals.mongodbConnected = mongoose.connection.readyState === 1;
  }
  next();
});

// Admin paneli HTML sayfaları için özel middleware
app.get('/admin*', (req, res, next) => {
  // HTML dosyası isteği kontrol et
  if (req.path.endsWith('.html') || req.path === '/admin' || req.path === '/admin/') {
    // MongoDB bağlantı bilgisini sayfaya ekle
    res.locals.mongodbConnected = mongoose.connection.readyState === 1;
  }
  next();
});

// Kullanıcının test siparişlerini görüntülemesi için basit endpoint
app.get('/api/test/orders', (req, res) => {
  // Test verileri döndür
  const testOrders = [
    {
      _id: "607f1f77bcf86cd799439011",
      orderNumber: "ORD-0001",
      user: "67d5999598eb1180fadc8bf3",
      orderItems: [
        {
          name: "AMD Ryzen 7 5800X İşlemci",
          qty: 1,
          image: "/uploads/product-1620158745123.jpg",
          price: 4999.90,
          product: "607f1f77bcf86cd799439012"
        }
      ],
      shippingAddress: {
        address: "Örnek Mahallesi Örnek Sokak No:123",
        city: "İstanbul",
        postalCode: "34000",
        country: "Türkiye"
      },
      paymentMethod: "Kredi Kartı",
      taxPrice: 899.98,
      shippingPrice: 0,
      totalPrice: 5899.88,
      isPaid: true,
      paidAt: new Date(),
      isDelivered: false,
      status: "PENDING",
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];
  
  res.json({ orders: testOrders });
});

// Kullanıcının kendi siparişlerini görüntülemesi için endpoint
app.get('/api/user/orders', async (req, res) => {
  try {
    // Token'dan kullanıcı ID'sini al
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Yetkilendirme hatası: Token bulunamadı' });
    }
    
    try {
      // Token'ı doğrula ve kullanıcı ID'sini al
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'pcmarketx_jwt_secret_key_2024');
      const userId = decoded.id;
      
      console.log('Kullanıcı ID:', userId);
      
      // Kullanıcıyı bul
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
      }
      
      console.log('Kullanıcı bulundu:', user.username);
      
      // Order modelinde user alanını kullanarak kullanıcının siparişlerini bul
      const orders = await Order.find({ user: userId })
        .sort({ createdAt: -1 });
      
      console.log('Bulunan siparişler:', orders.length);
      
      res.json({ orders });
    } catch (error) {
      console.error('Token doğrulama hatası:', error);
      return res.status(401).json({ message: 'Geçersiz token' });
    }
  } catch (error) {
    console.error('Kullanıcı siparişleri alınamadı:', error);
    res.status(500).json({ message: 'Siparişler yüklenirken bir hata oluştu' });
  }
});

// Sipariş detaylarını getirme endpoint'i
app.get('/api/orders/:id', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Yetkilendirme hatası: Token bulunamadı' });
    }
    
    try {
      // Token'ı doğrula ve kullanıcı ID'sini al
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'pcmarketx_jwt_secret_key_2024');
      const userId = decoded.id;
      
      // Sipariş ID'sini al
      const orderId = req.params.id;
      console.log('İstenen sipariş ID:', orderId);
      
      // Siparişi bul
      const order = await Order.findById(orderId);
      
      if (!order) {
        return res.status(404).json({ message: 'Sipariş bulunamadı' });
      }
      
      // Sipariş kullanıcıya ait mi kontrol et
      if (order.user.toString() !== userId) {
        return res.status(403).json({ message: 'Bu siparişi görüntüleme yetkiniz yok' });
      }
      
      console.log('Sipariş detayları bulundu:', order._id);
      res.json(order);
    } catch (error) {
      console.error('Token doğrulama veya sipariş detayı hatası:', error);
      return res.status(401).json({ message: 'Geçersiz token veya sipariş' });
    }
  } catch (error) {
    console.error('Sipariş detayları alınamadı:', error);
    res.status(500).json({ message: 'Sipariş detayları yüklenirken bir hata oluştu' });
  }
});

// Sunucuyu başlat
app.listen(PORT, () => {
    console.log(`Sunucu http://localhost:${PORT} adresinde çalışıyor`);
});

// Admin API rotalarını ekle
app.get('/api/admin/stats', async (req, res) => {
  try {
    if (!app.locals.mongodbConnected) {
      return res.status(500).json({ message: 'Veritabanı bağlantısı kurulamadı' });
    }
    
    // İstatistikleri topla
    const productsCount = await Product.countDocuments();
    const categoriesCount = await Category.find().countDocuments();
    const lowStockProducts = await Product.countDocuments({ stock: { $lt: 10 } });
    
    // Sipariş istatistikleri
    const totalOrders = await Order.countDocuments();
    const completedOrders = await Order.countDocuments({ status: 'COMPLETED' });
    const pendingOrders = await Order.countDocuments({ status: 'PENDING' });
    
    // Ciro hesaplama
    const allOrders = await Order.find();
    const totalSales = allOrders.reduce((sum, order) => sum + order.total, 0);
    
    // Son siparişleri getir
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('customer', 'name');
    
    // Son siparişleri uygun formata dönüştür
    const formattedRecentOrders = recentOrders.map(order => ({
      id: order._id,
      orderNumber: order.orderNumber,
      date: order.createdAt,
      customer: order.customer ? order.customer.name : 'Bilinmeyen Müşteri',
      total: order.total,
      status: order.status
    }));
    
    // En çok satan ürünleri bul (şimdilik rastgele 5 ürün)
    const popularProducts = await Product.find()
      .sort({ createdAt: -1 })
      .limit(5);
    
    // Popüler ürünleri uygun formata dönüştür
    const formattedPopularProducts = popularProducts.map((product, index) => ({
      id: product._id,
      name: product.name,
      category: product.category ? product.category.toString() : 'Genel',
      price: product.price,
      sales: Math.floor(Math.random() * 50) + 10, // Demo için rastgele satış
      stock: product.stock
    }));
    
    // Müşteri sayısı
    const User = require('./src/models/User');
    const totalCustomers = await User.countDocuments({ role: 'user' });
    
    res.json({
      products: productsCount,
      categories: categoriesCount,
      lowStock: lowStockProducts,
      recentOrders: formattedRecentOrders,
      popularProducts: formattedPopularProducts,
      totalOrders: totalOrders,
      pendingOrders: pendingOrders,
      completedOrders: completedOrders,
      totalSales: totalSales,
      totalCustomers: totalCustomers,
      totalProducts: productsCount
    });
  } catch (error) {
    console.error('İstatistikler alınırken hata:', error);
    res.status(500).json({ message: 'İstatistikler alınırken hata oluştu' });
  }
});

// Admin kategorileri getir
app.get('/api/admin/categories', async (req, res) => {
  try {
    if (!app.locals.mongodbConnected) {
      return res.status(500).json({ message: 'Veritabanı bağlantısı kurulamadı' });
    }
    
    const categories = await Category.find().sort({ createdAt: -1 });
    res.json({ data: categories });
  } catch (error) {
    console.error('Kategoriler alınırken hata:', error);
    res.status(500).json({ message: 'Kategoriler alınırken hata oluştu' });
  }
});

// Admin ürünleri getir (sayfalama ile)
app.get('/api/admin/products', async (req, res) => {
  try {
    if (!app.locals.mongodbConnected) {
      return res.status(500).json({ message: 'Veritabanı bağlantısı kurulamadı' });
    }
    
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;
    
    // Filtre seçenekleri
    const filter = {};
    if (req.query.category) {
      filter.category = req.query.category;
    }
    if (req.query.search) {
      filter.name = { $regex: req.query.search, $options: 'i' };
    }
    if (req.query.status) {
      filter.status = req.query.status;
    }
    
    // Ürünleri getir
    const products = await Product.find(filter)
      .populate('category')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    // Toplam ürün sayısı
    const total = await Product.countDocuments(filter);
    
    res.json({
      data: products,
      page,
      totalPages: Math.ceil(total / limit),
      totalItems: total
    });
  } catch (error) {
    console.error('Ürünler alınırken hata:', error);
    res.status(500).json({ message: 'Ürünler alınırken hata oluştu' });
  }
});

// Admin Siparişler API endpoint'leri
app.get('/api/admin/orders', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Filtre parametrelerini hazırla
    let query = {};
    
    // Duruma göre filtrele
    if (req.query.status) {
      query.status = req.query.status.toUpperCase();
    }
    
    // Arama filtresi
    if (req.query.search) {
      query.$or = [
        { orderNumber: { $regex: req.query.search, $options: 'i' } },
        { 'customer.name': { $regex: req.query.search, $options: 'i' } },
        { 'customer.email': { $regex: req.query.search, $options: 'i' } }
      ];
    }
    
    // Tarih aralığına göre filtrele
    if (req.query.dateFrom || req.query.dateTo) {
      query.createdAt = {};
      if (req.query.dateFrom) {
        query.createdAt.$gte = new Date(req.query.dateFrom);
      }
      if (req.query.dateTo) {
        query.createdAt.$lte = new Date(req.query.dateTo);
      }
    }
    
    console.log('Siparişler API sorgusu:', query);
    
    // Siparişleri getir
    const orders = await Order.find(query)
      .populate('user', 'username email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    // Toplam sipariş sayısını bul
    const total = await Order.countDocuments(query);
    
    console.log(`${orders.length} sipariş bulundu. Toplam: ${total}`);
    
    res.json({
      data: orders,
      page,
      totalPages: Math.ceil(total / limit),
      totalItems: total
    });
  } catch (error) {
    console.error('Siparişler listelenirken hata:', error);
    res.status(500).json({ message: 'Siparişler listelenirken bir hata oluştu' });
  }
});

// Admin Sipariş Detayı API endpoint'i
app.get('/api/admin/orders/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'username email')
      .populate('orderItems.product', 'name');
    
    if (!order) {
      return res.status(404).json({ message: 'Sipariş bulunamadı' });
    }
    
    res.json(order);
  } catch (error) {
    console.error('Sipariş detayı alınırken hata:', error);
    res.status(500).json({ message: 'Sipariş detayı alınırken bir hata oluştu' });
  }
});

// Admin Sipariş Durumu Güncelleme API endpoint'i
app.put('/api/admin/orders/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ message: 'Durum bilgisi gereklidir' });
    }
    
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Sipariş bulunamadı' });
    }
    
    // Durumu güncelle
    order.status = status.toUpperCase();
    
    // Eğer durum "TESLİM EDİLDİ" ise, isDelivered ve deliveredAt'i güncelle
    if (status.toUpperCase() === 'DELIVERED') {
      order.isDelivered = true;
      order.deliveredAt = Date.now();
    }
    
    // Güncellenmiş siparişi kaydet
    const updatedOrder = await order.save();
    
    res.json(updatedOrder);
  } catch (error) {
    console.error('Sipariş durumu güncellenirken hata:', error);
    res.status(500).json({ message: 'Sipariş durumu güncellenirken bir hata oluştu' });
  }
});

// 404 - Not Found
app.use((req, res, next) => {
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({ message: 'API endpoint bulunamadı' });
    }
    
    // Ana sayfa yönlendirmesi
    if (req.path === '/') {
        return res.sendFile(path.join(__dirname, 'public', 'html', 'index.html'));
    }
    
    // Frontend SPA için tüm istekleri html/index.html'e yönlendir
    if (!req.path.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg)$/)) {
        return res.sendFile(path.join(__dirname, 'public', 'html', 'index.html'));
    }
    
    next();
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Sunucu hatası:', err);
    res.status(500).json({ message: 'Sunucu hatası', error: err.message });
}); 