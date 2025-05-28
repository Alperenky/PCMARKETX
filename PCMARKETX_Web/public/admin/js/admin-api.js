// Admin API için JavaScript - MongoDB Atlas ile etkileşim

// MongoDB bağlantı durumunu kaydet
(function() {
    // Sunucu başlatıldığında MongoDB bağlantısı başarılı olduğunda bu fonksiyon çağrılır
    const markMongodbConnected = function() {
        localStorage.setItem('mongodb_connected', 'true');
        console.log('MongoDB bağlantısı başarılı olarak işaretlendi');
    };

    // MongoDB bağlantısını varsayılan olarak true yap
    localStorage.setItem('mongodb_connected', 'true');

    // Sunucu mesajlarını dinle
    if (typeof window !== 'undefined') {
        // Sayfa yüklendikten sonra bağlantı durumunu kontrol et
        window.addEventListener('DOMContentLoaded', function() {
            // MongoDB'yi her zaman bağlı kabul et
            markMongodbConnected();
            
            // Sunucudan gelen bağlantı mesajını kontrol et (opsiyonel)
            if (document.body.dataset.mongodbConnected === 'true') {
                markMongodbConnected();
            } else if (window.location.href.includes('admin')) {
                // Admin sayfasında otomatik API testi yap
                setTimeout(() => {
                    AdminAPI.testApiConnection()
                      .then(result => {
                          if (result && result.success) {
                              markMongodbConnected();
                          }
                      })
                      .catch(err => console.warn('API test hatası:', err));
                }, 500);
            }
        });
    }
})();

// API URL'lerini normalleştiren yardımcı fonksiyon
function normalizeUrl(url) {
    // URL'in başında / olduğundan emin ol
    if (!url.startsWith('/')) {
        url = '/' + url;
    }
    
    // URL'in önünde /api olduğundan emin ol
    if (!url.startsWith('/api/')) {
        if (url.startsWith('/admin/')) {
            url = '/api' + url; // /admin/ --> /api/admin/
        } else {
            url = '/api/admin' + url; // /products --> /api/admin/products
        }
    } else if (!url.includes('/admin/') && url.startsWith('/api/')) {
        // /api/ ile başlıyor ama /admin/ içermiyor, /api/admin/ yapalım
        url = url.replace('/api/', '/api/admin/');
    }
    
    return url;
}

// Admin API Sınıfı
class AdminAPI {
    
    // API bağlantısını test et
    static async testApiConnection() {
        try {
            const response = await fetch('/api/admin/stats');
            if (response.ok) {
                return { success: true };
            } else {
                // Eğer 404 alırsak, simüle veriler kullanmaya devam edelim
                if (response.status === 404) {
                    console.log('API endpoint bulunamadı, simülasyon modu kullanılıyor');
                    return { success: false, error: `HTTP ${response.status}` };
                }
                
                // MongoDB bağlantısını kontrol etmek için başka bir endpoint deneyelim
                const productsResponse = await fetch('/api/admin/products');
                if (productsResponse.ok) {
                    return { success: true };
                }
                
                console.warn('API bağlantı testi başarısız:', response.status);
                return { success: false, error: `HTTP ${response.status}` };
            }
        } catch (error) {
            console.error('API test hatası:', error);
            return { success: false, error: error.message };
        }
    }
    
