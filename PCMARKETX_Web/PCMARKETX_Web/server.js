const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
require('dotenv').config();
const connectDB = require('./src/config/db');
const { notFound, errorHandler } = require('./src/middleware/errorMiddleware');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Express uygulamasını başlat
const app = express();

// Sunucu portu
const PORT = process.env.PORT || 5002;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Statik dosyaları sunma
app.use(express.static(path.join(__dirname, 'public')));

// HTML dosyalarına doğrudan erişim için özel yönlendirme
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'html', 'index.html'));
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
    
    // Kategori ID'sini kullanarak ürünleri bul
    const products = await Product.find({ category: category._id })
      .sort({ createdAt: -1 });
    
    res.json(products);
  } catch (error) {
    console.error('Kategoriye göre ürünler getirilirken hata oluştu:', error);
    res.status(500).json({ message: 'Ürünler yüklenirken bir hata oluştu', error: error.message });
  }
});

// Multer Storage ayarları (Resim yükleme)
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, 'public/uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Sadece resim dosyaları yüklenebilir!'), false);
        }
    }
});

// MongoDB Bağlantısı (MongoDB Atlas)
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://your-username:your-password@your-cluster.mongodb.net/pcmarketx?retryWrites=true&w=majority';

mongoose.connect(MONGODB_URI)
    .then(() => console.log('MongoDB Atlas\'a başarıyla bağlandı'))
    .catch(err => {
        console.error('MongoDB bağlantı hatası:', err);
        process.exit(1);
    });

// MongoDB Şemaları ve Modelleri
const CategorySchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    description: { type: String, trim: true },
    imageUrl: { type: String }
}, { timestamps: true });

const ProductSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true },
    description: { type: String, required: true, trim: true },
    brand: { type: String, trim: true },
    imageUrl: { type: String },
    stock: { type: Number, default: 0 },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    status: { type: String, enum: ['ACTIVE', 'INACTIVE', 'POPULAR'], default: 'ACTIVE' },
    features: [String],
    sales: { type: Number, default: 0 }
}, { timestamps: true });

const CustomerSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true },
    phone: { type: String, trim: true },
    address: { type: String, trim: true }
}, { timestamps: true });

const OrderSchema = new mongoose.Schema({
    orderNumber: { type: String, required: true, unique: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    items: [{
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true }
    }],
    total: { type: Number, required: true },
    status: { 
        type: String, 
        enum: ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'], 
        default: 'PENDING' 
    },
    shippingAddress: { type: String, required: true, trim: true },
    paymentMethod: { type: String, required: true, trim: true }
}, { timestamps: true });

const Category = mongoose.model('Category', CategorySchema);
const Product = mongoose.model('Product', ProductSchema);
const Customer = mongoose.model('Customer', CustomerSchema);
const Order = mongoose.model('Order', OrderSchema);

// User Model
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Kullanıcı adı zorunludur'],
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: [true, 'E-posta adresi zorunludur'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Geçerli bir e-posta adresi giriniz']
  },
  password: {
    type: String,
    required: [true, 'Şifre zorunludur'],
    minlength: [6, 'Şifre en az 6 karakter olmalıdır']
  },
  firstName: {
    type: String,
    trim: true
  },
  lastName: {
    type: String,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Şifreyi kaydetmeden önce hash'leme
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Şifre doğrulama metodu
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

// JWT Token oluşturma
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'gizli_anahtar', {
    expiresIn: '30d'
  });
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

// Kategoriler
app.get('/api/categories', async (req, res) => {
    try {
        const categories = await Category.find();
        res.json(categories);
    } catch (error) {
        console.error('Kategori listesi alınamadı:', error);
        res.status(500).json({ message: 'Kategoriler yüklenirken bir hata oluştu' });
    }
});

// Kategoriyi slug ile getir - DİKKAT: Bu endpoint ID endpoint'inden önce olmalı
app.get('/api/categories/slug/:slug', async (req, res) => {
    try {
        const category = await Category.findOne({ slug: req.params.slug });
        if (!category) {
            return res.status(404).json({ message: 'Kategori bulunamadı' });
        }
        res.json(category);
    } catch (error) {
        console.error('Kategori bulunamadı:', error);
        res.status(500).json({ message: 'Kategori yüklenirken bir hata oluştu' });
    }
});

// Kategoriyi ID ile getir
app.get('/api/categories/:id', async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ message: 'Kategori bulunamadı' });
        }
        res.json(category);
    } catch (error) {
        console.error('Kategori bulunamadı:', error);
        res.status(500).json({ message: 'Kategori yüklenirken bir hata oluştu' });
    }
});

