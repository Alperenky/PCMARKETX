const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('../config/db');
const Product = require('../models/Product');
const User = require('../models/userModel');

// Çevre değişkenlerini yükle
dotenv.config();

// Order modelini doğrudan tanımlıyoruz (server.js ile uyumlu olması için)
const OrderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  orderNumber: { 
    type: String, 
    required: true, 
    unique: true 
  },
  orderItems: [
    {
      name: { type: String, required: true },
      qty: { type: Number, required: true },
      image: { type: String, required: true },
      price: { type: Number, required: true },
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
      }
    }
  ],
  shippingAddress: {
    address: { type: String, required: true },
    city: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true }
  },
  paymentMethod: {
    type: String,
    required: true
  },
  paymentResult: {
    id: { type: String },
    status: { type: String },
    update_time: { type: String },
    email_address: { type: String }
  },
  taxPrice: {
    type: Number,
    required: true,
    default: 0.0
  },
  shippingPrice: {
    type: Number,
    required: true,
    default: 0.0
  },
  totalPrice: {
    type: Number,
    required: true,
    default: 0.0
  },
  isPaid: {
    type: Boolean,
    required: true,
    default: false
  },
  paidAt: {
    type: Date
  },
  isDelivered: {
    type: Boolean,
    required: true,
    default: false
  },
  deliveredAt: {
    type: Date
  },
  status: {
    type: String,
    enum: ['Beklemede', 'İşleniyor', 'Kargoya Verildi', 'Teslim Edildi', 'İptal Edildi'],
    default: 'Beklemede'
  }
}, {
  timestamps: true
});

// Order modelini özel olarak oluşturuyoruz
const Order = mongoose.model('Order', OrderSchema);

// Rastgele tarih oluşturan fonksiyon
const randomDate = (start, end) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

// Rastgele durum seçen fonksiyon
const getRandomStatus = () => {
  const statuses = ['Beklemede', 'İşleniyor', 'Kargoya Verildi', 'Teslim Edildi', 'İptal Edildi'];
  return statuses[Math.floor(Math.random() * statuses.length)];
};

// Rastgele ödeme yöntemi
const getRandomPaymentMethod = () => {
  const methods = ['Kredi Kartı', 'Havale/EFT', 'Kapıda Ödeme'];
  return methods[Math.floor(Math.random() * methods.length)];
};

// Benzersiz sipariş numarası oluştur
const generateOrderNumber = () => {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `PCM-${timestamp}-${random}`;
};