    // API İstekleri için temel metot
    static async request(endpoint, method = 'GET', data = null) {
        try {
            // MongoDB bağlantısını kontrol et
            const isConnected = localStorage.getItem('mongodb_connected') === 'true';
            
            // MongoDB bağlantısı yoksa ve simülasyon verilerini kullanabiliriz
            if (!isConnected && this.isApiAvailable() === false) {
                console.log(`Simülasyon verisi kullanılıyor: ${endpoint}`);
                return this._getSimulationData(endpoint, method, data);
            }
            
            // URL'i normalleştir
            endpoint = normalizeUrl(endpoint);
            
            const options = {
                method,
                headers: {
                    'Content-Type': 'application/json'
                }
            };
            
            // Yetkili kullanıcı için token ekle
            const token = this.getAuthToken();
            if (token) {
                options.headers['Authorization'] = `Bearer ${token}`;
            }
            
            // POST, PUT, DELETE istekleri için body parametresi ekle
            if (method !== 'GET' && data !== null) {
                options.body = JSON.stringify(data);
            }
            
            console.log(`API isteği: ${method} ${endpoint}`);
            
            // İsteği gönder
            const response = await fetch(endpoint, options);
            
            // JSON olmayan yanıtlar için (örneğin, dosya indirme)
            if (!response.headers.get('content-type')?.includes('application/json')) {
                if (!response.ok) {
                    throw new Error(`HTTP Hata: ${response.status}`);
                }
                return response;
            }
            
            // JSON yanıtını parse et
            const responseData = await response.json();
            
            // Hata kontrolü
            if (!response.ok) {
                const error = new Error(responseData.message || `HTTP Hata: ${response.status}`);
                error.status = response.status;
                error.data = responseData;
                throw error;
            }
            
            return responseData;
        } catch (error) {
            console.error(`API İsteği Başarısız (${endpoint}):`, error);
            
            // MongoDB bağlantısı yoksa simülasyon verilerini dene
            if (this.isApiAvailable() === false) {
                console.log(`Simülasyon verisi kullanılıyor (hata sonrası): ${endpoint}`);
                return this._getSimulationData(endpoint, method, data);
            }
            
            throw error;
        }
    }
    
    // API erişilebilirliğini kontrol et
    static isApiAvailable() {
        // MongoDB bağlantı durumunu localStorage'dan kontrol et
        const isConnected = localStorage.getItem('mongodb_connected') === 'true';
        
        // Bağlantı durumu biliniyorsa onu kullan
        if (isConnected !== null) {
            return isConnected;
        }
        
        // Her zaman MongoDB'yi kullanmayı zorla
        return true;
    }
    
    // Simülasyon verileri
    static _getSimulationData(endpoint, method, data) {
        console.log(`Simülasyon verisi kullanılıyor: ${endpoint} (${method})`);
        
        // endpoint'i normalleştir ve parse et
        endpoint = normalizeUrl(endpoint);
        const url = new URL(endpoint, window.location.origin);
        const path = url.pathname;
        const searchParams = url.searchParams;
        
        // GET istekleri için
        if (method === 'GET') {
            // Ürünleri getir
            if (path.includes('/products') && !path.includes('/products/')) {
                return this._getSimulatedProducts(searchParams);
            }
            
            // Ürün detayı
            if (path.match(/\/products\/[a-zA-Z0-9]+/)) {
                const productId = path.split('/').pop();
                return this._getSimulatedProduct(productId);
            }
            
            // Kategorileri getir
            if (path.includes('/categories') && !path.includes('/categories/')) {
                return this._getSimulatedCategories();
            }
            
            // Kategori detayı
            if (path.match(/\/categories\/[a-zA-Z0-9]+/)) {
                const categoryId = path.split('/').pop();
                return this._getSimulatedCategoryById(categoryId);
            }
            
            // İstatistikler
            if (path.includes('/stats')) {
                return this._getSimulatedStats();
            }
            
            // Siparişler
            if (path.includes('/orders') && !path.includes('/orders/')) {
                return this._getSimulatedOrders();
            }
        }
        
        // POST, PUT, DELETE gibi diğer istek türleri için
        // Burada simüle edilmiş bir yanıt dönebilirsin
        
        return {
            success: true,
            message: 'Simüle edilmiş işlem başarılı',
            data: data
        };
    }
    
