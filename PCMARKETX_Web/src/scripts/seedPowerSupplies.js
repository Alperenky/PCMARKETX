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
    
    // Alt kategori: Güç Kaynakları
    let psuCategory = await Category.findOne({ slug: 'guc-kaynaklari' });
    
    if (!psuCategory) {
      try {
        psuCategory = await Category.create({
          name: 'Güç Kaynakları',
          description: 'Her ihtiyaca uygun, farklı güç kapasitelerinde ve verimlilik sertifikalarıyla güç kaynakları',
          image: '/images/categories/guc-kaynaklari-banner.jpg',
          slug: 'guc-kaynaklari',
          parent: computerPartsCategory._id
        });
        console.log('Güç Kaynakları alt kategorisi oluşturuldu.');
      } catch (error) {
        if (error.code === 11000) {
          psuCategory = await Category.findOne({ name: 'Güç Kaynakları' });
          // Eğer parent yoksa güncelle
          if (psuCategory && !psuCategory.parent) {
            psuCategory.parent = computerPartsCategory._id;
            await psuCategory.save();
            console.log('Mevcut Güç Kaynakları kategorisi güncellendi ve ana kategoriye bağlandı.');
          } else {
            console.log('Mevcut Güç Kaynakları kategorisi kullanılıyor.');
          }
        } else {
          throw error;
        }
      }
    } else {
      // Eğer parent yoksa güncelle
      if (!psuCategory.parent) {
        psuCategory.parent = computerPartsCategory._id;
        await psuCategory.save();
        console.log('Mevcut Güç Kaynakları kategorisi güncellendi ve ana kategoriye bağlandı.');
      } else {
        console.log('Mevcut Güç Kaynakları kategorisi kullanılıyor.');
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
        _id: psuCategory._id,
        name: psuCategory.name,
        slug: psuCategory.slug
      }
    ];
    
    // Güç Kaynakları eklenmeden önce mevcut ürünleri sil
    await Product.deleteMany({ category: psuCategory._id });
    console.log('Mevcut güç kaynağı ürünleri silindi.');
    
    // Güç kaynağı ürünlerini ekle
    const powerSupplies = [
      {
        name: 'Corsair RM1000x 1000W 80+ Gold Tam Modüler',
        description: 'Corsair RM1000x, son derece verimli, 80 PLUS Gold sertifikalı ve tamamen modüler kablolara sahip premium güç kaynağı. 135mm manyetik levitasyonlu fan ve yüksek kaliteli Japon kapasitörleri ile donatılmıştır.',
        price: 3499.99,
        brand: 'Corsair',
        stock: 25,
        category: psuCategory._id,
        categoryPath: categoryPath,
        images: ['/images/products/corsair-rm1000x.jpg'],
        specifications: {
          'Güç': '1000W',
          'Verimlilik_Sertifikası': '80+ Gold',
          'Modülerlik': 'Tam Modüler',
          'Fan': '135mm Manyetik Levitasyonlu Fan',
          'Giriş_Gerilim_Aralığı': '100-240VAC',
          'PFC': 'Aktif PFC',
          'Kapasitörler': 'Japon 105°C',
          'MTBF': '100,000 saat',
          'Güvenlik_Özellikleri': 'OVP, UVP, OCP, OPP, SCP',
          'Boyutlar': '150mm x 86mm x 180mm',
          'Garanti': '10 yıl',
          'PCIe_Gen5_Uyumluluk': 'Evet'
        },
        isNewProduct: false,
        isPopular: true,
        isActive: true,
        featured: true
      },
      {
        name: 'EVGA SuperNOVA 850 G6 850W 80+ Gold Tam Modüler',
        description: 'EVGA SuperNOVA G6, kompakt boyutu ve yüksek verimliliğiyle öne çıkan, tamamen modüler 80 PLUS Gold güç kaynağı. Gelişmiş LLC rezonans topolojisi ve Fluid Dynamic Fan teknolojisi ile donatılmıştır.',
        price: 2799.99,
        brand: 'EVGA',
        stock: 20,
        category: psuCategory._id,
        categoryPath: categoryPath,
        images: ['/images/products/evga-supernova-g6.jpg'],
        specifications: {
          'Güç': '850W',
          'Verimlilik_Sertifikası': '80+ Gold',
          'Modülerlik': 'Tam Modüler',
          'Fan': '135mm Fluid Dynamic Bearing',
          'Giriş_Gerilim_Aralığı': '100-240VAC',
          'PFC': 'Aktif PFC',
          'Kapasitörler': 'Japon',
          'Verimlilik': '%90+ (Tipik Yükte)',
          'Boyutlar': '150mm x 85mm x 150mm',
          'Garanti': '10 yıl',
          'Çalışma_Modu': 'ECO Mode (Semi-Fanless)'
        },
        isNewProduct: false,
        isPopular: true,
        isActive: true,
        featured: false
      },
      {
        name: 'Seasonic FOCUS GX-750 750W 80+ Gold Tam Modüler',
        description: 'Seasonic FOCUS GX, yüksek kaliteli bileşenler ve sağlam yapısıyla tanınan 80 PLUS Gold sertifikalı güç kaynağı. Hybrid Silent Fan Control ile düşük yüklerde sessiz çalışma sunar.',
        price: 2399.99,
        brand: 'Seasonic',
        stock: 30,
        category: psuCategory._id,
        categoryPath: categoryPath,
        images: ['/images/products/seasonic-focus-gx.jpg'],
        specifications: {
          'Güç': '750W',
          'Verimlilik_Sertifikası': '80+ Gold',
          'Modülerlik': 'Tam Modüler',
          'Fan': '120mm Fluid Dynamic Bearing',
          'Giriş_Gerilim_Aralığı': '100-240VAC',
          'PFC': 'Aktif PFC',
          'Kapasitörler': 'Japon',
          'MTBF': '100,000 saat',
          'Boyutlar': '140mm x 150mm x 86mm',
          'Garanti': '10 yıl',
          'Çalışma_Modu': 'Hybrid Fan Control'
        },
        isNewProduct: false,
        isPopular: true,
        isActive: true,
        featured: false
      },
      {
        name: 'be quiet! Dark Power Pro 12 1200W 80+ Titanium Tam Modüler',
        description: 'be quiet! Dark Power Pro 12, üst düzey sistem kurulumları için en yüksek verimlilik ve sessizlik sunan premium güç kaynağı. 80 PLUS Titanium sertifikası ve gelişmiş Silent Wings fan teknolojisiyle donatılmıştır.',
        price: 5499.99,
        brand: 'be quiet!',
        stock: 15,
        category: psuCategory._id,
        categoryPath: categoryPath,
        images: ['/images/products/bequiet-darkpowerpro12.jpg'],
        specifications: {
          'Güç': '1200W',
          'Verimlilik_Sertifikası': '80+ Titanium',
          'Modülerlik': 'Tam Modüler',
          'Fan': '135mm Silent Wings',
          'Giriş_Gerilim_Aralığı': '100-240VAC',
          'PFC': 'Aktif PFC',
          'Kapasitörler': 'Japon 105°C',
          'Verimlilik': '%94+ (50% Yükte)',
          'Boyutlar': '200mm x 150mm x 86mm',
          'Garanti': '10 yıl',
          'Özel_Özellikler': 'Overclocking Key, Wireless Fan Control'
        },
        isNewProduct: true,
        isPopular: false,
        isActive: true,
        featured: true
      },
      {
        name: 'Thermaltake Toughpower GF3 850W 80+ Gold Tam Modüler',
        description: 'Thermaltake Toughpower GF3, ATX 3.0 ve PCIe 5.0 standartlarına uyumlu, yeni nesil güç kaynağı. 12VHPWR konnektörü ile en yeni ekran kartlarını destekler.',
        price: 2899.99,
        brand: 'Thermaltake',
        stock: 25,
        category: psuCategory._id,
        categoryPath: categoryPath,
        images: ['/images/products/thermaltake-toughpower-gf3.jpg'],
        specifications: {
          'Güç': '850W',
          'Verimlilik_Sertifikası': '80+ Gold',
          'Modülerlik': 'Tam Modüler',
          'Fan': '140mm Hydraulic Bearing Fan',
          'Standartlar': 'ATX 3.0, PCIe 5.0',
          'PFC': 'Aktif PFC',
          'Kapasitörler': 'Japon',
          'MTBF': '100,000 saat',
          'Boyutlar': '150mm x 86mm x 160mm',
          'Garanti': '10 yıl',
          'PCIe_5_Konnektör': '16-pin 12VHPWR (600W)'
        },
        isNewProduct: true,
        isPopular: true,
        isActive: true,
        featured: false
      },
      {
        name: 'Cooler Master MWE 650 Gold V2 80+ Gold',
        description: 'Cooler Master MWE Gold V2, 80 PLUS Gold sertifikalı, güvenilir ve ekonomik bir güç kaynağı. 120mm LDB fanı ve DC-to-DC dönüştürme ile kararlı güç çıkışı sağlar.',
        price: 1699.99,
        brand: 'Cooler Master',
        stock: 40,
        category: psuCategory._id,
        categoryPath: categoryPath,
        images: ['/images/products/coolermaster-mwe-gold.jpg'],
        specifications: {
          'Güç': '650W',
          'Verimlilik_Sertifikası': '80+ Gold',
          'Modülerlik': 'Yarı Modüler',
          'Fan': '120mm LDB Fan',
          'Giriş_Gerilim_Aralığı': '100-240VAC',
          'PFC': 'Aktif PFC',
          'Kapasitörler': 'Japon',
          'DC_to_DC': 'Evet',
          'Verimlilik': '%90+ (50% Yükte)',
          'Boyutlar': '140mm x 150mm x 86mm',
          'Garanti': '5 yıl'
        },
        isNewProduct: false,
        isPopular: true,
        isActive: true,
        featured: false
      },
      {
        name: 'ASUS ROG Thor 1000P2 1000W 80+ Platinum Tam Modüler',
        description: 'ASUS ROG Thor, OLED ekran ve Aura Sync RGB aydınlatmalı, 80 PLUS Platinum sertifikalı premium güç kaynağı. 0dB teknolojisi ve 135mm Wing-Blade fanı ile düşük sıcaklıklarda sessiz çalışma sağlar.',
        price: 4299.99,
        brand: 'ASUS',
        stock: 20,
        category: psuCategory._id,
        categoryPath: categoryPath,
        images: ['/images/products/asus-rog-thor.jpg'],
        specifications: {
          'Güç': '1000W',
          'Verimlilik_Sertifikası': '80+ Platinum',
          'Modülerlik': 'Tam Modüler',
          'Fan': '135mm ROG Wing-Blade',
          'Giriş_Gerilim_Aralığı': '100-240VAC',
          'PFC': 'Aktif PFC',
          'Kapasitörler': 'Japon',
          'MTBF': '100,000 saat',
          'Özel_Özellikler': 'OLED Ekran, Aura Sync RGB, 0dB Teknolojisi',
          'Boyutlar': '160mm x 150mm x 86mm',
          'Garanti': '10 yıl',
          'PCIe_Gen5_Uyumluluk': 'Evet'
        },
        isNewProduct: true,
        isPopular: true,
        isActive: true,
        featured: true
      },
      {
        name: 'MSI MPG A750GF 750W 80+ Gold Tam Modüler',
        description: 'MSI MPG A750GF, yüksek verimlilikli ve tamamen modüler 80 PLUS Gold güç kaynağı. Yarı pasif fan modu ve düşük gürültü seviyesi ile kullanıcı dostu bir deneyim sunar.',
        price: 2299.99,
        brand: 'MSI',
        stock: 30,
        category: psuCategory._id,
        categoryPath: categoryPath,
        images: ['/images/products/msi-mpg-a750gf.jpg'],
        specifications: {
          'Güç': '750W',
          'Verimlilik_Sertifikası': '80+ Gold',
          'Modülerlik': 'Tam Modüler',
          'Fan': '140mm Fluid Dynamic Bearing',
          'Giriş_Gerilim_Aralığı': '100-240VAC',
          'PFC': 'Aktif PFC',
          'Kapasitörler': 'Japon',
          'DC_to_DC': 'Evet',
          'Boyutlar': '150mm x 86mm x 140mm',
          'Garanti': '10 yıl',
          'Çalışma_Modu': 'Yarı Pasif Fan Modu'
        },
        isNewProduct: false,
        isPopular: true,
        isActive: true,
        featured: false
      },
      {
        name: 'Gigabyte P750GM 750W 80+ Gold Modüler',
        description: 'Gigabyte P750GM, kompakt boyutu ve yüksek güç kalitesiyle öne çıkan 80 PLUS Gold sertifikalı bir güç kaynağı. 120mm akıllı fan ve OVP/OPP/SCP koruma özellikleri ile donatılmıştır.',
        price: 1999.99,
        brand: 'Gigabyte',
        stock: 35,
        category: psuCategory._id,
        categoryPath: categoryPath,
        images: ['/images/products/gigabyte-p750gm.jpg'],
        specifications: {
          'Güç': '750W',
          'Verimlilik_Sertifikası': '80+ Gold',
          'Modülerlik': 'Yarı Modüler',
          'Fan': '120mm Smart Fan',
          'Giriş_Gerilim_Aralığı': '100-240VAC',
          'PFC': 'Aktif PFC',
          'Kapasitörler': 'Japon',
          'Güvenlik_Özellikleri': 'OVP, UVP, OCP, OPP, SCP',
          'Boyutlar': '140mm x 150mm x 86mm',
          'Garanti': '5 yıl'
        },
        isNewProduct: false,
        isPopular: false,
        isActive: true,
        featured: false
      },
      {
        name: 'Fractal Design Ion+ 2 Platinum 860W 80+ Platinum Tam Modüler',
        description: 'Fractal Design Ion+ 2 Platinum, yüksek verimlilik ve sessiz çalışma odaklı premium güç kaynağı. UltraFlex kablolar ve yüksek kaliteli kapasitörlerle donatılmıştır.',
        price: 3199.99,
        brand: 'Fractal Design',
        stock: 20,
        category: psuCategory._id,
        categoryPath: categoryPath,
        images: ['/images/products/fractal-ion-platinum.jpg'],
        specifications: {
          'Güç': '860W',
          'Verimlilik_Sertifikası': '80+ Platinum',
          'Modülerlik': 'Tam Modüler',
          'Fan': '140mm FDB Fan',
          'Giriş_Gerilim_Aralığı': '100-240VAC',
          'PFC': 'Aktif PFC',
          'Kapasitörler': 'Japon',
          'Kablolar': 'UltraFlex',
          'MTBF': '100,000 saat',
          'Boyutlar': '150mm x 86mm x 150mm',
          'Garanti': '10 yıl',
          'Çalışma_Modu': 'Zero RPM Fan Mode'
        },
        isNewProduct: true,
        isPopular: true,
        isActive: true,
        featured: false
      }
    ];
    
    // Veritabanına ekle
    await Product.insertMany(powerSupplies);
    console.log('10 adet güç kaynağı başarıyla eklendi!');
    
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