app.post('/api/categories', upload.single('image'), async (req, res) => {
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

app.put('/api/categories/:id', upload.single('image'), async (req, res) => {
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

app.post('/api/products', upload.single('image'), async (req, res) => {
    try {
        const { name, price, description, stock, category, status } = req.body;
        const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;
        
        const product = new Product({
            name,
            price,
            description,
            stock,
            category,
            status: status ? status.toUpperCase() : 'ACTIVE',
            imageUrl
        });
        
        await product.save();
        res.status(201).json(product);
    } catch (error) {
        console.error('Ürün eklenemedi:', error);
        res.status(400).json({ message: 'Ürün eklenirken bir hata oluştu' });
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

app.put('/api/products/:id', upload.single('image'), async (req, res) => {
    try {
        const { name, price, description, stock, category, status } = req.body;
        const update = { 
            name, 
            price, 
            description, 
            stock, 
            category,
            status: status ? status.toUpperCase() : undefined
        };
        
        if (req.file) {
            update.imageUrl = `/uploads/${req.file.filename}`;
        }
        
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            update,
            { new: true }
        ).populate('category');
        
        if (!product) {
            return res.status(404).json({ message: 'Ürün bulunamadı' });
        }
        
        res.json(product);
    } catch (error) {
        console.error('Ürün güncellenemedi:', error);
        res.status(400).json({ message: 'Ürün güncellenirken bir hata oluştu' });
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

// Siparişler
app.get('/api/orders', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        
        let query = {};
        
        // Filtreler
        if (req.query.status) {
            query.status = req.query.status.toUpperCase();
        }
        
        if (req.query.customerId) {
            query.customer = req.query.customerId;
        }
        
        // Sıralama
        let sort = {};
        if (req.query.sort) {
            const [field, direction] = req.query.sort.split(':');
            sort[field] = direction === 'desc' ? -1 : 1;
        } else {
            sort = { createdAt: -1 };
        }
        
        const orders = await Order.find(query)
            .populate('customer')
            .populate('items.product')
            .sort(sort)
            .skip(skip)
            .limit(limit);
        
        const total = await Order.countDocuments(query);
        const totalPages = Math.ceil(total / limit);
        
        res.json({
            orders,
            currentPage: page,
            totalPages,
            totalOrders: total
        });
    } catch (error) {
        console.error('Sipariş listesi alınamadı:', error);
        res.status(500).json({ message: 'Siparişler yüklenirken bir hata oluştu' });
    }
});

app.get('/api/orders/:id', async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('customer')
            .populate('items.product');
            
        if (!order) {
            return res.status(404).json({ message: 'Sipariş bulunamadı' });
        }
        
        res.json(order);
    } catch (error) {
        console.error('Sipariş bulunamadı:', error);
        res.status(500).json({ message: 'Sipariş yüklenirken bir hata oluştu' });
    }
});

app.post('/api/orders', async (req, res) => {
    try {
        const { 
            customer, 
            items, 
            total, 
            shippingAddress, 
            paymentMethod, 
            status 
        } = req.body;
        
        // Sipariş numarası oluştur
        const orderCount = await Order.countDocuments();
        const orderNumber = `ORD-${(orderCount + 1).toString().padStart(4, '0')}`;
        
        const order = new Order({
            orderNumber,
            customer,
            items,
            total,
            shippingAddress,
            paymentMethod,
            status: status || 'PENDING'
        });
        
        await order.save();
        
        // Her satılan ürün için stok güncellemesi ve satış sayısı artırma
        for (const item of items) {
            await Product.findByIdAndUpdate(item.product, {
                $inc: { stock: -item.quantity, sales: item.quantity }
            });
        }
        
        res.status(201).json(order);
    } catch (error) {
        console.error('Sipariş oluşturulamadı:', error);
        res.status(400).json({ message: 'Sipariş oluşturulurken bir hata oluştu' });
    }
});

app.put('/api/orders/:id', async (req, res) => {
    try {
        const { status } = req.body;
        
        if (!status) {
            return res.status(400).json({ message: 'Güncellenecek durumu belirtmelisiniz' });
        }
        
        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { status: status.toUpperCase() },
            { new: true }
        )
        .populate('customer')
        .populate('items.product');
        
        if (!order) {
            return res.status(404).json({ message: 'Sipariş bulunamadı' });
        }
        
        res.json(order);
    } catch (error) {
        console.error('Sipariş güncellenemedi:', error);
        res.status(400).json({ message: 'Sipariş güncellenirken bir hata oluştu' });
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

// Sunucuyu başlat
app.listen(PORT, () => {
    console.log(`Sunucu http://localhost:${PORT} adresinde çalışıyor`);
}); 