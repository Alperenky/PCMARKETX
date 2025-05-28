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
          description: 'Bilgisayarınızı daha verimli kullanmanızı sağlayan kulaklıklar, klavyeler, mouseler ve diğer çevre birimleri',
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
    
    // Alt kategori: Kulaklıklar
    let headphonesCategory = await Category.findOne({ slug: 'kulakliklar' });
    
    if (!headphonesCategory) {
      try {
        headphonesCategory = await Category.create({
          name: 'Kulaklıklar',
          description: 'Oyun, müzik ve günlük kullanım için kablolu ve kablosuz kulaklık modelleri',
          image: '/images/categories/kulakliklar-banner.jpg',
          slug: 'kulakliklar',
          parent: peripheralsCategory._id
        });
        console.log('Kulaklıklar alt kategorisi oluşturuldu.');
      } catch (error) {
        if (error.code === 11000) {
          headphonesCategory = await Category.findOne({ slug: 'kulakliklar' });
          // Eğer parent yoksa güncelle
          if (headphonesCategory && !headphonesCategory.parent) {
            headphonesCategory.parent = peripheralsCategory._id;
            await headphonesCategory.save();
            console.log('Mevcut Kulaklıklar kategorisi güncellendi ve ana kategoriye bağlandı.');
          } else {
            console.log('Mevcut Kulaklıklar kategorisi kullanılıyor.');
          }
        } else {
          throw error;
        }
      }
    } else {
      // Eğer parent yoksa güncelle
      if (!headphonesCategory.parent) {
        headphonesCategory.parent = peripheralsCategory._id;
        await headphonesCategory.save();
        console.log('Mevcut Kulaklıklar kategorisi güncellendi ve ana kategoriye bağlandı.');
      } else {
        console.log('Mevcut Kulaklıklar kategorisi kullanılıyor.');
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
        _id: headphonesCategory._id,
        name: headphonesCategory.name,
        slug: headphonesCategory.slug
      }
    ];
    
    // Kulaklıklar eklenmeden önce mevcut ürünleri sil
    await Product.deleteMany({ category: headphonesCategory._id });
    console.log('Mevcut kulaklık ürünleri silindi.');
    
    // Kulaklık ürünlerini ekle
    const headphones = [
      {
        name: 'SteelSeries Arctis Pro Wireless Kulaklık',
        description: 'SteelSeries Arctis Pro Wireless, Hi-Res ses sertifikası, çift kablosuz teknolojisi ve premium yapısıyla oyunculara en üst düzey ses deneyimi sunan bir kulaklık. Yenilikçi baz istasyonu, çift pil sistemi ve çelik başlık bandı ile uzun süreli konfor sağlar.',
        price: 3999.99,
        brand: 'SteelSeries',
        stock: 25,
        category: headphonesCategory._id,
        categoryPath: categoryPath,
        images: ['/images/products/steelseries-arctis-pro-wireless.jpg'],
        specifications: {
          'Kulaklık_Tipi': 'Over-ear (Kulak üstü)',
          'Bağlantı': 'Kablosuz (2.4 GHz + Bluetooth)',
          'Pil_Ömrü': '20 saat (çift pil sistemi)',
          'Frekans_Aralığı': '10–40,000 Hz',
          'Empedans': '32 Ohm',
          'Sürücü': '40mm Neodymium',
          'Mikrofon': 'Çıkarılabilir ClearCast',
          'Aktif_Gürültü_Engelleme': 'Yok',
          'Ses_Formatı': 'Hi-Res Audio, DTS Headphone:X v2.0',
          'Özellikler': 'OLED ekranlı baz istasyonu, Çift pil sistemi, RGB aydınlatma',
          'Ağırlık': '357g',
          'Uyumlu_Platformlar': 'PC, PS4/PS5, Mobile',
          'Renk': 'Siyah',
          'Garanti': '2 yıl'
        },
        isNewProduct: false,
        isPopular: true,
        isActive: true,
        featured: true
      },
      {
        name: 'Logitech G Pro X Wireless LIGHTSPEED Oyuncu Kulaklığı',
        description: 'Logitech G Pro X Wireless LIGHTSPEED, profesyonel e-spor oyuncuları için tasarlanmış yüksek kaliteli kablosuz bir kulaklık. Blue VO!CE mikrofon teknolojisi, LIGHTSPEED kablosuz bağlantısı ve PRO-G 50mm sürücüleri ile kesintisiz bir oyun deneyimi sunar.',
        price: 2499.99,
        brand: 'Logitech',
        stock: 30,
        category: headphonesCategory._id,
        categoryPath: categoryPath,
        images: ['/images/products/logitech-g-pro-x-wireless.jpg'],
        specifications: {
          'Kulaklık_Tipi': 'Over-ear (Kulak üstü)',
          'Bağlantı': 'Kablosuz (LIGHTSPEED 2.4 GHz)',
          'Pil_Ömrü': '20 saat',
          'Frekans_Aralığı': '20–20,000 Hz',
          'Empedans': '35 Ohm',
          'Sürücü': '50mm PRO-G',
          'Mikrofon': 'Ayrılabilir 6mm kardiyoid',
          'Aktif_Gürültü_Engelleme': 'Yok',
          'Ses_Formatı': 'DTS Headphone:X 2.0, 7.1 Surround',
          'Özellikler': 'Blue VO!CE mikrofon teknolojisi, Hafif ve dayanıklı yapı',
          'Ağırlık': '370g',
          'Uyumlu_Platformlar': 'PC, PS4/PS5',
          'Renk': 'Siyah',
          'Garanti': '2 yıl'
        },
        isNewProduct: false,
        isPopular: true,
        isActive: true,
        featured: false
      },
      {
        name: 'HyperX Cloud Alpha Wireless Oyuncu Kulaklığı',
        description: 'HyperX Cloud Alpha Wireless, 300 saate kadar pil ömrü sunan dünyanın en uzun pil ömrüne sahip oyuncu kulaklığı. Çift odacıklı sürücü tasarımı, konforlu hafıza köpüklü kulak pedleri ve yüksek kaliteli ses özellikleriyle öne çıkar.',
        price: 2199.99,
        brand: 'HyperX',
        stock: 35,
        category: headphonesCategory._id,
        categoryPath: categoryPath,
        images: ['/images/products/hyperx-cloud-alpha-wireless.jpg'],
        specifications: {
          'Kulaklık_Tipi': 'Over-ear (Kulak üstü)',
          'Bağlantı': 'Kablosuz (2.4 GHz)',
          'Pil_Ömrü': '300 saat',
          'Frekans_Aralığı': '15–21,000 Hz',
          'Empedans': '62 Ohm',
          'Sürücü': '50mm Çift Odacıklı',
          'Mikrofon': 'Ayrılabilir Gürültü Engelleyici',
          'Aktif_Gürültü_Engelleme': 'Yok',
          'Ses_Formatı': 'DTS Spatial Audio',
          'Özellikler': 'Alüminyum çerçeve, Hafıza köpüklü kulak pedleri',
          'Ağırlık': '335g',
          'Uyumlu_Platformlar': 'PC, PS4/PS5',
          'Renk': 'Kırmızı/Siyah',
          'Garanti': '2 yıl'
        },
        isNewProduct: true,
        isPopular: true,
        isActive: true,
        featured: true
      },
      {
        name: 'Razer BlackShark V2 Pro Kablosuz Oyuncu Kulaklığı',
        description: 'Razer BlackShark V2 Pro, e-spor oyuncuları için geliştirilmiş premium kablosuz bir kulaklık. Titanyum kaplı 50mm sürücüler, ultra yumuşak hafıza köpüklü kulak yastıkları ve gelişmiş mikrofon teknolojisiyle benzersiz bir ses deneyimi sunar.',
        price: 1999.99,
        brand: 'Razer',
        stock: 20,
        category: headphonesCategory._id,
        categoryPath: categoryPath,
        images: ['/images/products/razer-blackshark-v2-pro.jpg'],
        specifications: {
          'Kulaklık_Tipi': 'Over-ear (Kulak üstü)',
          'Bağlantı': 'Kablosuz (2.4 GHz), 3.5mm kablolu',
          'Pil_Ömrü': '24 saat',
          'Frekans_Aralığı': '12–28,000 Hz',
          'Empedans': '32 Ohm',
          'Sürücü': '50mm Razer TriForce Titanyum',
          'Mikrofon': 'Razer HyperClear Supercardioid çıkarılabilir',
          'Aktif_Gürültü_Engelleme': 'Pasif gürültü izolasyonu',
          'Ses_Formatı': 'THX Spatial Audio',
          'Özellikler': 'Ultra yumuşak hafıza köpüklü kulak yastıkları, Hafif tasarım',
          'Ağırlık': '320g',
          'Uyumlu_Platformlar': 'PC, PS4/PS5, Mobile',
          'Renk': 'Siyah',
          'Garanti': '2 yıl'
        },
        isNewProduct: false,
        isPopular: true,
        isActive: true,
        featured: false
      },
      {
        name: 'Corsair Virtuoso RGB Wireless SE Hi-Fi Oyuncu Kulaklığı',
        description: 'Corsair Virtuoso RGB Wireless SE, lüks konfor ve premium ses kalitesi sunan yüksek performanslı bir gaming kulaklık. Alüminyum yapısı, Hi-Fi ses kalitesi ve mikrofonu ile oyun, müzik ve iletişim için mükemmel bir çözüm.',
        price: 2799.99,
        brand: 'Corsair',
        stock: 15,
        category: headphonesCategory._id,
        categoryPath: categoryPath,
        images: ['/images/products/corsair-virtuoso-rgb-wireless-se.jpg'],
        specifications: {
          'Kulaklık_Tipi': 'Over-ear (Kulak üstü)',
          'Bağlantı': 'Kablosuz (Slipstream), Bluetooth, USB, 3.5mm',
          'Pil_Ömrü': '20 saat',
          'Frekans_Aralığı': '20–40,000 Hz',
          'Empedans': '32 Ohm',
          'Sürücü': '50mm Neodymium',
          'Mikrofon': 'Çıkarılabilir Broadcast-Grade',
          'Aktif_Gürültü_Engelleme': 'Yok',
          'Ses_Formatı': '7.1 Surround Sound',
          'Özellikler': 'RGB aydınlatma, Premium alüminyum yapı',
          'Ağırlık': '360g',
          'Uyumlu_Platformlar': 'PC, PS4/PS5, Xbox, Mobile',
          'Renk': 'Espresso (Gunmetal)',
          'Garanti': '2 yıl'
        },
        isNewProduct: true,
        isPopular: false,
        isActive: true,
        featured: false
      },
      {
        name: 'Sony WH-1000XM5 Kablosuz Gürültü Engelleyici Kulaklık',
        description: 'Sony WH-1000XM5, en gelişmiş gürültü engelleme teknolojisine sahip premium kablosuz kulaklık. 8 mikrofon ve 2 işlemci ile olağanüstü ses kalitesi sunan bu kulaklık, 30 saate kadar pil ömrü ve konforlu tasarımıyla öne çıkar.',
        price: 4999.99,
        brand: 'Sony',
        stock: 40,
        category: headphonesCategory._id,
        categoryPath: categoryPath,
        images: ['/images/products/sony-wh-1000xm5.jpg'],
        specifications: {
          'Kulaklık_Tipi': 'Over-ear (Kulak üstü)',
          'Bağlantı': 'Bluetooth 5.2, 3.5mm kablolu',
          'Pil_Ömrü': '30 saat (ANC açık)',
          'Frekans_Aralığı': '4–40,000 Hz',
          'Empedans': '48 Ohm',
          'Sürücü': '30mm Carbon Fiber',
          'Mikrofon': 'Entegre 8 mikrofon sistemi',
          'Aktif_Gürültü_Engelleme': 'Var (Endüstri lideri)',
          'Ses_Formatı': 'LDAC, Hi-Res Audio',
          'Özellikler': 'Dokunmatik kontroller, Hızlı şarj, Konuşma algılama',
          'Ağırlık': '250g',
          'Uyumlu_Platformlar': 'Tüm Bluetooth cihazları',
          'Renk': 'Siyah, Gümüş',
          'Garanti': '2 yıl'
        },
        isNewProduct: false,
        isPopular: true,
        isActive: true,
        featured: true
      },
      {
        name: 'Apple AirPods Max',
        description: 'Apple AirPods Max, üstün ses kalitesi ve aktif gürültü engelleme özelliğiyle premium bir kulaklık deneyimi sunar. Özel tasarlanmış dinamik sürücü, H1 yongası ve şık alüminyum tasarımı ile Apple ekosistemindeki en üst düzey kulaklık.',
        price: 7999.99,
        brand: 'Apple',
        stock: 10,
        category: headphonesCategory._id,
        categoryPath: categoryPath,
        images: ['/images/products/apple-airpods-max.jpg'],
        specifications: {
          'Kulaklık_Tipi': 'Over-ear (Kulak üstü)',
          'Bağlantı': 'Bluetooth 5.0',
          'Pil_Ömrü': '20 saat (ANC açık)',
          'Frekans_Aralığı': '20-20,000 Hz',
          'Sürücü': '40mm Apple özel dinamik sürücü',
          'Mikrofon': '9 mikrofon sistemi (8 ANC, 3 ses algılama)',
          'Aktif_Gürültü_Engelleme': 'Var (Adaptif ANC)',
          'Ses_Formatı': 'Spatial Audio, Dolby Atmos desteği',
          'Özellikler': 'Digital Crown kontrol, Konum algılama, Otomatik eşleşme',
          'Ağırlık': '384g',
          'Uyumlu_Platformlar': 'iOS, macOS, iPadOS (sınırlı Android desteği)',
          'Renk': 'Uzay Grisi, Gümüş, Gökyüzü Mavisi, Yeşil, Pembe',
          'Garanti': '2 yıl'
        },
        isNewProduct: false,
        isPopular: false,
        isActive: true,
        featured: false
      },
      {
        name: 'Sennheiser HD 660S Referans Kulaklık',
        description: 'Sennheiser HD 660S, ses profesyonelleri ve audiophile kullanıcılar için tasarlanmış açık arka planlı referans kulaklık. Yüksek çözünürlüklü, detaylı ses profili ve konforlu yapısıyla uzun süreli kullanımlar için ideal.',
        price: 4499.99,
        brand: 'Sennheiser',
        stock: 15,
        category: headphonesCategory._id,
        categoryPath: categoryPath,
        images: ['/images/products/sennheiser-hd-660s.jpg'],
        specifications: {
          'Kulaklık_Tipi': 'Over-ear (Kulak üstü), Açık Arka',
          'Bağlantı': 'Kablolu (6.35mm, 4.4mm Pentaconn)',
          'Frekans_Aralığı': '10–41,000 Hz',
          'Empedans': '150 Ohm',
          'Sürücü': '42mm dinamik',
          'Mikrofon': 'Yok',
          'Aktif_Gürültü_Engelleme': 'Yok (Açık arka tasarım)',
          'Ses_Formatı': 'Stereo, Hi-Fi',
          'Özellikler': 'Kadife kulak pedleri, çıkarılabilir kablo',
          'Ağırlık': '260g',
          'Uyumlu_Platformlar': 'Tüm 6.35mm/3.5mm jaklı cihazlar (adaptör dahil)',
          'Renk': 'Siyah/Antrasit',
          'Garanti': '2 yıl'
        },
        isNewProduct: false,
        isPopular: false,
        isActive: true,
        featured: false
      },
      {
        name: 'JBL Quantum 800 Kablosuz Oyuncu Kulaklığı',
        description: 'JBL Quantum 800, aktif gürültü engelleme ve JBL QuantumSOUND imzalı ses kalitesiyle donatılmış bir kablosuz oyuncu kulaklığı. RGB aydınlatma, hafıza köpüklü kulak pedleri ve flip-up boom mikrofon özelliklerine sahiptir.',
        price: 1799.99,
        brand: 'JBL',
        stock: 25,
        category: headphonesCategory._id,
        categoryPath: categoryPath,
        images: ['/images/products/jbl-quantum-800.jpg'],
        specifications: {
          'Kulaklık_Tipi': 'Over-ear (Kulak üstü)',
          'Bağlantı': 'Kablosuz (2.4 GHz), Bluetooth 5.0, 3.5mm',
          'Pil_Ömrü': '14 saat (RGB ve ANC kapalı)',
          'Frekans_Aralığı': '20–40,000 Hz',
          'Sürücü': '50mm dinamik',
          'Mikrofon': 'Boom, Ses gürültü engelleme',
          'Aktif_Gürültü_Engelleme': 'Var',
          'Ses_Formatı': 'JBL QuantumSURROUND, DTS Headphone:X 2.0',
          'Özellikler': 'RGB aydınlatma, Hafıza köpüklü kulak pedleri',
          'Ağırlık': '410g',
          'Uyumlu_Platformlar': 'PC, PS4/PS5, Xbox, Mobile',
          'Renk': 'Siyah',
          'Garanti': '2 yıl'
        },
        isNewProduct: true,
        isPopular: true,
        isActive: true,
        featured: false
      },
      {
        name: 'ASUS ROG Delta S Oyuncu Kulaklığı',
        description: 'ASUS ROG Delta S, MQA desteği ve AI Noise-Cancelling mikrofonuyla donatılmış bir USB-C oyuncu kulaklığı. Quad-DAC teknolojisi, ergonomik D şekilli kulak pedleri ve RGB aydınlatma ile modern oyuncular için tasarlanmıştır.',
        price: 1599.99,
        brand: 'ASUS',
        stock: 30,
        category: headphonesCategory._id,
        categoryPath: categoryPath,
        images: ['/images/products/asus-rog-delta-s.jpg'],
        specifications: {
          'Kulaklık_Tipi': 'Over-ear (Kulak üstü)',
          'Bağlantı': 'USB-C, USB-A (adaptör dahil)',
          'Frekans_Aralığı': '20–40,000 Hz',
          'Empedans': '32 Ohm',
          'Sürücü': '50mm ASUS Essence',
          'Mikrofon': 'Ayrılabilir, AI Noise-Cancelling',
          'Aktif_Gürültü_Engelleme': 'Yok (mikrofonda var)',
          'Ses_Formatı': 'MQA Renderer, 7.1 Surround',
          'Özellikler': 'Quad-DAC teknolojisi, AURA Sync RGB, Hafif tasarım',
          'Ağırlık': '300g',
          'Uyumlu_Platformlar': 'PC, PS4/PS5, Nintendo Switch, Mobile',
          'Renk': 'Beyaz/Siyah',
          'Garanti': '2 yıl'
        },
        isNewProduct: false,
        isPopular: false,
        isActive: true,
        featured: false
      }
    ];
    
    // Veritabanına ekle
    await Product.insertMany(headphones);
    console.log('10 adet kulaklık başarıyla eklendi!');
    
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