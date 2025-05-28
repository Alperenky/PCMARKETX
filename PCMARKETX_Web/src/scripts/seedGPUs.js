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
    
    // Alt kategori: Ekran Kartları
    let gpuCategory = await Category.findOne({ slug: 'ekran-kartlari' });
    
    if (!gpuCategory) {
      try {
        gpuCategory = await Category.create({
          name: 'Ekran Kartları',
          description: 'Gaming ve profesyonel kullanım için yüksek performanslı ekran kartları',
          image: '/images/categories/ekran-kartlari-banner.jpg',
          slug: 'ekran-kartlari',
          parent: computerPartsCategory._id
        });
        console.log('Ekran Kartları alt kategorisi oluşturuldu.');
      } catch (error) {
        if (error.code === 11000) {
          gpuCategory = await Category.findOne({ name: 'Ekran Kartları' });
          // Eğer parent yoksa güncelle
          if (gpuCategory && !gpuCategory.parent) {
            gpuCategory.parent = computerPartsCategory._id;
            await gpuCategory.save();
            console.log('Mevcut Ekran Kartları kategorisi güncellendi ve ana kategoriye bağlandı.');
          } else {
            console.log('Mevcut Ekran Kartları kategorisi kullanılıyor.');
          }
        } else {
          throw error;
        }
      }
    } else {
      // Eğer parent yoksa güncelle
      if (!gpuCategory.parent) {
        gpuCategory.parent = computerPartsCategory._id;
        await gpuCategory.save();
        console.log('Mevcut Ekran Kartları kategorisi güncellendi ve ana kategoriye bağlandı.');
      } else {
        console.log('Mevcut Ekran Kartları kategorisi kullanılıyor.');
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
        _id: gpuCategory._id,
        name: gpuCategory.name,
        slug: gpuCategory.slug
      }
    ];
    
    // Ekran kartları eklenmeden önce mevcut ekran kartlarını sil
    await Product.deleteMany({ category: gpuCategory._id });
    console.log('Mevcut ekran kartları silindi.');
    
    // Popüler ekran kartlarını ekle
    const gpus = [
      {
        name: 'NVIDIA GeForce RTX 4090',
        description: 'NVIDIA GeForce RTX 4090, NVIDIA\'nın en güçlü ekran kartı. 24GB GDDR6X bellek ve Ada Lovelace mimarisiyle olağanüstü oyun ve yapay zeka performansı sunar.',
        price: 44999.99,
        brand: 'NVIDIA',
        stock: 15,
        category: gpuCategory._id,
        categoryPath: categoryPath,
        images: ['/images/products/rtx-4090.jpg'],
        specifications: {
          'GPU': 'NVIDIA GeForce RTX 4090',
          'Bellek': '24GB GDDR6X',
          'Bellek Hızı': '21Gbps',
          'Bellek Arayüzü': '384-bit',
          'Boost Clock': '2.52 GHz',
          'CUDA Çekirdekleri': '16384',
          'RT Çekirdekleri': '128 (3. Nesil)',
          'Tensor Çekirdekleri': '512 (4. Nesil)',
          'TDP': '450W'
        },
        isNewProduct: true,
        isPopular: true,
        isActive: true,
        featured: true
      },
      {
        name: 'AMD Radeon RX 7900 XTX',
        description: 'AMD Radeon RX 7900 XTX, AMD\'nin amiral gemisi ekran kartı. RDNA 3 mimarisi ve 24GB yüksek hızlı bellek ile yüksek çözünürlüklü oyunlarda üstün performans sağlar.',
        price: 34999.99,
        brand: 'AMD',
        stock: 20,
        category: gpuCategory._id,
        categoryPath: categoryPath,
        images: ['/images/products/rx-7900xtx.jpg'],
        specifications: {
          'GPU': 'AMD Radeon RX 7900 XTX',
          'Bellek': '24GB GDDR6',
          'Bellek Hızı': '20Gbps',
          'Bellek Arayüzü': '384-bit',
          'Boost Clock': '2.5 GHz',
          'Stream İşlemcileri': '12288',
          'Ray Tracing Hızlandırıcıları': '96',
          'AI Hızlandırıcıları': '192',
          'TDP': '355W'
        },
        isNewProduct: true,
        isPopular: true,
        isActive: true,
        featured: true
      },
      {
        name: 'ASUS ROG Strix GeForce RTX 4080 OC',
        description: 'ASUS ROG Strix GeForce RTX 4080, yenilikçi soğutma teknolojisi ve fabrika çıkışı hız aşırtma ile üstün performans sunan premium bir ekran kartıdır.',
        price: 39999.99,
        brand: 'ASUS',
        stock: 18,
        category: gpuCategory._id,
        categoryPath: categoryPath,
        images: ['/images/products/asus-rtx4080.jpg'],
        specifications: {
          'GPU': 'NVIDIA GeForce RTX 4080',
          'Bellek': '16GB GDDR6X',
          'Bellek Hızı': '22.4Gbps',
          'Bellek Arayüzü': '256-bit',
          'Boost Clock': '2.61 GHz (OC Mode)',
          'CUDA Çekirdekleri': '9728',
          'Güç Konektörü': '1x 16-pin',
          'Soğutma': 'Üçlü Fan Tasarımı',
          'TDP': '320W'
        },
        isNewProduct: true,
        isPopular: true,
        isActive: true,
        featured: false
      },
      {
        name: 'MSI Gaming X Trio GeForce RTX 4070 Ti',
        description: 'MSI Gaming X Trio serisi, üstün soğutma performansı ve RGB aydınlatma ile dikkat çeken RTX 4070 Ti modeli. 1440p ve 4K oyunlarda mükemmel performans sunar.',
        price: 26999.99,
        brand: 'MSI',
        stock: 30,
        category: gpuCategory._id,
        categoryPath: categoryPath,
        images: ['/images/products/msi-rtx4070ti.jpg'],
        specifications: {
          'GPU': 'NVIDIA GeForce RTX 4070 Ti',
          'Bellek': '12GB GDDR6X',
          'Bellek Hızı': '21Gbps',
          'Bellek Arayüzü': '192-bit',
          'Boost Clock': '2.75 GHz (OC Mode)',
          'CUDA Çekirdekleri': '7680',
          'Soğutma': 'TRI FROZR 2 Termal Tasarım',
          'Aydınlatma': 'Mystic Light RGB',
          'TDP': '285W'
        },
        isNewProduct: true,
        isPopular: true,
        isActive: true,
        featured: false
      },
      {
        name: 'Gigabyte AORUS Radeon RX 7800 XT Master',
        description: 'Gigabyte AORUS Master serisi RX 7800 XT, üstün soğutma ve yüksek dayanıklılık sunan AORUS kalitesi ile AMD RDNA 3 mimarisinin gücünü sunuyor.',
        price: 21999.99,
        brand: 'Gigabyte',
        stock: 25,
        category: gpuCategory._id,
        categoryPath: categoryPath,
        images: ['/images/products/gigabyte-rx7800xt.jpg'],
        specifications: {
          'GPU': 'AMD Radeon RX 7800 XT',
          'Bellek': '16GB GDDR6',
          'Bellek Hızı': '19.5Gbps',
          'Bellek Arayüzü': '256-bit',
          'Boost Clock': '2.43 GHz',
          'Stream İşlemcileri': '3840',
          'Soğutma': 'WINDFORCE Cooling System',
          'Aydınlatma': 'RGB Fusion 2.0',
          'TDP': '263W'
        },
        isNewProduct: false,
        isPopular: true,
        isActive: true,
        featured: false
      },
      {
        name: 'NVIDIA GeForce RTX 4060 Ti Founders Edition',
        description: 'NVIDIA GeForce RTX 4060 Ti, enerji verimliliği ve kompakt tasarımıyla orta segment sistemler için ideal bir ekran kartı. DLSS 3.0 ve yeni nesil ray tracing destekler.',
        price: 15999.99,
        brand: 'NVIDIA',
        stock: 45,
        category: gpuCategory._id,
        categoryPath: categoryPath,
        images: ['/images/products/rtx-4060ti.jpg'],
        specifications: {
          'GPU': 'NVIDIA GeForce RTX 4060 Ti',
          'Bellek': '8GB GDDR6',
          'Bellek Hızı': '18Gbps',
          'Bellek Arayüzü': '128-bit',
          'Boost Clock': '2.54 GHz',
          'CUDA Çekirdekleri': '4352',
          'RT Çekirdekleri': '34 (3. Nesil)',
          'Tensor Çekirdekleri': '136 (4. Nesil)',
          'TDP': '160W'
        },
        isNewProduct: false,
        isPopular: true,
        isActive: true,
        featured: false
      },
      {
        name: 'Sapphire NITRO+ AMD Radeon RX 7700 XT',
        description: 'Sapphire NITRO+ RX 7700 XT, yenilikçi soğutma sistemi ve yüksek kaliteli komponentleriyle fiyat/performans odaklı oyuncular için ideal ekran kartı.',
        price: 18999.99,
        brand: 'Sapphire',
        stock: 35,
        category: gpuCategory._id,
        categoryPath: categoryPath,
        images: ['/images/products/sapphire-rx7700xt.jpg'],
        specifications: {
          'GPU': 'AMD Radeon RX 7700 XT',
          'Bellek': '12GB GDDR6',
          'Bellek Hızı': '18Gbps',
          'Bellek Arayüzü': '192-bit',
          'Boost Clock': '2.55 GHz',
          'Stream İşlemcileri': '3456',
          'Soğutma': 'Tri-X Cooling Technology',
          'Aydınlatma': 'ARGB',
          'TDP': '245W'
        },
        isNewProduct: false,
        isPopular: true,
        isActive: true,
        featured: false
      },
      {
        name: 'EVGA GeForce RTX 3090 Ti FTW3 Ultra',
        description: 'EVGA FTW3 Ultra RTX 3090 Ti, önceki neslin en güçlü ekran kartı. iCX3 soğutma teknolojisi ve yüksek hızlı belleğiyle en zorlu uygulamaları çalıştırabilir.',
        price: 29999.99,
        brand: 'EVGA',
        stock: 10,
        category: gpuCategory._id,
        categoryPath: categoryPath,
        images: ['/images/products/evga-rtx3090ti.jpg'],
        specifications: {
          'GPU': 'NVIDIA GeForce RTX 3090 Ti',
          'Bellek': '24GB GDDR6X',
          'Bellek Hızı': '21Gbps',
          'Bellek Arayüzü': '384-bit',
          'Boost Clock': '1.92 GHz',
          'CUDA Çekirdekleri': '10752',
          'RT Çekirdekleri': '84 (2. Nesil)',
          'Tensor Çekirdekleri': '336 (3. Nesil)',
          'TDP': '450W'
        },
        isNewProduct: false,
        isPopular: false,
        isActive: true,
        featured: false
      },
      {
        name: 'PowerColor Red Devil AMD Radeon RX 6950 XT',
        description: 'PowerColor Red Devil RX 6950 XT, RDNA 2 mimarisinin en güçlü versiyonu. Üstün soğutma ve dayanıklı bileşenlerle yüksek performans sunar.',
        price: 23999.99,
        brand: 'PowerColor',
        stock: 15,
        category: gpuCategory._id,
        categoryPath: categoryPath,
        images: ['/images/products/powercolor-rx6950xt.jpg'],
        specifications: {
          'GPU': 'AMD Radeon RX 6950 XT',
          'Bellek': '16GB GDDR6',
          'Bellek Hızı': '18Gbps',
          'Bellek Arayüzü': '256-bit',
          'Boost Clock': '2.31 GHz',
          'Stream İşlemcileri': '5120',
          'Infinity Cache': '128MB',
          'Soğutma': 'Triple Fan Design',
          'TDP': '335W'
        },
        isNewProduct: false,
        isPopular: false,
        isActive: true,
        featured: false
      },
      {
        name: 'ASUS TUF Gaming GeForce RTX 4070 OC',
        description: 'ASUS TUF Gaming ekran kartları dayanıklılık ve performansı bir araya getirir. TUF RTX 4070 modeli uzun ömürlü askeri sınıf komponentler kullanır.',
        price: 19999.99,
        brand: 'ASUS',
        stock: 40,
        category: gpuCategory._id,
        categoryPath: categoryPath,
        images: ['/images/products/asus-tuf-rtx4070.jpg'],
        specifications: {
          'GPU': 'NVIDIA GeForce RTX 4070',
          'Bellek': '12GB GDDR6X',
          'Bellek Hızı': '21Gbps',
          'Bellek Arayüzü': '192-bit',
          'Boost Clock': '2.58 GHz (OC Mode)',
          'CUDA Çekirdekleri': '5888',
          'Soğutma': 'Axial-tech Fan Design',
          'Askeri Sınıf Sertifikasyon': 'TUF Certified',
          'TDP': '200W'
        },
        isNewProduct: false,
        isPopular: true,
        isActive: true,
        featured: false
      },
      {
        name: 'Intel Arc A770 Limited Edition',
        description: 'Intel\'in yüksek performanslı grafik kartı pazarına girişi olan Arc A770, AI destekli ölçeklendirme ve ray tracing özellikleriyle dikkat çeker.',
        price: 14999.99,
        brand: 'Intel',
        stock: 25,
        category: gpuCategory._id,
        categoryPath: categoryPath,
        images: ['/images/products/intel-arc-a770.jpg'],
        specifications: {
          'GPU': 'Intel Arc A770',
          'Bellek': '16GB GDDR6',
          'Bellek Hızı': '17.5Gbps',
          'Bellek Arayüzü': '256-bit',
          'Grafik Frekansı': '2.1 GHz',
          'Xe-core Sayısı': '32',
          'Ray Tracing Birimleri': '32',
          'XMX Motorları': '512',
          'TDP': '225W'
        },
        isNewProduct: true,
        isPopular: false,
        isActive: true,
        featured: true
      },
      {
        name: 'MSI Ventus GeForce RTX 4060 2X OC',
        description: 'MSI Ventus serisi RTX 4060, kompakt boyutu ve çift fanlı soğutma sistemiyle küçük kasalara yönelik, yüksek performanslı bir ekran kartıdır.',
        price: 11999.99,
        brand: 'MSI',
        stock: 60,
        category: gpuCategory._id,
        categoryPath: categoryPath,
        images: ['/images/products/msi-rtx4060.jpg'],
        specifications: {
          'GPU': 'NVIDIA GeForce RTX 4060',
          'Bellek': '8GB GDDR6',
          'Bellek Hızı': '17Gbps',
          'Bellek Arayüzü': '128-bit',
          'Boost Clock': '2.49 GHz',
          'CUDA Çekirdekleri': '3072',
          'Soğutma': 'TORX Fan 4.0',
          'Uzunluk': '199mm',
          'TDP': '115W'
        },
        isNewProduct: false,
        isPopular: true,
        isActive: true,
        featured: false
      },
      {
        name: 'Gigabyte EAGLE Radeon RX 7600',
        description: 'Gigabyte EAGLE serisi RX 7600, ekonomik fiyat/performans dengesi arayanlar için RDNA 3 mimarisini sunan giriş segmenti bir ekran kartıdır.',
        price: 8999.99,
        brand: 'Gigabyte',
        stock: 70,
        category: gpuCategory._id,
        categoryPath: categoryPath,
        images: ['/images/products/gigabyte-rx7600.jpg'],
        specifications: {
          'GPU': 'AMD Radeon RX 7600',
          'Bellek': '8GB GDDR6',
          'Bellek Hızı': '18Gbps',
          'Bellek Arayüzü': '128-bit',
          'Boost Clock': '2.35 GHz',
          'Stream İşlemcileri': '2048',
          'Soğutma': 'WINDFORCE Cooling System',
          'Güç Konektörü': '8-pin',
          'TDP': '165W'
        },
        isNewProduct: false,
        isPopular: true,
        isActive: true,
        featured: false
      },
      {
        name: 'ZOTAC GAMING GeForce RTX 3080 Trinity OC',
        description: 'ZOTAC GAMING Trinity serisi RTX 3080, zarif RGB aydınlatma ve güçlü soğutma performansı sunan, Ampere mimarisinin popüler modelidir.',
        price: 17999.99,
        brand: 'ZOTAC',
        stock: 20,
        category: gpuCategory._id,
        categoryPath: categoryPath,
        images: ['/images/products/zotac-rtx3080.jpg'],
        specifications: {
          'GPU': 'NVIDIA GeForce RTX 3080',
          'Bellek': '10GB GDDR6X',
          'Bellek Hızı': '19Gbps',
          'Bellek Arayüzü': '320-bit',
          'Boost Clock': '1.71 GHz',
          'CUDA Çekirdekleri': '8704',
          'Soğutma': 'IceStorm 2.0',
          'Aydınlatma': 'Spectra 2.0 RGB',
          'TDP': '320W'
        },
        isNewProduct: false,
        isPopular: true,
        isActive: true,
        featured: false
      }
    ];
    
    // Veritabanına ekle
    await Product.insertMany(gpus);
    console.log('15 adet ekran kartı başarıyla eklendi!');
    
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