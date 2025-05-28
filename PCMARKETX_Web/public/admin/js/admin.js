// Admin paneli için ana JavaScript dosyası

// Genel değişkenler
let currentPage = 1;
let totalPages = 1;
const PAGE_SIZE = 10;

// Sayfanın yüklenmesini bekle
document.addEventListener('DOMContentLoaded', function() {
    console.log('Admin panel yükleniyor...');
    
    // MongoDB bağlantı durumunu kontrol et
    checkMongoDBConnection();
    
    // Menü açılıp kapanma işlevselliği
    initSidebar();
    
    // Bildirim ve modal işlevselliği
    initNotifications();
    
    // Tema değiştirme
    initThemeToggle();
    
    // İlk sayfanın yüklenmesi
    initPages();
});

// MongoDB bağlantı durumunu kontrol et ve bildiri göster
function checkMongoDBConnection() {
    // MongoDB'yi her zaman bağlı kabul edelim çünkü artık siparişleri doğrudan alıyoruz
    localStorage.setItem('mongodb_connected', 'true');
    
    // Durum çubuğunda göster
    const statusBadge = document.querySelector('#dbStatusBadge');
    if (statusBadge) {
        statusBadge.classList.add('status-online');
        statusBadge.classList.remove('status-offline');
        statusBadge.title = 'Veri sistemi hazır';
    }
}

// Sidebar menüsünü başlat
function initSidebar() {
    const sidebarToggle = document.querySelector('.sidebar-toggle');
    const sidebar = document.querySelector('.sidebar');
    
    if (sidebarToggle && sidebar) {
        // Menü toggle butonuna tıklama olayı ekle
        sidebarToggle.addEventListener('click', function() {
            document.body.classList.toggle('sidebar-collapsed');
            
            // Tercih olarak kaydet
            const isCollapsed = document.body.classList.contains('sidebar-collapsed');
            localStorage.setItem('sidebar_collapsed', isCollapsed);
        });
        
        // Kaydedilmiş tercihe göre sidebar durumunu ayarla
        const isCollapsed = localStorage.getItem('sidebar_collapsed') === 'true';
        if (isCollapsed) {
            document.body.classList.add('sidebar-collapsed');
        }
        
        // Mobil görünümde dışarı tıklayınca menüyü kapat
        document.addEventListener('click', function(e) {
            if (window.innerWidth < 992 && !sidebar.contains(e.target) && !sidebarToggle.contains(e.target)) {
                document.body.classList.add('sidebar-collapsed');
            }
        });
    }
    
    // Alt menüler için dropdown işlevselliği
    const dropdownToggles = document.querySelectorAll('.has-submenu > a');
    dropdownToggles.forEach(toggle => {
        toggle.addEventListener('click', function(e) {
            e.preventDefault();
            const parent = this.parentElement;
            const isOpen = parent.classList.contains('submenu-open');
            
            // Diğer açık menüleri kapat
            document.querySelectorAll('.has-submenu.submenu-open').forEach(menu => {
                if (menu !== parent) {
                    menu.classList.remove('submenu-open');
                    const submenu = menu.querySelector('.submenu');
                    if (submenu) submenu.style.maxHeight = null;
                }
            });
            
            // Bu menüyü aç veya kapat
            parent.classList.toggle('submenu-open');
            const submenu = parent.querySelector('.submenu');
            if (submenu) {
                submenu.style.maxHeight = isOpen ? null : submenu.scrollHeight + 'px';
            }
        });
    });
}

// Bildirimleri başlat
function initNotifications() {
    // Bildirim container'ını oluştur
    if (!document.querySelector('.notification-container')) {
        createNotificationContainer();
    }
    
    // Bildirimleri kapatma olayını ekle
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('notification-close')) {
            const notification = e.target.closest('.notification');
            if (notification) {
                notification.classList.add('notification-hide');
                setTimeout(() => notification.remove(), 300);
            }
        }
    });
}

