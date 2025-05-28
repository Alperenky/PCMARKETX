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
    
    // Alt kategori: Soğutma Sistemleri
    let coolingCategory = await Category.findOne({ slug: 'sogutma-sistemleri' });
    
    if (!coolingCategory) {
      try {
        coolingCategory = await Category.create({
          name: 'Soğutma Sistemleri',
          description: 'Hava ve sıvı soğutma çözümleri, fanlar, radyatörler ve soğutma aksesuarları',
          image: '/images/categories/sogutma-sistemleri-banner.jpg',
          slug: 'sogutma-sistemleri',
          parent: computerPartsCategory._id
        });
        console.log('Soğutma Sistemleri alt kategorisi oluşturuldu.');
      } catch (error) {
        if (error.code === 11000) {
          coolingCategory = await Category.findOne({ name: 'Soğutma Sistemleri' });
          // Eğer parent yoksa güncelle
          if (coolingCategory && !coolingCategory.parent) {
            coolingCategory.parent = computerPartsCategory._id;
            await coolingCategory.save();
            console.log('Mevcut Soğutma Sistemleri kategorisi güncellendi ve ana kategoriye bağlandı.');
          } else {
            console.log('Mevcut Soğutma Sistemleri kategorisi kullanılıyor.');
          }
        } else {
          throw error;
        }
      }
    } else {
      // Eğer parent yoksa güncelle
      if (!coolingCategory.parent) {
        coolingCategory.parent = computerPartsCategory._id;
        await coolingCategory.save();
        console.log('Mevcut Soğutma Sistemleri kategorisi güncellendi ve ana kategoriye bağlandı.');
      } else {
        console.log('Mevcut Soğutma Sistemleri kategorisi kullanılıyor.');
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
        _id: coolingCategory._id,
        name: coolingCategory.name,
        slug: coolingCategory.slug
      }
    ];
    
    // Soğutma Sistemleri eklenmeden önce mevcut ürünleri sil
    await Product.deleteMany({ category: coolingCategory._id });
    console.log('Mevcut soğutma sistemleri ürünleri silindi.');
    
    // Soğutma sistemleri ürünlerini ekle
    const coolingProducts = [
      {
        name: 'Noctua NH-D15 Çift Kule CPU Soğutucu',
        description: 'Noctua NH-D15, sessiz çalışma ve üstün soğutma performansı sunan premium çift kule işlemci soğutucusu. İki adet yüksek kaliteli NF-A15 PWM fanı ve altı ısı borusu tasarımı ile hava soğutmalı soğutucuların en iyilerinden biri.',
        price: 1999.99,
        brand: 'Noctua',
        stock: 30,
        category: coolingCategory._id,
        categoryPath: categoryPath,
        images: ['/images/products/noctua-nh-d15.jpg'],
        specifications: {
          'Soğutucu_Tipi': 'Hava Soğutma (Çift Kule)',
          'Soket_Uyumluluğu': 'Intel LGA1700, LGA1200, LGA115x, LGA2066, AMD AM4, AM5',
          'Boyutlar': '165mm x 150mm x 161mm',
          'Ağırlık': '1320g (Fanlar dahil)',
          'Fan_Boyutu': '2x 140mm NF-A15 PWM',
          'Fan_Hızı': '300-1500 RPM',
          'Hava_Akışı': '140.2 m³/h',
          'Gürültü_Seviyesi': '24.6 dBA',
          'Isı_Borusu': '6x Isı Borusu',
          'TDP_Derecesi': '220W+',
          'Radyatör_Malzemesi': 'Alüminyum Kanatlar, Bakır Taban',
          'Termal_Macun': 'NT-H1 (Dahil)',
          'Garanti': '6 yıl'
        },
        isNewProduct: false,
        isPopular: true,
        isActive: true,
        featured: true
      },
      {
        name: 'Corsair iCUE H150i ELITE CAPELLIX Sıvı Soğutucu',
        description: 'Corsair iCUE H150i ELITE CAPELLIX, 360mm radyatörlü, yüksek performanslı RGB aydınlatmalı All-in-One (AIO) sıvı soğutucu. Parlak CAPELLIX LED\'ler, güçlü ML120 RGB fanlar ve yeni iCUE COMMANDER CORE kontrolcü ile donatılmıştır.',
        price: 2499.99,
        brand: 'Corsair',
        stock: 25,
        category: coolingCategory._id,
        categoryPath: categoryPath,
        images: ['/images/products/corsair-h150i-elite-capellix.jpg'],
        specifications: {
          'Soğutucu_Tipi': 'All-in-One Sıvı Soğutma',
          'Radyatör_Boyutu': '360mm',
          'Soket_Uyumluluğu': 'Intel LGA1700, LGA1200, LGA115x, LGA2066, AMD AM4, AM5',
          'Pompa_Başlığı': 'Bakır Soğutma Plakası, 33 CAPELLIX LED',
          'Fan_Tipi': '3x ML120 RGB PWM',
          'Fan_Hızı': '400-2400 RPM',
          'Statik_Basınç': '4.2 mmH₂O',
          'Hava_Akışı': '75 CFM',
          'Gürültü_Seviyesi': '10-36 dBA',
          'Kontrol': 'iCUE COMMANDER CORE (Dahil)',
          'Pompa_Hızı': '2400 RPM',
          'RGB': 'Evet, iCUE uyumlu',
          'Garanti': '5 yıl'
        },
        isNewProduct: true,
        isPopular: true,
        isActive: true,
        featured: true
      },
      {
        name: 'be quiet! Dark Rock Pro 4 CPU Soğutucu',
        description: 'be quiet! Dark Rock Pro 4, sessiz çalışma ve güçlü soğutma performansı sunan bir premium çift kule işlemci soğutucusu. Siyah kaplama, SilentWings fanlar ve gelişmiş montaj mekanizması ile öne çıkar.',
        price: 1799.99,
        brand: 'be quiet!',
        stock: 35,
        category: coolingCategory._id,
        categoryPath: categoryPath,
        images: ['/images/products/bequiet-darkrock-pro4.jpg'],
        specifications: {
          'Soğutucu_Tipi': 'Hava Soğutma (Çift Kule)',
          'Soket_Uyumluluğu': 'Intel LGA1700, LGA1200, LGA115x, LGA2066, AMD AM4, AM5',
          'Boyutlar': '145.7mm x 136mm x 162.8mm',
          'Ağırlık': '1130g',
          'Fan_Boyutu': '1x 120mm + 1x 135mm SilentWings',
          'Fan_Hızı': '1200-1500 RPM',
          'Hava_Akışı': '67.8 CFM (Maks)',
          'Gürültü_Seviyesi': '24.3 dBA',
          'Isı_Borusu': '7x Isı Borusu',
          'TDP_Derecesi': '250W',
          'Radyatör_Malzemesi': 'Alüminyum Kanatlar, Bakır Taban',
          'Kaplama': 'Siyah Nikel Kaplama',
          'Garanti': '3 yıl'
        },
        isNewProduct: false,
        isPopular: true,
        isActive: true,
        featured: false
      },
      {
        name: 'NZXT Kraken X73 RGB 360mm Sıvı Soğutucu',
        description: 'NZXT Kraken X73 RGB, 360mm radyatörlü, şık Infinity Mirror tasarımlı ve NZXT RGB fanlar ile donatılmış premium sıvı soğutucu. Asetek pompa teknolojisi ve kolaylaştırılmış kurulum ile dikkat çekiyor.',
        price: 2299.99,
        brand: 'NZXT',
        stock: 20,
        category: coolingCategory._id,
        categoryPath: categoryPath,
        images: ['/images/products/nzxt-kraken-x73-rgb.jpg'],
        specifications: {
          'Soğutucu_Tipi': 'All-in-One Sıvı Soğutma',
          'Radyatör_Boyutu': '360mm',
          'Soket_Uyumluluğu': 'Intel LGA1700, LGA1200, LGA115x, LGA2066, AMD AM4, AM5',
          'Pompa_Başlığı': 'Infinity Mirror, NZXT Logo RGB, Bakır Soğutma Plakası',
          'Fan_Tipi': '3x NZXT AER RGB 2 120mm',
          'Fan_Hızı': '500-1800 RPM',
          'Statik_Basınç': '2.93 mmH₂O',
          'Hava_Akışı': '73.11 CFM',
          'Gürültü_Seviyesi': '21-38 dBA',
          'Kontrol': 'CAM Yazılımı',
          'Pompa_Hızı': '800-2800 RPM',
          'RGB': 'Evet, CAM uyumlu',
          'Garanti': '6 yıl'
        },
        isNewProduct: true,
        isPopular: true,
        isActive: true,
        featured: false
      },
      {
        name: 'Arctic Freezer 34 eSports DUO CPU Soğutucu',
        description: 'Arctic Freezer 34 eSports DUO, çift fanlı, yüksek performanslı ve uygun fiyatlı bir işlemci soğutucusu. BioniX P fanları, şık renkli tasarımı ve kolay montaj özelliği ile öne çıkar.',
        price: 799.99,
        brand: 'Arctic',
        stock: 40,
        category: coolingCategory._id,
        categoryPath: categoryPath,
        images: ['/images/products/arctic-freezer34-esports-duo.jpg'],
        specifications: {
          'Soğutucu_Tipi': 'Hava Soğutma (Tek Kule)',
          'Soket_Uyumluluğu': 'Intel LGA1700, LGA1200, LGA115x, AMD AM4, AM5',
          'Boyutlar': '124mm x 103mm x 157mm',
          'Ağırlık': '764g',
          'Fan_Boyutu': '2x 120mm BioniX P',
          'Fan_Hızı': '200-2100 RPM',
          'Hava_Akışı': '68.8 CFM',
          'Gürültü_Seviyesi': '0.5-28 dBA',
          'Isı_Borusu': '4x Isı Borusu',
          'TDP_Derecesi': '210W',
          'Radyatör_Malzemesi': 'Alüminyum Kanatlar, Bakır Taban',
          'Renk_Seçenekleri': 'Kırmızı, Beyaz, Yeşil, Sarı',
          'Garanti': '6 yıl'
        },
        isNewProduct: false,
        isPopular: true,
        isActive: true,
        featured: false
      },
      {
        name: 'Thermaltake ToughLiquid Ultra 360 ARGB Sıvı Soğutucu',
        description: 'Thermaltake ToughLiquid Ultra 360, 2.1" LCD ekranlı, yüksek performanslı 360mm radyatörlü sıvı soğutucu. Yeni nesil ARGB TOUGFAN 12 fanlar ve özelleştirilebilir LCD ekran ile benzersiz bir deneyim sunar.',
        price: 2799.99,
        brand: 'Thermaltake',
        stock: 15,
        category: coolingCategory._id,
        categoryPath: categoryPath,
        images: ['/images/products/thermaltake-toughliquid-ultra-360.jpg'],
        specifications: {
          'Soğutucu_Tipi': 'All-in-One Sıvı Soğutma',
          'Radyatör_Boyutu': '360mm',
          'Soket_Uyumluluğu': 'Intel LGA1700, LGA1200, LGA115x, LGA2066, AMD AM4, AM5',
          'Pompa_Başlığı': '2.1" LCD Ekran, Bakır Soğutma Plakası',
          'Fan_Tipi': '3x TOUGFAN 12 ARGB',
          'Fan_Hızı': '500-2000 RPM',
          'Statik_Basınç': '3.78 mmH₂O',
          'Hava_Akışı': '72.69 CFM',
          'Gürültü_Seviyesi': '22.3-33.2 dBA',
          'Kontrol': 'TT RGB Plus 2.0 Software',
          'Pompa_Hızı': '3600 RPM',
          'Ekran': '2.1" LCD (480x480 çözünürlük)',
          'RGB': 'Evet, ARGB Sync uyumlu',
          'Garanti': '5 yıl'
        },
        isNewProduct: true,
        isPopular: false,
        isActive: true,
        featured: true
      },
      {
        name: 'Cooler Master MasterLiquid ML240L V2 RGB Sıvı Soğutucu',
        description: 'Cooler Master MasterLiquid ML240L V2 RGB, 240mm radyatörlü, dual chamber pompası ve ARGB fanları ile bütçe dostu bir sıvı soğutucu. Yeni nesil soğutma plakası tasarımı, üçüncü nesil dual chamber pompası ile etkileyici soğutma performansı sunar.',
        price: 1199.99,
        brand: 'Cooler Master',
        stock: 45,
        category: coolingCategory._id,
        categoryPath: categoryPath,
        images: ['/images/products/coolermaster-ml240l-v2.jpg'],
        specifications: {
          'Soğutucu_Tipi': 'All-in-One Sıvı Soğutma',
          'Radyatör_Boyutu': '240mm',
          'Soket_Uyumluluğu': 'Intel LGA1700, LGA1200, LGA115x, LGA2066, AMD AM4, AM5',
          'Pompa_Başlığı': 'ARGB Aydınlatma, Gen 3 Dual Chamber',
          'Fan_Tipi': '2x SickleFlow 120 ARGB',
          'Fan_Hızı': '650-1800 RPM',
          'Statik_Basınç': '2.5 mmH₂O',
          'Hava_Akışı': '62 CFM',
          'Gürültü_Seviyesi': '8-27 dBA',
          'Pompa_Hızı': '2400 RPM',
          'Radyatör_Malzemesi': 'Alüminyum',
          'RGB': 'Evet, anakart senkronizasyonu destekli',
          'Garanti': '2 yıl'
        },
        isNewProduct: false,
        isPopular: true,
        isActive: true,
        featured: false
      },
      {
        name: 'Deepcool AK620 CPU Soğutucu',
        description: 'Deepcool AK620, uygun fiyatlı ancak premium performans sunan çift kuleli bir işlemci soğutucusu. Altı ısı borusu, çift fan tasarımı ve şık görünümü ile güçlü sistemler için ideal bir tercih.',
        price: 899.99,
        brand: 'Deepcool',
        stock: 50,
        category: coolingCategory._id,
        categoryPath: categoryPath,
        images: ['/images/products/deepcool-ak620.jpg'],
        specifications: {
          'Soğutucu_Tipi': 'Hava Soğutma (Çift Kule)',
          'Soket_Uyumluluğu': 'Intel LGA1700, LGA1200, LGA115x, LGA2066, AMD AM4, AM5',
          'Boyutlar': '129mm x 138mm x 160mm',
          'Ağırlık': '1020g',
          'Fan_Boyutu': '2x 120mm FK120',
          'Fan_Hızı': '500-1850 RPM',
          'Hava_Akışı': '68.99 CFM',
          'Gürültü_Seviyesi': '28 dBA',
          'Isı_Borusu': '6x Isı Borusu',
          'TDP_Derecesi': '260W',
          'Radyatör_Malzemesi': 'Alüminyum Kanatlar, Nikel Kaplı Bakır Taban',
          'Garanti': '3 yıl'
        },
        isNewProduct: false,
        isPopular: false,
        isActive: true,
        featured: false
      },
      {
        name: 'Lian Li Galahad AIO 240 RGB Sıvı Soğutucu',
        description: 'Lian Li Galahad AIO 240, zarif tasarım, yüksek performans ve göz alıcı ARGB aydınlatma sunan bir sıvı soğutucu. Benzersiz pompa başlığı tasarımı ve yüksek kaliteli bileşenleriyle öne çıkıyor.',
        price: 1499.99,
        brand: 'Lian Li',
        stock: 30,
        category: coolingCategory._id,
        categoryPath: categoryPath,
        images: ['/images/products/lianli-galahad-240.jpg'],
        specifications: {
          'Soğutucu_Tipi': 'All-in-One Sıvı Soğutma',
          'Radyatör_Boyutu': '240mm',
          'Soket_Uyumluluğu': 'Intel LGA1700, LGA1200, LGA115x, LGA2066, AMD AM4, AM5',
          'Pompa_Başlığı': 'Dönebilen Infinity Mirror tasarımı',
          'Fan_Tipi': '2x Lian Li ST120 PWM ARGB',
          'Fan_Hızı': '800-1900 RPM',
          'Statik_Basınç': '2.6 mmH₂O',
          'Hava_Akışı': '69.17 CFM',
          'Gürültü_Seviyesi': '17-31 dBA',
          'Pompa_Hızı': '2500 RPM',
          'Radyatör_Malzemesi': 'Alüminyum',
          'RGB': 'Evet, adreslenebilir RGB (L-Connect uyumlu)',
          'Renk_Seçenekleri': 'Beyaz, Siyah',
          'Garanti': '5 yıl'
        },
        isNewProduct: true,
        isPopular: true,
        isActive: true,
        featured: false
      },
      {
        name: 'Arctic P12 PWM PST 5\'li Fan Paketi',
        description: 'Arctic P12 PWM PST, uygun fiyatlı ancak yüksek performanslı 120mm fanların 5\'li paketi. Daisy chain bağlantısı, yüksek statik basınç ve sessiz çalışma sunan fanlar, radyatör ve kasa kullanımı için idealdir.',
        price: 449.99,
        brand: 'Arctic',
        stock: 60,
        category: coolingCategory._id,
        categoryPath: categoryPath,
        images: ['/images/products/arctic-p12-pwm-pst-5pack.jpg'],
        specifications: {
          'Fan_Tipi': '120mm PWM PST (Basınç Optimize)',
          'Fan_Boyutu': '120mm x 120mm x 25mm',
          'Fan_Hızı': '200-1800 RPM',
          'Kontrol': 'PWM (4-pin)',
          'Bağlantı': 'PST (PWM Sharing Technology)',
          'Hava_Akışı': '56.3 CFM',
          'Statik_Basınç': '2.2 mmH₂O',
          'Gürültü_Seviyesi': '0.3-22.5 dBA',
          'Yatak_Tipi': 'Fluid Dynamic Bearing',
          'MTBF': '>40,000 saat',
          'Kablo_Uzunluğu': '40cm',
          'Renk': 'Siyah',
          'Garanti': '6 yıl'
        },
        isNewProduct: false,
        isPopular: true,
        isActive: true,
        featured: false
      }
    ];
    
    // Veritabanına ekle
    await Product.insertMany(coolingProducts);
    console.log('10 adet soğutma sistemi başarıyla eklendi!');
    
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