const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/userModel');
const Order = require('../models/Order');

// Çevre değişkenlerini yükle
dotenv.config();

// MongoDB bağlantısı
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://adminuser:KkM8tMTLdaRfY9R@pcexpress.hvgoo.mongodb.net/PCShopDB?retryWrites=true&w=majority');
    console.log(`MongoDB bağlantısı başarılı: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`Veritabanı bağlantı hatası: ${error.message}`);
    process.exit(1);
  }
};

// Rastgele tarih oluşturan fonksiyon
const randomDate = (start, end) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

// Rastgele durum seçen fonksiyon
const getRandomStatus = () => {
  const statuses = ['Beklemede', 'İşleniyor', 'Kargoya Verildi', 'Teslim Edildi', 'İptal Edildi'];
  return statuses[Math.floor(Math.random() * statuses.length)];
};

// Rastgele ödeme yöntemi seçen fonksiyon
const getRandomPaymentMethod = () => {
  const methods = ['Kredi Kartı', 'Havale/EFT', 'Kapıda Ödeme'];
  return methods[Math.floor(Math.random() * methods.length)];
};

// Sipariş numarası oluşturan fonksiyon
const generateOrderNumber = () => {
  const prefix = 'PCM';
  const timestamp = Math.floor(Date.now() / 1000).toString().substr(-6);
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${prefix}-${timestamp}-${random}`;
};

// Her kullanıcı için siparişler oluşturan fonksiyon
const createOrdersForUser = async (userId, userName, userEmail, productIds) => {
  console.log(`${userName} kullanıcısı için siparişler oluşturuluyor...`);
  
  // Her kullanıcı için 3 sipariş oluştur
  const orders = [];
  
  for (let i = 0; i < 3; i++) {
    try {
      // Rastgele 2-4 ürün seç
      const numProducts = Math.floor(Math.random() * 3) + 2;
      const selectedProducts = [];
      
      // Ürünleri karıştır ve numProducts kadar seç
      const shuffledProducts = [...productIds].sort(() => 0.5 - Math.random());
      
      for (let j = 0; j < numProducts; j++) {
        if (j < shuffledProducts.length) {
          selectedProducts.push(shuffledProducts[j]);
        }
      }
      
      // Rastgele sipariş tarihi (son 60 gün içinde)
      const orderDate = randomDate(new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), new Date());
      
      // Toplam tutarları hesapla
      const itemPrices = selectedProducts.map(() => 
        parseFloat((Math.random() * 5000 + 1000).toFixed(2))
      );
      
      const orderItems = selectedProducts.map((productId, index) => {
        const qty = Math.floor(Math.random() * 3) + 1;
        return {
          name: `Ürün ${index + 1}`,
          qty,
          image: `/images/products/product${index + 1}.jpg`,
          price: itemPrices[index],
          product: productId
        };
      });
      
      // Ara toplam hesapla
      const subtotal = orderItems.reduce((acc, item) => acc + (item.price * item.qty), 0);
      
      // KDV hesapla (%18)
      const taxPrice = parseFloat((subtotal * 0.18).toFixed(2));
      
      // Kargo ücreti (1500 TL üzeri bedava)
      const shippingPrice = subtotal > 1500 ? 0 : 29.99;
      
      // Toplam fiyat
      const totalPrice = parseFloat((subtotal + taxPrice + shippingPrice).toFixed(2));
      
      // Sipariş durumu
      const status = getRandomStatus();
      
      // Ödeme durumu
      const isPaid = Math.random() > 0.2; // %80 ihtimalle ödenmiş
      const paidAt = isPaid ? orderDate : null;
      
      // Teslimat durumu
      let isDelivered = false;
      let deliveredAt = null;
      
      if (status === 'Teslim Edildi') {
        isDelivered = true;
        // Sipariş tarihinden 1-5 gün sonra teslim
        const deliveryDays = Math.floor(Math.random() * 5) + 1;
        deliveredAt = new Date(orderDate);
        deliveredAt.setDate(orderDate.getDate() + deliveryDays);
      }
      
      // Teslimat adresi
      const shippingAddress = {
        address: `${userName} Mah. ${i + 1}. Sokak No:${Math.floor(Math.random() * 100) + 1}`,
        city: ['İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya'][Math.floor(Math.random() * 5)],
        postalCode: `${Math.floor(Math.random() * 90000) + 10000}`,
        country: 'Türkiye'
      };
      
      // Sipariş numarası
      const orderNumber = generateOrderNumber();
      
      // Sipariş objesi
      const orderData = {
        user: userId,
        orderNumber,
        orderItems,
        shippingAddress,
        paymentMethod: getRandomPaymentMethod(),
        paymentResult: isPaid ? {
          id: `PAY-${Math.random().toString(36).substring(2, 10)}`,
          status: 'COMPLETED',
          update_time: paidAt.toISOString(),
          email_address: userEmail
        } : null,
        taxPrice,
        shippingPrice,
        totalPrice,
        isPaid,
        paidAt,
        isDelivered,
        deliveredAt,
        status,
        createdAt: orderDate,
        updatedAt: orderDate
      };
      
      // Siparişi oluştur
      const order = await Order.create(orderData);
      console.log(`Sipariş oluşturuldu: ${order.orderNumber}`);
      
      // Siparişi orders listesine ekle
      orders.push(order._id);
    } catch (error) {
      console.error(`Sipariş oluşturulurken hata: ${error.message}`);
    }
  }
  
  return orders;
};

// Ana fonksiyon
const addOrdersToUsers = async () => {
  let connection;
  
  try {
    // Veritabanına bağlan
    connection = await connectDB();
    
    // Kullanıcıları getir
    const users = await User.find({});
    console.log(`${users.length} kullanıcı bulundu.`);
    
    // Product ID'leri (örnek olarak)
    const productIds = [];
    for (let i = 0; i < 10; i++) {
      productIds.push(new mongoose.Types.ObjectId());
    }
    
    // Her kullanıcı için siparişler oluştur
    for (const user of users) {
      // Kullanıcının önceki siparişlerini kontrol et
      const existingOrders = await Order.find({ user: user._id });
      
      if (existingOrders.length > 0) {
        console.log(`${user.username} kullanıcısının zaten ${existingOrders.length} siparişi var. Güncelleniyor...`);
        
        // Kullanıcıya mevcut siparişleri ekle
        user.orders = existingOrders.map(order => order._id);
        await user.save();
        
        console.log(`${user.username} kullanıcısının siparişleri güncellendi.`);
      } else {
        // Yeni siparişler oluştur
        const orderIds = await createOrdersForUser(user._id, user.username, user.email, productIds);
        
        // Kullanıcıya oluşturulan siparişleri ekle
        user.orders = orderIds;
        await user.save();
        
        console.log(`${user.username} kullanıcısına ${orderIds.length} sipariş eklendi.`);
      }
    }
    
    console.log('Tüm kullanıcıların sipariş bilgileri güncellendi!');
  } catch (error) {
    console.error(`Hata: ${error.message}`);
  } finally {
    // Bağlantıyı kapat
    if (connection) {
      await mongoose.connection.close();
      console.log('Veritabanı bağlantısı kapatıldı.');
    }
  }
};

// Scripti çalıştır
addOrdersToUsers(); 