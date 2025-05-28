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
    
    // Alt kategori: RAM Bellek
    let ramCategory = await Category.findOne({ slug: 'ram-bellek' });
    
    if (!ramCategory) {
      try {
        ramCategory = await Category.create({
          name: 'RAM Bellek',
          description: 'DDR4 ve DDR5 RAM bellek modülleri, her tür sistem için yüksek performanslı bellekler',
          image: '/images/categories/ram-bellek-banner.jpg',
          slug: 'ram-bellek',
          parent: computerPartsCategory._id
        });
        console.log('RAM Bellek alt kategorisi oluşturuldu.');
      } catch (error) {
        if (error.code === 11000) {
          ramCategory = await Category.findOne({ name: 'RAM Bellek' });
          // Eğer parent yoksa güncelle
          if (ramCategory && !ramCategory.parent) {
            ramCategory.parent = computerPartsCategory._id;
            await ramCategory.save();
            console.log('Mevcut RAM Bellek kategorisi güncellendi ve ana kategoriye bağlandı.');
          } else {
            console.log('Mevcut RAM Bellek kategorisi kullanılıyor.');
          }
        } else {
          throw error;
        }
      }
    } else {
      // Eğer parent yoksa güncelle
      if (!ramCategory.parent) {
        ramCategory.parent = computerPartsCategory._id;
        await ramCategory.save();
        console.log('Mevcut RAM Bellek kategorisi güncellendi ve ana kategoriye bağlandı.');
      } else {
        console.log('Mevcut RAM Bellek kategorisi kullanılıyor.');
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
        _id: ramCategory._id,
        name: ramCategory.name,
        slug: ramCategory.slug
      }
    ];
    
    // RAM Bellek eklenmeden önce mevcut ürünleri sil
    await Product.deleteMany({ category: ramCategory._id });
    console.log('Mevcut RAM bellek ürünleri silindi.');
    
    // Popüler RAM bellekleri ekle
    const rams = [
      {
        name: 'Corsair Dominator Platinum RGB DDR5 32GB (2x16GB) 6200MHz',
        description: 'Corsair Dominator Platinum RGB, DDR5 teknolojisi ile muhteşem RGB aydınlatma ve sıradışı performansı birleştiren premium bellek modülleri. İleri düzey soğutma sistemi ve özel PCB tasarımı ile yüksek hızlarda kararlı çalışma sunar.',
        price: 4999.99,
        brand: 'Corsair',
        stock: 25,
        category: ramCategory._id,
        categoryPath: categoryPath,
        images: ['/images/products/corsair-dominator-ddr5.jpg'],
        specifications: {
          'Bellek_Tipi': 'DDR5',
          'Kapasite': '32GB (2x16GB)',
          'Hız': '6200MHz',
          'CAS_Latency': 'CL36',
          'Voltaj': '1.35V',
          'Soğutma': 'Alüminyum ısı emici, Patentli DHX soğutma',
          'Aydınlatma': '12 adet CAPELLIX RGB LED',
          'Profiller': 'XMP 3.0',
          'Renk': 'Siyah'
        },
        isNewProduct: true,
        isPopular: true,
        isActive: true,
        featured: true
      },
      {
        name: 'G.Skill Trident Z5 RGB DDR5 32GB (2x16GB) 6400MHz',
        description: 'G.Skill Trident Z5 RGB, DDR5 platformu için maksimum performans ve gösterişli RGB aydınlatma sunan üst düzey bellek kiti. Yüksek kaliteli çiplerle aşırı hız ve düşük gecikme süresi sağlar.',
        price: 5299.99,
        brand: 'G.Skill',
        stock: 20,
        category: ramCategory._id,
        categoryPath: categoryPath,
        images: ['/images/products/gskill-tridentz5-ddr5.jpg'],
        specifications: {
          'Bellek_Tipi': 'DDR5',
          'Kapasite': '32GB (2x16GB)',
          'Hız': '6400MHz',
          'CAS_Latency': 'CL32',
          'Voltaj': '1.40V',
          'Soğutma': 'Alüminyum ısı emici',
          'Aydınlatma': 'Tam boy RGB ışık çubuğu',
          'Profiller': 'Intel XMP 3.0',
          'Renk': 'Siyah/Gümüş'
        },
        isNewProduct: true,
        isPopular: true,
        isActive: true,
        featured: true
      },
      {
        name: 'Kingston FURY Beast RGB DDR4 32GB (2x16GB) 3600MHz',
        description: 'Kingston FURY Beast RGB, oyuncular ve performans tutkunları için tasarlanmış, yüksek hızlı DDR4 bellek modülleri. Senkronize edilebilir RGB aydınlatma ve otomatik overclocking özellikleri sunar.',
        price: 2199.99,
        brand: 'Kingston',
        stock: 35,
        category: ramCategory._id,
        categoryPath: categoryPath,
        images: ['/images/products/kingston-fury-beast-rgb.jpg'],
        specifications: {
          'Bellek_Tipi': 'DDR4',
          'Kapasite': '32GB (2x16GB)',
          'Hız': '3600MHz',
          'CAS_Latency': 'CL18',
          'Voltaj': '1.35V',
          'Soğutma': 'Alüminyum ısı emici',
          'Aydınlatma': 'RGB LED aydınlatma',
          'Profiller': 'Intel XMP 2.0',
          'Renk': 'Siyah'
        },
        isNewProduct: false,
        isPopular: true,
        isActive: true,
        featured: false
      },
      {
        name: 'Crucial Ballistix MAX RGB DDR4 32GB (2x16GB) 4400MHz',
        description: 'Crucial Ballistix MAX RGB, yüksek performans için özel olarak tasarlanmış premium DDR4 bellek. Üstün hız aşırtma potansiyeli ve 8 bölgeli RGB LED aydınlatmaya sahiptir.',
        price: 2799.99,
        brand: 'Crucial',
        stock: 15,
        category: ramCategory._id,
        categoryPath: categoryPath,
        images: ['/images/products/crucial-ballistix-max-rgb.jpg'],
        specifications: {
          'Bellek_Tipi': 'DDR4',
          'Kapasite': '32GB (2x16GB)',
          'Hız': '4400MHz',
          'CAS_Latency': 'CL19',
          'Voltaj': '1.40V',
          'Soğutma': 'Alüminyum ısı emici',
          'Aydınlatma': '8 bölgeli RGB LED',
          'Profiller': 'XMP 2.0',
          'Renk': 'Siyah'
        },
        isNewProduct: false,
        isPopular: true,
        isActive: true,
        featured: false
      },
      {
        name: 'Corsair Vengeance LPX DDR4 32GB (2x16GB) 3200MHz',
        description: 'Corsair Vengeance LPX, düşük profilli tasarımıyla sınırlı alanlar için ideal, sade ve güvenilir DDR4 bellek. Yüksek performans ve uyumluluk sunar.',
        price: 1799.99,
        brand: 'Corsair',
        stock: 50,
        category: ramCategory._id,
        categoryPath: categoryPath,
        images: ['/images/products/corsair-vengeance-lpx.jpg'],
        specifications: {
          'Bellek_Tipi': 'DDR4',
          'Kapasite': '32GB (2x16GB)',
          'Hız': '3200MHz',
          'CAS_Latency': 'CL16',
          'Voltaj': '1.35V',
          'Soğutma': 'Alüminyum ısı emici',
          'Aydınlatma': 'Yok',
          'Profiller': 'XMP 2.0',
          'Renk': 'Siyah'
        },
        isNewProduct: false,
        isPopular: true,
        isActive: true,
        featured: false
      },
      {
        name: 'TeamGroup T-Force Delta RGB DDR4 32GB (2x16GB) 3600MHz',
        description: 'TeamGroup T-Force Delta RGB, tam boy RGB aydınlatma ve üstün soğutma özelliklerine sahip oyuncu odaklı bellek modülleri. Çarpıcı RGB efektleri ve yüksek performans sunar.',
        price: 2099.99,
        brand: 'TeamGroup',
        stock: 30,
        category: ramCategory._id,
        categoryPath: categoryPath,
        images: ['/images/products/teamgroup-tforce-delta.jpg'],
        specifications: {
          'Bellek_Tipi': 'DDR4',
          'Kapasite': '32GB (2x16GB)',
          'Hız': '3600MHz',
          'CAS_Latency': 'CL18',
          'Voltaj': '1.35V',
          'Soğutma': 'Üçgen tasarımlı ısı emici',
          'Aydınlatma': '120° geniş açılı RGB aydınlatma',
          'Profiller': 'XMP 2.0',
          'Renk': 'Beyaz'
        },
        isNewProduct: false,
        isPopular: true,
        isActive: true,
        featured: false
      },
      {
        name: 'Crucial DDR5 32GB (2x16GB) 5600MHz',
        description: 'Crucial DDR5, en yeni nesil DDR5 teknolojisiyle üstün performans sunan, sade tasarımlı bellek modülleri. Yüksek verimlilik ve güvenilirlik sağlar.',
        price: 3499.99,
        brand: 'Crucial',
        stock: 25,
        category: ramCategory._id,
        categoryPath: categoryPath,
        images: ['/images/products/crucial-ddr5.jpg'],
        specifications: {
          'Bellek_Tipi': 'DDR5',
          'Kapasite': '32GB (2x16GB)',
          'Hız': '5600MHz',
          'CAS_Latency': 'CL46',
          'Voltaj': '1.25V',
          'Soğutma': 'Düşük profilli ısı emici',
          'Aydınlatma': 'Yok',
          'Profiller': 'XMP 3.0',
          'Renk': 'Siyah'
        },
        isNewProduct: true,
        isPopular: false,
        isActive: true,
        featured: false
      },
      {
        name: 'G.Skill Ripjaws V DDR4 32GB (2x16GB) 3600MHz',
        description: 'G.Skill Ripjaws V, performans ve fiyat dengesini gözeten, güvenilir DDR4 bellek serisi. Anakart uyumluluğu ve kararlı çalışmasıyla tanınır.',
        price: 1899.99,
        brand: 'G.Skill',
        stock: 40,
        category: ramCategory._id,
        categoryPath: categoryPath,
        images: ['/images/products/gskill-ripjaws-v.jpg'],
        specifications: {
          'Bellek_Tipi': 'DDR4',
          'Kapasite': '32GB (2x16GB)',
          'Hız': '3600MHz',
          'CAS_Latency': 'CL16',
          'Voltaj': '1.35V',
          'Soğutma': 'Alüminyum ısı emici',
          'Aydınlatma': 'Yok',
          'Profiller': 'XMP 2.0',
          'Renk': 'Kırmızı'
        },
        isNewProduct: false,
        isPopular: true,
        isActive: true,
        featured: false
      },
      {
        name: 'Kingston FURY Renegade DDR4 32GB (2x16GB) 4000MHz',
        description: 'Kingston FURY Renegade, oyuncular ve overclockerlar için üst düzey performans sunan premium DDR4 bellek. Sıkı seçilmiş çiplerle en zorlu görevlerde bile üstün hız sağlar.',
        price: 2599.99,
        brand: 'Kingston',
        stock: 20,
        category: ramCategory._id,
        categoryPath: categoryPath,
        images: ['/images/products/kingston-fury-renegade.jpg'],
        specifications: {
          'Bellek_Tipi': 'DDR4',
          'Kapasite': '32GB (2x16GB)',
          'Hız': '4000MHz',
          'CAS_Latency': 'CL19',
          'Voltaj': '1.35V',
          'Soğutma': 'Siyah alüminyum ısı emici',
          'Aydınlatma': 'Yok',
          'Profiller': 'XMP 2.0',
          'Renk': 'Siyah'
        },
        isNewProduct: false,
        isPopular: true,
        isActive: true,
        featured: false
      },
      {
        name: 'ADATA XPG Lancer RGB DDR5 32GB (2x16GB) 6000MHz',
        description: 'ADATA XPG Lancer RGB, DDR5 platformunda üstün oyun performansı sunan, ışıklı RGB aydınlatmalı bellek modülleri. En yeni oyunlar ve içerik üretimi için ideal.',
        price: 4799.99,
        brand: 'ADATA',
        stock: 18,
        category: ramCategory._id,
        categoryPath: categoryPath,
        images: ['/images/products/adata-xpg-lancer-rgb.jpg'],
        specifications: {
          'Bellek_Tipi': 'DDR5',
          'Kapasite': '32GB (2x16GB)',
          'Hız': '6000MHz',
          'CAS_Latency': 'CL40',
          'Voltaj': '1.35V',
          'Soğutma': 'Alüminyum ısı emici',
          'Aydınlatma': 'RGB LED şerit',
          'Profiller': 'XMP 3.0',
          'Renk': 'Siyah'
        },
        isNewProduct: true,
        isPopular: true,
        isActive: true,
        featured: false
      }
    ];
    
    // Veritabanına ekle
    await Product.insertMany(rams);
    console.log('10 adet RAM bellek başarıyla eklendi!');
    
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