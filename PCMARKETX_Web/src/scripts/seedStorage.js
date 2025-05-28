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
    
    // Ana kategori: Bilgisayar Bileşenleri
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
    
    // Alt kategori: Depolama
    let storageCategory = await Category.findOne({ slug: 'depolama' });
    
    if (!storageCategory) {
      try {
        storageCategory = await Category.create({
          name: 'Depolama',
          description: 'SSD, HDD ve M.2 depolama ürünleri, dahili ve harici disk çözümleri',
          image: '/images/categories/depolama-banner.jpg',
          slug: 'depolama',
          parent: computerPartsCategory._id
        });
        console.log('Depolama alt kategorisi oluşturuldu.');
      } catch (error) {
        if (error.code === 11000) {
          storageCategory = await Category.findOne({ name: 'Depolama' });
          // Eğer parent yoksa güncelle
          if (storageCategory && !storageCategory.parent) {
            storageCategory.parent = computerPartsCategory._id;
            await storageCategory.save();
            console.log('Mevcut Depolama kategorisi güncellendi ve ana kategoriye bağlandı.');
          } else {
            console.log('Mevcut Depolama kategorisi kullanılıyor.');
          }
        } else {
          throw error;
        }
      }
    } else {
      // Eğer parent yoksa güncelle
      if (!storageCategory.parent) {
        storageCategory.parent = computerPartsCategory._id;
        await storageCategory.save();
        console.log('Mevcut Depolama kategorisi güncellendi ve ana kategoriye bağlandı.');
      } else {
        console.log('Mevcut Depolama kategorisi kullanılıyor.');
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
        _id: storageCategory._id,
        name: storageCategory.name,
        slug: storageCategory.slug
      }
    ];
    
    // Depolama ürünleri eklenmeden önce mevcut ürünleri sil
    await Product.deleteMany({ category: storageCategory._id });
    console.log('Mevcut depolama ürünleri silindi.');
    
    // Depolama ürünlerini ekle
    const storageProducts = [
      {
        name: 'Samsung 990 PRO 2TB NVMe M.2 SSD',
        description: 'Samsung 990 PRO, PCIe 4.0 teknolojisiyle olağanüstü hızlar sunan premium M.2 SSD. Samsung\'un en gelişmiş kontrolcüsü ve V-NAND teknolojisiyle maksimum performans için tasarlandı.',
        price: 3499.99,
        brand: 'Samsung',
        stock: 30,
        category: storageCategory._id,
        categoryPath: categoryPath,
        images: ['/images/products/samsung-990-pro.jpg'],
        specifications: {
          'Kapasite': '2TB',
          'Arayüz': 'PCIe Gen 4.0 x4, NVMe 2.0',
          'Form_Faktör': 'M.2 2280',
          'Okuma_Hızı': '7450 MB/s',
          'Yazma_Hızı': '6900 MB/s',
          'NAND_Tipi': 'Samsung V-NAND TLC',
          'DRAM': 'LPDDR4 2GB',
          'Dayanıklılık': '1200 TBW',
          'Soğutma': 'Nikel kaplı ısı dağıtıcı',
          'Güvenlik': 'AES 256-bit şifreleme'
        },
        isNewProduct: true,
        isPopular: true,
        isActive: true,
        featured: true
      },
      {
        name: 'WD Black SN850X 1TB NVMe M.2 SSD',
        description: 'WD Black SN850X, oyuncular için optimize edilmiş, son derece hızlı PCIe Gen4 SSD. Oyun yükleme sürelerini minimize eden ve gecikmeyi azaltan GameMode 2.0 teknolojisine sahiptir.',
        price: 2199.99,
        brand: 'Western Digital',
        stock: 25,
        category: storageCategory._id,
        categoryPath: categoryPath,
        images: ['/images/products/wd-black-sn850x.jpg'],
        specifications: {
          'Kapasite': '1TB',
          'Arayüz': 'PCIe Gen 4.0 x4, NVMe 1.4',
          'Form_Faktör': 'M.2 2280',
          'Okuma_Hızı': '7300 MB/s',
          'Yazma_Hızı': '6300 MB/s',
          'NAND_Tipi': '3D TLC',
          'DRAM': 'Var',
          'Dayanıklılık': '600 TBW',
          'Özel_Özellik': 'GameMode 2.0, WD Dashboard'
        },
        isNewProduct: true,
        isPopular: true,
        isActive: true,
        featured: false
      },
      {
        name: 'Crucial MX500 1TB SATA SSD',
        description: 'Crucial MX500, SATA arabirimine sahip güvenilir ve ekonomik bir SSD. Dayanıklılık ve hız dengesini iyi kuran, eski sistemlerde yüksek performans artışı sağlayan bir model.',
        price: 999.99,
        brand: 'Crucial',
        stock: 50,
        category: storageCategory._id,
        categoryPath: categoryPath,
        images: ['/images/products/crucial-mx500.jpg'],
        specifications: {
          'Kapasite': '1TB',
          'Arayüz': 'SATA III 6Gb/s',
          'Form_Faktör': '2.5 inç',
          'Okuma_Hızı': '560 MB/s',
          'Yazma_Hızı': '510 MB/s',
          'NAND_Tipi': 'Micron 3D TLC',
          'DRAM': 'LPDDR3',
          'Dayanıklılık': '360 TBW',
          'Şifreleme': 'AES 256-bit',
          'Özel_Özellik': 'Dinamik Yazma Hızlandırma, Entegre Güç Kaybı Koruması'
        },
        isNewProduct: false,
        isPopular: true,
        isActive: true,
        featured: false
      },
      {
        name: 'Seagate IronWolf Pro 4TB NAS HDD',
        description: 'Seagate IronWolf Pro, 7/24 çalışmak üzere tasarlanmış, NAS sistemleri için optimize edilmiş yüksek kapasiteli bir sabit disk. AgileArray teknolojisi ve yüksek MTBF oranıyla uzun ömürlü bir çözüm sunar.',
        price: 1899.99,
        brand: 'Seagate',
        stock: 20,
        category: storageCategory._id,
        categoryPath: categoryPath,
        images: ['/images/products/seagate-ironwolf-pro.jpg'],
        specifications: {
          'Kapasite': '4TB',
          'Arayüz': 'SATA III 6Gb/s',
          'Form_Faktör': '3.5 inç',
          'Dönüş_Hızı': '7200 RPM',
          'Cache': '128MB',
          'Veri_Transfer_Hızı': '214 MB/s',
          'MTBF': '1.2 milyon saat',
          'Çalışma_Döngüsü': '24/7',
          'Önerilen_Kullanım': 'NAS Sistemleri (1-24 yuvalı)',
          'Özel_Özellikler': 'AgileArray, IronWolf Health Management'
        },
        isNewProduct: false,
        isPopular: false,
        isActive: true,
        featured: false
      },
      {
        name: 'Samsung 870 EVO 2TB SATA SSD',
        description: 'Samsung 870 EVO, SATA SSD kategorisinin referans modeli olarak gösterilen, güvenilir ve yüksek performanslı bir depolama çözümü. MKX kontrolcü ve Samsung V-NAND teknolojisi ile donatılmıştır.',
        price: 1799.99,
        brand: 'Samsung',
        stock: 35,
        category: storageCategory._id,
        categoryPath: categoryPath,
        images: ['/images/products/samsung-870-evo.jpg'],
        specifications: {
          'Kapasite': '2TB',
          'Arayüz': 'SATA III 6Gb/s',
          'Form_Faktör': '2.5 inç',
          'Okuma_Hızı': '560 MB/s',
          'Yazma_Hızı': '530 MB/s',
          'NAND_Tipi': 'Samsung V-NAND 3-bit MLC (TLC)',
          'DRAM': 'LPDDR4 2GB',
          'Dayanıklılık': '1200 TBW',
          'Şifreleme': 'AES 256-bit',
          'Yazılım': 'Samsung Magician'
        },
        isNewProduct: false,
        isPopular: true,
        isActive: true,
        featured: false
      },
      {
        name: 'Kingston KC3000 2TB PCIe 4.0 NVMe M.2 SSD',
        description: 'Kingston KC3000, PCIe 4.0 performansıyla olağanüstü hızlar sunan, yüksek verimli bir M.2 SSD. Gelişmiş 3D TLC NAND teknolojisi ile güçlendirilmiştir.',
        price: 2799.99,
        brand: 'Kingston',
        stock: 22,
        category: storageCategory._id,
        categoryPath: categoryPath,
        images: ['/images/products/kingston-kc3000.jpg'],
        specifications: {
          'Kapasite': '2TB',
          'Arayüz': 'PCIe Gen 4.0 x4, NVMe 1.4',
          'Form_Faktör': 'M.2 2280',
          'Okuma_Hızı': '7000 MB/s',
          'Yazma_Hızı': '7000 MB/s',
          'NAND_Tipi': '3D TLC',
          'DRAM': 'Var',
          'Dayanıklılık': '1600 TBW',
          'Çalışma_Sıcaklığı': '0°C - 70°C',
          'Yazılım': 'Kingston SSD Manager'
        },
        isNewProduct: true,
        isPopular: false,
        isActive: true,
        featured: false
      },
      {
        name: 'Western Digital 4TB WD Blue 5400RPM HDD',
        description: 'WD Blue, günlük kullanım için tasarlanmış, güvenilir ve ekonomik bir sabit disk sürücüsü. Genel amaçlı depolama ihtiyaçları için ideal bir çözüm sunar.',
        price: 1299.99,
        brand: 'Western Digital',
        stock: 40,
        category: storageCategory._id,
        categoryPath: categoryPath,
        images: ['/images/products/wd-blue-hdd.jpg'],
        specifications: {
          'Kapasite': '4TB',
          'Arayüz': 'SATA III 6Gb/s',
          'Form_Faktör': '3.5 inç',
          'Dönüş_Hızı': '5400 RPM',
          'Cache': '64MB',
          'Veri_Transfer_Hızı': '180 MB/s',
          'MTBF': '1 milyon saat',
          'Güç_Tüketimi': '5.3W okuma/yazma, 3.4W boşta',
          'Gürültü_Seviyesi': '25 dBA boşta, 28 dBA arama',
          'Uygulamalar': 'Masaüstü PC, Harici Depolama'
        },
        isNewProduct: false,
        isPopular: true,
        isActive: true,
        featured: false
      },
      {
        name: 'Sabrent Rocket 4 Plus 1TB PCIe 4.0 NVMe M.2 SSD',
        description: 'Sabrent Rocket 4 Plus, Phison E18 kontrolcü ile olağanüstü hız ve performans sunan premium bir NVMe SSD. PCIe 4.0 teknolojisinin tüm avantajlarından yararlanan üst düzey bir depolama çözümü.',
        price: 1899.99,
        brand: 'Sabrent',
        stock: 18,
        category: storageCategory._id,
        categoryPath: categoryPath,
        images: ['/images/products/sabrent-rocket-4plus.jpg'],
        specifications: {
          'Kapasite': '1TB',
          'Arayüz': 'PCIe Gen 4.0 x4, NVMe 1.4',
          'Form_Faktör': 'M.2 2280',
          'Okuma_Hızı': '7100 MB/s',
          'Yazma_Hızı': '6600 MB/s',
          'NAND_Tipi': 'TLC',
          'DRAM': 'DDR4',
          'Dayanıklılık': '700 TBW',
          'Kontrolcü': 'Phison E18',
          'Yazılım': 'Sabrent Acronis True Image'
        },
        isNewProduct: false,
        isPopular: true,
        isActive: true,
        featured: false
      },
      {
        name: 'Seagate BarraCuda 2TB 7200RPM HDD',
        description: 'Seagate BarraCuda, masaüstü bilgisayarlar için ideal, yüksek performanslı ve uygun fiyatlı sabit disk sürücüsü. Günlük bilgisayar kullanımı için güvenilir bir depolama çözümü sunar.',
        price: 799.99,
        brand: 'Seagate',
        stock: 60,
        category: storageCategory._id,
        categoryPath: categoryPath,
        images: ['/images/products/seagate-barracuda.jpg'],
        specifications: {
          'Kapasite': '2TB',
          'Arayüz': 'SATA III 6Gb/s',
          'Form_Faktör': '3.5 inç',
          'Dönüş_Hızı': '7200 RPM',
          'Cache': '256MB',
          'Veri_Transfer_Hızı': '210 MB/s',
          'MTBF': '1 milyon saat',
          'Güç_Tüketimi': '5.3W çalışma, 3.4W boşta',
          'Gürültü_Seviyesi': '26 dBA boşta, 29 dBA arama',
          'Garanti': '2 yıl'
        },
        isNewProduct: false,
        isPopular: true,
        isActive: true,
        featured: false
      },
      {
        name: 'Corsair MP600 PRO XT 2TB PCIe 4.0 NVMe M.2 SSD',
        description: 'Corsair MP600 PRO XT, yüksek ısılarda bile tutarlı performans sunan, güçlü alüminyum soğutucuya sahip premium bir SSD. 3D TLC NAND ve en yeni Phison E18 kontrolcü ile donatılmıştır.',
        price: 3299.99,
        brand: 'Corsair',
        stock: 15,
        category: storageCategory._id,
        categoryPath: categoryPath,
        images: ['/images/products/corsair-mp600-pro-xt.jpg'],
        specifications: {
          'Kapasite': '2TB',
          'Arayüz': 'PCIe Gen 4.0 x4, NVMe 1.4',
          'Form_Faktör': 'M.2 2280',
          'Okuma_Hızı': '7100 MB/s',
          'Yazma_Hızı': '6800 MB/s',
          'NAND_Tipi': '3D TLC',
          'Dayanıklılık': '1400 TBW',
          'Kontrolcü': 'Phison E18',
          'Soğutma': 'Entegre Alüminyum Soğutucu',
          'Yazılım': 'Corsair SSD Toolbox'
        },
        isNewProduct: true,
        isPopular: true,
        isActive: true,
        featured: true
      }
    ];
    
    // Veritabanına ekle
    await Product.insertMany(storageProducts);
    console.log('10 adet depolama ürünü başarıyla eklendi!');
    
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