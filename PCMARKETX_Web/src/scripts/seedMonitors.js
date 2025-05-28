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
    
    // Ana kategori: Çevre Birimleri
    let peripheralsCategory = await Category.findOne({ slug: 'cevre-birimleri' });
    
    if (!peripheralsCategory) {
      try {
        peripheralsCategory = await Category.create({
          name: 'Çevre Birimleri',
          description: 'Bilgisayar kullanım deneyiminizi artıran tüm ekipmanlar',
          image: '/images/categories/cevre-birimleri-banner.jpg',
          slug: 'cevre-birimleri'
        });
        console.log('Çevre Birimleri ana kategorisi oluşturuldu.');
      } catch (error) {
        if (error.code === 11000) {
          peripheralsCategory = await Category.findOne({ slug: 'cevre-birimleri' });
          console.log('Mevcut Çevre Birimleri kategorisi kullanılıyor.');
        } else {
          throw error;
        }
      }
    } else {
      console.log('Mevcut Çevre Birimleri kategorisi kullanılıyor.');
    }
    
    // Alt kategori: Monitörler
    let monitorsCategory = await Category.findOne({ slug: 'monitorler' });
    
    if (!monitorsCategory) {
      try {
        monitorsCategory = await Category.create({
          name: 'Monitörler',
          description: 'Gaming ve profesyonel kullanım için yüksek performanslı monitörler',
          image: '/images/categories/monitorler-banner.jpg',
          slug: 'monitorler',
          parent: peripheralsCategory._id
        });
        console.log('Monitörler alt kategorisi oluşturuldu.');
      } catch (error) {
        if (error.code === 11000) {
          monitorsCategory = await Category.findOne({ slug: 'monitorler' });
          // Eğer parent yoksa güncelle
          if (monitorsCategory && !monitorsCategory.parent) {
            monitorsCategory.parent = peripheralsCategory._id;
            await monitorsCategory.save();
            console.log('Mevcut Monitörler kategorisi güncellendi ve ana kategoriye bağlandı.');
          } else {
            console.log('Mevcut Monitörler kategorisi kullanılıyor.');
          }
        } else {
          throw error;
        }
      }
    } else {
      // Eğer parent yoksa güncelle
      if (!monitorsCategory.parent) {
        monitorsCategory.parent = peripheralsCategory._id;
        await monitorsCategory.save();
        console.log('Mevcut Monitörler kategorisi güncellendi ve ana kategoriye bağlandı.');
      } else {
        console.log('Mevcut Monitörler kategorisi kullanılıyor.');
      }
    }
    
    // Kategori yolunu belirle (dizi formatında)
    const categoryPath = [
      {
        _id: peripheralsCategory._id,
        name: peripheralsCategory.name,
        slug: peripheralsCategory.slug
      },
      {
        _id: monitorsCategory._id,
        name: monitorsCategory.name,
        slug: monitorsCategory.slug
      }
    ];
    
    // Monitörler eklenmeden önce mevcut monitörleri sil
    await Product.deleteMany({ category: monitorsCategory._id });
    console.log('Mevcut monitörler silindi.');
    
    // Popüler monitörleri ekle
    const monitors = [
      {
        name: 'LG UltraGear 27GP850-B',
        description: '27 inç QHD (2560x1440) Nano IPS, 180Hz, 1ms, HDR 400, G-Sync uyumlu gaming monitör. Yüksek tazeleme hızı ve düşük gecikme süresi ile rekabetçi oyuncular için ideal.',
        price: 7499.99,
        brand: 'LG',
        stock: 15,
        category: monitorsCategory._id,
        categoryPath: categoryPath,
        images: ['/images/products/monitors/lg-27gp850.jpg'],
        specifications: {
          'Ekran Boyutu': '27 inç',
          'Çözünürlük': '2560 x 1440 (QHD)',
          'Panel Tipi': 'Nano IPS',
          'Tazeleme Hızı': '180Hz',
          'Tepki Süresi': '1ms',
          'HDR': 'HDR400',
          'Bağlantı': 'HDMI 2.0, DisplayPort 1.4, USB Hub',
          'Teknolojiler': 'G-Sync Uyumlu, AMD FreeSync Premium'
        },
        isNewProduct: true,
        isPopular: true,
        isActive: true,
        featured: true
      },
      {
        name: 'Samsung Odyssey G7 C32G75T',
        description: '32 inç WQHD (2560x1440) 1000R Kavisli VA, 240Hz, 1ms, HDR600, G-Sync uyumlu gaming monitör. Kavisli ekranı ve yüksek tazeleme hızıyla sürükleyici oyun deneyimi sunar.',
        price: 9999.99,
        brand: 'Samsung',
        stock: 12,
        category: monitorsCategory._id,
        categoryPath: categoryPath,
        images: ['/images/products/monitors/samsung-g7.jpg'],
        specifications: {
          'Ekran Boyutu': '32 inç',
          'Çözünürlük': '2560 x 1440 (WQHD)',
          'Panel Tipi': 'VA',
          'Kavis': '1000R',
          'Tazeleme Hızı': '240Hz',
          'Tepki Süresi': '1ms',
          'HDR': 'HDR600',
          'Bağlantı': 'HDMI 2.0, DisplayPort 1.4, USB Hub',
          'Teknolojiler': 'G-Sync Uyumlu, AMD FreeSync Premium Pro'
        },
        isNewProduct: true,
        isPopular: true,
        isActive: true,
        featured: true
      },
      {
        name: 'ASUS ROG Swift PG279QM',
        description: '27 inç QHD (2560x1440) IPS, 240Hz, 1ms, G-Sync gaming monitör. NVIDIA G-Sync teknolojisi ve yüksek tazeleme hızı ile akıcı oyun deneyimi sunar.',
        price: 10499.99,
        brand: 'ASUS',
        stock: 8,
        category: monitorsCategory._id,
        categoryPath: categoryPath,
        images: ['/images/products/monitors/asus-pg279qm.jpg'],
        specifications: {
          'Ekran Boyutu': '27 inç',
          'Çözünürlük': '2560 x 1440 (QHD)',
          'Panel Tipi': 'IPS',
          'Tazeleme Hızı': '240Hz',
          'Tepki Süresi': '1ms',
          'HDR': 'HDR 400',
          'Bağlantı': 'HDMI 2.0, DisplayPort 1.4, USB Hub',
          'Teknolojiler': 'NVIDIA G-SYNC'
        },
        isNewProduct: true,
        isPopular: true,
        isActive: true,
        featured: false
      },
      {
        name: 'Dell S2722DGM',
        description: '27 inç QHD (2560x1440) VA, 165Hz, 1ms, AMD FreeSync Premium gaming monitör. Uygun fiyatlı gaming monitör arayanlar için ideal seçenek.',
        price: 4999.99,
        brand: 'Dell',
        stock: 25,
        category: monitorsCategory._id,
        categoryPath: categoryPath,
        images: ['/images/products/monitors/dell-s2722dgm.jpg'],
        specifications: {
          'Ekran Boyutu': '27 inç',
          'Çözünürlük': '2560 x 1440 (QHD)',
          'Panel Tipi': 'VA',
          'Tazeleme Hızı': '165Hz',
          'Tepki Süresi': '1ms',
          'Bağlantı': 'HDMI 2.0, DisplayPort 1.2',
          'Teknolojiler': 'AMD FreeSync Premium'
        },
        isNewProduct: false,
        isPopular: true,
        isActive: true,
        featured: false
      },
      {
        name: 'AOC 24G2U',
        description: '24 inç Full HD (1920x1080) IPS, 144Hz, 1ms, AMD FreeSync gaming monitör. Bütçe dostu fiyatıyla yüksek performans sunan giriş seviyesi oyuncu monitörü.',
        price: 3299.99,
        brand: 'AOC',
        stock: 30,
        category: monitorsCategory._id,
        categoryPath: categoryPath,
        images: ['/images/products/monitors/aoc-24g2u.jpg'],
        specifications: {
          'Ekran Boyutu': '24 inç',
          'Çözünürlük': '1920 x 1080 (Full HD)',
          'Panel Tipi': 'IPS',
          'Tazeleme Hızı': '144Hz',
          'Tepki Süresi': '1ms',
          'Bağlantı': 'HDMI 1.4, DisplayPort 1.2, VGA, USB Hub',
          'Teknolojiler': 'AMD FreeSync'
        },
        isNewProduct: false,
        isPopular: true,
        isActive: true,
        featured: false
      },
      {
        name: 'Gigabyte M32U',
        description: '32 inç 4K UHD (3840x2160) SS IPS, 144Hz, 1ms, KVM Switch, HDMI 2.1 monitör. Profesyonel içerik üreticileri ve konsolda oyun oynayanlar için ideal.',
        price: 13999.99,
        brand: 'Gigabyte',
        stock: 7,
        category: monitorsCategory._id,
        categoryPath: categoryPath,
        images: ['/images/products/monitors/gigabyte-m32u.jpg'],
        specifications: {
          'Ekran Boyutu': '32 inç',
          'Çözünürlük': '3840 x 2160 (4K UHD)',
          'Panel Tipi': 'SS IPS',
          'Tazeleme Hızı': '144Hz',
          'Tepki Süresi': '1ms',
          'HDR': 'HDR 400',
          'Bağlantı': 'HDMI 2.1, DisplayPort 1.4, USB-C, KVM Switch',
          'Teknolojiler': 'AMD FreeSync Premium Pro'
        },
        isNewProduct: true,
        isPopular: true,
        isActive: true,
        featured: true
      },
      {
        name: 'MSI Optix MAG274QRF-QD',
        description: '27 inç QHD (2560x1440) Rapid IPS Quantum Dot, 165Hz, 1ms, G-Sync uyumlu gaming monitör. Canlı renkleri ve düşük tepki süresi ile oyun ve içerik üretimi için ideal.',
        price: 7799.99,
        brand: 'MSI',
        stock: 20,
        category: monitorsCategory._id,
        categoryPath: categoryPath,
        images: ['/images/products/monitors/msi-mag274qrf-qd.jpg'],
        specifications: {
          'Ekran Boyutu': '27 inç',
          'Çözünürlük': '2560 x 1440 (QHD)',
          'Panel Tipi': 'Rapid IPS Quantum Dot',
          'Tazeleme Hızı': '165Hz',
          'Tepki Süresi': '1ms',
          'HDR': 'HDR 400',
          'Bağlantı': 'HDMI 2.0, DisplayPort 1.4, USB-C, USB Hub',
          'Teknolojiler': 'G-Sync Uyumlu, AMD FreeSync'
        },
        isNewProduct: false,
        isPopular: true,
        isActive: true,
        featured: false
      },
      {
        name: 'ViewSonic XG270QG',
        description: '27 inç QHD (2560x1440) IPS, 165Hz, 1ms, G-Sync gaming monitör. RGB aydınlatması ve ergonomik standı ile dikkat çeken performans odaklı monitör.',
        price: 8299.99,
        brand: 'ViewSonic',
        stock: 15,
        category: monitorsCategory._id,
        categoryPath: categoryPath,
        images: ['/images/products/monitors/viewsonic-xg270qg.jpg'],
        specifications: {
          'Ekran Boyutu': '27 inç',
          'Çözünürlük': '2560 x 1440 (QHD)',
          'Panel Tipi': 'IPS',
          'Tazeleme Hızı': '165Hz',
          'Tepki Süresi': '1ms',
          'Bağlantı': 'HDMI 2.0, DisplayPort 1.4, USB Hub',
          'Teknolojiler': 'NVIDIA G-SYNC',
          'Ek Özellikler': 'RGB Aydınlatma'
        },
        isNewProduct: false,
        isPopular: false,
        isActive: true,
        featured: false
      },
      {
        name: 'BenQ MOBIUZ EX3210U',
        description: '32 inç 4K UHD (3840x2160) IPS, 144Hz, 1ms, HDR600, 4K HDMI 2.1 gaming monitör. Dahili 2.1 ses sistemi ve yüksek kaliteli paneli ile premium oyuncu deneyimi sunar.',
        price: 14999.99,
        brand: 'BenQ',
        stock: 5,
        category: monitorsCategory._id,
        categoryPath: categoryPath,
        images: ['/images/products/monitors/benq-ex3210u.jpg'],
        specifications: {
          'Ekran Boyutu': '32 inç',
          'Çözünürlük': '3840 x 2160 (4K UHD)',
          'Panel Tipi': 'IPS',
          'Tazeleme Hızı': '144Hz',
          'Tepki Süresi': '1ms',
          'HDR': 'HDR 600',
          'Bağlantı': 'HDMI 2.1, DisplayPort 1.4, USB Hub',
          'Ses Sistemi': 'Dahili 2.1 Hoparlör Sistemi',
          'Teknolojiler': 'AMD FreeSync Premium Pro'
        },
        isNewProduct: true,
        isPopular: false,
        isActive: true,
        featured: true
      },
      {
        name: 'Huawei MateView GT 34',
        description: '34 inç UWQHD (3440x1440) VA, 165Hz, 4ms, 1500R Kavisli, HDR10 gaming monitör. Geniş ekranı ve dahili soundbar\'ı ile sürükleyici oyun ve multimedya deneyimi sunar.',
        price: 6999.99,
        brand: 'Huawei',
        stock: 18,
        category: monitorsCategory._id,
        categoryPath: categoryPath,
        images: ['/images/products/monitors/huawei-mateview-gt.jpg'],
        specifications: {
          'Ekran Boyutu': '34 inç',
          'Çözünürlük': '3440 x 1440 (UWQHD)',
          'Panel Tipi': 'VA',
          'Kavis': '1500R',
          'Tazeleme Hızı': '165Hz',
          'Tepki Süresi': '4ms',
          'HDR': 'HDR 10',
          'Bağlantı': 'HDMI 2.0, DisplayPort 1.4, USB-C',
          'Ses Sistemi': 'Dahili Soundbar',
          'Teknolojiler': 'AMD FreeSync'
        },
        isNewProduct: false,
        isPopular: true,
        isActive: true,
        featured: false
      }
    ];
    
    // Veritabanına ekle
    await Product.insertMany(monitors);
    console.log('10 adet monitör başarıyla eklendi!');
    
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