    // Simüle edilmiş ürünleri getir
    static _getSimulatedProducts() {
        const cachedProducts = localStorage.getItem('simulated_products');
        
        if (cachedProducts) {
            try {
                return JSON.parse(cachedProducts);
            } catch (e) {
                console.error('Önbellek ürünleri parse edilemedi:', e);
            }
        }
        
        // Varsayılan ürünler
        const products = {
            data: [
                {
                    _id: '1',
                    name: 'NVIDIA RTX 4090',
                    price: 42999.99,
                    stock: 10,
                    brand: 'NVIDIA',
                    category: {
                        _id: '1',
                        name: 'Ekran Kartları'
                    },
                    description: 'En güçlü ekran kartı',
                    isActive: true,
                    isNewProduct: true,
                    featured: true,
                    images: ['/images/products/rtx-4090.jpg'],
                    createdAt: new Date().toISOString()
                },
                {
                    _id: '2',
                    name: 'AMD Ryzen 9 7950X',
                    price: 18999.99,
                    stock: 15,
                    brand: 'AMD',
                    category: {
                        _id: '2',
                        name: 'İşlemciler'
                    },
                    description: 'Yüksek performanslı işlemci',
                    isActive: true,
                    isNewProduct: true,
                    featured: false,
                    images: ['/images/products/ryzen-7950x.jpg'],
                    createdAt: new Date().toISOString()
                }
            ],
            page: 1,
            totalPages: 1,
            totalItems: 2
        };
        
        // Önbelleğe kaydet
        this._saveSimulatedProducts(products);
        
        return products;
    }
    
    // Simüle edilmiş ürünleri kaydet (local storage'a)
    static _saveSimulatedProducts(products) {
        try {
            localStorage.setItem('simulated_products', JSON.stringify(products));
        } catch (e) {
            console.error('Simüle ürünler kaydedilemedi:', e);
        }
    }
    
    // Simüle edilmiş ürün detayı
    static _getSimulatedProduct(productId) {
        const cachedProducts = localStorage.getItem('simulated_products');
        let products = [];
        
        if (cachedProducts) {
            try {
                const parsed = JSON.parse(cachedProducts);
                products = parsed.data || [];
            } catch (e) {
                console.error('Önbellek ürünleri parse edilemedi:', e);
            }
        }
        
        const product = products.find(p => p._id === productId);
        return product || null;
    }
    
    // Simüle edilmiş kategorileri getir
    static _getSimulatedCategories() {
        return {
            data: [
                {
                    _id: '1',
                    name: 'Ekran Kartları',
                    slug: 'ekran-kartlari',
                    description: 'Gaming ve profesyonel kullanım için yüksek performanslı ekran kartları',
                    parent: null,
                    createdAt: new Date().toISOString()
                },
                {
                    _id: '2',
                    name: 'İşlemciler',
                    slug: 'islemciler',
                    description: 'Yüksek performanslı AMD ve Intel işlemciler',
                    parent: null,
                    createdAt: new Date().toISOString()
                },
                {
                    _id: '3',
                    name: 'Anakartlar',
                    slug: 'anakartlar',
                    description: 'Her ihtiyaca uygun anakartlar',
                    parent: null,
                    createdAt: new Date().toISOString()
                },
                {
                    _id: '4',
                    name: 'RAM Bellek',
                    slug: 'ram-bellek',
                    description: 'DDR4 ve DDR5 bellekler',
                    parent: null,
                    createdAt: new Date().toISOString()
                },
                {
                    _id: '5',
                    name: 'SSD ve Sabit Diskler',
                    slug: 'depolama',
                    description: 'Veri depolama çözümleri',
                    parent: null,
                    createdAt: new Date().toISOString()
                }
            ]
        };
    }
    
    // Simüle edilmiş kategori detayı
    static _getSimulatedCategoryById(categoryId) {
        const categories = this._getSimulatedCategories().data;
        const category = categories.find(c => c._id === categoryId);
        return category || null;
    }
    
