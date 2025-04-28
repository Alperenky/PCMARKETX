const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('../config/db');
const Product = require('../models/Product');
const Category = require('../models/Category');

// Çevre değişkenlerini yükle
dotenv.config();

// Veritabanına bağlan
connectDB();

// Kategori verileri
const categories = [
  {
    name: 'İşlemciler',
    description: 'Bilgisayarınızın beyni olan işlemciler, yüksek performans ve verimlilik sunar.',
    image: '/images/categories/islemciler-banner.jpg',
    slug: 'islemciler'
  },
  {
    name: 'Ekran Kartları',
    description: 'Oyun ve grafik tasarım için yüksek performanslı ekran kartları.',
    image: '/images/categories/ekran-kartlari-banner.jpg',
    slug: 'ekran-kartlari'
  },
  {
    name: 'Anakartlar',
    description: 'Bilgisayarınızın tüm bileşenlerini bir araya getiren anakartlar.',
    image: '/images/categories/anakartlar-banner.jpg',
    slug: 'anakartlar'
  },
  {
    name: 'RAM & Bellek',
    description: 'Bilgisayarınızın hızını artıran RAM ve bellek çözümleri.',
    image: '/images/categories/ram-bellek-banner.jpg',
    slug: 'ram-bellek'
  },
  {
    name: 'Depolama',
    description: 'Verilerinizi güvenle saklayacağınız SSD ve HDD çözümleri.',
    image: '/images/categories/depolama-banner.jpg',
    slug: 'depolama'
  },
  {
    name: 'Monitörler',
    description: 'Oyun, iş ve günlük kullanım için yüksek kaliteli monitörler.',
    image: '/images/categories/monitorler-banner.jpg',
    slug: 'monitorler'
  }
];