// Tema değiştirme işlevini başlat
function initThemeToggle() {
    const themeToggle = document.querySelector('.theme-toggle');
    if (themeToggle) {
        // Mevcut temayı kontrol et
        const isDarkMode = localStorage.getItem('dark_mode') === 'true';
        if (isDarkMode) {
            document.body.classList.add('dark-mode');
            themeToggle.checked = true;
        }
        
        // Tema değiştirme olayını ekle
        themeToggle.addEventListener('change', function() {
            document.body.classList.toggle('dark-mode');
            localStorage.setItem('dark_mode', this.checked);
        });
    }
}

// Sayfa yönlendirmelerini başlat
function initPages() {
    const pageName = getCurrentPageName();
    initializeAdminPanel(pageName);
    initCommonEvents();
}

// Check if user is logged in
function isLoggedIn() {
    const token = localStorage.getItem('admin_token');
    console.log('Checking login status. Token exists:', token !== null);
    return token !== null;
}

// Get current page name from URL
function getCurrentPageName() {
    const path = window.location.pathname;
    const pageName = path.split('/').pop().replace('.html', '');
    return pageName === 'admin' || pageName === 'index' || pageName === '' ? 'dashboard' : pageName;
}

// Initialize admin panel based on current page
function initializeAdminPanel(pageName) {
    console.log('Initializing panel for page:', pageName);
    
    // Set active menu item
    setActiveMenuItem(pageName);
    
    // Initialize page specific functions
    switch(pageName) {
        case 'dashboard':
            loadDashboardStats();
            break;
        case 'products':
            if (typeof window.initProductsPage === 'function') {
                console.log('Calling initProductsPage function...');
                window.initProductsPage();
                window.productsInitialized = true;
            } else {
                console.error('products sayfası için gerekli JS yüklenmemiş');
                // Try to load the script
                const script = document.createElement('script');
                script.src = 'js/admin-products.js';
                script.onload = function() {
                    console.log('admin-products.js script loaded successfully');
                    if (typeof window.initProductsPage === 'function') {
                        window.initProductsPage();
                        window.productsInitialized = true;
                    } else {
                        showNotification('Ürünler sayfası için gerekli JavaScript fonksiyonları yüklenemedi. Sayfayı yenileyin.', 'error');
                    }
                };
                script.onerror = function() {
                    console.error('admin-products.js script loading failed');
                    showNotification('Ürünler sayfası için gerekli JavaScript dosyaları yüklenemedi. Sayfayı yenileyin.', 'error');
                };
                document.body.appendChild(script);
            }
            break;
        case 'orders':
            if (typeof initOrdersPage === 'function') {
                initOrdersPage();
            } else {
                console.error('orders sayfası için gerekli JS yüklenmemiş');
                showNotification('Siparişler sayfası için gerekli JavaScript dosyaları yüklenemedi. Lütfen sayfayı yenileyin.', 'error');
            }
            break;
        // ... other cases for different pages
    }
}

// Set active menu item
function setActiveMenuItem(pageName) {
    const menuItems = document.querySelectorAll('.sidebar-menu a');
    menuItems.forEach(item => {
        const itemPage = item.getAttribute('href').replace('.html', '');
        if (itemPage === pageName || (itemPage === 'index' && pageName === 'dashboard')) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}

// Initialize common events
function initCommonEvents() {
    // Toggle sidebar on mobile
    const sidebarToggle = document.querySelector('.sidebar-toggle');
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', function() {
            document.body.classList.toggle('sidebar-collapsed');
        });
    }

    // Close notifications
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('notification-close')) {
            e.target.parentElement.remove();
        }
    });

    // Initialize logout button
    const logoutBtn = document.querySelector('.logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            localStorage.removeItem('admin_token');
            window.location.href = 'login.html';
        });
    }
}

/**
 * Bildirim göster
 * @param {string} message - Bildirim mesajı
 * @param {string} type - Bildirim tipi (success, error, warning, info)
 * @param {number} duration - Bildirim süresi (ms)
 */
