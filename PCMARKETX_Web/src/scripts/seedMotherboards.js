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
    
    // Alt kategori: Anakartlar
    let motherboardCategory = await Category.findOne({ slug: 'anakartlar' });
    
    if (!motherboardCategory) {
      try {
        motherboardCategory = await Category.create({
          name: 'Anakartlar',
          description: 'Intel ve AMD işlemciler için yüksek performanslı anakartlar',
          image: '/images/categories/anakartlar-banner.jpg',
          slug: 'anakartlar',
          parent: computerPartsCategory._id
        });
        console.log('Anakartlar alt kategorisi oluşturuldu.');
      } catch (error) {
        if (error.code === 11000) {
          motherboardCategory = await Category.findOne({ name: 'Anakartlar' });
          // Eğer parent yoksa güncelle
          if (motherboardCategory && !motherboardCategory.parent) {
            motherboardCategory.parent = computerPartsCategory._id;
            await motherboardCategory.save();
            console.log('Mevcut Anakartlar kategorisi güncellendi ve ana kategoriye bağlandı.');
          } else {
            console.log('Mevcut Anakartlar kategorisi kullanılıyor.');
          }
        } else {
          throw error;
        }
      }
    } else {
      // Eğer parent yoksa güncelle
      if (!motherboardCategory.parent) {
        motherboardCategory.parent = computerPartsCategory._id;
        await motherboardCategory.save();
        console.log('Mevcut Anakartlar kategorisi güncellendi ve ana kategoriye bağlandı.');
      } else {
        console.log('Mevcut Anakartlar kategorisi kullanılıyor.');
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
        _id: motherboardCategory._id,
        name: motherboardCategory.name,
        slug: motherboardCategory.slug
      }
    ];
    
    // Anakartlar eklenmeden önce mevcut anakartları sil
    await Product.deleteMany({ category: motherboardCategory._id });
    console.log('Mevcut anakartlar silindi.');
    
    // Popüler anakartları ekle
    const motherboards = [
      {
        name: 'ASUS ROG Maximus Z790 Hero',
        description: 'ASUS ROG Maximus Z790 Hero, Intel 13. ve 14. nesil işlemcileri destekleyen premium özellikli anakart. Üstün güç dağıtımı, gelişmiş soğutma ve en son bağlantı teknolojilerini sunar.',
        price: 13999.99,
        brand: 'ASUS',
        stock: 20,
        category: motherboardCategory._id,
        categoryPath: categoryPath,
        images: ['/images/products/asus-maximus-z790-hero.jpg'],
        specifications: {
          'CPU_Soket': 'LGA 1700',
          'Chipset': 'Intel Z790',
          'Form_Faktör': 'ATX',
          'RAM_Yuvaları': '4x DDR5 DIMM (Max 128GB)',
          'RAM_Hızı': 'DDR5-8000+ (OC)',
          'M2_Yuvaları': '5x M.2 PCIe 4.0',
          'PCIe_Slotları': '1x PCIe 5.0 x16, 1x PCIe 4.0 x16, 1x PCIe 3.0 x16',
          'SATA': '6x SATA 6Gb/s',
          'LAN': 'Intel 2.5Gb Ethernet',
          'Kablosuz': 'Wi-Fi 6E (802.11ax) + Bluetooth 5.3',
          'USB': '3x USB 3.2 Gen 2x2 Type-C, Multiple USB 3.2 Gen 2/Gen 1',
          'Audio': 'ROG SupremeFX 7.1 Surround Sound'
        },
        isNewProduct: true,
        isPopular: true,
        isActive: true,
        featured: true
      },
      {
        name: 'MSI MEG X670E GODLIKE',
        description: 'MSI MEG X670E GODLIKE, AMD Ryzen 7000 serisi işlemciler için üst segment anakart. Sınırsız güç dağıtımı, son teknoloji ısı dağıtımı ve zengin bağlantı seçenekleri sunar.',
        price: 15999.99,
        brand: 'MSI',
        stock: 15,
        category: motherboardCategory._id,
        categoryPath: categoryPath,
        images: ['/images/products/msi-meg-x670e-godlike.jpg'],
        specifications: {
          'CPU_Soket': 'AMD AM5 (LGA 1718)',
          'Chipset': 'AMD X670E',
          'Form_Faktör': 'E-ATX',
          'RAM_Yuvaları': '4x DDR5 DIMM (Max 128GB)',
          'RAM_Hızı': 'DDR5-7600+ (OC)',
          'M2_Yuvaları': '5x M.2 PCIe 5.0/4.0',
          'PCIe_Slotları': '2x PCIe 5.0 x16, 1x PCIe 4.0 x16',
          'SATA': '8x SATA 6Gb/s',
          'LAN': 'Dual Intel 2.5Gb Ethernet',
          'Kablosuz': 'Wi-Fi 6E + Bluetooth 5.3',
          'USB': '2x USB 3.2 Gen 2x2 Type-C, Multiple USB 3.2 Gen 2/Gen 1',
          'Audio': 'ESS E5618 + ESS SABRE9280AQ DAC, 7.1 HD Audio',
          'Özel_Özellikler': 'M-Vision Dashboard (IPS Dokunmatik Ekran)'
        },
        isNewProduct: true,
        isPopular: true,
        isActive: true,
        featured: true
      },
      {
        name: 'Gigabyte Z790 AORUS MASTER',
        description: 'Gigabyte Z790 AORUS MASTER, Intel 13. ve 14. nesil işlemciler için AORUS serisinin üst düzey anakartı. Gelişmiş VRM tasarımı, thermal guard ve hız aşırtma özellikleri ile öne çıkar.',
        price: 11499.99,
        brand: 'Gigabyte',
        stock: 22,
        category: motherboardCategory._id,
        categoryPath: categoryPath,
        images: ['/images/products/gigabyte-z790-aorus-master.jpg'],
        specifications: {
          'CPU_Soket': 'LGA 1700',
          'Chipset': 'Intel Z790',
          'Form_Faktör': 'ATX',
          'RAM_Yuvaları': '4x DDR5 DIMM (Max 128GB)',
          'RAM_Hızı': 'DDR5-8000+ (OC)',
          'M2_Yuvaları': '4x M.2 PCIe 4.0',
          'PCIe_Slotları': '1x PCIe 5.0 x16, 2x PCIe 4.0 x16',
          'SATA': '6x SATA 6Gb/s',
          'LAN': 'Intel 2.5Gb Ethernet',
          'Kablosuz': 'Wi-Fi 6E + Bluetooth 5.3',
          'USB': '1x USB 3.2 Gen 2x2 Type-C, Multiple USB 3.2 Gen 2/Gen 1',
          'Audio': 'Realtek ALC1220-VB, 7.1 HD Audio',
          'Soğutma': 'Thermal Guard III, MOSFET Heatsinks'
        },
        isNewProduct: true,
        isPopular: true,
        isActive: true,
        featured: false
      },
      {
        name: 'ASRock X670E Taichi',
        description: 'ASRock X670E Taichi, AMD Ryzen 7000 serisi işlemciler için tasarlanmış bir amiral gemisi anakart. Dişli temalı tasarımı ve güçlü özellikleriyle tanınır.',
        price: 10999.99,
        brand: 'ASRock',
        stock: 18,
        category: motherboardCategory._id,
        categoryPath: categoryPath,
        images: ['/images/products/asrock-x670e-taichi.jpg'],
        specifications: {
          'CPU_Soket': 'AMD AM5 (LGA 1718)',
          'Chipset': 'AMD X670E',
          'Form_Faktör': 'ATX',
          'RAM_Yuvaları': '4x DDR5 DIMM (Max 128GB)',
          'RAM_Hızı': 'DDR5-6600+ (OC)',
          'M2_Yuvaları': '4x M.2 PCIe 5.0/4.0',
          'PCIe_Slotları': '1x PCIe 5.0 x16, 2x PCIe 4.0 x16',
          'SATA': '8x SATA 6Gb/s',
          'LAN': 'Killer E3100G 2.5Gb Ethernet',
          'Kablosuz': 'Killer Wi-Fi 6E + Bluetooth 5.3',
          'USB': '1x USB 3.2 Gen 2x2 Type-C, Multiple USB 3.2 Gen 2/Gen 1',
          'Audio': 'Realtek ALC4082, 7.1 HD Audio',
          'Özel_Özellikler': 'Dişli tasarımlı heatsink ve RGB aydınlatma'
        },
        isNewProduct: true,
        isPopular: false,
        isActive: true,
        featured: false
      },
      {
        name: 'ASUS TUF Gaming B760M-PLUS WIFI',
        description: 'ASUS TUF Gaming B760M-PLUS WIFI, orta seviye oyun sistemleri için askeri sınıf dayanıklılık sunan mikro-ATX anakart. Sağlamlık ve uygun fiyatla güvenilir performans sunar.',
        price: 4599.99,
        brand: 'ASUS',
        stock: 50,
        category: motherboardCategory._id,
        categoryPath: categoryPath,
        images: ['/images/products/asus-tuf-b760m-plus-wifi.jpg'],
        specifications: {
          'CPU_Soket': 'LGA 1700',
          'Chipset': 'Intel B760',
          'Form_Faktör': 'Micro-ATX',
          'RAM_Yuvaları': '4x DDR5 DIMM (Max 128GB)',
          'RAM_Hızı': 'DDR5-7000+ (OC)',
          'M2_Yuvaları': '2x M.2 PCIe 4.0',
          'PCIe_Slotları': '1x PCIe 5.0 x16, 1x PCIe 3.0 x16',
          'SATA': '4x SATA 6Gb/s',
          'LAN': 'Realtek 2.5Gb Ethernet',
          'Kablosuz': 'Wi-Fi 6 + Bluetooth 5.2',
          'USB': '1x USB 3.2 Gen 2x2 Type-C, Multiple USB 3.2 Gen 2/Gen 1',
          'Audio': 'Realtek 7.1 HD Audio',
          'Özel_Özellikler': 'TUF Koruma, Askeri Sınıf Komponentler'
        },
        isNewProduct: false,
        isPopular: true,
        isActive: true,
        featured: false
      },
      {
        name: 'MSI MPG B650 GAMING EDGE WIFI',
        description: 'MSI MPG B650 GAMING EDGE WIFI, AMD Ryzen 7000 serisi işlemciler için tasarlanmış orta-üst segment bir anakart. RGB aydınlatma ve güçlü soğutma tasarımına sahiptir.',
        price: 5999.99,
        brand: 'MSI',
        stock: 40,
        category: motherboardCategory._id,
        categoryPath: categoryPath,
        images: ['/images/products/msi-mpg-b650-edge-wifi.jpg'],
        specifications: {
          'CPU_Soket': 'AMD AM5 (LGA 1718)',
          'Chipset': 'AMD B650',
          'Form_Faktör': 'ATX',
          'RAM_Yuvaları': '4x DDR5 DIMM (Max 128GB)',
          'RAM_Hızı': 'DDR5-6600+ (OC)',
          'M2_Yuvaları': '3x M.2 PCIe 4.0',
          'PCIe_Slotları': '1x PCIe 5.0 x16, 1x PCIe 3.0 x16',
          'SATA': '6x SATA 6Gb/s',
          'LAN': 'Intel 2.5Gb Ethernet',
          'Kablosuz': 'Wi-Fi 6E + Bluetooth 5.3',
          'USB': '1x USB 3.2 Gen 2x2 Type-C, Multiple USB 3.2 Gen 2/Gen 1',
          'Audio': 'Realtek ALC1220, 7.1 HD Audio',
          'Aydınlatma': 'Mystic Light RGB'
        },
        isNewProduct: false,
        isPopular: true,
        isActive: true,
        featured: false
      },
      {
        name: 'Gigabyte B650 AORUS ELITE AX',
        description: 'Gigabyte B650 AORUS ELITE AX, AMD Ryzen 7000 serisi işlemciler için fiyat/performans dengesini gözeten, kablosuz bağlantı özellikleri ile donatılmış anakart.',
        price: 5499.99,
        brand: 'Gigabyte',
        stock: 35,
        category: motherboardCategory._id,
        categoryPath: categoryPath,
        images: ['/images/products/gigabyte-b650-aorus-elite-ax.jpg'],
        specifications: {
          'CPU_Soket': 'AMD AM5 (LGA 1718)',
          'Chipset': 'AMD B650',
          'Form_Faktör': 'ATX',
          'RAM_Yuvaları': '4x DDR5 DIMM (Max 128GB)',
          'RAM_Hızı': 'DDR5-6600+ (OC)',
          'M2_Yuvaları': '4x M.2 PCIe 4.0',
          'PCIe_Slotları': '1x PCIe 4.0 x16, 1x PCIe 3.0 x16',
          'SATA': '4x SATA 6Gb/s',
          'LAN': 'Realtek 2.5Gb Ethernet',
          'Kablosuz': 'Wi-Fi 6E + Bluetooth 5.2',
          'USB': '1x USB 3.2 Gen 2x2 Type-C, Multiple USB 3.2 Gen 2/Gen 1',
          'Audio': 'Realtek ALC1220, 7.1 HD Audio',
          'Aydınlatma': 'RGB Fusion 2.0'
        },
        isNewProduct: false,
        isPopular: true,
        isActive: true,
        featured: false
      },
      {
        name: 'ASUS ProArt Z790-CREATOR WIFI',
        description: 'ASUS ProArt Z790-CREATOR WIFI, içerik üreticileri için tasarlanmış Intel 13. ve 14. nesil işlemcileri destekleyen premium anakart. İş istasyonları için ideal seçim.',
        price: 9999.99,
        brand: 'ASUS',
        stock: 25,
        category: motherboardCategory._id,
        categoryPath: categoryPath,
        images: ['/images/products/asus-proart-z790-creator.jpg'],
        specifications: {
          'CPU_Soket': 'LGA 1700',
          'Chipset': 'Intel Z790',
          'Form_Faktör': 'ATX',
          'RAM_Yuvaları': '4x DDR5 DIMM (Max 128GB)',
          'RAM_Hızı': 'DDR5-7800+ (OC)',
          'M2_Yuvaları': '4x M.2 PCIe 4.0',
          'PCIe_Slotları': '1x PCIe 5.0 x16, 2x PCIe 4.0 x16',
          'SATA': '4x SATA 6Gb/s',
          'LAN': 'Dual Intel 2.5Gb Ethernet',
          'Kablosuz': 'Wi-Fi 6E + Bluetooth 5.2',
          'USB': '2x Thunderbolt 4 Type-C, Multiple USB 3.2 Gen 2',
          'Audio': 'Realtek ALC4080, 7.1 HD Audio',
          'Özel_Özellikler': 'Thunderbolt 4, Profesyonel tasarım'
        },
        isNewProduct: false,
        isPopular: false,
        isActive: true,
        featured: true
      },
      {
        name: 'ASRock B760M Pro RS/D4',
        description: 'ASRock B760M Pro RS/D4, Intel 13. ve 14. nesil işlemcilere uygun, bütçe dostu ancak DDR4 bellek desteği sunan kompakt Micro-ATX anakart.',
        price: 2999.99,
        brand: 'ASRock',
        stock: 60,
        category: motherboardCategory._id,
        categoryPath: categoryPath,
        images: ['/images/products/asrock-b760m-pro-rs-d4.jpg'],
        specifications: {
          'CPU_Soket': 'LGA 1700',
          'Chipset': 'Intel B760',
          'Form_Faktör': 'Micro-ATX',
          'RAM_Yuvaları': '4x DDR4 DIMM (Max 128GB)',
          'RAM_Hızı': 'DDR4-5333+ (OC)',
          'M2_Yuvaları': '2x M.2 PCIe 4.0',
          'PCIe_Slotları': '1x PCIe 4.0 x16, 1x PCIe 3.0 x16',
          'SATA': '4x SATA 6Gb/s',
          'LAN': 'Realtek 2.5Gb Ethernet',
          'USB': '1x USB 3.2 Gen 2 Type-C, Multiple USB 3.2 Gen 1',
          'Audio': 'Realtek ALC897, 7.1 HD Audio'
        },
        isNewProduct: false,
        isPopular: true,
        isActive: true,
        featured: false
      },
      {
        name: 'MSI MAG X670E TOMAHAWK WIFI',
        description: 'MSI MAG X670E TOMAHAWK WIFI, AMD Ryzen 7000 serisi işlemciler için güçlü VRM ve gelişmiş termal çözümler sunan, dayanıklılığa odaklı oyuncu anakartı.',
        price: 7499.99,
        brand: 'MSI',
        stock: 30,
        category: motherboardCategory._id,
        categoryPath: categoryPath,
        images: ['/images/products/msi-mag-x670e-tomahawk.jpg'],
        specifications: {
          'CPU_Soket': 'AMD AM5 (LGA 1718)',
          'Chipset': 'AMD X670E',
          'Form_Faktör': 'ATX',
          'RAM_Yuvaları': '4x DDR5 DIMM (Max 128GB)',
          'RAM_Hızı': 'DDR5-7200+ (OC)',
          'M2_Yuvaları': '4x M.2 PCIe 5.0/4.0',
          'PCIe_Slotları': '1x PCIe 5.0 x16, 1x PCIe 4.0 x16',
          'SATA': '6x SATA 6Gb/s',
          'LAN': 'Intel 2.5Gb Ethernet',
          'Kablosuz': 'Wi-Fi 6E + Bluetooth 5.3',
          'USB': '1x USB 3.2 Gen 2x2 Type-C, Multiple USB 3.2 Gen 2/Gen 1',
          'Audio': 'Realtek ALC1220, 7.1 HD Audio',
          'Soğutma': 'Extended Heatsink Design'
        },
        isNewProduct: false,
        isPopular: true,
        isActive: true,
        featured: false
      },
      {
        name: 'Gigabyte H610M H DDR4',
        description: 'Gigabyte H610M H DDR4, Intel 12. ve 13. nesil işlemcilere uyumlu giriş seviyesi Micro-ATX anakart. Ekonomik fiyatı ve DDR4 desteği ile temel sistemler için ideal.',
        price: 1999.99,
        brand: 'Gigabyte',
        stock: 75,
        category: motherboardCategory._id,
        categoryPath: categoryPath,
        images: ['/images/products/gigabyte-h610m-h-ddr4.jpg'],
        specifications: {
          'CPU_Soket': 'LGA 1700',
          'Chipset': 'Intel H610',
          'Form_Faktör': 'Micro-ATX',
          'RAM_Yuvaları': '2x DDR4 DIMM (Max 64GB)',
          'RAM_Hızı': 'DDR4-3200',
          'M2_Yuvaları': '1x M.2 PCIe 3.0',
          'PCIe_Slotları': '1x PCIe 4.0 x16',
          'SATA': '4x SATA 6Gb/s',
          'LAN': 'Realtek Gigabit Ethernet',
          'USB': 'Multiple USB 3.2 Gen 1/2.0',
          'Audio': 'Realtek ALC897, 7.1 HD Audio'
        },
        isNewProduct: false,
        isPopular: true,
        isActive: true,
        featured: false
      },
      {
        name: 'ASUS ROG STRIX B650E-E GAMING WIFI',
        description: 'ASUS ROG STRIX B650E-E GAMING WIFI, AMD Ryzen 7000 serisi işlemciler için geliştirilmiş, PCIe 5.0 desteği ve güçlü VRM tasarımıyla öne çıkan oyuncu anakartı.',
        price: 8499.99,
        brand: 'ASUS',
        stock: 28,
        category: motherboardCategory._id,
        categoryPath: categoryPath,
        images: ['/images/products/asus-rog-strix-b650e-e.jpg'],
        specifications: {
          'CPU_Soket': 'AMD AM5 (LGA 1718)',
          'Chipset': 'AMD B650E',
          'Form_Faktör': 'ATX',
          'RAM_Yuvaları': '4x DDR5 DIMM (Max 128GB)',
          'RAM_Hızı': 'DDR5-7800+ (OC)',
          'M2_Yuvaları': '3x M.2 PCIe 5.0/4.0',
          'PCIe_Slotları': '1x PCIe 5.0 x16, 1x PCIe 4.0 x16',
          'SATA': '4x SATA 6Gb/s',
          'LAN': 'Intel 2.5Gb Ethernet',
          'Kablosuz': 'Wi-Fi 6E + Bluetooth 5.2',
          'USB': '1x USB 3.2 Gen 2x2 Type-C, Multiple USB 3.2 Gen 2/Gen 1',
          'Audio': 'ROG SupremeFX 7.1 Surround Sound',
          'Aydınlatma': 'Aura Sync RGB'
        },
        isNewProduct: false,
        isPopular: true,
        isActive: true,
        featured: false
      },
      {
        name: 'MSI PRO Z690-A DDR4',
        description: 'MSI PRO Z690-A DDR4, Intel 12. ve 13. nesil işlemcilere uyumlu, DDR4 bellek desteği sunan, profesyonel kullanım için tasarlanmış uygun fiyatlı Z690 anakart.',
        price: 4299.99,
        brand: 'MSI',
        stock: 45,
        category: motherboardCategory._id,
        categoryPath: categoryPath,
        images: ['/images/products/msi-pro-z690-a-ddr4.jpg'],
        specifications: {
          'CPU_Soket': 'LGA 1700',
          'Chipset': 'Intel Z690',
          'Form_Faktör': 'ATX',
          'RAM_Yuvaları': '4x DDR4 DIMM (Max 128GB)',
          'RAM_Hızı': 'DDR4-5200+ (OC)',
          'M2_Yuvaları': '4x M.2 PCIe 4.0',
          'PCIe_Slotları': '1x PCIe 5.0 x16, 1x PCIe 3.0 x16',
          'SATA': '6x SATA 6Gb/s',
          'LAN': 'Intel 2.5Gb Ethernet',
          'USB': '1x USB 3.2 Gen 2x2 Type-C, Multiple USB 3.2 Gen 2/Gen 1',
          'Audio': 'Realtek ALC897, 7.1 HD Audio',
          'Özel_Özellikler': 'Extended Heatsink, MSI PRO Design'
        },
        isNewProduct: false,
        isPopular: false,
        isActive: true,
        featured: false
      },
      {
        name: 'ASRock B550 PG Riptide',
        description: 'ASRock B550 PG Riptide, AMD Ryzen 5000 ve 3000 serisi işlemcilere uyumlu, güçlü VRM ve Lightning Gaming Port özelliği ile oyuncular için tasarlanmış uygun fiyatlı anakart.',
        price: 3599.99,
        brand: 'ASRock',
        stock: 40,
        category: motherboardCategory._id,
        categoryPath: categoryPath,
        images: ['/images/products/asrock-b550-pg-riptide.jpg'],
        specifications: {
          'CPU_Soket': 'AMD AM4',
          'Chipset': 'AMD B550',
          'Form_Faktör': 'ATX',
          'RAM_Yuvaları': '4x DDR4 DIMM (Max 128GB)',
          'RAM_Hızı': 'DDR4-5000+ (OC)',
          'M2_Yuvaları': '2x M.2 PCIe 4.0/3.0',
          'PCIe_Slotları': '1x PCIe 4.0 x16, 1x PCIe 3.0 x16',
          'SATA': '6x SATA 6Gb/s',
          'LAN': 'Dragon RTL8125BG 2.5Gb Ethernet',
          'USB': '1x USB 3.2 Gen 2 Type-C, Multiple USB 3.2 Gen 2/Gen 1',
          'Audio': 'Realtek ALC897, 7.1 HD Audio',
          'Özel_Özellikler': 'Lightning Gaming Ports, Dragon 2.5G LAN'
        },
        isNewProduct: false,
        isPopular: false,
        isActive: true,
        featured: false
      },
      {
        name: 'ASUS ROG Crosshair X670E Hero',
        description: 'ASUS ROG Crosshair X670E Hero, AMD Ryzen 7000 serisi için üst düzey özellikler sunan, PCIe 5.0 ve DDR5 destekli, overclocking odaklı bir anakart.',
        price: 14499.99,
        brand: 'ASUS',
        stock: 15,
        category: motherboardCategory._id,
        categoryPath: categoryPath,
        images: ['/images/products/asus-crosshair-x670e-hero.jpg'],
        specifications: {
          'CPU_Soket': 'AMD AM5 (LGA 1718)',
          'Chipset': 'AMD X670E',
          'Form_Faktör': 'ATX',
          'RAM_Yuvaları': '4x DDR5 DIMM (Max 128GB)',
          'RAM_Hızı': 'DDR5-8000+ (OC)',
          'M2_Yuvaları': '5x M.2 PCIe 5.0/4.0',
          'PCIe_Slotları': '2x PCIe 5.0 x16, 1x PCIe 4.0 x16',
          'SATA': '6x SATA 6Gb/s',
          'LAN': 'Intel 2.5Gb Ethernet',
          'Kablosuz': 'Wi-Fi 6E + Bluetooth 5.3',
          'USB': '2x USB 3.2 Gen 2x2 Type-C, Multiple USB 3.2 Gen 2/Gen 1',
          'Audio': 'ROG SupremeFX 7.1 Surround Sound',
          'Aydınlatma': 'Aura Sync RGB, Anime Matrix Display'
        },
        isNewProduct: true,
        isPopular: false,
        isActive: true,
        featured: true
      }
    ];
    
    // Veritabanına ekle
    await Product.insertMany(motherboards);
    console.log('15 adet anakart başarıyla eklendi!');
    
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