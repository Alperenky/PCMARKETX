const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
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

// Yükleme klasörünü hazırla
const prepareUploadDirectory = () => {
  const uploadDir = path.join(__dirname, '../../public/uploads');
  
  // Klasörün var olduğundan emin ol
  if (!fs.existsSync(uploadDir)) {
    try {
      fs.mkdirSync(uploadDir, { recursive: true });
      console.log(`Upload klasörü oluşturuldu: ${uploadDir}`);
    } catch (error) {
      console.error(`Upload klasörü oluşturulurken hata: ${error.message}`);
    }
  }
  
  // Klasör izinlerini kontrol et
  try {
    const stats = fs.statSync(uploadDir);
    console.log(`Upload klasörü izinleri: ${stats.mode.toString(8)}`);
    
    // İzinleri düzelt (yazma izni ekle)
    fs.chmodSync(uploadDir, 0o755);
  } catch (error) {
    console.error(`Upload klasörü izinleri kontrol edilirken hata: ${error.message}`);
  }
  
  return uploadDir;
};

// Yükleme klasörünü hazırla
const uploadDir = prepareUploadDirectory();

// Multer Storage ayarları
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Dosya adını benzersiz yap
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const filename = file.fieldname + '-' + uniqueSuffix + ext;
    
    console.log(`Dosya adı oluşturuldu: ${filename}`);
    cb(null, filename);
  }
});

// Multer dosya filtresi
const fileFilter = (req, file, cb) => {
  // Geçerli resim formatlarını kontrol et
  const allowedFileTypes = /jpeg|jpg|png|gif|webp/;
  const mimetype = allowedFileTypes.test(file.mimetype);
  const extname = allowedFileTypes.test(path.extname(file.originalname).toLowerCase());
  
  console.log(`Dosya yükleme kontrolü: ${file.originalname}, MIME: ${file.mimetype}, Geçerli MIME: ${mimetype}, Geçerli Uzantı: ${extname}`);
  
  if (mimetype && extname) {
    console.log(`Dosya kabul edildi: ${file.originalname}`);
    return cb(null, true);
  } else {
    console.log(`Dosya reddedildi: ${file.originalname} - Desteklenmeyen format`);
    cb(new Error('Sadece resim dosyaları yüklenebilir (JPEG, JPG, PNG, GIF, WEBP)!'));
  }
};

// Multer upload nesnesi
const uploadConfig = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: fileFilter
});

// Multer middleware
const uploadSingle = uploadConfig.single('image');

// Asıl upload middleware - Hata yakalama ile
const uploadMiddleware = (req, res, next) => {
  uploadSingle(req, res, function (err) {
    // Dosya yüklendiyse konsola bilgi yazdır
    if (req.file) {
      console.log(`Dosya başarıyla yüklendi: ${req.file.originalname} -> ${req.file.filename} (${req.file.size} bayt)`);
    } else {
      console.log('Dosya yüklenmedi - sadece metin verileri alındı');
    }
    
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

// @route   GET /api/products
router.route('/')
  .get(getProducts)
  .post(uploadMiddleware, createProduct);

// @route   GET /api/products/featured
router.get('/featured', getFeaturedProducts);

// @route   GET, PUT, DELETE /api/products/:id
router.route('/:id')
  .get(getProductById)
  .put(uploadMiddleware, updateProduct)
  .delete(deleteProduct);

// @route   POST /api/products/:id/reviews
router.route('/:id/reviews')
  .post(protect, createProductReview);

module.exports = router; 