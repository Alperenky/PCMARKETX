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
    
    // Alt kategori: Bilgisayar Kasaları
    let caseCategory = await Category.findOne({ slug: 'bilgisayar-kasalari' });
    
    if (!caseCategory) {
      try {
        caseCategory = await Category.create({
          name: 'Bilgisayar Kasaları',
          description: 'Her türlü sistem için ATX, Micro-ATX, Mini-ITX ve diğer form faktörlerinde bilgisayar kasaları',
          image: '/images/categories/bilgisayar-kasalari-banner.jpg',
          slug: 'bilgisayar-kasalari',
          parent: computerPartsCategory._id
        });
        console.log('Bilgisayar Kasaları alt kategorisi oluşturuldu.');
      } catch (error) {
        if (error.code === 11000) {
          caseCategory = await Category.findOne({ name: 'Bilgisayar Kasaları' });
          // Eğer parent yoksa güncelle
          if (caseCategory && !caseCategory.parent) {
            caseCategory.parent = computerPartsCategory._id;
            await caseCategory.save();
            console.log('Mevcut Bilgisayar Kasaları kategorisi güncellendi ve ana kategoriye bağlandı.');
          } else {
            console.log('Mevcut Bilgisayar Kasaları kategorisi kullanılıyor.');
          }
        } else {
          throw error;
        }
      }
    } else {
      // Eğer parent yoksa güncelle
      if (!caseCategory.parent) {
        caseCategory.parent = computerPartsCategory._id;
        await caseCategory.save();
        console.log('Mevcut Bilgisayar Kasaları kategorisi güncellendi ve ana kategoriye bağlandı.');
      } else {
        console.log('Mevcut Bilgisayar Kasaları kategorisi kullanılıyor.');
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
        _id: caseCategory._id,
        name: caseCategory.name,
        slug: caseCategory.slug
      }
    ];
    
    // Bilgisayar Kasaları eklenmeden önce mevcut ürünleri sil
    await Product.deleteMany({ category: caseCategory._id });
    console.log('Mevcut bilgisayar kasası ürünleri silindi.');
    
    // Bilgisayar kasalarını ekle
    const cases = [
      {
        name: 'Lian Li PC-O11 Dynamic EVO',
        description: 'Lian Li PC-O11 Dynamic EVO, geniş iç hacmi, çift bölmeli tasarımı ve mükemmel hava akışı özellikleriyle öne çıkan premium bir bilgisayar kasası. Cömert ekran kartı ve soğutucu desteği, zahmetsiz kablo yönetimi ve estetik temiz cam panel tasarımıyla dikkat çekiyor.',
        price: 2999.99,
        brand: 'Lian Li',
        stock: 25,
        category: caseCategory._id,
        categoryPath: categoryPath,
        images: ['/images/products/lianli-o11-dynamic-evo.jpg'],
        specifications: {
          'Form_Faktör': 'Mid Tower',
          'Anakart_Desteği': 'E-ATX, ATX, Micro-ATX, Mini-ITX',
          'Malzeme': 'Alüminyum, Temperli Cam, Çelik',
          'Boyutlar': '465mm x 285mm x 459mm',
          'Ağırlık': '11.6 kg',
          'Fan_Desteği_Üst': '3x 120mm / 2x 140mm',
          'Fan_Desteği_Yan': '3x 120mm / 2x 140mm',
          'Fan_Desteği_Alt': '3x 120mm / 2x 140mm',
          'Radyatör_Desteği': '360mm üst, 360mm yan, 360mm alt',
          'Disk_Yuvası': '6x 2.5", 3x 3.5"',
          'Ekran_Kartı_Maks_Uzunluk': '420mm',
          'CPU_Soğutucu_Maks_Yükseklik': '167mm',
          'I_O_Panel': '1x USB 3.1 Type-C, 2x USB 3.0, HD Audio',
          'RGB_Desteği': 'Evet (Aura Sync, Mystic Light, RGB Fusion)'
        },
        isNewProduct: true,
        isPopular: true,
        isActive: true,
        featured: true
      },
      {
        name: 'Corsair 5000D Airflow',
        description: 'Corsair 5000D Airflow, optimum hava akışı, geniş bileşen desteği ve zarif tasarım sunan üst segment bir oyuncu kasası. Ön ve yan panellerdeki yüksek hava akışlı mesh örgü, dahili bileşenlerin maksimum serinlikte kalmasını sağlar.',
        price: 2499.99,
        brand: 'Corsair',
        stock: 30,
        category: caseCategory._id,
        categoryPath: categoryPath,
        images: ['/images/products/corsair-5000d-airflow.jpg'],
        specifications: {
          'Form_Faktör': 'Mid Tower',
          'Anakart_Desteği': 'ATX, Micro-ATX, Mini-ITX',
          'Malzeme': 'Çelik, Temperli Cam, Plastik',
          'Boyutlar': '520mm x 245mm x 520mm',
          'Ağırlık': '13.8 kg',
          'Fan_Desteği_Ön': '3x 120mm / 2x 140mm',
          'Fan_Desteği_Üst': '3x 120mm / 2x 140mm',
          'Fan_Desteği_Arka': '1x 120mm',
          'Fan_Desteği_Yan': '3x 120mm',
          'Radyatör_Desteği': '360mm ön, 360mm üst, 360mm yan, 120mm arka',
          'Disk_Yuvası': '4x 2.5", 2x 3.5"',
          'Ekran_Kartı_Maks_Uzunluk': '420mm',
          'CPU_Soğutucu_Maks_Yükseklik': '170mm',
          'I_O_Panel': '1x USB 3.1 Type-C, 2x USB 3.0, HD Audio',
          'Dahili_Fan': '2x 120mm'
        },
        isNewProduct: false,
        isPopular: true,
        isActive: true,
        featured: false
      },
      {
        name: 'Fractal Design Meshify 2 Compact',
        description: 'Fractal Design Meshify 2 Compact, mesh ön panel, esnek iç tasarım ve kompakt boyutlarıyla hem performans hem de estetik arayanlar için ideal bir kasa. Yüksek hava akışı özellikleriyle yoğun sistemlerde etkin soğutma sağlar.',
        price: 1899.99,
        brand: 'Fractal Design',
        stock: 35,
        category: caseCategory._id,
        categoryPath: categoryPath,
        images: ['/images/products/fractal-meshify-2-compact.jpg'],
        specifications: {
          'Form_Faktör': 'Compact Mid Tower',
          'Anakart_Desteği': 'ATX, Micro-ATX, Mini-ITX',
          'Malzeme': 'Çelik, Temperli Cam, Mesh',
          'Boyutlar': '424mm x 210mm x 475mm',
          'Ağırlık': '8.1 kg',
          'Fan_Desteği_Ön': '3x 120mm / 2x 140mm',
          'Fan_Desteği_Üst': '3x 120mm / 2x 140mm',
          'Fan_Desteği_Arka': '1x 120mm',
          'Fan_Desteği_Alt': '1x 120mm',
          'Radyatör_Desteği': '360mm ön, 240mm üst, 120mm arka',
          'Disk_Yuvası': '4x 2.5", 2x 3.5"',
          'Ekran_Kartı_Maks_Uzunluk': '360mm',
          'CPU_Soğutucu_Maks_Yükseklik': '169mm',
          'I_O_Panel': '1x USB 3.1 Type-C, 2x USB 3.0, HD Audio',
          'Dahili_Fan': '3x 120mm'
        },
        isNewProduct: false,
        isPopular: true,
        isActive: true,
        featured: false
      },
      {
        name: 'NZXT H7 Flow',
        description: 'NZXT H7 Flow, minimalist tasarımı, mükemmel hava akışlı mesh panelleri ve geniş bileşen desteği ile öne çıkan modern bir bilgisayar kasası. Temiz kablo yönetimi ve estetik görünümüyle her sistem kurulumuna zarafet katar.',
        price: 1799.99,
        brand: 'NZXT',
        stock: 20,
        category: caseCategory._id,
        categoryPath: categoryPath,
        images: ['/images/products/nzxt-h7-flow.jpg'],
        specifications: {
          'Form_Faktör': 'Mid Tower',
          'Anakart_Desteği': 'E-ATX, ATX, Micro-ATX, Mini-ITX',
          'Malzeme': 'SGCC Çelik, Temperli Cam, Mesh',
          'Boyutlar': '480mm x 230mm x 505mm',
          'Ağırlık': '12.5 kg',
          'Fan_Desteği_Ön': '3x 120mm / 2x 140mm',
          'Fan_Desteği_Üst': '3x 120mm / 3x 140mm',
          'Fan_Desteği_Arka': '1x 120mm / 1x 140mm',
          'Radyatör_Desteği': '360mm ön, 360mm üst, 140mm arka',
          'Disk_Yuvası': '4x 2.5", 2x 3.5"',
          'Ekran_Kartı_Maks_Uzunluk': '400mm',
          'CPU_Soğutucu_Maks_Yükseklik': '185mm',
          'I_O_Panel': '1x USB 3.1 Type-C, 2x USB 3.0, HD Audio',
          'Dahili_Fan': '2x 120mm'
        },
        isNewProduct: true,
        isPopular: true,
        isActive: true,
        featured: false
      },
      {
        name: 'be quiet! Pure Base 500DX',
        description: 'be quiet! Pure Base 500DX, yerleşik ARGB aydınlatma, optimum hava akışı için mesh ön panel ve sessiz çalışma için akustik özellikler sunan dengeli bir bilgisayar kasası. Pratik bileşen yerleşimi ve kablo yönetimi her seviyeden kullanıcı için uygundur.',
        price: 1499.99,
        brand: 'be quiet!',
        stock: 40,
        category: caseCategory._id,
        categoryPath: categoryPath,
        images: ['/images/products/bequiet-purebase-500dx.jpg'],
        specifications: {
          'Form_Faktör': 'Mid Tower',
          'Anakart_Desteği': 'ATX, Micro-ATX, Mini-ITX',
          'Malzeme': 'Çelik, Temperli Cam, Mesh',
          'Boyutlar': '450mm x 232mm x 463mm',
          'Ağırlık': '7.8 kg',
          'Fan_Desteği_Ön': '3x 120mm / 2x 140mm',
          'Fan_Desteği_Üst': '3x 120mm / 2x 140mm',
          'Fan_Desteği_Arka': '1x 120mm / 1x 140mm',
          'Radyatör_Desteği': '360mm ön, 240mm üst, 120mm arka',
          'Disk_Yuvası': '5x 2.5", 2x 3.5"',
          'Ekran_Kartı_Maks_Uzunluk': '369mm',
          'CPU_Soğutucu_Maks_Yükseklik': '190mm',
          'I_O_Panel': '1x USB 3.1 Type-C, 2x USB 3.0, HD Audio',
          'ARGB': 'Evet, kontrol düğmesi ve anakart senkronizasyonu',
          'Dahili_Fan': '3x Pure Wings 2 140mm'
        },
        isNewProduct: false,
        isPopular: true,
        isActive: true,
        featured: false
      },
      {
        name: 'Phanteks Eclipse P500A DRGB',
        description: 'Phanteks Eclipse P500A DRGB, ultra high-airflow mesh ön panel, entegre D-RGB aydınlatma ve geniş bileşen desteği sunan premium bir kasa. Yüksek performanslı sistemler için optimum hava akışı ve soğutma sağlar.',
        price: 1699.99,
        brand: 'Phanteks',
        stock: 25,
        category: caseCategory._id,
        categoryPath: categoryPath,
        images: ['/images/products/phanteks-p500a-drgb.jpg'],
        specifications: {
          'Form_Faktör': 'Mid Tower',
          'Anakart_Desteği': 'E-ATX, ATX, Micro-ATX, Mini-ITX',
          'Malzeme': 'Çelik, Temperli Cam, Ultra-Fine Mesh',
          'Boyutlar': '465mm x 230mm x 515mm',
          'Ağırlık': '10.1 kg',
          'Fan_Desteği_Ön': '3x 120mm / 3x 140mm',
          'Fan_Desteği_Üst': '3x 120mm / 3x 140mm',
          'Fan_Desteği_Arka': '1x 120mm / 1x 140mm',
          'Radyatör_Desteği': '420mm ön, 360mm üst, 140mm arka',
          'Disk_Yuvası': '3x 2.5", 2x 3.5"',
          'Ekran_Kartı_Maks_Uzunluk': '435mm',
          'CPU_Soğutucu_Maks_Yükseklik': '190mm',
          'I_O_Panel': '1x USB 3.1 Type-C, 2x USB 3.0, HD Audio',
          'DRGB_Aydınlatma': 'Ön panel D-RGB şerit, 3x D-RGB fanlar',
          'Dahili_Fan': '3x 140mm D-RGB PWM fan'
        },
        isNewProduct: false,
        isPopular: true,
        isActive: true,
        featured: true
      },
      {
        name: 'Cooler Master MasterBox TD500 Mesh',
        description: 'Cooler Master MasterBox TD500 Mesh, poligonal mesh ön panel, üç adet ARGB fanı ve kristal benzeri yan panel tasarımıyla görsel şölen sunan bir bilgisayar kasası. Yüksek hava akışı ve etkileyici görünüm dengesi arayanlar için ideal.',
        price: 1299.99,
        brand: 'Cooler Master',
        stock: 50,
        category: caseCategory._id,
        categoryPath: categoryPath,
        images: ['/images/products/coolermaster-td500-mesh.jpg'],
        specifications: {
          'Form_Faktör': 'Mid Tower',
          'Anakart_Desteği': 'ATX, Micro-ATX, Mini-ITX',
          'Malzeme': 'Çelik, Temperli Cam, Mesh',
          'Boyutlar': '493mm x 217mm x 469mm',
          'Ağırlık': '7.6 kg',
          'Fan_Desteği_Ön': '3x 120mm / 2x 140mm',
          'Fan_Desteği_Üst': '3x 120mm / 2x 140mm',
          'Fan_Desteği_Arka': '1x 120mm',
          'Radyatör_Desteği': '360mm ön, 360mm üst, 120mm arka',
          'Disk_Yuvası': '4x 2.5", 2x 3.5"',
          'Ekran_Kartı_Maks_Uzunluk': '410mm',
          'CPU_Soğutucu_Maks_Yükseklik': '165mm',
          'I_O_Panel': '2x USB 3.0, HD Audio',
          'ARGB': 'Evet, 3x ön fan ARGB',
          'Dahili_Fan': '3x 120mm ARGB ön, 1x 120mm arka'
        },
        isNewProduct: false,
        isPopular: true,
        isActive: true,
        featured: false
      },
      {
        name: 'MSI MPG GUNGNIR 110R',
        description: 'MSI MPG GUNGNIR 110R, mesh ön panel, dört adet ARGB fan ve optimum hava akışı için tasarlanmış şık bir oyuncu kasası. Zahmetsiz kurulum ve geniş bileşen uyumluluğu sunar.',
        price: 1199.99,
        brand: 'MSI',
        stock: 35,
        category: caseCategory._id,
        categoryPath: categoryPath,
        images: ['/images/products/msi-gungnir-110r.jpg'],
        specifications: {
          'Form_Faktör': 'Mid Tower',
          'Anakart_Desteği': 'ATX, Micro-ATX, Mini-ITX',
          'Malzeme': 'Çelik, Temperli Cam, Mesh',
          'Boyutlar': '465mm x 226mm x 455mm',
          'Ağırlık': '7.8 kg',
          'Fan_Desteği_Ön': '3x 120mm / 2x 140mm',
          'Fan_Desteği_Üst': '3x 120mm / 2x 140mm',
          'Fan_Desteği_Arka': '1x 120mm',
          'Radyatör_Desteği': '360mm ön, 240mm üst, 120mm arka',
          'Disk_Yuvası': '6x 2.5", 2x 3.5"',
          'Ekran_Kartı_Maks_Uzunluk': '340mm',
          'CPU_Soğutucu_Maks_Yükseklik': '170mm',
          'I_O_Panel': '1x USB 3.1 Type-C, 2x USB 3.0, HD Audio',
          'ARGB': 'Evet, Mystic Light Sync',
          'Dahili_Fan': '3x 120mm ARGB ön, 1x 120mm ARGB arka'
        },
        isNewProduct: false,
        isPopular: false,
        isActive: true,
        featured: false
      },
      {
        name: 'Thermaltake Core P3',
        description: 'Thermaltake Core P3, açık düzen yarı kapalı duvar tipi tasarımıyla bileşenlerinizi sergilemenize olanak sağlayan benzersiz bir kasa. Yatay veya dikey konumlandırılabilir, hatta duvara monte edilebilir. Modding tutkunları için ideal bir seçenek.',
        price: 1999.99,
        brand: 'Thermaltake',
        stock: 15,
        category: caseCategory._id,
        categoryPath: categoryPath,
        images: ['/images/products/thermaltake-core-p3.jpg'],
        specifications: {
          'Form_Faktör': 'Mid Tower (Açık Tasarım)',
          'Anakart_Desteği': 'ATX, Micro-ATX, Mini-ITX',
          'Malzeme': 'SPCC Çelik, Akrilik Yan Panel',
          'Boyutlar': '512mm x 333mm x 470mm',
          'Ağırlık': '10.6 kg',
          'Fan_Desteği_Sağ': '3x 120mm / 2x 140mm',
          'Radyatör_Desteği': '360mm / 420mm',
          'Disk_Yuvası': '3x 2.5"/3.5" combo, 2x 2.5"',
          'Ekran_Kartı_Maks_Uzunluk': '450mm',
          'CPU_Soğutucu_Maks_Yükseklik': '180mm',
          'I_O_Panel': '2x USB 3.0, 2x USB 2.0, HD Audio',
          'Özel_Özellikler': 'Açık tasarım, duvar montaj desteği, ekran kartı dikey montaj seçeneği',
          'Dahili_Fan': 'Yok (Açık tasarım)'
        },
        isNewProduct: true,
        isPopular: false,
        isActive: true,
        featured: true
      },
      {
        name: 'Silverstone FARA R1 Pro',
        description: 'Silverstone FARA R1 Pro, yüksek hava akışlı mesh ön panel, dört adet RGB fan ve uygun fiyat etiketiyle öne çıkan bir bilgisayar kasası. Başlangıç ve orta seviye oyun sistemleri için mükemmel bir seçenek sunar.',
        price: 899.99,
        brand: 'Silverstone',
        stock: 55,
        category: caseCategory._id,
        categoryPath: categoryPath,
        images: ['/images/products/silverstone-fara-r1-pro.jpg'],
        specifications: {
          'Form_Faktör': 'Mid Tower',
          'Anakart_Desteği': 'ATX, Micro-ATX, Mini-ITX',
          'Malzeme': 'Çelik, Temperli Cam, Mesh',
          'Boyutlar': '426mm x 210mm x 465mm',
          'Ağırlık': '6.5 kg',
          'Fan_Desteği_Ön': '3x 120mm',
          'Fan_Desteği_Üst': '2x 120mm / 2x 140mm',
          'Fan_Desteği_Arka': '1x 120mm',
          'Radyatör_Desteği': '280mm ön, 240mm üst, 120mm arka',
          'Disk_Yuvası': '2x 2.5", 2x 3.5"',
          'Ekran_Kartı_Maks_Uzunluk': '325mm',
          'CPU_Soğutucu_Maks_Yükseklik': '165mm',
          'I_O_Panel': '1x USB 3.0, 2x USB 2.0, HD Audio',
          'RGB': 'Evet, 4x RGB fan',
          'Dahili_Fan': '3x 120mm RGB ön, 1x 120mm RGB arka'
        },
        isNewProduct: false,
        isPopular: true,
        isActive: true,
        featured: false
      }
    ];
    
    // Veritabanına ekle
    await Product.insertMany(cases);
    console.log('10 adet bilgisayar kasası başarıyla eklendi!');
    
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