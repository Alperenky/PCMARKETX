/**
 * Main Admin JavaScript
 * Core functionality for the admin panel
 */

// Global variables for pagination
let currentPage = 1;
let totalPages = 1;
let pageSize = 10;
let currentPageName = '';

// Initialize when document is loaded
document.addEventListener('DOMContentLoaded', () => {
    initializeAdminPanel();
});

/**
 * Initialize the admin panel based on the current page
 */
function initializeAdminPanel() {
    // Get current page name from URL
    currentPageName = getCurrentPageName();
    
    // Initialize common events for all pages
    initCommonEvents();
    
    // Initialize specific page if needed
    switch (currentPageName) {
        case 'index':
        case '':
            initDashboard();
            break;
    }
}

/**
 * Get the current page name from the URL
 * @returns {string} The page name
 */
function getCurrentPageName() {
    const path = window.location.pathname;
    const filename = path.split('/').pop();
    
    if (!filename || filename === '') {
        return 'index';
    }
    
    return filename.replace('.html', '');
}

/**
 * Initialize common events for all pages
 */
function initCommonEvents() {
    // Sidebar toggle
    const sidebarToggle = document.querySelector('.sidebar-toggle');
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', () => {
            document.querySelector('.admin-container').classList.toggle('sidebar-collapsed');
        });
    }
    
    // Modal close buttons
    document.querySelectorAll('.modal-close, [data-dismiss="modal"]').forEach(btn => {
        btn.addEventListener('click', e => {
            e.preventDefault();
            const modal = btn.closest('.modal');
            if (modal) {
                modal.classList.remove('show');
            }
        });
    });
    
    // Close notification when clicking the close button
    document.addEventListener('click', e => {
        if (e.target.matches('.notification-close')) {
            const notification = e.target.closest('.notification');
            if (notification) {
                closeNotification(notification);
            }
        }
    });
    
    // Logout button
    const logoutBtn = document.querySelector('.logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', e => {
            e.preventDefault();
            AdminAPI.logout().then(() => {
                window.location.href = '/admin/login.html';
            });
        });
    }
    
    // Check authentication
    checkAuthentication();
}

/**
 * Check if user is authenticated
 */
async function checkAuthentication() {
    try {
        // Skip if on login page
        if (currentPageName === 'login') return;
        
        const isLoggedIn = await AdminAPI.isLoggedIn();
        if (!isLoggedIn) {
            window.location.href = '/admin/login.html';
        }
    } catch (error) {
        console.error('Authentication check failed:', error);
        window.location.href = '/admin/login.html';
    }
}

/**
 * Initialize the dashboard page
 */
async function initDashboard() {
    try {
        showLoading(document.querySelector('.main-content'));
        
        // Fetch dashboard stats
        const stats = await AdminAPI.getStats();
        
        // Update stats cards
        document.getElementById('total-revenue').textContent = formatPrice(stats.totalRevenue || 0);
        document.getElementById('total-orders').textContent = stats.totalOrders || 0;
        document.getElementById('total-customers').textContent = stats.totalCustomers || 0;
        document.getElementById('total-products').textContent = stats.totalProducts || 0;
        
        // Update alert cards
        document.getElementById('pending-orders').textContent = stats.pendingOrders || 0;
        document.getElementById('low-stock-products').textContent = stats.lowStockProducts || 0;
        
        // Update recent orders
        updateRecentOrders(stats.recentOrders || []);
        
        // Update popular products
        updatePopularProducts(stats.popularProducts || []);
    } catch (error) {
        showNotification('Dashboard verileri yüklenirken bir hata oluştu.', 'error');
        console.error('Error loading dashboard stats:', error);
    } finally {
        hideLoading();
    }
}

/**
 * Update the recent orders table
 * @param {Array} orders - Array of order objects
 */