function showNotification(message, type = 'info', duration = 3000) {
    const container = document.querySelector('.notification-container') || createNotificationContainer();
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    notification.innerHTML = `
        <div class="notification-icon">
            <i class="fas fa-${getNotificationIcon(type)}"></i>
        </div>
        <div class="notification-content">
            <div class="notification-message">${message}</div>
        </div>
        <button class="notification-close">&times;</button>
    `;
    
    container.appendChild(notification);
    
    // Otomatik kapanma
    if (duration > 0) {
        setTimeout(() => {
            notification.classList.add('notification-hide');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, duration);
    }
}

/**
 * Bildirim container oluştur
 * @returns {HTMLElement} Notification container
 */
function createNotificationContainer() {
    const container = document.createElement('div');
    container.className = 'notification-container';
    document.body.appendChild(container);
    return container;
}

/**
 * Bildirim tipine göre ikon getir
 * @param {string} type - Bildirim tipi
 * @returns {string} Icon class
 */
function getNotificationIcon(type) {
    switch (type) {
        case 'success':
            return 'check-circle';
        case 'error':
            return 'exclamation-circle';
        case 'warning':
            return 'exclamation-triangle';
        case 'info':
        default:
            return 'info-circle';
    }
}

/**
 * Yükleme durumunu göster/gizle
 * @param {boolean} show - Göster/gizle
 * @param {string} targetId - Hedef eleman ID
 */
function showLoading(targetId = null) {
    const targetElement = typeof targetId === 'string' ? document.querySelector(targetId) : document.body;
    if (!targetElement) return;
    
    let loader = targetElement.querySelector('.loader-overlay');
    
    if (!loader) {
        loader = document.createElement('div');
        loader.className = 'loader-overlay';
        loader.innerHTML = `<div class="loader"></div>`;
        targetElement.appendChild(loader);
    }
    loader.style.display = 'flex';
}

/**
 * Yükleme durumunu gizle
 * @param {string} targetId - Hedef eleman ID
 */
function hideLoading(targetId = null) {
    const targetElement = typeof targetId === 'string' ? document.querySelector(targetId) : document.body;
    if (!targetElement) return;
    
    const loader = targetElement.querySelector('.loader-overlay');
    if (loader) {
        loader.style.display = 'none';
    }
}

/**
 * Fiyat formatla
 * @param {number} price - Fiyat
 * @param {string} currency - Para birimi (₺, $, €)
 * @returns {string} Formatlanmış fiyat
 */
function formatPrice(price, currency = '₺') {
    // Null/undefined kontrolü
    if (price === null || price === undefined) {
        return '0 ' + currency;
    }
    
    // Number'a çevir
    const numPrice = parseFloat(price);
    if (isNaN(numPrice)) {
        return '0 ' + currency;
    }
    
    return numPrice.toLocaleString('tr-TR') + ' ' + currency;
}

/**
 * Sipariş durumunu Türkçe'ye çevir
 * @param {string} status - Sipariş durumu
 * @returns {string} Türkçe durum
 */
function translateOrderStatus(status) {
    if (!status) return 'Beklemede';
    
    status = status.toUpperCase();
    
    switch(status) {
        case 'PENDING':
        case 'BEKLEMEDE':
            return 'Beklemede';
        case 'PROCESSING':
        case 'İŞLENİYOR':
            return 'İşleniyor';
        case 'SHIPPED':
        case 'KARGOYA VERİLDİ':
            return 'Kargoya Verildi';
        case 'DELIVERED':
        case 'TESLİM EDİLDİ':
            return 'Teslim Edildi';
        case 'CANCELED':
        case 'İPTAL EDİLDİ':
            return 'İptal Edildi';
        default:
            return status;
    }
}

/**
 * Tarih formatla
 * @param {string|Date} date - Tarih
 * @returns {string} Formatlanmış tarih
 */
function formatDate(date) {
    const d = new Date(date);
    return d.toLocaleDateString('tr-TR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

/**
 * Sayfalama oluştur
 * @param {number} currentPage - Mevcut sayfa
 * @param {number} totalPages - Toplam sayfa
 * @param {Function} callback - Sayfa değiştiğinde çağrılacak fonksiyon
 * @param {string} containerId - Container ID
 */
function renderPagination(currentPage, totalPages, callback, containerId = 'pagination') {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    // Sayfa yoksa gizle
    if (totalPages <= 1) {
        container.style.display = 'none';
        return;
    }
    
    let html = `<ul class="pagination-list">`;
    
    // Önceki sayfa
    html += `<li class="pagination-item">
        <button class="pagination-link ${currentPage === 1 ? 'disabled' : ''}" 
            ${currentPage === 1 ? 'disabled' : `data-page="${currentPage - 1}"`}>
            <i class="fas fa-chevron-left"></i>
        </button>
    </li>`;
    
    // Sayfa numaraları
    const maxPageCount = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPageCount / 2));
    let endPage = Math.min(totalPages, startPage + maxPageCount - 1);
    
    if (endPage - startPage + 1 < maxPageCount) {
        startPage = Math.max(1, endPage - maxPageCount + 1);
    }
    
    // İlk sayfa
    if (startPage > 1) {
        html += `<li class="pagination-item">
            <button class="pagination-link" data-page="1">1</button>
        </li>`;
        
        if (startPage > 2) {
            html += `<li class="pagination-item pagination-ellipsis">...</li>`;
        }
    }
    
    // Orta sayfalar
    for (let i = startPage; i <= endPage; i++) {
        html += `<li class="pagination-item">
            <button class="pagination-link ${i === currentPage ? 'active' : ''}" data-page="${i}">
                ${i}
            </button>
        </li>`;
    }
    
    // Son sayfa
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            html += `<li class="pagination-item pagination-ellipsis">...</li>`;
        }
        
        html += `<li class="pagination-item">
            <button class="pagination-link" data-page="${totalPages}">${totalPages}</button>
        </li>`;
    }
    
    // Sonraki sayfa
    html += `<li class="pagination-item">
        <button class="pagination-link ${currentPage === totalPages ? 'disabled' : ''}" 
            ${currentPage === totalPages ? 'disabled' : `data-page="${currentPage + 1}"`}>
            <i class="fas fa-chevron-right"></i>
        </button>
    </li>`;
    
    html += `</ul>`;
    
    container.innerHTML = html;
    container.style.display = 'flex';
    
    // Sayfalama butonlarına tıklama olayı
    container.querySelectorAll('.pagination-link:not(.disabled)').forEach(button => {
        button.addEventListener('click', function() {
            const page = parseInt(this.getAttribute('data-page'));
            if (page && page !== currentPage) {
                callback(page);
            }
        });
    });
}