// Veritabanına bağlan ve örnek siparişleri ekle
const createSampleOrders = async () => {
  try {
    await connectDB();
    console.log('MongoDB bağlantısı başarılı!');
    
    // Mevcut kullanıcı ID'leri
    const userIds = [
      '67d5999598eb1180fadc8bf3', // ALPERENN
      '682c42e19743b0d69a8bb935', // emirhan gündoğdu
      '6833496654778621e2bc0492'  // alperen
    ];
    
    // Tüm ürünleri getir
    const allProducts = await Product.find({ isActive: true });
    
    if (allProducts.length === 0) {
      console.log('Hiç aktif ürün bulunamadı. Öncelikle ürünleri seed etmelisiniz.');
      return;
    }
    
    console.log(`${allProducts.length} aktif ürün bulundu.`);
    
    // Mevcut siparişleri temizle (opsiyonel)
    console.log('Mevcut siparişler temizleniyor...');
    await Order.deleteMany({});
    
    // Her kullanıcı için siparişler oluştur
    let ordersCreated = 0;
    
    for (const userId of userIds) {
      // Kullanıcıyı bul
      const user = await User.findById(userId);
      
      if (!user) {
        console.log(`${userId} ID'li kullanıcı bulunamadı, bu kullanıcı için siparişler atlanıyor.`);
        continue;
      }
      
      console.log(`${user.username} kullanıcısı için 4 adet sipariş oluşturuluyor...`);
      
      // Her kullanıcı için tam 4 sipariş oluştur
      for (let i = 0; i < 4; i++) {
        // Sipariş için rastgele 1-5 ürün seç
        const productCount = Math.floor(Math.random() * 5) + 1;
        const orderItems = [];
        let subtotal = 0;
        
        // Benzersiz ürünler seçmek için kullanılan ürün IDleri
        const selectedProductIds = new Set();
        
        for (let j = 0; j < productCount; j++) {
          // Rastgele bir ürün seç (benzersiz olmalı)
          let randomProduct;
          do {
            randomProduct = allProducts[Math.floor(Math.random() * allProducts.length)];
          } while (selectedProductIds.has(randomProduct._id.toString()));
          
          selectedProductIds.add(randomProduct._id.toString());
          
          // Rastgele miktar (1-3 arası)
          const qty = Math.floor(Math.random() * 3) + 1;
          
          // Ürün fiyatı
          const price = randomProduct.price;
          
          // Toplam tutara ekle
          subtotal += price * qty;
          
          // Sipariş öğesi ekle
          orderItems.push({
            name: randomProduct.name,
            qty,
            image: randomProduct.image || randomProduct.images?.[0] || '/images/placeholder.jpg',
            price,
            product: randomProduct._id
          });
        }
        
        // Vergi ve kargo ücretlerini hesapla
        const taxPrice = parseFloat((subtotal * 0.18).toFixed(2)); // %18 KDV
        const shippingPrice = subtotal > 1500 ? 0 : 49.99; // 1500 TL üzeri kargo bedava
        const totalPrice = parseFloat((subtotal + taxPrice + shippingPrice).toFixed(2));
        
        // Rastgele sipariş durumu
        const status = getRandomStatus();
        
        // Sipariş oluşturma tarihi (son 60 gün içinde)
        const orderDate = randomDate(new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), new Date());
        
        // Ödenmiş durumu ve tarih
        const isPaid = Math.random() > 0.2; // %80 ihtimalle ödenmiş
        const paidAt = isPaid ? orderDate : null;
        
        // Teslim durumu
        let isDelivered = false;
        let deliveredAt = null;
        
        if (status === 'Teslim Edildi') {
          isDelivered = true;
          // Sipariş tarihinden 1-5 gün sonra teslim
          const deliveryDays = Math.floor(Math.random() * 5) + 1;
          deliveredAt = new Date(orderDate);
          deliveredAt.setDate(orderDate.getDate() + deliveryDays);
        }
        
        // Varsayılan teslimat adresi
        const shippingAddress = {
          address: user.firstName ? `${user.firstName} ${user.lastName} Cad. No:${Math.floor(Math.random() * 100) + 1}` : 'Örnek Mah. Test Sok. No:1',
          city: ['İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya'][Math.floor(Math.random() * 5)],
          postalCode: `${Math.floor(Math.random() * 90000) + 10000}`,
          country: 'Türkiye'
        };
        
        // Benzersiz sipariş numarası oluştur
        const orderNumber = generateOrderNumber();
        console.log(`${orderNumber} numaralı sipariş oluşturuluyor...`);
        
        // Siparişi oluştur
        const order = new Order({
          user: user._id,
          orderNumber,
          orderItems,
          shippingAddress,
          paymentMethod: getRandomPaymentMethod(),
          taxPrice,
          shippingPrice,
          totalPrice,
          isPaid,
          paidAt,
          isDelivered,
          deliveredAt,
          status
        });
        
        if (isPaid) {
          order.paymentResult = {
            id: `PAY-${Math.random().toString(36).substring(2, 15)}`,
            status: 'COMPLETED',
            update_time: paidAt.toISOString(),
            email_address: user.email
          };
        }
        
        try {
          // Siparişi kaydet
          await order.save();
          ordersCreated++;
          console.log(`${orderNumber} numaralı sipariş oluşturuldu.`);
        } catch (error) {
          console.error(`Sipariş oluşturulurken hata oluştu: ${error.message}`);
        }
      }
    }
    
    console.log(`${ordersCreated} adet örnek sipariş başarıyla oluşturuldu!`);
    console.log('Sipariş oluşturma işlemi tamamlandı.');
    
    // Veritabanı bağlantısını kapat
    await mongoose.connection.close();
    console.log('MongoDB bağlantısı kapatıldı.');
    
  } catch (error) {
    console.error('HATA:', error);
    process.exit(1);
  }
};

// Script'i çalıştır
createSampleOrders(); 