function updateRecentOrders(orders) {
    const tableBody = document.querySelector('#recent-orders tbody');
    tableBody.innerHTML = '';
    
    if (orders.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="5" class="text-center">Henüz sipariş bulunmuyor.</td></tr>';
        return;
    }
    
    orders.forEach(order => {
        const row = document.createElement('tr');
        
        // Format the status
        let statusClass = '';
        switch (order.status) {
            case 'pending':
                statusClass = 'pending';
                break;
            case 'processing':
                statusClass = 'processing';
                break;
            case 'shipped':
                statusClass = 'shipped';
                break;
            case 'delivered':
                statusClass = 'delivered';
                break;
            case 'cancelled':
                statusClass = 'cancelled';
                break;
        }
        
        row.innerHTML = `
            <td><a href="orders.html?id=${order._id}">#${order.orderNumber || order._id}</a></td>
            <td>${order.customer ? order.customer.name : 'Misafir'}</td>
            <td>${formatPrice(order.total)}</td>
            <td><span class="status-badge status-${statusClass}">${getOrderStatusText(order.status)}</span></td>
            <td>${formatDate(order.createdAt)}</td>
        `;
        
        tableBody.appendChild(row);
    });
}

/**
 * Update the popular products table
 * @param {Array} products - Array of product objects
 */
