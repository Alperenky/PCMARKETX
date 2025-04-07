// Admin paneli için ana JavaScript dosyası

// Genel değişkenler
let currentPage = 1;
let totalPages = 1;
const PAGE_SIZE = 10;

// Sayfa yüklendiğinde
document.addEventListener('DOMContentLoaded', function() {
    console.log('Admin panel starting...');
    
    // Login sayfasındaysak kontrol etmeye gerek yok
    if (window.location.href.includes('login.html')) {
        console.log('Login page detected, skipping auth check');
        return;
    }
    
    // Check if user is logged in
    if (!isLoggedIn()) {
        console.log('User not logged in, redirecting to login page');
        window.location.href = 'login.html';
        return;
    }

    // Determine current page and initialize
    const pageName = getCurrentPageName();
    console.log('Current page:', pageName);
    initializeAdminPanel(pageName);
    initCommonEvents();
});

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
    return price.toLocaleString('tr-TR') + ' ' + currency;
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
        
        // Get stats from API
        const stats = await adminAPI.getStats();
        
        // Update dashboard stats
        document.querySelector('#total-orders').textContent = stats.totalOrders;
        document.querySelector('#total-sales').textContent = formatPrice(stats.totalSales);
        document.querySelector('#total-customers').textContent = stats.totalCustomers;
        document.querySelector('#total-products').textContent = stats.totalProducts;
        
        // Update recent orders
        if (stats.recentOrders && stats.recentOrders.length > 0) {
            renderRecentOrders(stats.recentOrders);
        }
        
        // Update popular products
        if (stats.popularProducts && stats.popularProducts.length > 0) {
            renderPopularProducts(stats.popularProducts);
        }
    } catch (error) {
        console.log('Dashboard yüklenirken hata oluştu:', error);
        showNotification('Dashboard yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.', 'error');
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
            <td>${order.id}</td>
            <td>${formatDate(order.date)}</td>
            <td>${order.customer}</td>
            <td>${formatPrice(order.total)}</td>
            <td><span class="badge ${getStatusClass(order.status)}">${order.status}</span></td>
            <td>
                <button class="btn btn-sm btn-outline-primary" onclick="viewOrder('${order.id}')">
                    <i class="fas fa-eye"></i>
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Get status class for badge
function getStatusClass(status) {
    switch(status) {
        case 'Tamamlandı':
            return 'bg-success';
        case 'İşleniyor':
            return 'bg-primary';
        case 'Kargoya Verildi':
            return 'bg-info';
        case 'İptal Edildi':
            return 'bg-danger';
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
            <td>${product.id}</td>
            <td>${product.name}</td>
            <td>${formatPrice(product.price)}</td>
            <td>${product.sales}</td>
            <td>${product.stock}</td>
        `;
        tableBody.appendChild(row);
    });
} 