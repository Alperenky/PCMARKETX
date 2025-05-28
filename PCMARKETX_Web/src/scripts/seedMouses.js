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
    
    // Alt kategori: Mouse
    let mouseCategory = await Category.findOne({ slug: 'mouse' });
    
    if (!mouseCategory) {
      try {
        mouseCategory = await Category.create({
          name: 'Mouse',
          description: 'Oyun, ofis ve günlük kullanım için kablolu ve kablosuz fare modelleri',
          image: '/images/categories/mouse-banner.jpg',
          slug: 'mouse',
          parent: peripheralsCategory._id
        });
        console.log('Mouse alt kategorisi oluşturuldu.');
      } catch (error) {
        if (error.code === 11000) {
          mouseCategory = await Category.findOne({ slug: 'mouse' });
          // Eğer parent yoksa güncelle
          if (mouseCategory && !mouseCategory.parent) {
            mouseCategory.parent = peripheralsCategory._id;
            await mouseCategory.save();
            console.log('Mevcut Mouse kategorisi güncellendi ve ana kategoriye bağlandı.');
          } else {
            console.log('Mevcut Mouse kategorisi kullanılıyor.');
          }
        } else {
          throw error;
        }
      }
    } else {
      // Eğer parent yoksa güncelle
      if (!mouseCategory.parent) {
        mouseCategory.parent = peripheralsCategory._id;
        await mouseCategory.save();
        console.log('Mevcut Mouse kategorisi güncellendi ve ana kategoriye bağlandı.');
      } else {
        console.log('Mevcut Mouse kategorisi kullanılıyor.');
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
        _id: mouseCategory._id,
        name: mouseCategory.name,
        slug: mouseCategory.slug
      }
    ];
    
    // Mouse ürünleri eklenmeden önce mevcut ürünleri sil
    await Product.deleteMany({ category: mouseCategory._id });
    console.log('Mevcut mouse ürünleri silindi.');
    
    // Mouse ürünlerini ekle
    const mouses = [
      {
        name: 'Logitech G Pro X Superlight Kablosuz Gaming Mouse',
        description: 'Logitech G Pro X Superlight, sadece 63 gram ağırlığıyla performans odaklı oyuncular için tasarlanmış ultra hafif bir kablosuz oyun faresi. HERO 25K sensör, Powerplay uyumluluğu ve 70 saate kadar pil ömrü sunar.',
        price: 1899.99,
        brand: 'Logitech',
        stock: 50,
        category: mouseCategory._id,
        categoryPath: categoryPath,
        images: ['/images/products/logitech-g-pro-x-superlight.jpg'],
        specifications: {
          'Bağlantı': 'LIGHTSPEED Kablosuz',
          'Sensör': 'HERO 25K',
          'Maksimum_DPI': '25,600',
          'Hız': '400+ IPS',
          'İvme': '40G',
          'Tuş_Sayısı': '5',
          'Tuş_Programlama': 'Evet (G HUB)',
          'Polling_Rate': '1000Hz (1ms)',
          'Pil_Ömrü': '70 saat',
          'Ağırlık': '63g',
          'Boyutlar': '125mm x 63.5mm x 40mm',
          'Kablo': 'USB-A to USB-C, 1.8m',
          'RGB': 'Yok',
          'Malzeme': 'Plastik, PTFE ayaklar',
          'Renk': 'Siyah, Beyaz',
          'Uyumluluk': 'Windows, macOS, Linux',
          'Garanti': '2 yıl'
        },
        isNewProduct: false,
        isPopular: true,
        isActive: true,
        featured: true
      },
      {
        name: 'Razer DeathAdder V3 Pro Kablosuz Gaming Mouse',
        description: 'Razer DeathAdder V3 Pro, ergonomik tasarımı, 90 saat pil ömrü ve 30.000 DPI Focus Pro sensörüyle oyun deneyiminizi yükseltecek ultra hafif bir kablosuz fare. Gen-3 optik anahtarlar ve HyperSpeed kablosuz teknolojisi ile donatılmıştır.',
        price: 1799.99,
        brand: 'Razer',
        stock: 40,
        category: mouseCategory._id,
        categoryPath: categoryPath,
        images: ['/images/products/razer-deathadder-v3-pro.jpg'],
        specifications: {
          'Bağlantı': 'Razer HyperSpeed Kablosuz, USB-C kablolu',
          'Sensör': 'Focus Pro 30K Optik',
          'Maksimum_DPI': '30,000',
          'Hız': '750 IPS',
          'İvme': '70G',
          'Tuş_Sayısı': '5',
          'Tuş_Programlama': 'Evet (Razer Synapse)',
          'Polling_Rate': '1000Hz (4000Hz HyperPolling ile)',
          'Pil_Ömrü': '90 saat',
          'Ağırlık': '64g',
          'Boyutlar': '128mm x 68mm x 44mm',
          'Kablo': 'Speedflex USB-C, 1.8m',
          'RGB': 'Yok',
          'Malzeme': 'Plastik, PTFE ayaklar',
          'Renk': 'Siyah, Beyaz',
          'Uyumluluk': 'Windows',
          'Garanti': '2 yıl'
        },
        isNewProduct: true,
        isPopular: true,
        isActive: true,
        featured: true
      },
      {
        name: 'SteelSeries Aerox 5 Wireless Gaming Mouse',
        description: 'SteelSeries Aerox 5 Wireless, bal peteği tasarım ile sadece 74 gram ağırlığa sahip kablosuz oyun faresi. 9 adet programlanabilir tuş, RGB aydınlatma ve çift kablosuz bağlantı seçeneği ile maksimum esneklik sunar.',
        price: 1499.99,
        brand: 'SteelSeries',
        stock: 35,
        category: mouseCategory._id,
        categoryPath: categoryPath,
        images: ['/images/products/steelseries-aerox-5-wireless.jpg'],
        specifications: {
          'Bağlantı': 'Quantum 2.0 Kablosuz, Bluetooth 5.0, USB-C kablolu',
          'Sensör': 'TrueMove Air Optik',
          'Maksimum_DPI': '18,000',
          'Hız': '400 IPS',
          'İvme': '40G',
          'Tuş_Sayısı': '9',
          'Tuş_Programlama': 'Evet (SteelSeries GG)',
          'Polling_Rate': '1000Hz',
          'Pil_Ömrü': '180 saat',
          'Ağırlık': '74g',
          'Boyutlar': '128.8mm x 68.2mm x 42.4mm',
          'Kablo': 'USB-C Super Mesh, 2m',
          'RGB': 'PrismSync RGB (3 bölge)',
          'Malzeme': 'ABS Plastik, PTFE ayaklar',
          'Özellikler': 'IP54 su ve toz direnci',
          'Renk': 'Siyah',
          'Garanti': '2 yıl'
        },
        isNewProduct: false,
        isPopular: true,
        isActive: true,
        featured: false
      },
      {
        name: 'Glorious Model O Wireless Gaming Mouse',
        description: 'Glorious Model O Wireless, bal peteği tasarımı ile sadece 69 gram ağırlığa sahip kablosuz bir oyun faresi. BAMF sensörü, RGB aydınlatma ve G-Skate ayaklarıyla hem performans hem de estetik açıdan üst düzey bir deneyim sunar.',
        price: 999.99,
        brand: 'Glorious',
        stock: 45,
        category: mouseCategory._id,
        categoryPath: categoryPath,
        images: ['/images/products/glorious-model-o-wireless.jpg'],
        specifications: {
          'Bağlantı': 'Kablosuz (2.4 GHz), USB-C kablolu',
          'Sensör': 'BAMF Optik',
          'Maksimum_DPI': '19,000',
          'Hız': '400 IPS',
          'İvme': '50G',
          'Tuş_Sayısı': '6',
          'Tuş_Programlama': 'Evet (Glorious Core)',
          'Polling_Rate': '1000Hz',
          'Pil_Ömrü': '71 saat (RGB kapalı)',
          'Ağırlık': '69g',
          'Boyutlar': '128mm x 66mm x 37.5mm',
          'Kablo': 'Ascended USB-C, 2m',
          'RGB': 'RGB şeritler ve logo',
          'Malzeme': 'ABS Plastik, G-Skate PTFE ayaklar',
          'Renk': 'Mat Siyah, Mat Beyaz',
          'Uyumluluk': 'Windows',
          'Garanti': '2 yıl'
        },
        isNewProduct: false,
        isPopular: false,
        isActive: true,
        featured: false
      },
      {
        name: 'Zowie EC2-C Esports Gaming Mouse',
        description: 'Zowie EC2-C, e-spor oyuncuları için tasarlanmış, sağ elini kullananlar için ergonomik yapıya sahip kablolu bir oyun faresi. Plug & Play tasarımı, 3360 sensörü ve esnek kablosuyla profesyonel oyuncuların tercih ettiği bir modeldir.',
        price: 899.99,
        brand: 'Zowie',
        stock: 30,
        category: mouseCategory._id,
        categoryPath: categoryPath,
        images: ['/images/products/zowie-ec2-c.jpg'],
        specifications: {
          'Bağlantı': 'Kablolu (USB)',
          'Sensör': 'PMW 3360 Optik',
          'Maksimum_DPI': '400/800/1600/3200',
          'Hız': '250 IPS',
          'İvme': '50G',
          'Tuş_Sayısı': '5',
          'Tuş_Programlama': 'Hayır (Sürücüsüz)',
          'Polling_Rate': '125/500/1000Hz (ayarlanabilir)',
          'Ağırlık': '88g',
          'Boyutlar': '120mm x 61mm x 40mm',
          'Kablo': 'Esnek kablo, 2m',
          'RGB': 'Yok',
          'Malzeme': 'Plastik, PTFE ayaklar',
          'Renk': 'Siyah',
          'Uyumluluk': 'Windows, macOS, Linux',
          'Garanti': '2 yıl'
        },
        isNewProduct: false,
        isPopular: true,
        isActive: true,
        featured: false
      },
      {
        name: 'Corsair M65 RGB Ultra Wireless Gaming Mouse',
        description: 'Corsair M65 RGB Ultra Wireless, 26.000 DPI sensörü, ayarlanabilir ağırlık sistemi ve programlanabilir yan tuşları ile FPS oyuncuları için tasarlanmış gelişmiş bir kablosuz fare. Alüminyum çerçevesi ve özel keskin nişancı tuşu ile öne çıkar.',
        price: 1299.99,
        brand: 'Corsair',
        stock: 25,
        category: mouseCategory._id,
        categoryPath: categoryPath,
        images: ['/images/products/corsair-m65-rgb-ultra-wireless.jpg'],
        specifications: {
          'Bağlantı': 'SLIPSTREAM Kablosuz, Bluetooth, USB kablolu',
          'Sensör': 'MARKSMAN Optik',
          'Maksimum_DPI': '26,000',
          'Hız': '650 IPS',
          'İvme': '50G',
          'Tuş_Sayısı': '8',
          'Tuş_Programlama': 'Evet (iCUE)',
          'Polling_Rate': '2000Hz',
          'Pil_Ömrü': '120 saat (SLIPSTREAM), 90 gün (Bluetooth)',
          'Ağırlık': '97g - 115g (ayarlanabilir)',
          'Boyutlar': '117mm x 77mm x 39mm',
          'Kablo': 'USB Type-C, 1.8m',
          'RGB': 'İki bölge RGB',
          'Malzeme': 'Alüminyum çerçeve, Plastik gövde, PTFE ayaklar',
          'Özel_Özellikler': 'Keskin nişancı tuşu, 6-eksen hareket algılama',
          'Renk': 'Siyah, Beyaz',
          'Garanti': '2 yıl'
        },
        isNewProduct: true,
        isPopular: false,
        isActive: true,
        featured: false
      },
      {
        name: 'Logitech MX Master 3S Kablosuz Mouse',
        description: 'Logitech MX Master 3S, profesyoneller için tasarlanmış premium bir kablosuz fare. 8K DPI sensör, MagSpeed elektromanyetik kaydırma tekerleği, yeniden şarj edilebilir pil ve sessiz tıklama özellikleriyle üretkenliği artırır.',
        price: 1699.99,
        brand: 'Logitech',
        stock: 60,
        category: mouseCategory._id,
        categoryPath: categoryPath,
        images: ['/images/products/logitech-mx-master-3s.jpg'],
        specifications: {
          'Bağlantı': 'Bluetooth, Logi Bolt USB alıcı',
          'Sensör': 'Darkfield yüksek hassasiyetli',
          'Maksimum_DPI': '8,000',
          'Tuş_Sayısı': '7',
          'Tuş_Programlama': 'Evet (Logi Options+)',
          'Polling_Rate': '125Hz',
          'Pil_Ömrü': '70 gün (tam şarj)',
          'Şarj': 'USB-C hızlı şarj (1 dk şarj = 3 saat kullanım)',
          'Ağırlık': '141g',
          'Boyutlar': '124.9mm x 84.3mm x 51mm',
          'Kaydırma_Tekerleği': 'MagSpeed elektromanyetik',
          'Özel_Özellikler': 'Sessiz tıklama (%90 daha sessiz), Yatay kaydırma tekerleği',
          'Malzeme': 'Plastik, silikon kavrama',
          'Multi_Device': '3 cihaza kadar eşleştirme',
          'Renk': 'Grafiti, Açık Gri, Siyah',
          'Uyumluluk': 'Windows, macOS, Linux, iPadOS',
          'Garanti': '2 yıl'
        },
        isNewProduct: true,
        isPopular: true,
        isActive: true,
        featured: true
      },
      {
        name: 'HyperX Pulsefire Haste Kablosuz Gaming Mouse',
        description: 'HyperX Pulsefire Haste Wireless, bal peteği tasarımlı, sadece 61 gram ağırlığında ultra hafif bir kablosuz oyun faresi. TTC Altın mikro anahtarlar, toz geçirmez anahtarlar ve güçlü pil ömrü ile dayanıklılık ve performans sunar.',
        price: 849.99,
        brand: 'HyperX',
        stock: 45,
        category: mouseCategory._id,
        categoryPath: categoryPath,
        images: ['/images/products/hyperx-pulsefire-haste-wireless.jpg'],
        specifications: {
          'Bağlantı': '2.4GHz Kablosuz, Kablolu',
          'Sensör': 'PAW3335 Optik',
          'Maksimum_DPI': '16,000',
          'Hız': '450 IPS',
          'İvme': '40G',
          'Tuş_Sayısı': '6',
          'Tuş_Programlama': 'Evet (HyperX NGENUITY)',
          'Polling_Rate': '1000Hz',
          'Pil_Ömrü': '100 saat',
          'Ağırlık': '61g',
          'Boyutlar': '124.2mm x 66.8mm x 38.2mm',
          'Kablo': 'HyperFlex USB-C, 1.8m',
          'RGB': 'Logo RGB',
          'Malzeme': 'ABS Plastik, PTFE ayaklar',
          'Anahtarlar': 'TTC Altın Mikro Anahtarlar (80M tıklama)',
          'Renk': 'Siyah, Beyaz',
          'Garanti': '2 yıl'
        },
        isNewProduct: false,
        isPopular: false,
        isActive: true,
        featured: false
      },
      {
        name: 'ASUS ROG Gladius III Wireless Gaming Mouse',
        description: 'ASUS ROG Gladius III Wireless, değiştirilebilir anahtar tasarımı, tri-mode bağlantı ve 19.000 DPI sensör ile donatılmış premium bir kablosuz oyun faresi. Aura Sync RGB aydınlatma ve ergonomik tasarımıyla hem performans hem de konfor sunar.',
        price: 1399.99,
        brand: 'ASUS',
        stock: 30,
        category: mouseCategory._id,
        categoryPath: categoryPath,
        images: ['/images/products/asus-rog-gladius-iii-wireless.jpg'],
        specifications: {
          'Bağlantı': '2.4GHz RF, Bluetooth LE, USB-C kablolu',
          'Sensör': 'ROG AimPoint Optik',
          'Maksimum_DPI': '19,000',
          'Hız': '400 IPS',
          'İvme': '40G',
          'Tuş_Sayısı': '6',
          'Tuş_Programlama': 'Evet (Armoury Crate)',
          'Polling_Rate': '1000Hz',
          'Pil_Ömrü': '55 saat (2.4GHz), 85 saat (Bluetooth)',
          'Ağırlık': '89g',
          'Boyutlar': '123mm x 68mm x 44mm',
          'Kablo': 'ROG Paracord USB-C, 2m',
          'RGB': 'Aura Sync RGB (2 bölge)',
          'Malzeme': 'Plastik, PTFE ayaklar',
          'Özel_Özellikler': 'Değiştirilebilir anahtarlar, Hızlı şarj',
          'Renk': 'Siyah',
          'Garanti': '2 yıl'
        },
        isNewProduct: true,
        isPopular: false,
        isActive: true,
        featured: false
      },
      {
        name: 'Microsoft Surface Precision Mouse',
        description: 'Microsoft Surface Precision Mouse, iş ve verimlilik odaklı kullanıcılar için tasarlanmış profesyonel bir kablosuz fare. Premium ergonomik tasarım, üç özelleştirilebilir yan tuş ve SmartSwitch teknolojisi ile üç cihaz arasında sorunsuz geçiş sağlar.',
        price: 899.99,
        brand: 'Microsoft',
        stock: 50,
        category: mouseCategory._id,
        categoryPath: categoryPath,
        images: ['/images/products/microsoft-surface-precision-mouse.jpg'],
        specifications: {
          'Bağlantı': 'Bluetooth 4.0/4.1/4.2 LE, USB kablolu',
          'Sensör': 'Microsoft BlueTrack',
          'Maksimum_DPI': '3,200',
          'Tuş_Sayısı': '7',
          'Tuş_Programlama': 'Evet (Microsoft Mouse and Keyboard Center)',
          'Pil_Ömrü': '3 ay (şarj edilebilir)',
          'Ağırlık': '135g',
          'Boyutlar': '122.6mm x 77.6mm x 43.3mm',
          'Kablo': 'USB-A, 1.5m',
          'Özel_Özellikler': 'SmartSwitch (3 cihaza bağlantı), Hassas kaydırma tekerleği',
          'Malzeme': 'Premium plastik, Alüminyum kaydırma tekerleği',
          'Renk': 'Gri',
          'Uyumluluk': 'Windows, macOS',
          'Garanti': '2 yıl'
        },
        isNewProduct: false,
        isPopular: false,
        isActive: true,
        featured: false
      }
    ];
    
    // Veritabanına ekle
    await Product.insertMany(mouses);
    console.log('10 adet mouse başarıyla eklendi!');
    
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