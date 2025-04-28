/**
 * Admin Customers JavaScript
 * Customers page functionality for the admin panel
 */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize the customers page
    initCustomersPage();
});

// Customers filters
const customerFilters = {
    dateFrom: '',
    dateTo: '',
    ordersMin: '',
    ordersMax: '',
    search: ''
};

/**
 * Initialize the customers page
 */
function initCustomersPage() {
    // Set page variables
    currentPage = 1;
    pageSize = 10;
    
    // Initialize customer filters
    initCustomerFilters();
    
    // Load customers on page load
    loadCustomers(currentPage);
    
    // Set up event listeners
    document.getElementById('exportCustomers').addEventListener('click', exportCustomers);
    
    // Initialize tabs in customer detail modal
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.dataset.tab;
            
            // Remove active class from all tabs and content
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            
            // Add active class to selected tab and content
            btn.classList.add('active');
            document.getElementById(tabId).classList.add('active');
        });
    });
    
    // Allow clicking anywhere in the modal to close it
    document.querySelectorAll('.modal-close, [data-dismiss="modal"]').forEach(element => {
        element.addEventListener('click', event => {
            event.preventDefault();
            const modal = element.closest('.modal');
            if (modal) {
                modal.classList.remove('show');
            }
        });
    });
}

/**
 * Initialize customer filters
 */
function initCustomerFilters() {
    // Get filter elements
    const filterDateFrom = document.getElementById('filterDateFrom');
    const filterDateTo = document.getElementById('filterDateTo');
    const filterOrdersMin = document.getElementById('filterOrdersMin');
    const filterOrdersMax = document.getElementById('filterOrdersMax');
    const filterSearch = document.getElementById('filterSearch');
    const resetFilters = document.getElementById('resetFilters');
    
    // Add event listeners to filters
    filterDateFrom.addEventListener('change', updateFilters);
    filterDateTo.addEventListener('change', updateFilters);
    filterOrdersMin.addEventListener('input', updateFilters);
    filterOrdersMax.addEventListener('input', updateFilters);
    
    // Add event listener for search input (with debounce)
    let searchTimeout;
    filterSearch.addEventListener('input', () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            updateFilters();
        }, 500);
    });
    
    // Add event listener for reset button
    resetFilters.addEventListener('click', resetCustomerFilters);
}

/**
 * Update filters and reload customers
 */
function updateFilters() {
    // Update filter values
    customerFilters.dateFrom = document.getElementById('filterDateFrom').value;
    customerFilters.dateTo = document.getElementById('filterDateTo').value;
    customerFilters.ordersMin = document.getElementById('filterOrdersMin').value;
    customerFilters.ordersMax = document.getElementById('filterOrdersMax').value;
    customerFilters.search = document.getElementById('filterSearch').value;
    
    // Reset to first page and reload customers
    currentPage = 1;
    loadCustomers(currentPage);
}

/**
 * Reset all customer filters
 */
function resetCustomerFilters() {
    // Reset filter values
    document.getElementById('filterDateFrom').value = '';
    document.getElementById('filterDateTo').value = '';
    document.getElementById('filterOrdersMin').value = '';
    document.getElementById('filterOrdersMax').value = '';
    document.getElementById('filterSearch').value = '';
    
    // Clear filter object
    Object.keys(customerFilters).forEach(key => {
        customerFilters[key] = '';
    });
    
    // Reset to first page and reload customers
    currentPage = 1;
    loadCustomers(currentPage);
}

/**
 * Load customers from the API
 * @param {number} page - The page number to load
 */
async function loadCustomers(page = 1) {
    try {
        showLoading(document.querySelector('#customersTable').closest('.card-body'));
        
        // Fetch customers from API with filters
        const params = {
            page: page,
            limit: pageSize,
            ...customerFilters
        };
        
        const response = await AdminAPI.getCustomers(params);
        
        // Update pagination
        totalPages = Math.ceil(response.total / pageSize);
        currentPage = page;
        
        // Render the customers table
        renderCustomersTable(response.data);
        
        // Render pagination
        renderPagination(
            document.getElementById('customersPagination'),
            currentPage,
            totalPages,
            loadCustomers
        );
    } catch (error) {
        showNotification('Müşteriler yüklenirken bir hata oluştu.', 'error');
        console.error('Error loading customers:', error);
    } finally {
        hideLoading();
    }
}

/**
 * Render the customers table
 * @param {Array} customers - Array of customer objects
 */