// Dashboard istatistikleri yükleme
async function loadDashboardStats() {
    try {
        showLoading('#dashboard-stats');
        
        // Örnek veriler yerine gerçek sipariş ve ürün verilerini kullanalım
        // Tüm siparişleri ve ürünleri aynı anda almak için Promise.all kullanıyoruz
        const [ordersResponse, productsResponse] = await Promise.all([
            AdminAPI.getOrders({ limit: 100 }),  // Son 100 siparişi al
            AdminAPI.getProducts({ limit: 100 }) // Son 100 ürünü al
        ]);
        
        console.log('Sipariş verileri alındı:', ordersResponse);
        console.log('Ürün verileri alındı:', productsResponse);
        
        // Sipariş verilerini kontrol et
        const orders = ordersResponse.data || ordersResponse.orders || [];
        const products = productsResponse.data || productsResponse.products || [];
        
        // İstatistik hesaplamaları
        const totalOrders = orders.length;
        
        // Toplam satış tutarını hesapla
        let totalSales = 0;
        orders.forEach(order => {
            totalSales += parseFloat(order.total || order.totalPrice || 0);
        });
        
        // Müşteri sayısını hesapla (benzersiz user_id'ler)
        const uniqueCustomers = new Set();
        orders.forEach(order => {
            if (order.user && order.user._id) {
                uniqueCustomers.add(order.user._id);
            } else if (order.customer && order.customer._id) {
                uniqueCustomers.add(order.customer._id);
            }
        });
        const totalCustomers = uniqueCustomers.size;
        
        // Düşük stoklu ürünleri bul (stok < 10)
        const lowStockProducts = products.filter(product => {
            return product.stock !== undefined && product.stock < 10;
        });
        
        // Bekleyen siparişleri bul
        const pendingOrders = orders.filter(order => {
            const status = order.status ? order.status.toUpperCase() : '';
            return status === 'PENDING' || status === 'BEKLEMEDE';
        });
        
        // Son 5 siparişi bul
        const recentOrders = orders
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 5)
            .map(order => {
                // Tarih formatı düzeltme
                const orderDate = new Date(order.createdAt);
                
                return {
                    id: order._id,
                    orderNumber: order.orderNumber || order._id,
                    date: orderDate,
                    customer: order.user ? (order.user.username || order.user.name || 'Misafir') : 
                             (order.customer ? order.customer.name : 'Misafir'),
                    total: order.total || order.totalPrice || 0,
                    status: translateOrderStatus(order.status)
                };
            });
        
        // En çok satan ürünleri hesapla
        // Önce her ürünün satış adedini belirle
        const productSalesMap = new Map();
        
        orders.forEach(order => {
            if (order.orderItems && Array.isArray(order.orderItems)) {
                order.orderItems.forEach(item => {
                    if (item.product) {
                        const productId = typeof item.product === 'string' ? 
                            item.product : (item.product._id || '');
                        
                        if (productId) {
                            const currentSales = productSalesMap.get(productId) || 0;
                            productSalesMap.set(productId, currentSales + (item.qty || 1));
                        }
                    }
                });
            }
        });
        
        // Ürünleri satış sayısına göre sırala
        const topSellingProducts = products
            .filter(product => productSalesMap.has(product._id))
            .map(product => ({
                id: product._id,
                name: product.name,
                price: product.price,
                stock: product.stock || 0,
                sales: productSalesMap.get(product._id) || 0,
                category: product.category ? (
                    typeof product.category === 'string' ? product.category : 
                    (product.category.name || 'Diğer')
                ) : 'Diğer'
            }))
            .sort((a, b) => b.sales - a.sales)
            .slice(0, 5);
        
        // Dashboard istatistiklerini güncelle
        document.querySelector('#total-orders').textContent = totalOrders;
        document.querySelector('#total-revenue').textContent = formatPrice(totalSales);
        document.querySelector('#total-customers').textContent = totalCustomers;
        document.querySelector('#total-products').textContent = products.length;
        
        // Düşük stoklu ürünler
        const lowStockElement = document.querySelector('#low-stock-products');
        if (lowStockElement) {
            lowStockElement.textContent = lowStockProducts.length;
        }
        
        // Bekleyen siparişler
        const pendingOrdersElement = document.querySelector('#pending-orders');
        if (pendingOrdersElement) {
            pendingOrdersElement.textContent = pendingOrders.length;
        }
        
        // Son siparişleri güncelle
        if (recentOrders.length > 0) {
            renderRecentOrders(recentOrders);
        } else {
            const recentOrdersTable = document.querySelector('#recent-orders tbody');
            if (recentOrdersTable) {
                recentOrdersTable.innerHTML = '<tr><td colspan="5" class="text-center">Henüz sipariş bulunmuyor</td></tr>';
            }
        }
        
        // Popüler ürünleri güncelle
        if (topSellingProducts.length > 0) {
            renderPopularProducts(topSellingProducts);
        } else {
            const popularProductsTable = document.querySelector('#popular-products tbody');
            if (popularProductsTable) {
                popularProductsTable.innerHTML = '<tr><td colspan="5" class="text-center">Satış verisi bulunamadı</td></tr>';
            }
        }
        
        showNotification('Dashboard başarıyla güncellendi', 'success', 2000);
        
    } catch (error) {
        console.error('Dashboard yüklenirken hata oluştu:', error);
        showNotification('Dashboard yüklenirken bir hata oluştu. Lütfen sayfayı yenileyin.', 'error');
        
        // Hata durumunda tabloları temizle
        const recentOrdersTable = document.querySelector('#recent-orders tbody');
        if (recentOrdersTable) {
            recentOrdersTable.innerHTML = '<tr><td colspan="5" class="text-center">Veriler yüklenemedi</td></tr>';
        }
        
        const popularProductsTable = document.querySelector('#popular-products tbody');
        if (popularProductsTable) {
            popularProductsTable.innerHTML = '<tr><td colspan="5" class="text-center">Veriler yüklenemedi</td></tr>';
        }
        
    } finally {
        hideLoading('#dashboard-stats');
    }
}