    // Simüle edilmiş istatistikler
    static _getSimulatedStats() {
        // Simüle edilmiş siparişleri oluştur
        const recentOrders = [];
        for (let i = 1; i <= 5; i++) {
            recentOrders.push({
                id: `ORD-${i.toString().padStart(4, '0')}`,
                orderNumber: `ORD-${i.toString().padStart(4, '0')}`,
                date: new Date(Date.now() - i * 86400000).toISOString(),
                customer: `Müşteri ${i}`,
                total: Math.floor(Math.random() * 10000) + 1000,
                status: ['Tamamlandı', 'İşleniyor', 'Kargoya Verildi', 'İptal Edildi'][Math.floor(Math.random() * 4)]
            });
        }
        
        // Simüle edilmiş popüler ürünleri oluştur
        const popularProducts = [];
        const products = ['RTX 4090', 'Ryzen 9 7950X', 'i9-13900K', 'G.Skill Trident Z5', 'Samsung 990 Pro'];
        const categories = ['Ekran Kartları', 'İşlemciler', 'İşlemciler', 'RAM', 'Depolama'];
        
        for (let i = 0; i < 5; i++) {
            popularProducts.push({
                id: i + 1,
                name: products[i],
                category: categories[i],
                price: Math.floor(Math.random() * 20000) + 5000,
                sales: Math.floor(Math.random() * 50) + 10,
                stock: Math.floor(Math.random() * 100) + 5
            });
        }
        
        // MongoDB'den veri alınmış gibi formatla
        return {
            products: 105,
            categories: 15,
            lowStock: 8,
            totalOrders: 24,
            totalSales: 125750.75,
            totalCustomers: 18,
            totalProducts: 105,
            recentOrders: recentOrders,
            popularProducts: popularProducts
        };
    }
    
    // Simüle edilmiş siparişler
    static _getSimulatedOrders() {
        return {
            data: [
                {
                    _id: 'o1',
                    orderNumber: 'ORD-2023001',
                    customer: {
                        name: 'Ahmet Yılmaz'
                    },
                    total: 12999.99,
                    status: 'PENDING',
                    createdAt: new Date().toISOString()
                },
                {
                    _id: 'o2',
                    orderNumber: 'ORD-2023002',
                    customer: {
                        name: 'Ayşe Demir'
                    },
                    total: 25799.99,
                    status: 'PROCESSING',
                    createdAt: new Date().toISOString()
                }
            ],
            page: 1,
            totalPages: 1,
            totalItems: 2
        };
    }
    
    // Kimlik doğrulama token'ını getir
    static getAuthToken() {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        return user.token || null;
    }
    
    // Kullanıcı giriş durumunu kontrol et
    static isLoggedIn() {
        return !!this.getAuthToken();
    }
    
    // Login sayfasına yönlendir
    static redirectToLogin() {
        if (!this.isLoggedIn()) {
            window.location.href = '/admin/login.html';
        }
    }
    