function renderCustomersTable(customers) {
    const tableBody = document.querySelector('#customersTable tbody');
    tableBody.innerHTML = '';
    
    if (customers.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `<td colspan="8" class="text-center">Müşteri bulunamadı.</td>`;
        tableBody.appendChild(row);
        return;
    }
    
    customers.forEach(customer => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${customer._id}</td>
            <td>${customer.name}</td>
            <td>${customer.email}</td>
            <td>${customer.phone || '-'}</td>
            <td>${formatDate(customer.createdAt)}</td>
            <td>${customer.orderCount || 0}</td>
            <td>${formatPrice(customer.totalSpent || 0)}</td>
            <td>
                <button class="btn btn-sm btn-light btn-icon view-customer" data-id="${customer._id}">
                    <i class="fas fa-eye"></i>
                </button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // Add event listeners to view buttons
    document.querySelectorAll('.view-customer').forEach(button => {
        button.addEventListener('click', () => openCustomerDetailModal(button.dataset.id));
    });
}

/**
 * Open the customer detail modal
 * @param {string} customerId - The ID of the customer to view
 */
async function openCustomerDetailModal(customerId) {
    try {
        showLoading(document.querySelector('.main-content'));
        
        // Fetch the customer details
        const customer = await AdminAPI.getCustomerById(customerId);
        
        // Populate the customer info tab
        document.getElementById('customerName').textContent = customer.name;
        document.getElementById('customerEmail').textContent = customer.email;
        document.getElementById('customerPhone').textContent = customer.phone || '-';
        document.getElementById('customerRegistered').textContent = formatDate(customer.createdAt);
        document.getElementById('customerLastLogin').textContent = customer.lastLogin ? formatDate(customer.lastLogin) : '-';
        document.getElementById('customerTotalOrders').textContent = customer.orderCount || 0;
        document.getElementById('customerTotalSpent').textContent = formatPrice(customer.totalSpent || 0);
        
        // Calculate average order amount
        let averageOrder = 0;
        if (customer.orderCount && customer.orderCount > 0 && customer.totalSpent) {
            averageOrder = customer.totalSpent / customer.orderCount;
        }
        document.getElementById('customerAverageOrder').textContent = formatPrice(averageOrder);
        
        // Set last order date
        document.getElementById('customerLastOrder').textContent = customer.lastOrderDate ? formatDate(customer.lastOrderDate) : '-';
        
        // Set billing and shipping addresses
        if (customer.billingAddress) {
            document.getElementById('billingAddress').innerHTML = formatAddress(customer.billingAddress);
        } else {
            document.getElementById('billingAddress').innerHTML = 'Adres bilgisi bulunamadı.';
        }
        
        if (customer.shippingAddress) {
            document.getElementById('shippingAddress').innerHTML = formatAddress(customer.shippingAddress);
        } else {
            document.getElementById('shippingAddress').innerHTML = 'Adres bilgisi bulunamadı.';
        }
        
        // Fetch customer orders
        loadCustomerOrders(customerId);
        
        // Show the modal
        document.getElementById('customerDetailModal').classList.add('show');
    } catch (error) {
        showNotification('Müşteri detayları yüklenirken bir hata oluştu.', 'error');
        console.error('Error loading customer details:', error);
    } finally {
        hideLoading();
    }
}

/**
 * Load customer orders
 * @param {string} customerId - The ID of the customer
 */
async function loadCustomerOrders(customerId) {
    try {
        const orders = await AdminAPI.getCustomerOrders(customerId);
        const ordersList = document.getElementById('customerOrdersList');
        ordersList.innerHTML = '';
        
        if (orders.length === 0) {
            ordersList.innerHTML = `<tr><td colspan="5" class="text-center">Sipariş bulunamadı.</td></tr>`;
            return;
        }
        
        orders.forEach(order => {
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
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>#${order.orderNumber || order._id}</td>
                <td>${formatDate(order.createdAt)}</td>
                <td>${formatPrice(order.total)}</td>
                <td><span class="status-badge status-${statusClass}">${getOrderStatusText(order.status)}</span></td>
                <td>
                    <a href="orders.html?id=${order._id}" class="btn btn-sm btn-light btn-icon">
                        <i class="fas fa-eye"></i>
                    </a>
                </td>
            `;
            
            ordersList.appendChild(row);
        });
    } catch (error) {
        showNotification('Müşteri siparişleri yüklenirken bir hata oluştu.', 'error');
        console.error('Error loading customer orders:', error);
    }
}

/**
 * Format an address object to HTML
 * @param {Object} address - The address object
 * @returns {string} Formatted address HTML
 */
function formatAddress(address) {
    if (!address) return 'Adres bilgisi bulunamadı.';
    
    return `
        <p><strong>${address.firstName} ${address.lastName}</strong></p>
        <p>${address.address}</p>
        <p>${address.city}, ${address.state} ${address.postalCode}</p>
        <p>${address.country}</p>
        <p>Tel: ${address.phone || '-'}</p>
    `;
}

/**
 * Export customers to CSV
 */
function exportCustomers() {
    try {
        // Get table headers
        const headers = [];
        document.querySelectorAll('#customersTable thead th').forEach((th, index) => {
            // Skip actions column
            if (index !== 7) {
                headers.push(th.textContent.trim());
            }
        });
        
        // Get table rows
        const rows = [];
        document.querySelectorAll('#customersTable tbody tr').forEach(tr => {
            const row = [];
            tr.querySelectorAll('td').forEach((td, index) => {
                // Skip actions column
                if (index !== 7) {
                    // Get text content, removing HTML tags
                    const text = td.textContent.trim().replace(/\s+/g, ' ');
                    row.push(text);
                }
            });
            if (row.length > 0) {
                rows.push(row);
            }
        });
        
        // Create CSV content
        let csvContent = headers.join(',') + '\n';
        rows.forEach(row => {
            csvContent += row.map(cell => `"${cell}"`).join(',') + '\n';
        });
        
        // Create download link
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `customers_export_${new Date().toISOString().slice(0, 10)}.csv`);
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showNotification('Müşteriler başarıyla dışa aktarıldı.', 'success');
    } catch (error) {
        showNotification('Müşteriler dışa aktarılırken bir hata oluştu.', 'error');
        console.error('Error exporting customers:', error);
    }
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
        case 'canceled':
            return 'İptal Edildi';
        default:
            return status;
    }
} 