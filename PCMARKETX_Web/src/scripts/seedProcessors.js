const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('../config/db');
const Product = require('../models/Product');
const Category = require('../models/Category');

// Çevre değişkenlerini yükle
dotenv.config();

// Veritabanına bağlan
const initializeDB = async () => {
  try {
    await connectDB();
    console.log('MongoDB bağlantısı başarılı!');
    
    // Önce var olan işlemcileri temizle
    await Product.deleteMany({ category: { $exists: true, $ne: null } });
    console.log('Mevcut ürünler silindi.');
    
    // Kategori yapısını oluştur
    // 1. Ana kategori: Bilgisayar Bileşenleri
    let computerPartsCategory = await Category.findOne({ slug: 'bilgisayar-bilesenleri' });
    
    if (!computerPartsCategory) {
      try {
        computerPartsCategory = await Category.create({
          name: 'Bilgisayar Bileşenleri',
          description: 'Bilgisayar sistemleri için tüm donanım bileşenleri',
          image: '/images/categories/bilgisayar-bilesenleri-banner.jpg',
          slug: 'bilgisayar-bilesenleri'
        });
        console.log('Bilgisayar Bileşenleri ana kategorisi oluşturuldu.');
      } catch (error) {
        if (error.code === 11000) {
          computerPartsCategory = await Category.findOne({ slug: 'bilgisayar-bilesenleri' });
          console.log('Mevcut Bilgisayar Bileşenleri kategorisi kullanılıyor.');
        } else {
          throw error;
        }
      }
    } else {
      console.log('Mevcut Bilgisayar Bileşenleri kategorisi kullanılıyor.');
    }
    
    // 2. Alt kategori: İşlemci (parent: Bilgisayar Bileşenleri)
    let processorCategory = await Category.findOne({ slug: 'islemci' });
    
    if (!processorCategory) {
      try {
        processorCategory = await Category.create({
          name: 'İşlemci',
          description: 'Bilgisayarınızın beyni olan işlemciler, yüksek performans ve verimlilik sunar.',
          image: '/images/categories/islemciler-banner.jpg',
          slug: 'islemci',
          parent: computerPartsCategory._id
        });
        console.log('İşlemci alt kategorisi oluşturuldu.');
      } catch (error) {
        if (error.code === 11000) {
          processorCategory = await Category.findOne({ name: 'İşlemci' });
          // Eğer parent yoksa güncelle
          if (processorCategory && !processorCategory.parent) {
            processorCategory.parent = computerPartsCategory._id;
            await processorCategory.save();
            console.log('Mevcut İşlemci kategorisi güncellendi ve ana kategoriye bağlandı.');
          } else {
            console.log('Mevcut İşlemci kategorisi kullanılıyor.');
          }
        } else {
          throw error;
        }
      }
    } else {
      // Eğer parent yoksa güncelle
      if (!processorCategory.parent) {
        processorCategory.parent = computerPartsCategory._id;
        await processorCategory.save();
        console.log('Mevcut İşlemci kategorisi güncellendi ve ana kategoriye bağlandı.');
      } else {
        console.log('Mevcut İşlemci kategorisi kullanılıyor.');
      }
    }
    
    // Kategori yolunu belirle (dizi formatında)
    const categoryPath = [
      {
        _id: computerPartsCategory._id,
        name: computerPartsCategory.name,
        slug: computerPartsCategory.slug
      },
      {
        _id: processorCategory._id,
        name: processorCategory.name,
        slug: processorCategory.slug
      }
    ];
    
    // Popüler işlemcileri ekle
    const processors = [
      {
        name: 'AMD Ryzen 9 7950X',
        description: 'AMD Ryzen 9 7950X, 16 çekirdek ve 32 iş parçacığı sunan yüksek performanslı masaüstü işlemci. AM5 soketini kullanan bu işlemci, 5.7 GHz\'e kadar boost hızı sağlar.',
        price: 12999.99,
        brand: 'AMD',
        stock: 35,
        category: processorCategory._id,
        categoryPath: categoryPath,
        images: ['/images/products/ryzen-9-7950x.jpg'],
        specifications: {
          'İşlemci Serisi': 'Ryzen 9',
          'Çekirdek Sayısı': '16',
          'İş Parçacığı': '32',
          'Temel Frekans': '4.5 GHz',
          'Max Turbo Frekans': '5.7 GHz',
          'Önbellek': '64 MB L3',
          'TDP': '170W',
          'Soket': 'AM5'
        },
        isNewProduct: true,
        isPopular: true,
        isActive: true,
        featured: true
      },
      {
        name: 'Intel Core i9-13900K',
        description: 'Intel Core i9-13900K, 24 çekirdek (8P+16E) ve 32 iş parçacığı ile olağanüstü performans sunan 13. nesil masaüstü işlemci. 5.8 GHz\'e kadar boost hızı sağlar.',
        price: 13499.99,
        brand: 'Intel',
        stock: 28,
        category: processorCategory._id,
        categoryPath: categoryPath,
        images: ['/images/products/intel-i9-13900k.jpg'],
        specifications: {
          'İşlemci Serisi': 'Core i9',
          'Çekirdek Sayısı': '24 (8P+16E)',
          'İş Parçacığı': '32',
          'Temel Frekans': '3.0 GHz',
          'Max Turbo Frekans': '5.8 GHz',
          'Önbellek': '36 MB L3',
          'TDP': '125W',
          'Soket': 'LGA 1700'
        },
        isNewProduct: true,
        isPopular: true,
        isActive: true,
        featured: true
      },
      {
        name: 'AMD Ryzen 7 7800X3D',
        description: 'AMD Ryzen 7 7800X3D, 3D V-Cache teknolojisi ile oyunlarda en yüksek performansı sunan 8 çekirdekli, 16 iş parçacıklı işlemci. Oyuncular için optimum tercih.',
        price: 9999.99,
        brand: 'AMD',
        stock: 40,
        category: processorCategory._id,
        categoryPath: categoryPath,
        images: ['/images/products/ryzen-7-7800x3d.jpg'],
        specifications: {
          'İşlemci Serisi': 'Ryzen 7',
          'Çekirdek Sayısı': '8',
          'İş Parçacığı': '16',
          'Temel Frekans': '4.2 GHz',
          'Max Turbo Frekans': '5.0 GHz',
          'Önbellek': '96 MB (64MB L3 + 32MB L2)',
          'TDP': '120W',
          'Soket': 'AM5'
        },
        isNewProduct: true,
        isPopular: true,
        isActive: true,
        featured: false
      },
      {
        name: 'Intel Core i7-13700K',
        description: 'Intel Core i7-13700K, 16 çekirdek (8P+8E) ve 24 iş parçacığı ile yüksek performans sunan 13. nesil işlemci. Oyun ve içerik üretimi için ideal.',
        price: 8999.99,
        brand: 'Intel',
        stock: 50,
        category: processorCategory._id,
        categoryPath: categoryPath,
        images: ['/images/products/intel-i7-13700k.jpg'],
        specifications: {
          'İşlemci Serisi': 'Core i7',
          'Çekirdek Sayısı': '16 (8P+8E)',
          'İş Parçacığı': '24',
          'Temel Frekans': '3.4 GHz',
          'Max Turbo Frekans': '5.4 GHz',
          'Önbellek': '30 MB L3',
          'TDP': '125W',
          'Soket': 'LGA 1700'
        },
        isNewProduct: false,
        isPopular: true,
        isActive: true,
        featured: false
      },
      {
        name: 'AMD Ryzen 5 7600X',
        description: 'AMD Ryzen 5 7600X, 6 çekirdek ve 12 iş parçacığı sunan orta segment masaüstü işlemci. Fiyat/performans odaklı kullanıcılar için ideal tercih.',
        price: 5999.99,
        brand: 'AMD',
        stock: 65,
        category: processorCategory._id,
        categoryPath: categoryPath,
        images: ['/images/products/ryzen-5-7600x.jpg'],
        specifications: {
          'İşlemci Serisi': 'Ryzen 5',
          'Çekirdek Sayısı': '6',
          'İş Parçacığı': '12',
          'Temel Frekans': '4.7 GHz',
          'Max Turbo Frekans': '5.3 GHz',
          'Önbellek': '32 MB L3',
          'TDP': '105W',
          'Soket': 'AM5'
        },
        isNewProduct: false,
        isPopular: true,
        isActive: true,
        featured: false
      },
      {
        name: 'Intel Core i5-13600K',
        description: 'Intel Core i5-13600K, 14 çekirdek (6P+8E) ve 20 iş parçacığı ile orta-üst segment kullanıcılar için ideal 13. nesil işlemci.',
        price: 6499.99,
        brand: 'Intel',
        stock: 55,
        category: processorCategory._id,
        categoryPath: categoryPath,
        images: ['/images/products/intel-i5-13600k.jpg'],
        specifications: {
          'İşlemci Serisi': 'Core i5',
          'Çekirdek Sayısı': '14 (6P+8E)',
          'İş Parçacığı': '20',
          'Temel Frekans': '3.5 GHz',
          'Max Turbo Frekans': '5.1 GHz',
          'Önbellek': '24 MB L3',
          'TDP': '125W',
          'Soket': 'LGA 1700'
        },
        isNewProduct: false,
        isPopular: true,
        isActive: true,
        featured: false
      },
      {
        name: 'AMD Ryzen Threadripper 7980X',
        description: 'AMD Ryzen Threadripper 7980X, 64 çekirdek ve 128 iş parçacığı sunan ultra yüksek performanslı HEDT işlemci. Profesyonel iş istasyonları için tasarlandı.',
        price: 49999.99,
        brand: 'AMD',
        stock: 10,
        category: processorCategory._id,
        categoryPath: categoryPath,
        images: ['/images/products/threadripper-7980x.jpg'],
        specifications: {
          'İşlemci Serisi': 'Threadripper',
          'Çekirdek Sayısı': '64',
          'İş Parçacığı': '128',
          'Temel Frekans': '3.2 GHz',
          'Max Turbo Frekans': '5.1 GHz',
          'Önbellek': '256 MB L3',
          'TDP': '350W',
          'Soket': 'sTR5'
        },
        isNewProduct: true,
        isPopular: false,
        isActive: true,
        featured: true
      },
      {
        name: 'Intel Core i3-13100',
        description: 'Intel Core i3-13100, 4 çekirdek ve 8 iş parçacığı ile giriş seviyesi gaming ve ofis kullanımı için uygun fiyatlı 13. nesil işlemci.',
        price: 2999.99,
        brand: 'Intel',
        stock: 80,
        category: processorCategory._id,
        categoryPath: categoryPath,
        images: ['/images/products/intel-i3-13100.jpg'],
        specifications: {
          'İşlemci Serisi': 'Core i3',
          'Çekirdek Sayısı': '4',
          'İş Parçacığı': '8',
          'Temel Frekans': '3.4 GHz',
          'Max Turbo Frekans': '4.5 GHz',
          'Önbellek': '12 MB L3',
          'TDP': '60W',
          'Soket': 'LGA 1700'
        },
        isNewProduct: false,
        isPopular: false,
        isActive: true,
        featured: false
      },
      {
        name: 'AMD Ryzen 3 7300X',
        description: 'AMD Ryzen 3 7300X, 4 çekirdek ve 8 iş parçacığı sunan uygun fiyatlı masaüstü işlemci. Günlük kullanım ve giriş seviyesi oyun sistemleri için ideal.',
        price: 2799.99,
        brand: 'AMD',
        stock: 75,
        category: processorCategory._id,
        categoryPath: categoryPath,
        images: ['/images/products/ryzen-3-7300x.jpg'],
        specifications: {
          'İşlemci Serisi': 'Ryzen 3',
          'Çekirdek Sayısı': '4',
          'İş Parçacığı': '8',
          'Temel Frekans': '4.0 GHz',
          'Max Turbo Frekans': '4.9 GHz',
          'Önbellek': '16 MB L3',
          'TDP': '65W',
          'Soket': 'AM5'
        },
        isNewProduct: false,
        isPopular: false,
        isActive: true,
        featured: false
      },
      {
        name: 'Intel Core i9-14900K',
        description: 'Intel Core i9-14900K, en yeni 14. nesil işlemci olarak 24 çekirdek (8P+16E) ve 32 iş parçacığı ile sınıfının en iyi performansını sunar. 6.0 GHz\'e kadar boost hızı.',
        price: 14999.99,
        brand: 'Intel',
        stock: 20,
        category: processorCategory._id,
        categoryPath: categoryPath,
        images: ['/images/products/intel-i9-14900k.jpg'],
        specifications: {
          'İşlemci Serisi': 'Core i9',
          'Çekirdek Sayısı': '24 (8P+16E)',
          'İş Parçacığı': '32',
          'Temel Frekans': '3.2 GHz',
          'Max Turbo Frekans': '6.0 GHz',
          'Önbellek': '36 MB L3',
          'TDP': '125W',
          'Soket': 'LGA 1700'
        },
        isNewProduct: true,
        isPopular: true,
        isActive: true,
        featured: true
      }
    ];
    
    // Veritabanına ekle
    await Product.insertMany(processors);
    console.log('10 adet işlemci başarıyla eklendi!');
    
    // İşlem tamamlandı, bağlantıyı kapat
    mongoose.connection.close();
    console.log('MongoDB bağlantısı kapatıldı.');
    
  } catch (error) {
    console.error('HATA:', error);
    process.exit(1);
  }
};

// Scripti çalıştır
initializeDB(); 