// Örnek ürünler
const featuredProducts = [
  {
    name: 'Intel Core i7-12700K',
    description: 'Intel Core i7-12700K işlemci, 12 çekirdek ve 20 iş parçacığı ile üstün performans sunar. 5.0 GHz\'e kadar hız, oyun ve içerik oluşturma için idealdir.',
    price: 8999.99,
    brand: 'Intel',
    stock: 25,
    images: ['/images/products/cpu.jpg'],
    specifications: {
      'İşlemci Serisi': 'Core i7',
      'Çekirdek Sayısı': '12 (8P+4E)',
      'İş Parçacığı': '20',
      'Temel Frekans': '3.6 GHz',
      'Max Turbo Frekans': '5.0 GHz',
      'Önbellek': '25 MB',
      'TDP': '125W'
    },
    featured: true,
    discount: 10,
    oldPrice: 9999.99,
    isNewProduct: true
  },
  {
    name: 'NVIDIA GeForce RTX 3080',
    description: 'NVIDIA GeForce RTX 3080, oyun ve içerik oluşturma için üstün performans sunar. Ray tracing ve DLSS teknolojileri ile gerçekçi grafikler elde edin.',
    price: 15999.99,
    brand: 'NVIDIA',
    stock: 15,
    images: ['/images/products/gpu.jpg'],
    specifications: {
      'GPU': 'NVIDIA GeForce RTX 3080',
      'CUDA Çekirdekleri': '8704',
      'Bellek': '10 GB GDDR6X',
      'Bellek Arayüzü': '320-bit',
      'Boost Saat Hızı': '1.71 GHz',
      'Güç Tüketimi': '320W'
    },
    featured: true,
    discount: 0,
    oldPrice: null,
    isNewProduct: false
  },
  {
    name: 'Samsung 970 EVO Plus 1TB SSD',
    description: 'Samsung 970 EVO Plus, NVMe arayüzü ile ultra hızlı okuma ve yazma performansı sunar. 1TB kapasite ile tüm verilerinizi saklayın.',
    price: 2499.99,
    brand: 'Samsung',
    stock: 50,
    images: ['/images/products/ssd.jpg'],
    specifications: {
      'Kapasite': '1TB',
      'Arayüz': 'PCIe Gen 3.0 x4, NVMe 1.3',
      'Okuma Hızı': '3500 MB/s',
      'Yazma Hızı': '3300 MB/s',
      'NAND Tipi': 'V-NAND 3-bit MLC',
      'Dayanıklılık': '600 TBW'
    },
    featured: true,
    discount: 17,
    oldPrice: 2999.99,
    isNewProduct: false
  },
  {
    name: 'Corsair Vengeance RGB Pro 32GB',
    description: 'Corsair Vengeance RGB Pro, yüksek performanslı 32GB (2x16GB) DDR4 bellek kiti. RGB aydınlatma ile bilgisayarınıza stil katın.',
    price: 1899.99,
    brand: 'Corsair',
    stock: 30,
    images: ['/images/products/ram.jpg'],
    specifications: {
      'Kapasite': '32GB (2x16GB)',
      'Hız': '3600MHz',
      'Gecikme': 'CL18',
      'Voltaj': '1.35V',
      'Aydınlatma': 'RGB',
      'Profiller': 'XMP 2.0'
    },
    featured: true,
    discount: 0,
    oldPrice: null,
    isNewProduct: true
  },
  {
    name: 'ASUS ROG Strix Z690-E Gaming',
    description: 'ASUS ROG Strix Z690-E Gaming, Intel 12. nesil işlemciler için tasarlanmış yüksek performanslı anakart. WiFi 6E ve PCIe 5.0 desteği.',
    price: 6499.99,
    brand: 'ASUS',
    stock: 20,
    images: ['/images/products/motherboard.jpg'],
    specifications: {
      'Soket': 'LGA 1700',
      'Chipset': 'Intel Z690',
      'Bellek': 'DDR5, 4 Slot, Max 128GB',
      'Genişleme Slotları': '2x PCIe 5.0 x16, 1x PCIe 3.0 x16',
      'Depolama': '4x M.2, 6x SATA 6Gb/s',
      'Ağ': '2.5G LAN, WiFi 6E',
      'USB': 'USB 3.2 Gen 2x2 Type-C, USB 3.2 Gen 2, USB 3.2 Gen 1'
    },
    featured: true,
    discount: 7,
    oldPrice: 6999.99,
    isNewProduct: false
  }
];

// Kategori ürünleri oluşturmak için fonksiyon
const generateCategoryProducts = (categorySlug, categoryId) => {
  const categoryData = {
    'islemciler': {
      brands: ['Intel', 'AMD', 'Apple'],
      count: 24,
      namePrefix: 'İşlemci'
    },
    'ekran-kartlari': {
      brands: ['NVIDIA', 'AMD', 'ASUS', 'MSI', 'Gigabyte'],
      count: 32,
      namePrefix: 'Ekran Kartı'
    },
    'anakartlar': {
      brands: ['ASUS', 'MSI', 'Gigabyte', 'ASRock'],
      count: 28,
      namePrefix: 'Anakart'
    },
    'ram-bellek': {
      brands: ['Corsair', 'Kingston', 'G.Skill', 'Crucial'],
      count: 20,
      namePrefix: 'RAM'
    },
    'depolama': {
      brands: ['Samsung', 'Western Digital', 'Seagate', 'Crucial', 'Kingston'],
      count: 30,
      namePrefix: 'SSD'
    },
    'monitorler': {
      brands: ['Samsung', 'LG', 'ASUS', 'MSI', 'Dell', 'HP', 'AOC'],
      count: 26,
      namePrefix: 'Monitör'
    }
  };

  const category = categoryData[categorySlug];
  const products = [];

  for (let i = 1; i <= category.count; i++) {
    const brandIndex = Math.floor(Math.random() * category.brands.length);
    const brand = category.brands[brandIndex];
    
    const isNewProduct = Math.random() < 0.2; // 20% chance to be new
    const hasDiscount = Math.random() < 0.4; // 40% chance to have discount
    
    const basePrice = Math.floor(Math.random() * 10000) + 1000; // Random price between 1000-11000
    const discountPercent = hasDiscount ? Math.floor(Math.random() * 30) + 5 : 0; // 5-35% discount
    const discountedPrice = hasDiscount ? Math.round(basePrice * (1 - discountPercent / 100)) : basePrice;
    
    const modelNumber = Math.floor(Math.random() * 1000);
    const productName = `${brand} ${category.namePrefix} ${modelNumber}`;
    
    products.push({
      name: productName,
      description: `${productName} - Yüksek performanslı ${category.namePrefix.toLowerCase()} modeli. En yeni teknoloji ile donatılmış, uzun ömürlü ve güvenilir.`,
      price: discountedPrice,
      category: categoryId,
      brand: brand,
      stock: Math.floor(Math.random() * 50) + 5, // 5-55 stock
      images: [`/images/products/${categorySlug}-${i % 5 + 1}.jpg`],
      specifications: {
        'Marka': brand,
        'Model': `${category.namePrefix} ${modelNumber}`,
        'Garanti': '24 Ay'
      },
      featured: Math.random() < 0.1, // 10% chance to be featured
      discount: discountPercent,
      oldPrice: hasDiscount ? basePrice : null,
      isNewProduct: isNewProduct
    });
  }

  return products;
};