function updatePopularProducts(products) {
    const tableBody = document.querySelector('#popular-products tbody');
    tableBody.innerHTML = '';
    
    if (products.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="5" class="text-center">Henüz ürün bulunmuyor.</td></tr>';
        return;
    }
    
    products.forEach(product => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td><a href="products.html?id=${product._id}">${product.name}</a></td>
            <td>${product.category ? product.category.name : '-'}</td>
            <td>${formatPrice(product.price)}</td>
            <td>${product.stock}</td>
            <td>${product.sales || 0}</td>
        `;
        
        tableBody.appendChild(row);
    });
}

/**
 * Format price with currency
 * @param {number} price - The price to format
 * @returns {string} Formatted price with currency symbol
 */
function formatPrice(price) {
    return '₺' + parseFloat(price).toLocaleString('tr-TR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

/**
 * Format date
 * @param {string} dateString - The date string to format
 * @returns {string} Formatted date
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

/**
 * Get order status text
 * @param {string} status - The order status
 * @returns {string} The status text
 */
function getOrderStatusText(status) {
    switch (status) {
        case 'pending':
            return 'Beklemede';
        case 'processing':
            return 'İşleniyor';
        case 'shipped':
            return 'Kargoya Verildi';
        case 'delivered':
            return 'Teslim Edildi';
        case 'cancelled':
            return 'İptal Edildi';
        default:
            return status;
    }
}

/**
 * Show notification message
 * @param {string} message - The message to display
 * @param {string} type - The type of notification (success, error, warning, info)
 * @param {number} duration - Duration in milliseconds (default: 5000)
 */
function showNotification(message, type = 'info', duration = 5000) {
    const container = document.querySelector('.notification-container');
    
    // Create container if it doesn't exist
    if (!container) {
        const newContainer = document.createElement('div');
        newContainer.className = 'notification-container';
        document.body.appendChild(newContainer);
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    // Select icon based on type
    let icon = 'info-circle';
    switch (type) {
        case 'success':
            icon = 'check-circle';
            break;
        case 'error':
            icon = 'times-circle';
            break;
        case 'warning':
            icon = 'exclamation-triangle';
            break;
    }
    
    notification.innerHTML = `
        <div class="notification-icon">
            <i class="fas fa-${icon}"></i>
        </div>
        <div class="notification-content">
            <div class="notification-message">${message}</div>
        </div>
        <button class="notification-close">&times;</button>
    `;
    
    // Get container again in case it was just created
    document.querySelector('.notification-container').appendChild(notification);
    
    // Set timeout to remove notification
    setTimeout(() => {
        closeNotification(notification);
    }, duration);
}

/**
 * Close a notification
 * @param {HTMLElement} notification - The notification element to close
 */
function closeNotification(notification) {
    notification.classList.add('notification-hide');
    setTimeout(() => {
        notification.remove();
    }, 300);
}

/**
 * Show loading indicator
 * @param {HTMLElement} container - The container to show loading in
 */
function showLoading(container) {
    // Check if container already has loading overlay
    if (container.querySelector('.loader-overlay')) return;
    
    // Set position relative if not already
    const position = window.getComputedStyle(container).position;
    if (position === 'static') {
        container.style.position = 'relative';
    }
    
    const overlay = document.createElement('div');
    overlay.className = 'loader-overlay';
    overlay.innerHTML = '<div class="loader"></div>';
    
    container.appendChild(overlay);
}

/**
 * Hide loading indicator
 * @param {HTMLElement} container - The container to hide loading from (optional)
 */
function hideLoading(container) {
    if (container) {
        const overlay = container.querySelector('.loader-overlay');
        if (overlay) {
            overlay.remove();
        }
    } else {
        document.querySelectorAll('.loader-overlay').forEach(overlay => {
            overlay.remove();
        });
    }
}

/**
 * Render pagination
 * @param {HTMLElement} container - The container to render pagination in
 * @param {number} currentPage - The current page number
 * @param {number} totalPages - The total number of pages
 * @param {function} callback - The function to call when a page is clicked
 */
function renderPagination(container, currentPage, totalPages, callback) {
    container.innerHTML = '';
    
    if (totalPages <= 1) return;
    
    // Previous button
    const prevItem = document.createElement('div');
    prevItem.className = 'pagination-item';
    const prevLink = document.createElement('a');
    prevLink.className = `pagination-link ${currentPage === 1 ? 'disabled' : ''}`;
    prevLink.innerHTML = '<i class="fas fa-chevron-left"></i>';
    if (currentPage > 1) {
        prevLink.addEventListener('click', () => callback(currentPage - 1));
    }
    prevItem.appendChild(prevLink);
    container.appendChild(prevItem);
    
    // Determine page range
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + 4);
    
    if (endPage - startPage < 4) {
        startPage = Math.max(1, endPage - 4);
    }
    
    // First page
    if (startPage > 1) {
        const firstItem = document.createElement('div');
        firstItem.className = 'pagination-item';
        const firstLink = document.createElement('a');
        firstLink.className = 'pagination-link';
        firstLink.textContent = '1';
        firstLink.addEventListener('click', () => callback(1));
        firstItem.appendChild(firstLink);
        container.appendChild(firstItem);
        
        // Ellipsis
        if (startPage > 2) {
            const ellipsisItem = document.createElement('div');
            ellipsisItem.className = 'pagination-item';
            const ellipsis = document.createElement('span');
            ellipsis.className = 'pagination-ellipsis';
            ellipsis.textContent = '...';
            ellipsisItem.appendChild(ellipsis);
            container.appendChild(ellipsisItem);
        }
    }
    
    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
        const pageItem = document.createElement('div');
        pageItem.className = 'pagination-item';
        const pageLink = document.createElement('a');
        pageLink.className = `pagination-link ${i === currentPage ? 'active' : ''}`;
        pageLink.textContent = i;
        if (i !== currentPage) {
            pageLink.addEventListener('click', () => callback(i));
        }
        pageItem.appendChild(pageLink);
        container.appendChild(pageItem);
    }
    
    // Last page
    if (endPage < totalPages) {
        // Ellipsis
        if (endPage < totalPages - 1) {
            const ellipsisItem = document.createElement('div');
            ellipsisItem.className = 'pagination-item';
            const ellipsis = document.createElement('span');
            ellipsis.className = 'pagination-ellipsis';
            ellipsis.textContent = '...';
            ellipsisItem.appendChild(ellipsis);
            container.appendChild(ellipsisItem);
        }
        
        const lastItem = document.createElement('div');
        lastItem.className = 'pagination-item';
        const lastLink = document.createElement('a');
        lastLink.className = 'pagination-link';
        lastLink.textContent = totalPages;
        lastLink.addEventListener('click', () => callback(totalPages));
        lastItem.appendChild(lastLink);
        container.appendChild(lastItem);
    }
    
    // Next button
    const nextItem = document.createElement('div');
    nextItem.className = 'pagination-item';
    const nextLink = document.createElement('a');
    nextLink.className = `pagination-link ${currentPage === totalPages ? 'disabled' : ''}`;
    nextLink.innerHTML = '<i class="fas fa-chevron-right"></i>';
    if (currentPage < totalPages) {
        nextLink.addEventListener('click', () => callback(currentPage + 1));
    }
    nextItem.appendChild(nextLink);
    container.appendChild(nextItem);
} 