// Render recent orders
function renderRecentOrders(orders) {
    const tableBody = document.querySelector('#recent-orders tbody');
    tableBody.innerHTML = '';
    
    orders.forEach(order => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${order.orderNumber || order.id}</td>
            <td>${order.customer}</td>
            <td>${formatPrice(order.total)}</td>
            <td><span class="badge ${getStatusClass(order.status)}">${order.status}</span></td>
            <td>${formatDate(order.date)}</td>
        `;
        tableBody.appendChild(row);
    });
}

// Get status class for badge
function getStatusClass(status) {
    if (!status) return 'bg-secondary';
    
    status = status.toUpperCase();
    
    switch(status) {
        case 'DELIVERED':
        case 'TESLİM EDİLDİ':
        case 'TAMAMLANDI':
            return 'bg-success';
        case 'PROCESSING':
        case 'İŞLENİYOR':
            return 'bg-primary';
        case 'SHIPPED':
        case 'KARGOYA VERİLDİ':
            return 'bg-info';
        case 'CANCELED':
        case 'İPTAL EDİLDİ':
            return 'bg-danger';
        case 'PENDING':
        case 'BEKLEMEDE':
            return 'bg-warning';
        default:
            return 'bg-secondary';
    }
}

// Render popular products
function renderPopularProducts(products) {
    const tableBody = document.querySelector('#popular-products tbody');
    tableBody.innerHTML = '';
    
    products.forEach(product => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${product.name}</td>
            <td>${product.category || 'Diğer'}</td>
            <td>${formatPrice(product.price)}</td>
            <td>${product.stock}</td>
            <td>${product.sales}</td>
        `;
        tableBody.appendChild(row);
    });
}

