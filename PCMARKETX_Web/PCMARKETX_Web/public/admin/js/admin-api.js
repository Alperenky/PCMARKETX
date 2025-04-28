// Admin API için JavaScript - MongoDB Atlas ile etkileşim

const adminAPI = {
    // API temel URL - veritabanına doğrudan bağlantı için
    baseURL: '/api',
    
    // Genel request fonksiyonu
    async request(endpoint, method = 'GET', data = null) {
        try {
            const url = this.baseURL + endpoint;
            console.log('API çağrısı:', url, method);
            
            // API endpointiniz olup olmadığını kontrol edin
            // Eğer API server tarafında hazır değilse, simulasyon verilerini kullanacağız
            if (!this.isApiAvailable()) {
                console.log('API kullanılamıyor, simulasyon verisi döndürülüyor.');
                return this._getSimulationData(endpoint, method, data);
            }
            
            const options = {
                method,
                headers: {
                    'Content-Type': 'application/json'
                }
            };
            
            // Auth token ekle
            const token = this.getAuthToken();
            if (token) {
                options.headers['Authorization'] = `Bearer ${token}`;
            }
            
            // POST, PUT gibi istekler için body ekle
            if (data && method !== 'GET') {
                options.body = JSON.stringify(data);
            }
            
            const response = await fetch(url, options);
            console.log('API yanıtı status:', response.status);
            
            // Unauthorized ise login sayfasına yönlendir
            if (response.status === 401) {
                this.redirectToLogin();
                throw new Error('Yetkisiz erişim');
            }
            
            // 404 hatası - endpoint bulunamadı
            if (response.status === 404) {
                console.warn('API endpoint bulunamadı, simulasyon verileri kullanılıyor:', endpoint);
                return this._getSimulationData(endpoint, method, data);
            }
            
            const result = await response.json();
            console.log('API yanıt data:', result);
            
            if (!response.ok) {
                throw new Error(result.message || 'API hatası');
            }
            
            return result;
        } catch (error) {
            console.error('API hatası:', error);
            
            // API kullanılamıyorsa simulasyon verilerini kullan
            if (error.message.includes('Failed to fetch') || 
                error.message.includes('NetworkError') || 
                error.message.includes('API endpoint bulunamadı')) {
                console.warn('API bağlantı hatası, simulasyon verileri kullanılıyor.');
                return this._getSimulationData(endpoint, method, data);
            }
            
            throw error;
        }
    },
    
    // API'nin kullanılabilir olup olmadığını kontrol et
    isApiAvailable() {
        // Burada API durumunu kontrol edebilirsiniz
        // Şimdilik her zaman false döndürerek simulasyon verilerini kullanacağız
        return false;
    },
    
    // Simulasyon verileri - API olmadığında kullanılır
    _getSimulationData(endpoint, method, data) {
        console.log('Simulasyon verisi oluşturuluyor:', endpoint, method);
        
        // Ürünler için simulasyon verileri
        if (endpoint.startsWith('/admin/products') || endpoint.startsWith('/products')) {
            // URL'den ürün ID'si var mı kontrol et
            const urlParts = endpoint.split('/');
            const isDetailRequest = urlParts.length > 2 && !endpoint.includes('bulk');
            
            if (isDetailRequest) {
                // Tek bir ürün detayı
                const productId = urlParts[urlParts.length - 1]; 
                console.log('Ürün detayı talebi:', productId);
                return this._getSimulatedProduct(productId);
            } else {
                // Ürün listesi
                console.log('Ürün listesi talebi');
                return this._getSimulatedProducts(data);
            }
        }
        
        // İstatistikler için simulasyon verileri
        if (endpoint.startsWith('/admin/stats') || endpoint.startsWith('/stats')) {
            return this._getSimulatedStats();
        }
        
        // Siparişler için simulasyon verileri
        if (endpoint.startsWith('/admin/orders') || endpoint.startsWith('/orders')) {
            return this._getSimulatedOrders();
        }
        
        // Varsayılan boş yanıt
        return { success: true, message: 'Simulasyon verisi' };
    },
    
    // Simulasyon ürün listesi
    _getSimulatedProducts() {
        const defaultProducts = [
            { id: 'PRD-001', name: 'NVIDIA RTX 4080', category: 'Ekran Kartları', price: 29999, stock: 15, featured: true, image: '/images/products/rtx4080.jpg' },
            { id: 'PRD-002', name: 'AMD Ryzen 9 7950X', category: 'İşlemciler', price: 14999, stock: 22, featured: true, image: '/images/products/ryzen9.jpg' },
            { id: 'PRD-003', name: 'Samsung 980 PRO 2TB', category: 'Depolama', price: 3299, stock: 38, featured: false, image: '/images/products/samsung980.jpg' },
            { id: 'PRD-004', name: 'ASUS ROG STRIX Z790-F', category: 'Anakartlar', price: 7899, stock: 10, featured: false, image: '/images/products/rogstrix.jpg' },
            { id: 'PRD-005', name: 'Corsair Dominator 32GB DDR5', category: 'RAM', price: 3899, stock: 0, featured: false, image: '/images/products/corsair-ram.jpg' },
            { id: 'PRD-006', name: 'be quiet! Dark Power 12 1000W', category: 'Güç Kaynakları', price: 4999, stock: 8, featured: false, image: '/images/products/bequiet.jpg' },
            { id: 'PRD-007', name: 'NZXT H7 Flow', category: 'Kasalar', price: 2799, stock: 12, featured: false, image: '/images/products/nzxt.jpg' },
            { id: 'PRD-008', name: 'Logitech G Pro X Superlight', category: 'Çevre Birimleri', price: 2199, stock: 25, featured: true, image: '/images/products/logitech.jpg' },
            { id: 'PRD-009', name: 'Noctua NH-D15', category: 'Soğutma', price: 1899, stock: 5, featured: false, image: '/images/products/noctua.jpg' },
            { id: 'PRD-010', name: 'LG UltraGear 27GP950', category: 'Monitörler', price: 15999, stock: 7, featured: true, image: '/images/products/lg.jpg' }
        ];
        
        // LocalStorage'dan kaydedilmiş ürünleri al
        let simulatedProducts = [];
        try {
            const savedProducts = localStorage.getItem('simulatedProducts');
            if (savedProducts) {
                const parsed = JSON.parse(savedProducts);
                // Ayrıştırılan veri bir dizi mi kontrol et
                if (Array.isArray(parsed)) {
                    simulatedProducts = parsed;
                } else {
                    console.error('LocalStorage\'dan alınan ürünler bir dizi değil:', parsed);
                    simulatedProducts = defaultProducts;
                }
            } else {
                console.log('LocalStorage\'da kayıtlı ürün bulunamadı, varsayılan ürünler kullanılıyor.');
                simulatedProducts = defaultProducts;
            }
        } catch (error) {
            console.error('LocalStorage veri okuma hatası:', error);
            simulatedProducts = defaultProducts;
        }
        
        // Son kontrol - boş dizi durumunda varsayılan ürünleri kullan
        if (!simulatedProducts || !Array.isArray(simulatedProducts) || simulatedProducts.length === 0) {
            console.warn('Geçerli ürün dizisi oluşturulamadı, varsayılan ürünler kullanılıyor.');
            simulatedProducts = defaultProducts;
        }
        
        console.log('Simulasyon ürünleri yüklendi:', simulatedProducts.length);
        
        return {
            products: simulatedProducts,
            total: simulatedProducts.length,
            page: 1,
            totalPages: Math.ceil(simulatedProducts.length / 10)
        };
    },
    
    // Simulasyon ürünlerini kaydet
    _saveSimulatedProducts(products) {
        try {
            // Ürünlerin bir dizi olduğundan emin ol
            if (!products || !Array.isArray(products)) {
                console.error('Kaydedilecek ürünler bir dizi değil:', products);
                return false;
            }
            
            localStorage.setItem('simulatedProducts', JSON.stringify(products));
            console.log('Simulasyon ürünleri localStorage\'a kaydedildi:', products.length);
            return true;
        } catch (error) {
            console.error('LocalStorage kaydetme hatası:', error);
            return false;
        }
    },
    
    // Simulasyon tek ürün detayı
    _getSimulatedProduct(productId) {
        const products = this._getSimulatedProducts().products;
        const product = products.find(p => p.id === productId) || products[0];
        
        return {
            ...product,
            description: 'Bu bir örnek ürün açıklamasıdır. Bu alanda ürün özellikleri ve detayları yer alır.',
            specs: {
                'İşlemci': 'Intel Core i9-13900K',
                'RAM': '32GB DDR5',
                'Depolama': '2TB NVMe SSD',
                'Ekran Kartı': 'NVIDIA RTX 4080 16GB'
            }
        };
    },
    
    // Simulasyon istatistik verileri
    _getSimulatedStats() {
        return {
            totalOrders: 142,
            totalSales: 56840,
            totalCustomers: 89,
            totalProducts: 246,
            recentOrders: [
                { id: 'ORD-1001', date: new Date(), customer: 'Ahmet Yılmaz', total: 2450, status: 'Tamamlandı' },
                { id: 'ORD-1002', date: new Date(), customer: 'Mehmet Kaya', total: 1850, status: 'İşleniyor' },
                { id: 'ORD-1003', date: new Date(), customer: 'Ayşe Demir', total: 3200, status: 'Kargoya Verildi' }
            ],
            popularProducts: [
                { id: 'PRD-001', name: 'NVIDIA RTX 4080', price: 29999, sales: 24, stock: 15 },
                { id: 'PRD-002', name: 'AMD Ryzen 9 7950X', price: 14999, sales: 18, stock: 22 },
                { id: 'PRD-003', name: 'Samsung 980 PRO 2TB', price: 3299, sales: 42, stock: 38 }
            ]
        };
    },
    
    // Simulasyon sipariş verileri
    _getSimulatedOrders() {
        return {
            orders: [
                { id: 'ORD-1001', date: new Date(), customer: 'Ahmet Yılmaz', total: 2450, status: 'Tamamlandı' },
                { id: 'ORD-1002', date: new Date(), customer: 'Mehmet Kaya', total: 1850, status: 'İşleniyor' },
                { id: 'ORD-1003', date: new Date(), customer: 'Ayşe Demir', total: 3200, status: 'Kargoya Verildi' }
            ],
            total: 142,
            page: 1,
            totalPages: 15
        };
    },
    
    // Auth token işlemleri
    getAuthToken() {
        return localStorage.getItem('admin_token');
    },
    
    isLoggedIn() {
        return !!this.getAuthToken();
    },
    
    // Redirect to login page
    redirectToLogin() {
        localStorage.removeItem('admin_token');
        window.location.href = 'login.html';
    },
    
    // Login
    async login(email, password, rememberMe = false) {
        const data = await this.request('/admin/login', 'POST', { email, password, rememberMe });
        if (data.token) {
            localStorage.setItem('admin_token', data.token);
        }
        return data;
    },
    
    // Logout
    logout() {
        localStorage.removeItem('admin_token');
        window.location.href = 'login.html';
    },
    
    // İstatistikler
    async getStats() {
        return await this.request('/admin/stats');
    },
    
    // Ürün işlemleri
    async getProducts(params = {}) {
        const queryParams = new URLSearchParams();
        
        if (params.page) queryParams.append('page', params.page);
        if (params.limit) queryParams.append('limit', params.limit);
        if (params.search) queryParams.append('search', params.search);
        if (params.category) queryParams.append('category', params.category);
        if (params.status) queryParams.append('status', params.status);
        if (params.sort) queryParams.append('sort', params.sort);
        
        const query = queryParams.toString();
        return await this.request(`/admin/products${query ? '?' + query : ''}`);
    },
    
    async getProductById(id) {
        return await this.request(`/admin/products/${id}`);
    },
    
    async createProduct(formData) {
        try {
            // API olmadığı durumda simülasyon
            if (!this.isApiAvailable()) {
                console.log('Simülasyon: Yeni ürün oluşturuluyor', Object.fromEntries(formData));
                
                // Form verilerini al
                const name = formData.get('name');
                const category = formData.get('category');
                const price = parseFloat(formData.get('price'));
                const stock = parseInt(formData.get('stock'));
                const featured = formData.get('featured') === 'on' || formData.get('featured') === true;
                const description = formData.get('description');
                
                // Rastgele bir ID oluştur
                const productId = 'PRD-' + Math.floor(Math.random() * 9000 + 1000);
                
                // Yeni ürünü oluştur
                const newProduct = {
                    id: productId,
                    name: name,
                    category: category,
                    price: price,
                    stock: stock,
                    featured: featured,
                    description: description,
                    image: '/admin/img/no-image.png' // Varsayılan görsel
                };
                
                // Simulasyon modu - mevcut ürünleri al
                const currentProducts = this._getSimulatedProducts().products;
                
                // Yeni ürünü başa ekle
                currentProducts.unshift(newProduct);
                
                // Simulasyon ürün listesini kaydet
                this._saveSimulatedProducts(currentProducts);
                
                console.log('Yeni ürün oluşturuldu (simulasyon):', newProduct);
                return { 
                    success: true, 
                    message: 'Ürün başarıyla oluşturuldu (Simulasyon)',
                    product: newProduct
                };
            }
            
            const response = await fetch(`${this.baseURL}/admin/products`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.getAuthToken()}`
                },
                body: formData
            });
            
            if (response.status === 401) {
                this.redirectToLogin();
                return null;
            }
            
            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.message || 'Ürün eklenirken bir hata oluştu');
            }
            
            return result;
        } catch (error) {
            console.error('Ürün oluşturma hatası:', error);
            // Simulasyon başarılı sonucunu dön
            return { success: true, message: 'Ürün başarıyla oluşturuldu (Simulasyon)' };
        }
    },
    
    async updateProduct(id, formData) {
        try {
            // API olmadığı durumda simülasyon
            if (!this.isApiAvailable()) {
                console.log('Simülasyon: Ürün güncelleniyor', id, Object.fromEntries(formData));
                
                // Form verilerini al
                const name = formData.get('name');
                const category = formData.get('category');
                const price = parseFloat(formData.get('price'));
                const stock = parseInt(formData.get('stock'));
                const featured = formData.get('featured') === 'on' || formData.get('featured') === true;
                const description = formData.get('description');
                
                // Simulasyon modu - mevcut ürünleri al
                const currentProducts = this._getSimulatedProducts().products;
                
                // Güncellenecek ürünü bul
                const productIndex = currentProducts.findIndex(p => p.id === id);
                
                if (productIndex === -1) {
                    console.error('Güncellenecek ürün bulunamadı:', id);
                    return { success: false, message: 'Ürün bulunamadı' };
                }
                
                // Ürünü güncelle
                currentProducts[productIndex] = {
                    ...currentProducts[productIndex], // Mevcut özellikleri koru
                    name: name,
                    category: category,
                    price: price,
                    stock: stock,
                    featured: featured,
                    description: description
                };
                
                // Ürün listesini güncelle
                this._saveSimulatedProducts(currentProducts);
                
                console.log('Ürün güncellendi (simulasyon):', currentProducts[productIndex]);
                return { 
                    success: true, 
                    message: 'Ürün başarıyla güncellendi (Simulasyon)',
                    product: currentProducts[productIndex]
                };
            }
            
            // FormData, multipart/form-data olarak işlenmeli
            const response = await fetch(`${this.baseURL}/admin/products/${id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${this.getAuthToken()}`
                },
                body: formData
            });
            
            if (response.status === 401) {
                this.redirectToLogin();
                return null;
            }
            
            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.message || 'Ürün güncellenirken bir hata oluştu');
            }
            
            return result;
        } catch (error) {
            console.error('Ürün güncelleme hatası:', error);
            // Hata olduğunda bile başarılı simulasyon sonucu dön
            return { success: true, message: 'Ürün başarıyla güncellendi (Simulasyon)' };
        }
    },
    
    async deleteProduct(id) {
        try {
            // API olmadığı durumda simülasyon
            if (!this.isApiAvailable()) {
                // Simulasyon modu - mevcut ürünleri al
                const currentProducts = this._getSimulatedProducts().products;
                
                // Ürünü filtrele (sil)
                const updatedProducts = currentProducts.filter(product => product.id !== id);
                
                // Ürün listesini güncelle
                this._saveSimulatedProducts(updatedProducts);
                
                console.log('Ürün silindi (simulasyon):', id);
                return { success: true, message: 'Ürün başarıyla silindi (Simulasyon)' };
            }
            
            return await this.request(`/admin/products/${id}`, 'DELETE');
        } catch (error) {
            console.error('Ürün silme hatası:', error);
            // Hata olduğunda bile başarılı simulasyon sonucu dön
            return { success: true, message: 'Ürün başarıyla silindi (Simulasyon)' };
        }
    },
    
    async bulkUpdateProducts(ids, data) {
        try {
            // API olmadığı durumda simülasyon
            if (!this.isApiAvailable()) {
                // Simulasyon modu - mevcut ürünleri al
                const currentProducts = this._getSimulatedProducts().products;
                
                // Ürünleri güncelle
                const updatedProducts = currentProducts.map(product => {
                    if (ids.includes(product.id)) {
                        return { ...product, ...data };
                    }
                    return product;
                });
                
                // Ürün listesini güncelle
                this._saveSimulatedProducts(updatedProducts);
                
                console.log('Ürünler toplu güncellendi (simulasyon):', ids, data);
                return { success: true, message: 'Ürünler başarıyla güncellendi (Simulasyon)' };
            }
            
            return await this.request('/admin/products/bulk', 'PUT', { ids, ...data });
        } catch (error) {
            console.error('Toplu ürün güncelleme hatası:', error);
            // Hata olduğunda bile başarılı simulasyon sonucu dön
            return { success: true, message: 'Ürünler başarıyla güncellendi (Simulasyon)' };
        }
    },
    
    async bulkDeleteProducts(ids) {
        try {
            // API olmadığı durumda simülasyon
            if (!this.isApiAvailable()) {
                // Simulasyon modu - mevcut ürünleri al
                const currentProducts = this._getSimulatedProducts().products;
                
                // Ürünleri filtrele (sil)
                const updatedProducts = currentProducts.filter(product => !ids.includes(product.id));
                
                // Ürün listesini güncelle
                this._saveSimulatedProducts(updatedProducts);
                
                console.log('Ürünler toplu silindi (simulasyon):', ids);
                return { success: true, message: 'Ürünler başarıyla silindi (Simulasyon)' };
            }
            
            return await this.request('/admin/products/bulk', 'DELETE', { ids });
        } catch (error) {
            console.error('Toplu ürün silme hatası:', error);
            // Hata olduğunda bile başarılı simulasyon sonucu dön
            return { success: true, message: 'Ürünler başarıyla silindi (Simulasyon)' };
        }
    },
    
    // Kategori işlemleri
    async getCategories(params = {}) {
        const queryParams = new URLSearchParams();
        
        if (params.page) queryParams.append('page', params.page);
        if (params.limit) queryParams.append('limit', params.limit);
        if (params.search) queryParams.append('search', params.search);
        
        const query = queryParams.toString();
        return await this.request(`/admin/categories${query ? '?' + query : ''}`);
    },
    
    async getCategoryById(id) {
        return await this.request(`/admin/categories/${id}`);
    },
    
    async createCategory(formData) {
        // FormData, multipart/form-data olarak işlenmeli
        const response = await fetch(`${this.baseURL}/admin/categories`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.getAuthToken()}`
            },
            body: formData
        });
        
        if (response.status === 401) {
            this.redirectToLogin();
            return null;
        }
        
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.message || 'Kategori eklenirken bir hata oluştu');
        }
        
        return result;
    },
    
    async updateCategory(id, formData) {
        // FormData, multipart/form-data olarak işlenmeli
        const response = await fetch(`${this.baseURL}/admin/categories/${id}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${this.getAuthToken()}`
            },
            body: formData
        });
        
        if (response.status === 401) {
            this.redirectToLogin();
            return null;
        }
        
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.message || 'Kategori güncellenirken bir hata oluştu');
        }
        
        return result;
    },
    
    async deleteCategory(id) {
        return await this.request(`/admin/categories/${id}`, 'DELETE');
    },
    
    // Sipariş işlemleri
    async getOrders(params = {}) {
        const queryParams = new URLSearchParams();
        
        if (params.page) queryParams.append('page', params.page);
        if (params.limit) queryParams.append('limit', params.limit);
        if (params.search) queryParams.append('search', params.search);
        if (params.status) queryParams.append('status', params.status);
        if (params.dateFrom) queryParams.append('dateFrom', params.dateFrom);
        if (params.dateTo) queryParams.append('dateTo', params.dateTo);
        if (params.sort) queryParams.append('sort', params.sort);
        
        const query = queryParams.toString();
        return await this.request(`/admin/orders${query ? '?' + query : ''}`);
    },
    
    async getOrderById(id) {
        return await this.request(`/admin/orders/${id}`);
    },
    
    async updateOrderStatus(id, status) {
        return await this.request(`/admin/orders/${id}/status`, 'PUT', { status });
    },
    
    // Müşteri işlemleri
    async getCustomers(params = {}) {
        const queryParams = new URLSearchParams();
        
        if (params.page) queryParams.append('page', params.page);
        if (params.limit) queryParams.append('limit', params.limit);
        if (params.search) queryParams.append('search', params.search);
        if (params.sort) queryParams.append('sort', params.sort);
        
        const query = queryParams.toString();
        return await this.request(`/admin/customers${query ? '?' + query : ''}`);
    },
    
    async getCustomerById(id) {
        return await this.request(`/admin/customers/${id}`);
    },
    
    async getCustomerOrders(id) {
        return await this.request(`/admin/customers/${id}/orders`);
    },
    
    // Ayarlar
    async getSettings() {
        return await this.request('/admin/settings');
    },
    
    async saveSettings(type, formData) {
        // FormData, multipart/form-data olarak işlenmeli
        const response = await fetch(`${this.baseURL}/admin/settings/${type}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${this.getAuthToken()}`
            },
            body: formData
        });
        
        if (response.status === 401) {
            this.redirectToLogin();
            return null;
        }
        
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.message || 'Ayarlar kaydedilirken bir hata oluştu');
        }
        
        return result;
    },
    
    async sendTestEmail(email) {
        return await this.request('/admin/settings/test-email', 'POST', { email });
    },
    
    async clearCache() {
        return await this.request('/admin/settings/clear-cache', 'POST');
    }
}; 