// Veritabanını temizle ve yeni verileri ekle
const seedDatabase = async () => {
  try {
    // Veritabanını temizle
    await Product.deleteMany({});
    await Category.deleteMany({});
    
    console.log('Veritabanı temizlendi');
    
    // Kategorileri ekle
    const createdCategories = await Category.insertMany(categories);
    console.log(`${createdCategories.length} kategori eklendi`);
    
    // Kategori ID'lerini eşleştir
    const categoryMap = {};
    createdCategories.forEach(cat => {
      categoryMap[cat.slug] = cat._id;
    });
    
    // Öne çıkan ürünleri ekle
    const mappedFeaturedProducts = featuredProducts.map(product => {
      // Kategori ID'sini bul
      let categoryId = null;
      if (product.name.includes('İşlemci') || product.name.includes('Core i7')) {
        categoryId = categoryMap['islemciler'];
      } else if (product.name.includes('GeForce') || product.name.includes('RTX')) {
        categoryId = categoryMap['ekran-kartlari'];
      } else if (product.name.includes('SSD') || product.name.includes('EVO')) {
        categoryId = categoryMap['depolama'];
      } else if (product.name.includes('RAM') || product.name.includes('Vengeance')) {
        categoryId = categoryMap['ram-bellek'];
      } else if (product.name.includes('Anakart') || product.name.includes('ROG') || product.name.includes('Z690')) {
        categoryId = categoryMap['anakartlar'];
      } else {
        // Varsayılan kategori
        categoryId = createdCategories[0]._id;
      }
      
      return {
        ...product,
        category: categoryId
      };
    });
    
    const createdFeaturedProducts = await Product.insertMany(mappedFeaturedProducts);
    console.log(`${createdFeaturedProducts.length} öne çıkan ürün eklendi`);
    
    // Her kategori için ürünler oluştur ve ekle
    let totalProducts = createdFeaturedProducts.length;
    
    for (const category of createdCategories) {
      const categoryProducts = generateCategoryProducts(category.slug, category._id);
      await Product.insertMany(categoryProducts);
      totalProducts += categoryProducts.length;
      console.log(`${categoryProducts.length} ürün ${category.name} kategorisine eklendi`);
    }
    
    console.log(`Toplam ${totalProducts} ürün veritabanına eklendi`);
    
    console.log('Veritabanı başarıyla dolduruldu!');
    process.exit();
  } catch (error) {
    console.error('Hata:', error.message);
    process.exit(1);
  }
};

// Veritabanını doldur
seedDatabase(); 