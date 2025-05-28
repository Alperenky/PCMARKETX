const mongoose = require('mongoose');
const Order = require('./src/models/Order');
const User = require('./src/models/userModel');
const Product = require('./src/models/Product');
require('dotenv').config();

// MongoDB bağlantısı
mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://adminuser:KkM8tMTLdaRfY9R@pcexpress.hvgoo.mongodb.net/PCShopDB?retryWrites=true&w=majority')
  .then(async () => {
    console.log('MongoDB bağlantısı başarılı');
    
    try {
      // Kullanıcıyı bul (varsayılan admin kullanıcı)
      const user = await User.findOne({ role: 'admin' });
      
      if (!user) {
        console.error('Admin kullanıcı bulunamadı! Önce admin kullanıcı oluşturun.');
        process.exit(1);
      }
      
      console.log(`Kullanıcı bulundu: ${user.username}`);
      
      // Ürünleri bul
      const products = await Product.find().limit(3);
      
      if (products.length === 0) {
        console.error('Ürün bulunamadı! Önce ürün ekleyin.');
        process.exit(1);
      }
      
      console.log(`${products.length} ürün bulundu`);
      
      // Sipariş oluştur
      const orderNumber = 'ORD-' + Date.now().toString().slice(-6);
      
      const orderItems = products.map(product => ({
        name: product.name,
        qty: Math.floor(Math.random() * 3) + 1, // 1-3 arası rastgele adet
        image: product.image || '/uploads/default-product.jpg',
        price: product.price,
        product: product._id
      }));
      
      // Toplam tutarı hesapla
      const totalPrice = orderItems.reduce((sum, item) => sum + (item.price * item.qty), 0);
      const taxPrice = Math.round(totalPrice * 0.18); // %18 KDV
      
      const newOrder = new Order({
        user: user._id,
        orderNumber,
        orderItems,
        shippingAddress: {
          address: 'Test Mahallesi, Test Caddesi No:123',
          city: 'İstanbul',
          postalCode: '34000',
          country: 'Türkiye'
        },
        paymentMethod: 'Kredi Kartı',
        taxPrice,
        shippingPrice: totalPrice > 5000 ? 0 : 50, // 5000 TL üzeri kargo bedava
        totalPrice: totalPrice + taxPrice + (totalPrice > 5000 ? 0 : 50),
        isPaid: true,
        paidAt: Date.now(),
        isDelivered: false,
        status: 'PENDING' // Admin panel API bu durumu bekliyor
      });
      
      await newOrder.save();
      console.log('Test siparişi başarıyla oluşturuldu:', newOrder._id);
      console.log('Sipariş Numarası:', orderNumber);
      console.log('Toplam Tutar:', newOrder.totalPrice);
      
      // İkinci test siparişi - farklı durum
      const orderNumber2 = 'ORD-' + (Date.now() + 1).toString().slice(-6);
      
      const orderItems2 = products.slice(0, 2).map(product => ({
        name: product.name,
        qty: Math.floor(Math.random() * 2) + 1, // 1-2 arası rastgele adet
        image: product.image || '/uploads/default-product.jpg',
        price: product.price,
        product: product._id
      }));
      
      const totalPrice2 = orderItems2.reduce((sum, item) => sum + (item.price * item.qty), 0);
      const taxPrice2 = Math.round(totalPrice2 * 0.18);
      
      const newOrder2 = new Order({
        user: user._id,
        orderNumber: orderNumber2,
        orderItems: orderItems2,
        shippingAddress: {
          address: 'Demo Mahallesi, Demo Sokak No:456',
          city: 'Ankara',
          postalCode: '06000',
          country: 'Türkiye'
        },
        paymentMethod: 'Havale/EFT',
        taxPrice: taxPrice2,
        shippingPrice: totalPrice2 > 5000 ? 0 : 50,
        totalPrice: totalPrice2 + taxPrice2 + (totalPrice2 > 5000 ? 0 : 50),
        isPaid: true,
        paidAt: Date.now(),
        isDelivered: true,
        deliveredAt: Date.now(),
        status: 'DELIVERED' // Teslim edilmiş sipariş
      });
      
      await newOrder2.save();
      console.log('İkinci test siparişi başarıyla oluşturuldu:', newOrder2._id);
      
      // Bağlantıyı kapat
      mongoose.connection.close();
      console.log('MongoDB bağlantısı kapatıldı');
      
    } catch (error) {
      console.error('İşlem sırasında hata oluştu:', error);
    }
  })
  .catch(err => {
    console.error('MongoDB bağlantı hatası:', err);
  }); 