/**
 * Siparişleri listeleme sayfasını başlat
 */
function initOrdersPage() {
    console.log('Siparişler sayfası başlatılıyor...');
    let currentPage = 1;
    let ordersPerPage = 10;
    
    // Filtre elemanlarını seç
    const filterStatus = document.getElementById('filterStatus');
    const filterDateFrom = document.getElementById('filterDateFrom');
    const filterDateTo = document.getElementById('filterDateTo');
    const filterSearch = document.getElementById('filterSearch');
    const resetFiltersBtn = document.getElementById('resetFilters');
    
    // Filtreleri temizle butonu
    if (resetFiltersBtn) {
        resetFiltersBtn.addEventListener('click', function() {
            filterStatus.value = '';
            filterDateFrom.value = '';
            filterDateTo.value = '';
            filterSearch.value = '';
            loadOrders(1);
        });
    }
    
    // Filtre değiştiğinde siparişleri yeniden yükle
    if (filterStatus) filterStatus.addEventListener('change', () => loadOrders(1));
    if (filterDateFrom) filterDateFrom.addEventListener('change', () => loadOrders(1));
    if (filterDateTo) filterDateTo.addEventListener('change', () => loadOrders(1));
    if (filterSearch) {
        filterSearch.addEventListener('keyup', function(e) {
            if (e.key === 'Enter') {
                loadOrders(1);
            }
        });
    }
    
    // Siparişleri yükle fonksiyonu
    async function loadOrders(page = 1) {
        try {
            currentPage = page;
            showLoading('#ordersTable');
            
            // Filtre parametrelerini hazırla
            const params = {
                page: page,
                limit: ordersPerPage
            };
            
            if (filterStatus && filterStatus.value) {
                params.status = filterStatus.value;
            }
            
            if (filterSearch && filterSearch.value) {
                params.search = filterSearch.value;
            }
            
            if (filterDateFrom && filterDateFrom.value) {
                params.dateFrom = filterDateFrom.value;
            }
            
            if (filterDateTo && filterDateTo.value) {
                params.dateTo = filterDateTo.value;
            }
            
            // API'den siparişleri al
            const response = await AdminAPI.getOrders(params);
            console.log('Siparişler yüklendi:', response);
            
            // Tabloyu güncelle
            renderOrdersTable(response.data || []);
            
            // Sayfalama oluştur
            renderPagination(
                page, 
                response.totalPages || 1, 
                loadOrders, 
                'ordersPagination'
            );
            
        } catch (error) {
            console.error('Siparişler yüklenirken hata:', error);
            showNotification('Siparişler yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.', 'error');
            
            // Hata durumunda boş tablo göster
            renderOrdersTable([]);
            renderPagination(1, 1, loadOrders, 'ordersPagination');
        } finally {
            hideLoading('#ordersTable');
        }
    }
    
    // Siparişleri tabloya render et
    function renderOrdersTable(orders) {
        const tableBody = document.querySelector('#ordersTable tbody');
        if (!tableBody) return;
        
        tableBody.innerHTML = '';
        
        if (!orders || orders.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center">Sipariş bulunamadı</td>
                </tr>
            `;
            return;
        }
        
        orders.forEach(order => {
            const row = document.createElement('tr');
            
            // Sipariş durumuna göre sınıf ekle
            const statusClass = getStatusClass(order.status);
            
            row.innerHTML = `
                <td><a href="#" class="order-link" data-id="${order._id}">${order.orderNumber || order._id}</a></td>
                <td>${order.customer ? order.customer.name : 'Misafir'}</td>
                <td>${formatDate(order.createdAt)}</td>
                <td>${formatPrice(order.total)}</td>
                <td>${order.paymentMethod || 'Belirtilmemiş'}</td>
                <td><span class="badge ${statusClass}">${translateOrderStatus(order.status)}</span></td>
                <td>
                    <div class="table-actions">
                        <button class="btn btn-sm btn-light view-order" data-id="${order._id}" title="Görüntüle">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-primary edit-order" data-id="${order._id}" title="Düzenle">
                            <i class="fas fa-edit"></i>
                        </button>
                    </div>
                </td>
            `;
            
            tableBody.appendChild(row);
        });
        
        // Sipariş detayı butonlarını aktif et
        document.querySelectorAll('.view-order, .order-link').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                const orderId = this.getAttribute('data-id');
                viewOrderDetails(orderId);
            });
        });
        
        // Sipariş düzenleme butonlarını aktif et
        document.querySelectorAll('.edit-order').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                const orderId = this.getAttribute('data-id');
                editOrder(orderId);
            });
        });
    }
    
    // Sipariş detaylarını görüntüle
    async function viewOrderDetails(orderId) {
        try {
            showLoading();
            
            // Siparişi getir
            const order = await AdminAPI.getOrderById(orderId);
            console.log('Sipariş detayları:', order);
            
            // Modal bilgilerini doldur
            document.getElementById('orderNumber').textContent = order.orderNumber || order._id;
            document.getElementById('orderDate').textContent = formatDate(order.createdAt);
            document.getElementById('orderStatus').textContent = translateOrderStatus(order.status);
            document.getElementById('paymentMethod').textContent = order.paymentMethod || 'Belirtilmemiş';
            document.getElementById('paymentStatus').textContent = order.isPaid ? 'Ödendi' : 'Ödenmedi';
            
            // Durum güncelleme selectbox
            const statusSelect = document.getElementById('newOrderStatus');
            if (statusSelect) {
                statusSelect.value = order.status.toLowerCase();
            }
            
            // Adres bilgileri
            const billingAddressEl = document.getElementById('billingAddress');
            const shippingAddressEl = document.getElementById('shippingAddress');
            
            if (billingAddressEl && order.billingAddress) {
                billingAddressEl.innerHTML = formatAddress(order.billingAddress);
            }
            
            if (shippingAddressEl && order.shippingAddress) {
                shippingAddressEl.innerHTML = formatAddress(order.shippingAddress);
            }
            
            // Sipariş ürünleri
            const orderItemsEl = document.getElementById('orderItemsList');
            if (orderItemsEl && order.orderItems && order.orderItems.length > 0) {
                orderItemsEl.innerHTML = '';
                
                let subtotal = 0;
                
                order.orderItems.forEach(item => {
                    const row = document.createElement('tr');
                    const itemTotal = item.price * item.qty;
                    subtotal += itemTotal;
                    
                    row.innerHTML = `
                        <td>
                            <div class="d-flex align-items-center">
                                <div class="product-image">
                                    <img src="${item.image || '../img/product-placeholder.png'}" alt="${item.name}">
                                </div>
                                <div class="product-info">
                                    <div class="product-name">${item.name}</div>
                                    <div class="product-sku">${item.product}</div>
                                </div>
                            </div>
                        </td>
                        <td>${formatPrice(item.price)}</td>
                        <td>${item.qty}</td>
                        <td>${formatPrice(itemTotal)}</td>
                    `;
                    
                    orderItemsEl.appendChild(row);
                });
                
                // Toplam bilgileri
                document.getElementById('orderSubtotal').textContent = formatPrice(subtotal);
                
                // Diğer toplam alanları
                if (order.taxPrice) {
                    document.getElementById('orderTax').textContent = formatPrice(order.taxPrice);
                    document.getElementById('taxRow').style.display = '';
                } else {
                    document.getElementById('taxRow').style.display = 'none';
                }
                
                if (order.shippingPrice) {
                    document.getElementById('orderShipping').textContent = formatPrice(order.shippingPrice);
                    document.getElementById('shippingRow').style.display = '';
                } else {
                    document.getElementById('shippingRow').style.display = 'none';
                }
                
                if (order.discount) {
                    document.getElementById('orderDiscount').textContent = formatPrice(order.discount);
                    document.getElementById('discountRow').style.display = '';
                } else {
                    document.getElementById('discountRow').style.display = 'none';
                }
                
                document.getElementById('orderTotal').textContent = formatPrice(order.total);
            }
            
            // Müşteri bilgileri
            if (order.customer) {
                document.getElementById('customerName').textContent = order.customer.name;
                document.getElementById('customerEmail').textContent = order.customer.email;
                document.getElementById('customerPhone').textContent = order.customer.phone || 'Belirtilmemiş';
                document.getElementById('customerRegistered').textContent = formatDate(order.customer.createdAt);
                
                // Müşteri profil linki
                const viewCustomerLink = document.getElementById('viewCustomerLink');
                if (viewCustomerLink) {
                    viewCustomerLink.href = `customers.html?id=${order.customer._id}`;
                }
            }
            
            // Durum güncelleme butonunu aktif et
            const updateStatusBtn = document.getElementById('updateStatus');
            if (updateStatusBtn) {
                updateStatusBtn.onclick = async function() {
                    try {
                        const newStatus = document.getElementById('newOrderStatus').value;
                        await AdminAPI.updateOrderStatus(orderId, newStatus);
                        showNotification('Sipariş durumu güncellendi', 'success');
                        
                        // Sipariş listesini yenile
                        loadOrders(currentPage);
                        
                        // Modal'ı kapat
                        closeModal('orderDetailModal');
                    } catch (error) {
                        console.error('Sipariş durumu güncellenirken hata:', error);
                        showNotification('Sipariş durumu güncellenirken bir hata oluştu', 'error');
                    }
                };
            }
            
            // Modal'ı aç
            openModal('orderDetailModal');
            
        } catch (error) {
            console.error('Sipariş detayları yüklenirken hata:', error);
            showNotification('Sipariş detayları yüklenirken bir hata oluştu', 'error');
        } finally {
            hideLoading();
        }
    }
    
    // Adresi formatla
    function formatAddress(address) {
        if (!address) return 'Adres belirtilmemiş';
        
        const addressParts = [];
        if (address.address) addressParts.push(address.address);
        if (address.city) addressParts.push(address.city);
        if (address.postalCode) addressParts.push(address.postalCode);
        if (address.country) addressParts.push(address.country);
        
        return addressParts.join('<br>');
    }
    
    // Sipariş düzenleme
    function editOrder(orderId) {
        // Düzenleme sayfasına yönlendir
        window.location.href = `order-edit.html?id=${orderId}`;
    }
    
    // Modal fonksiyonları
    function openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'flex';
            document.body.classList.add('modal-open');
        }
    }
    
    function closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
            document.body.classList.remove('modal-open');
        }
    }
    
    // Modal kapatma butonlarını etkinleştir
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', function() {
            const modal = this.closest('.modal');
            if (modal) {
                modal.style.display = 'none';
                document.body.classList.remove('modal-open');
            }
        });
    });
    
    // Tab'ları etkinleştir
    document.querySelectorAll('.tab-btn').forEach(tab => {
        tab.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            
            // Tüm tab butonlarını pasif yap
            document.querySelectorAll('.tab-btn').forEach(t => t.classList.remove('active'));
            // Tüm tab içeriklerini gizle
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            
            // Seçilen tab'ı aktif yap
            this.classList.add('active');
            document.getElementById(tabId).classList.add('active');
        });
    });
    
    // İlk yüklemeyi başlat
    loadOrders(1);
} 