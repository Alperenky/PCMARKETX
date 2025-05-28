// Admin kullanıcısı oluşturma script
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/userModel');

const createAdminUser = async () => {
  try {
    // MongoDB bağlantısı
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB bağlantısı başarılı');

    // Admin kullanıcısı için bilgiler
    const adminData = {
      username: 'admin',
      email: 'admin@pcmarketx.com',
      password: 'admin123',
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin'
    };

    // Önce email ile admin kullanıcısı var mı kontrol et
    const existingAdmin = await User.findOne({ email: adminData.email });
    
    if (existingAdmin) {
      console.log('Admin kullanıcısı zaten mevcut:', existingAdmin.email);
      process.exit(0);
    }

    // Admin kullanıcısını oluştur
    const adminUser = new User(adminData);
    await adminUser.save();

    console.log('Admin kullanıcısı başarıyla oluşturuldu:', adminUser.email);
    process.exit(0);
  } catch (error) {
    console.error('Admin kullanıcısı oluşturulurken hata:', error);
    process.exit(1);
  }
};

createAdminUser(); 