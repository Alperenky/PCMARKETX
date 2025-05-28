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
    
    // Alt kategori: Klavyeler
    let keyboardCategory = await Category.findOne({ slug: 'klavyeler' });
    
    if (!keyboardCategory) {
      try {
        keyboardCategory = await Category.create({
          name: 'Klavyeler',
          description: 'Mekanik, membran ve kablosuz klavye seçenekleri ile oyun ve çalışma deneyiminizi üst seviyeye taşıyın',
          image: '/images/categories/klavyeler-banner.jpg',
          slug: 'klavyeler',
          parent: peripheralsCategory._id
        });
        console.log('Klavyeler alt kategorisi oluşturuldu.');
      } catch (error) {
        if (error.code === 11000) {
          keyboardCategory = await Category.findOne({ slug: 'klavyeler' });
          // Eğer parent yoksa güncelle
          if (keyboardCategory && !keyboardCategory.parent) {
            keyboardCategory.parent = peripheralsCategory._id;
            await keyboardCategory.save();
            console.log('Mevcut Klavyeler kategorisi güncellendi ve ana kategoriye bağlandı.');
          } else {
            console.log('Mevcut Klavyeler kategorisi kullanılıyor.');
          }
        } else {
          throw error;
        }
      }
    } else {
      // Eğer parent yoksa güncelle
      if (!keyboardCategory.parent) {
        keyboardCategory.parent = peripheralsCategory._id;
        await keyboardCategory.save();
        console.log('Mevcut Klavyeler kategorisi güncellendi ve ana kategoriye bağlandı.');
      } else {
        console.log('Mevcut Klavyeler kategorisi kullanılıyor.');
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
        _id: keyboardCategory._id,
        name: keyboardCategory.name,
        slug: keyboardCategory.slug
      }
    ];
    
    // Klavyeler eklenmeden önce mevcut ürünleri sil
    await Product.deleteMany({ category: keyboardCategory._id });
    console.log('Mevcut klavye ürünleri silindi.');
    
    // Klavye ürünlerini ekle
    const keyboards = [
      {
        name: 'Logitech G Pro X TKL Mekanik Oyuncu Klavyesi',
        description: 'Logitech G Pro X TKL, profesyonel e-spor oyuncuları için tasarlanmış tuş takımsız bir klavyedir. Değiştirilebilir GX mekanik anahtarlar, sağlam yapı ve programlanabilir RGB aydınlatma ile rekabetçi oyunlar için idealdir.',
        price: 1799.99,
        brand: 'Logitech',
        stock: 35,
        category: keyboardCategory._id,
        categoryPath: categoryPath,
        images: ['/images/products/logitech-g-pro-x-tkl.jpg'],
        specifications: {
          'Klavye_Tipi': 'Mekanik',
          'Düzen': 'TKL (Tuş Takımsız)',
          'Anahtar': 'Değiştirilebilir GX Mekanik (Blue, Brown, Red)',
          'Bağlantı': 'USB-C kablolu (Çıkarılabilir)',
          'Tuş_Sayısı': '87',
          'Anti_Ghosting': 'Tam tuş rollover',
          'N_key_Rollover': 'Evet',
          'RGB_Aydınlatma': 'LIGHTSYNC RGB (tuş başına)',
          'Makro_Desteği': 'Evet (G HUB)',
          'Medya_Kontrolleri': 'FN tuşu kombinasyonları',
          'El_Dayanağı': 'Hayır',
          'Kablo': 'Çıkarılabilir USB-C, 1.8m',
          'Boyutlar': '361mm x 153mm x 34mm',
          'Ağırlık': '980g',
          'Ek_Özellikler': 'Taşıma çantası dahil, Oyun modu',
          'Uyumluluk': 'Windows, macOS',
          'Garanti': '2 yıl'
        },
        isNewProduct: false,
        isPopular: true,
        isActive: true,
        featured: true
      },
      {
        name: 'Razer BlackWidow V3 Pro Kablosuz Mekanik Klavye',
        description: 'Razer BlackWidow V3 Pro, Razer\'ın mekanik anahtarları, tam boyut düzeni ve çoklu bağlantı seçenekleriyle donatılmış premium kablosuz mekanik klavyesidir. Çıkarılabilir ergonomik el dayanağı ve programlanabilir RGB aydınlatma ile üst düzey bir oyun deneyimi sunar.',
        price: 2299.99,
        brand: 'Razer',
        stock: 25,
        category: keyboardCategory._id,
        categoryPath: categoryPath,
        images: ['/images/products/razer-blackwidow-v3-pro.jpg'],
        specifications: {
          'Klavye_Tipi': 'Mekanik',
          'Düzen': 'Tam Boyut',
          'Anahtar': 'Razer Green (Clicky) / Yellow (Linear)',
          'Bağlantı': 'Razer™ HyperSpeed Wireless (2.4 GHz), Bluetooth, USB-C kablolu',
          'Tuş_Sayısı': '104',
          'Anti_Ghosting': 'Evet',
          'N_key_Rollover': 'Evet',
          'RGB_Aydınlatma': 'Razer Chroma™ RGB (tuş başına)',
          'Makro_Desteği': 'Evet (Razer Synapse 3)',
          'Medya_Kontrolleri': 'Özel kontrol düğmesi ve multimedya tuşları',
          'El_Dayanağı': 'Çıkarılabilir yumuşak deri',
          'Pil_Ömrü': '192 saat (RGB kapalı)',
          'Kablo': 'USB-C, 2m',
          'Boyutlar': '440mm x 155mm x 42mm',
          'Ağırlık': '1.423kg',
          'Uyumluluk': 'Windows',
          'Garanti': '2 yıl'
        },
        isNewProduct: false,
        isPopular: true,
        isActive: true,
        featured: true
      },
      {
        name: 'SteelSeries Apex Pro Mini Kablosuz Mekanik Klavye',
        description: 'SteelSeries Apex Pro Mini Wireless, %60 boyutunda, ayarlanabilir OmniPoint 2.0 anahtarlara sahip ultra kompakt bir mekanik klavyedir. Kablosuz bağlantısı, hızlı yanıt süresi ve çift eylemli tuşlarıyla oyunda ve iş amaçlı kullanım için mükemmel dengeyi sunar.',
        price: 2499.99,
        brand: 'SteelSeries',
        stock: 20,
        category: keyboardCategory._id,
        categoryPath: categoryPath,
        images: ['/images/products/steelseries-apex-pro-mini-wireless.jpg'],
        specifications: {
          'Klavye_Tipi': 'Mekanik',
          'Düzen': '%60 (Mini)',
          'Anahtar': 'OmniPoint 2.0 Ayarlanabilir Anahtar (0.1mm - 4.0mm)',
          'Bağlantı': 'Quantum 2.0 Wireless, Bluetooth 5.0, USB-C kablolu',
          'Tuş_Sayısı': '61',
          'Anti_Ghosting': 'Evet',
          'N_key_Rollover': 'Evet',
          'RGB_Aydınlatma': 'PrismSync RGB (tuş başına)',
          'Makro_Desteği': 'Evet (SteelSeries GG)',
          'Çift_Eylem': 'Evet (her tuş için 2 eylem)',
          'Rapid_Trigger': 'Evet',
          'Medya_Kontrolleri': 'FN tuşu kombinasyonları',
          'Pil_Ömrü': '30 saat (RGB açık), 40+ saat (RGB kapalı)',
          'Kablo': 'USB-C, 2m',
          'Boyutlar': '293mm x 103mm x 40mm',
          'Ağırlık': '543g',
          'Uyumluluk': 'Windows, macOS',
          'Garanti': '2 yıl'
        },
        isNewProduct: true,
        isPopular: true,
        isActive: true,
        featured: false
      },
      {
        name: 'Corsair K70 RGB PRO Mekanik Oyuncu Klavyesi',
        description: 'Corsair K70 RGB PRO, turnuva düzeyinde performans ve dayanıklılık için tasarlanmış tam boyutlu bir mekanik oyuncu klavyesidir. Hafif alüminyum çerçeve, AXON işlem teknolojisi ve 8000Hz hızlı yanıt süresiyle rekabetçi oyunlar için ideal bir seçimdir.',
        price: 1999.99,
        brand: 'Corsair',
        stock: 30,
        category: keyboardCategory._id,
        categoryPath: categoryPath,
        images: ['/images/products/corsair-k70-rgb-pro.jpg'],
        specifications: {
          'Klavye_Tipi': 'Mekanik',
          'Düzen': 'Tam Boyut',
          'Anahtar': 'CHERRY MX Speed Silver / MX Red / MX Brown / MX Blue',
          'Bağlantı': 'USB-C kablolu (Çıkarılabilir)',
          'Tuş_Sayısı': '104',
          'Anti_Ghosting': 'Evet',
          'N_key_Rollover': 'Tam NKRO',
          'RGB_Aydınlatma': 'Tam tuş başına RGB',
          'Makro_Desteği': 'Evet (iCUE)',
          'Polling_Rate': '8000Hz (0.125ms)',
          'Medya_Kontrolleri': 'Özel kontrol düğmesi ve multimedia tuşları',
          'El_Dayanağı': 'Çıkarılabilir yumuşak PVC',
          'Kablo': 'USB-C, 1.82m',
          'Boyutlar': '444mm x 166mm x 40mm',
          'Ağırlık': '1.15kg',
          'Ek_Özellikler': 'Turnuva anahtarı, Onboard Hafıza, Ses dereceli ESC tuşu',
          'Uyumluluk': 'Windows, macOS (temel işlevler)',
          'Garanti': '2 yıl'
        },
        isNewProduct: false,
        isPopular: true,
        isActive: true,
        featured: false
      },
      {
        name: 'Keychron Q1 Pro Kablosuz Mekanik Klavye',
        description: 'Keychron Q1 Pro, CNC işlenmiş alüminyum gövdesi, QMK/VIA desteği ve %75 düzeni ile hem oyun hem de yazılım geliştirme için ideal bir kablosuz mekanik klavyedir. Gasket montaj yapısı ve çift katmanlı ses sönümleme ile mükemmel bir yazma deneyimi sunar.',
        price: 1799.99,
        brand: 'Keychron',
        stock: 15,
        category: keyboardCategory._id,
        categoryPath: categoryPath,
        images: ['/images/products/keychron-q1-pro.jpg'],
        specifications: {
          'Klavye_Tipi': 'Mekanik',
          'Düzen': '%75 (Kompakt)',
          'Anahtar': 'Gateron G Pro (Red, Blue, Brown) / Barebone (Anahtarsız)',
          'Bağlantı': 'Bluetooth 5.1, USB-C kablolu',
          'Tuş_Sayısı': '82',
          'Anti_Ghosting': 'Evet',
          'N_key_Rollover': 'Evet',
          'RGB_Aydınlatma': 'Güney yönlü RGB',
          'Makro_Desteği': 'Evet (QMK/VIA ile özelleştirilebilir)',
          'Pil_Ömrü': '300 saat (RGB kapalı)',
          'Cihaz_Eşleştirme': '3 cihaza kadar',
          'Montaj_Tipi': 'Gasket',
          'Gövde': 'CNC işlenmiş alüminyum',
          'Plaka': 'Alüminyum',
          'PCB': 'Çift katmanlı',
          'Sönümleme': 'Silikon pad ve köpük',
          'Boyutlar': '330mm x 135mm x 20mm',
          'Ağırlık': '1.75kg',
          'Uyumluluk': 'Windows, macOS, Linux',
          'Hot_swap': 'Evet (5-pin)',
          'Garanti': '1 yıl'
        },
        isNewProduct: true,
        isPopular: false,
        isActive: true,
        featured: false
      },
      {
        name: 'ASUS ROG Azoth Kablosuz Mekanik Oyuncu Klavyesi',
        description: 'ASUS ROG Azoth, OLED ekran, değiştirilebilir anahtar tasarımı ve üçlü bağlantı seçeneği ile donatılmış premium bir kablosuz mekanik klavyedir. Üç katmanlı sönümleme sistemi ve tam kapsamlı özelleştirme ile hem oyun hem de verimlilik için idealdir.',
        price: 2599.99,
        brand: 'ASUS',
        stock: 20,
        category: keyboardCategory._id,
        categoryPath: categoryPath,
        images: ['/images/products/asus-rog-azoth.jpg'],
        specifications: {
          'Klavye_Tipi': 'Mekanik',
          'Düzen': '%75 (Kompakt)',
          'Anahtar': 'ROG NX Mekanik (Red, Blue, Brown)',
          'Bağlantı': 'ROG SpeedNova Kablosuz, Bluetooth, USB-C kablolu',
          'Tuş_Sayısı': '75',
          'Anti_Ghosting': 'Evet',
          'N_key_Rollover': 'Evet',
          'RGB_Aydınlatma': 'Per-key ROG AuraSync RGB',
          'Makro_Desteği': 'Evet (Armoury Crate)',
          'OLED_Ekran': '2-inch OLED (sistem bilgisi, animasyonlar)',
          'Ses_Sönümleme': 'Üç katmanlı sönümleme sistemi',
          'Medya_Kontrolleri': 'Çok fonksiyonlu kontrol düğmesi',
          'Pil_Ömrü': '2000+ saat (RGB ve OLED kapalı)',
          'Gövde': 'Alüminyum üst plaka',
          'Hot_swap': 'Evet (3-pin / 5-pin)',
          'Ek_Özellikler': 'Yağlama kiti dahil, Stabilizatör ayarı',
          'Boyutlar': '326mm x 136mm x 40mm',
          'Ağırlık': '1.08kg',
          'Uyumluluk': 'Windows',
          'Garanti': '2 yıl'
        },
        isNewProduct: true,
        isPopular: true,
        isActive: true,
        featured: true
      },
      {
        name: 'Ducky One 3 Mini RGB Mekanik Klavye',
        description: 'Ducky One 3 Mini, QUACK Mechanics montaj sistemi, çift katmanlı PCB ve sökülüp takılabilir anahtar tasarımı ile yüksek kaliteli bir %60 mekanik klavyedir. Sökülüp temizlenebilir yapısı, Ducky\'nin meşhur yapım kalitesi ve PBT çift enjeksiyonlu tuş başlıkları ile uzun ömürlü bir kullanım sunar.',
        price: 1499.99,
        brand: 'Ducky',
        stock: 20,
        category: keyboardCategory._id,
        categoryPath: categoryPath,
        images: ['/images/products/ducky-one-3-mini.jpg'],
        specifications: {
          'Klavye_Tipi': 'Mekanik',
          'Düzen': '%60 (Mini)',
          'Anahtar': 'Cherry MX (Brown, Blue, Red, Black, Silent Red, Silver)',
          'Bağlantı': 'USB-C kablolu (Çıkarılabilir)',
          'Tuş_Sayısı': '61',
          'Anti_Ghosting': 'Evet',
          'N_key_Rollover': 'Tam NKRO',
          'RGB_Aydınlatma': 'RGB LED (16.8M renk)',
          'Makro_Desteği': 'Evet (Firmware düzeyinde)',
          'Montaj_Tipi': 'QUACK Mechanics (ara sönümlemeli)',
          'PCB': 'Çift katmanlı, Hot-swap',
          'Tuş_Kapakları': 'PBT Çift Enjeksiyon',
          'Kablo': 'USB-C, 1.8m (örgülü)',
          'Gövde': 'ABS (Sökülüp temizlenebilir)',
          'Boyutlar': '302mm x 108mm x 40mm',
          'Ağırlık': '642g',
          'Renk_Seçenekleri': 'Daybreak, Matcha, Fuji, Pure White, Frozen Llama',
          'Uyumluluk': 'Windows, macOS, Linux',
          'Garanti': '1 yıl'
        },
        isNewProduct: false,
        isPopular: false,
        isActive: true,
        featured: false
      },
      {
        name: 'HyperX Alloy Origins Core RGB Mekanik Klavye',
        description: 'HyperX Alloy Origins Core, havacılık sınıfı alüminyum gövde, HyperX kırmızı linear anahtarlar ve kompakt TKL tasarım ile dayanıklılık ve performans sunan bir mekanik klavyedir. RGB aydınlatma, ayarlanabilir eğim ve yerden tasarruf sağlayan kompakt yapısıyla ideal bir oyuncu klavyesidir.',
        price: 999.99,
        brand: 'HyperX',
        stock: 40,
        category: keyboardCategory._id,
        categoryPath: categoryPath,
        images: ['/images/products/hyperx-alloy-origins-core.jpg'],
        specifications: {
          'Klavye_Tipi': 'Mekanik',
          'Düzen': 'TKL (Tuş Takımsız)',
          'Anahtar': 'HyperX Mekanik (Red, Aqua, Blue)',
          'Bağlantı': 'USB-C kablolu (Çıkarılabilir)',
          'Tuş_Sayısı': '87',
          'Anti_Ghosting': 'Evet',
          'N_key_Rollover': 'Evet',
          'RGB_Aydınlatma': 'Tuş başına RGB (HyperX NGENUITY)',
          'Makro_Desteği': 'Evet (HyperX NGENUITY)',
          'Gövde': 'Havacılık sınıfı alüminyum',
          'Tuş_Kapakları': 'ABS',
          'Eğim': '3 kademeli (3°, 7°, 11°)',
          'Kablo': 'USB-C, 1.8m (çıkarılabilir)',
          'Onboard_Hafıza': '3 profil',
          'Boyutlar': '360mm x 132mm x 34mm',
          'Ağırlık': '900g',
          'Uyumluluk': 'Windows',
          'Garanti': '2 yıl'
        },
        isNewProduct: false,
        isPopular: true,
        isActive: true,
        featured: false
      },
      {
        name: 'Glorious GMMK Pro Mekanik Klavye',
        description: 'Glorious GMMK Pro, %75 düzeninde, CNC işlenmiş alüminyum kasaya sahip premium bir modüler mekanik klavyedir. Gasket montaj yapısı, RGB ışık şeridi, değiştirilebilir döner düğme ve hot-swap özelliği ile tamamen özelleştirilebilir bir klavye deneyimi sunar.',
        price: 1899.99,
        brand: 'Glorious',
        stock: 25,
        category: keyboardCategory._id,
        categoryPath: categoryPath,
        images: ['/images/products/glorious-gmmk-pro.jpg'],
        specifications: {
          'Klavye_Tipi': 'Mekanik',
          'Düzen': '%75 (Profesyonel)',
          'Anahtar': 'Hot-swap (Barebone veya Glorious Panda, Fox, Lynx)',
          'Bağlantı': 'USB-C kablolu (Çıkarılabilir)',
          'Tuş_Sayısı': '84',
          'Anti_Ghosting': 'Evet',
          'N_key_Rollover': 'Tam NKRO',
          'RGB_Aydınlatma': 'Güney yönlü RGB, 360° RGB ışık şeridi',
          'Makro_Desteği': 'Evet (Glorious Core)',
          'Düğme': 'Değiştirilebilir CNC döner düğme',
          'Montaj_Tipi': 'Gasket (modifiye edilebilir)',
          'Gövde': 'CNC işlenmiş alüminyum (Siyah veya Beyaz)',
          'Plaka': 'Alüminyum (değiştirilebilir)',
          'Hot_swap': 'Evet (5-pin)',
          'Kablo': 'USB-C, 2m (örgülü)',
          'Boyutlar': '332mm x 134mm x 40mm',
          'Ağırlık': '1.6kg',
          'Uyumluluk': 'Windows, macOS, Linux',
          'Garanti': '2 yıl'
        },
        isNewProduct: false,
        isPopular: true,
        isActive: true,
        featured: false
      },
      {
        name: 'Logitech MX Keys Advanced Kablosuz Klavye',
        description: 'Logitech MX Keys Advanced, profesyoneller için tasarlanmış premium bir kablosuz klavyedir. Perfect Stroke tuşları, akıllı arka aydınlatma ve çoklu cihaz desteği ile maksimum verimlilik sağlar. İnce ve şık tasarım, ergonomik yapı ve uzun pil ömrü ile ofis ve ev kullanımı için idealdir.',
        price: 1299.99,
        brand: 'Logitech',
        stock: 55,
        category: keyboardCategory._id,
        categoryPath: categoryPath,
        images: ['/images/products/logitech-mx-keys-advanced.jpg'],
        specifications: {
          'Klavye_Tipi': 'Membran (Perfect Stroke)',
          'Düzen': 'Tam Boyut',
          'Bağlantı': 'Bluetooth Low Energy, Logi Bolt USB alıcı',
          'Tuş_Sayısı': '108',
          'Aydınlatma': 'Akıllı arka aydınlatma (yakınlık sensörlü)',
          'Pil_Ömrü': '10 gün (aydınlatmalı), 5 ay (aydınlatmasız)',
          'Şarj': 'USB-C',
          'Cihaz_Eşleştirme': '3 cihaza kadar',
          'Akıllı_Özellikler': 'Flow teknolojisi (farklı cihazlar arası geçiş)',
          'Tuş_Kapakları': 'Konkav tuşlar, mat yüzey',
          'Gövde': 'Metal üst plaka',
          'Medya_Kontrolleri': 'F tuşları üzerinde',
          'Boyutlar': '430.2mm x 131.63mm x 20.5mm',
          'Ağırlık': '810g',
          'Renk': 'Grafit',
          'Uyumluluk': 'Windows, macOS, Linux, iOS, Android',
          'Yazılım': 'Logi Options+',
          'Garanti': '1 yıl'
        },
        isNewProduct: false,
        isPopular: false,
        isActive: true,
        featured: false
      }
    ];
    
    // Veritabanına ekle
    await Product.insertMany(keyboards);
    console.log('10 adet klavye başarıyla eklendi!');
    
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