    // Giriş işlemi
    static async login(email, password) {
        try {
            const response = await fetch('/api/users/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Giriş başarısız');
            }
            
            // Kullanıcı admin kontrolü
            if (data.role !== 'admin') {
                throw new Error('Bu sayfaya erişim yetkiniz yok');
            }
            
            // Kullanıcı bilgilerini ve token'ı kaydet
            localStorage.setItem('user', JSON.stringify(data));
            
            return data;
        } catch (error) {
            console.error('Login hatası:', error);
            throw error;
        }
    }
    
    // Çıkış işlemi
    static logout() {
        localStorage.removeItem('user');
        window.location.href = '/admin/login.html';
    }
    
    // İstatistikleri getir
    static async getStats() {
        return this.request('/api/admin/stats');
    }
    
    // Ürünleri getir (filtreleme ve sayfalama ile)
    static async getProducts(params = {}) {
        // URL parametrelerini oluştur
        const queryParams = new URLSearchParams();
        
        if (params.page) queryParams.append('page', params.page);
        if (params.limit) queryParams.append('limit', params.limit);
        if (params.search) queryParams.append('search', params.search);
        if (params.category) queryParams.append('category', params.category);
        if (params.status) queryParams.append('status', params.status);
        if (params.sortBy) queryParams.append('sortBy', params.sortBy);
        if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
        
        const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
        
        // API isteğini gönder
        return this.request(`/api/admin/products${queryString}`);
    }
    
    // Ürün detayını getir
    static async getProductById(id) {
        return this.request(`/api/products/${id}`);
    }
    
    // Yeni ürün oluştur
    static async createProduct(formData) {
        // Form verileri için özel işlem gerekiyor
        if (formData instanceof FormData) {
            try {
                // Form verilerini API'ye gönder
                const response = await fetch('/api/admin/products', {
                    method: 'POST',
                    body: formData,
                    headers: {
                        // Content-Type belirtilmiyor, otomatik olarak multipart/form-data
                        'Authorization': `Bearer ${this.getAuthToken()}`
                    }
                });
                
                const data = await response.json();
                
                if (!response.ok) {
                    throw new Error(data.message || `HTTP Hata: ${response.status}`);
                }
                
                return data;
            } catch (error) {
                console.error('Ürün oluşturma hatası:', error);
                
                // MongoDB bağlantısı yoksa simülasyon verilerini dene
                if (this.isApiAvailable() === false) {
                    console.log('Simülasyon verisi kullanılıyor (ürün oluşturma)');
                    
                    // Rastgele ID oluştur
                    const randomId = Math.random().toString(36).substring(2, 15);
                    
                    // Form verilerinden temel alanları al
                    const name = formData.get('name') || 'Yeni Ürün';
                    const price = formData.get('price') ? parseFloat(formData.get('price')) : 0;
                    const stock = formData.get('stock') ? parseInt(formData.get('stock')) : 0;
                    const brand = formData.get('brand') || '';
                    const description = formData.get('description') || '';
                    
                    // Örnek ürünü döndür
                    return {
                        _id: randomId,
                        name,
                        price,
                        stock,
                        brand,
                        description,
                        createdAt: new Date().toISOString()
                    };
                }
                
                throw error;
            }
        } else {
            // Eğer FormData değilse, normal JSON isteği yap
            return this.request('/api/admin/products', 'POST', formData);
        }
    }
    
    // Ürün güncelle
    static async updateProduct(id, formData) {
        // Form verileri için özel işlem gerekiyor
        if (formData instanceof FormData) {
            try {
                console.log(`Ürün güncelleniyor: ${id}`);
                console.log('FormData içeriği:');
                for (const pair of formData.entries()) {
                    if (pair[0] === 'image') {
                        console.log(`${pair[0]}: Dosya: ${pair[1].name}, Boyut: ${pair[1].size}, Tip: ${pair[1].type}`);
                    } else {
                        console.log(`${pair[0]}: ${pair[1]}`);
                    }
                }
                
                // Form verilerini API'ye gönder
                const response = await fetch(`/api/admin/products/${id}`, {
                    method: 'PUT',
                    body: formData, 
                    headers: {
                        // Content-Type belirtilmiyor, otomatik olarak multipart/form-data
                        'Authorization': `Bearer ${this.getAuthToken()}`
                    }
                });
                
                const contentType = response.headers.get('content-type');
                let data;
                
                if (contentType && contentType.includes('application/json')) {
                    data = await response.json();
                } else {
                    const text = await response.text();
                    console.error('Sunucu JSON yanıtı döndürmedi:', text);
                    throw new Error('Sunucudan geçersiz yanıt alındı');
                }
                
                console.log('API yanıtı:', data);
                
                if (!response.ok) {
                    console.error('Ürün güncellenemedi:', data);
                    throw new Error(data.message || `Ürün güncellenemedi. HTTP Hata: ${response.status}`);
                }
                
                console.log('Ürün başarıyla güncellendi:', data);
                return data;
            } catch (error) {
                console.error('Ürün güncelleme hatası:', error);
                
                // MongoDB bağlantısı yoksa simülasyon verilerini dene
                if (this.isApiAvailable() === false) {
                    console.log('Simülasyon verisi kullanılıyor (ürün güncelleme)');
                    
                    // Mevcut ürünü al
                    const existingProduct = this._getSimulatedProduct(id);
                    
                    if (!existingProduct) {
                        throw new Error('Ürün bulunamadı');
                    }
                    
                    // Form verilerinden temel alanları al
                    const name = formData.get('name') || existingProduct.name;
                    const price = formData.get('price') ? parseFloat(formData.get('price')) : existingProduct.price;
                    const stock = formData.get('stock') ? parseInt(formData.get('stock')) : existingProduct.stock;
                    const brand = formData.get('brand') || existingProduct.brand;
                    const description = formData.get('description') || existingProduct.description;
                    
                    // Ürünü güncelle
                    const updatedProduct = {
                        ...existingProduct,
                        name,
                        price,
                        stock,
                        brand,
                        description,
                        updatedAt: new Date().toISOString()
                    };
                    
                    // Önbellekteki ürünleri güncelle
                    const cachedProducts = localStorage.getItem('simulated_products');
                    
                    if (cachedProducts) {
                        try {
                            const parsed = JSON.parse(cachedProducts);
                            const products = parsed.data || [];
                            
                            // Ürünü güncelle
                            const updatedProducts = products.map(p => p._id === id ? updatedProduct : p);
                            
                            // Güncellenmiş ürünleri kaydet
                            localStorage.setItem('simulated_products', JSON.stringify({
                                ...parsed,
                                data: updatedProducts
                            }));
                        } catch (e) {
                            console.error('Önbellek ürünleri güncellenemedi:', e);
                        }
                    }
                    
                    return updatedProduct;
                }
                
                throw new Error(`Ürün güncellenemedi: ${error.message}`);
            }
        } else {
            // Eğer FormData değilse, normal JSON isteği yap
            return this.request(`/api/admin/products/${id}`, 'PUT', formData);
        }
    }
    
    // Ürün sil
    static async deleteProduct(id) {
        try {
            return this.request(`/api/admin/products/${id}`, 'DELETE');
        } catch (error) {
            console.error('Ürün silme hatası:', error);
            
            // MongoDB bağlantısı yoksa simülasyon verilerini dene
            if (this.isApiAvailable() === false) {
                console.log('Simülasyon verisi kullanılıyor (ürün silme)');
                
                // Önbellekteki ürünleri güncelle
                const cachedProducts = localStorage.getItem('simulated_products');
                
                if (cachedProducts) {
                    try {
                        const parsed = JSON.parse(cachedProducts);
                        const products = parsed.data || [];
                        
                        // Ürünü sil
                        const updatedProducts = products.filter(p => p._id !== id);
                        
                        // Güncellenmiş ürünleri kaydet
                        localStorage.setItem('simulated_products', JSON.stringify({
                            ...parsed,
                            data: updatedProducts,
                            totalItems: updatedProducts.length
                        }));
                    } catch (e) {
                        console.error('Önbellek ürünleri güncellenemedi:', e);
                    }
                }
                
                return { message: 'Ürün başarıyla silindi' };
            }
            
            throw error;
        }
    }
    
    // Toplu ürün güncelleme
    static async bulkUpdateProducts(ids, data) {
        try {
            return this.request('/api/admin/products/bulk-update', 'POST', { ids, update: data });
        } catch (error) {
            console.error('Toplu ürün güncelleme hatası:', error);
            
            // MongoDB bağlantısı yoksa simülasyon verilerini dene
            if (this.isApiAvailable() === false) {
                console.log('Simülasyon verisi kullanılıyor (toplu ürün güncelleme)');
                
                // Önbellekteki ürünleri güncelle
                const cachedProducts = localStorage.getItem('simulated_products');
                
                if (cachedProducts) {
                    try {
                        const parsed = JSON.parse(cachedProducts);
                        const products = parsed.data || [];
                        
                        // Ürünleri güncelle
                        const updatedProducts = products.map(p => {
                            if (ids.includes(p._id)) {
                                return { ...p, ...data, updatedAt: new Date().toISOString() };
                            }
                            return p;
                        });
                        
                        // Güncellenmiş ürünleri kaydet
                        localStorage.setItem('simulated_products', JSON.stringify({
                            ...parsed,
                            data: updatedProducts
                        }));
                    } catch (e) {
                        console.error('Önbellek ürünleri güncellenemedi:', e);
                    }
                }
                
                return { message: `${ids.length} ürün başarıyla güncellendi` };
            }
            
            throw error;
        }
    }
    
    // Toplu ürün silme
    static async bulkDeleteProducts(ids) {
        try {
            return this.request('/api/admin/products/bulk-delete', 'POST', { ids });
        } catch (error) {
            console.error('Toplu ürün silme hatası:', error);
            
            // MongoDB bağlantısı yoksa simülasyon verilerini dene
            if (this.isApiAvailable() === false) {
                console.log('Simülasyon verisi kullanılıyor (toplu ürün silme)');
                
                // Önbellekteki ürünleri güncelle
                const cachedProducts = localStorage.getItem('simulated_products');
                
                if (cachedProducts) {
                    try {
                        const parsed = JSON.parse(cachedProducts);
                        const products = parsed.data || [];
                        
                        // Ürünleri sil
                        const updatedProducts = products.filter(p => !ids.includes(p._id));
                        
                        // Güncellenmiş ürünleri kaydet
                        localStorage.setItem('simulated_products', JSON.stringify({
                            ...parsed,
                            data: updatedProducts,
                            totalItems: updatedProducts.length
                        }));
                    } catch (e) {
                        console.error('Önbellek ürünleri güncellenemedi:', e);
                    }
                }
                
                return { message: `${ids.length} ürün başarıyla silindi` };
            }
            
            throw error;
        }
    }
    
    // Kategorileri getir
    static async getCategories(params = {}) {
        try {
            // URL parametrelerini oluştur
            const queryParams = new URLSearchParams();
            
            if (params.page) queryParams.append('page', params.page);
            if (params.limit) queryParams.append('limit', params.limit);
            if (params.search) queryParams.append('search', params.search);
            if (params.parent) queryParams.append('parent', params.parent);
            
            const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
            
            // API isteğini gönder
            return this.request(`/api/admin/categories${queryString}`);
        } catch (error) {
            console.error('Kategoriler alınırken hata:', error);
            
            // MongoDB bağlantısı yoksa simülasyon verilerini dene
            if (this.isApiAvailable() === false) {
                console.log('Simülasyon verisi kullanılıyor (kategoriler)');
                return this._getSimulatedCategories();
            }
            
            throw error;
        }
    }
    
    // Kategori detayını getir
    static async getCategoryById(id) {
        try {
            return this.request(`/api/admin/categories/${id}`);
        } catch (error) {
            console.error('Kategori detayı alınırken hata:', error);
            
            // MongoDB bağlantısı yoksa simülasyon verilerini dene
            if (this.isApiAvailable() === false) {
                console.log('Simülasyon verisi kullanılıyor (kategori detayı)');
                const category = this._getSimulatedCategoryById(id);
                if (!category) {
                    throw new Error('Kategori bulunamadı');
                }
                return category;
            }
            
            throw error;
        }
    }
    
    // Yeni kategori oluştur
    static async createCategory(formData) {
        return this.request('/api/admin/categories', 'POST', formData);
    }
    
    // Kategori güncelle
    static async updateCategory(id, formData) {
        return this.request(`/api/admin/categories/${id}`, 'PUT', formData);
    }
    
    // Kategori sil
    static async deleteCategory(id) {
        return this.request(`/api/admin/categories/${id}`, 'DELETE');
    }
    
    // Siparişleri getir
    static async getOrders(params = {}) {
        try {
            // URL parametrelerini oluştur
            const queryParams = new URLSearchParams();
            
            if (params.page) queryParams.append('page', params.page);
            if (params.limit) queryParams.append('limit', params.limit);
            if (params.status) queryParams.append('status', params.status);
            if (params.search) queryParams.append('search', params.search);
            if (params.dateFrom) queryParams.append('dateFrom', params.dateFrom);
            if (params.dateTo) queryParams.append('dateTo', params.dateTo);
            
            const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
            
            console.log(`Sipariş API isteği: /api/admin/orders${queryString}`);
            
            // API isteğini gönder
            const response = await this.request(`/api/admin/orders${queryString}`);
            console.log('Sipariş API yanıtı:', response);
            
            // Yanıt formatını kontrol et ve uyumlu hale getir
            if (!response.data && response.orders) {
                // Eski format yanıtı yenisine uyarla
                response.data = response.orders;
            }
            
            return response;
        } catch (error) {
            console.error('Siparişler alınırken hata:', error);
            
            // Simülasyon verilerini dene
            if (this.isApiAvailable() === false) {
                console.log('Simülasyon verisi kullanılıyor (siparişler)');
                return this._getSimulatedOrders();
            }
            
            throw error;
        }
    }
    
    // Sipariş detayını getir
    static async getOrderById(id) {
        return this.request(`/api/admin/orders/${id}`);
    }
    
    // Sipariş durumunu güncelle
    static async updateOrderStatus(id, status) {
        return this.request(`/api/admin/orders/${id}/status`, 'PUT', { status });
    }
    
    // Sipariş bilgilerini güncelle
    static async updateOrder(id, data) {
        return this.request(`/api/admin/orders/${id}`, 'PUT', data);
    }
    
    // Müşterileri getir
    static async getCustomers(params = {}) {
        // URL parametrelerini oluştur
        const queryParams = new URLSearchParams();
        
        if (params.page) queryParams.append('page', params.page);
        if (params.limit) queryParams.append('limit', params.limit);
        if (params.search) queryParams.append('search', params.search);
        
        const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
        
        // API isteğini gönder
        return this.request(`/api/admin/customers${queryString}`);
    }
    
    // Müşteri detayını getir
    static async getCustomerById(id) {
        return this.request(`/api/admin/customers/${id}`);
    }
    
    // Müşterinin siparişlerini getir
    static async getCustomerOrders(id) {
        return this.request(`/api/admin/customers/${id}/orders`);
    }
    
    // Ayarları getir
    static async getSettings() {
        return this.request('/api/admin/settings');
    }
    
    // Ayarları kaydet
    static async saveSettings(type, formData) {
        try {
            // Form verileri için özel işlem gerekiyor
            if (formData instanceof FormData) {
                const response = await fetch(`/api/admin/settings/${type}`, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Authorization': `Bearer ${this.getAuthToken()}`
                    }
                });
                
                const data = await response.json();
                
                if (!response.ok) {
                    throw new Error(data.message || `HTTP Hata: ${response.status}`);
                }
                
                return data;
            } else {
                // Normal JSON isteği
                return this.request(`/api/admin/settings/${type}`, 'POST', formData);
            }
        } catch (error) {
            console.error('Ayarlar kaydedilirken hata:', error);
            throw error;
        }
    }
    
    // Test e-posta gönder
    static async sendTestEmail(email) {
        return this.request('/api/admin/settings/email/test', 'POST', { email });
    }
    
    // Önbelleği temizle
    static async clearCache() {
        return this.request('/api/admin/cache/clear', 'POST');
    }
} 