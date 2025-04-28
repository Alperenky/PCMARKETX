(function() {
// Products page variables
let productsTable;
let productFilters = {
    category: '',
    status: '',
    search: '',
    sortBy: 'name',
    sortOrder: 'asc'
};
// Globals are already defined in admin.js:
// currentPage, totalPages, PAGE_SIZE
let pageSize = 10;
let selectedProducts = [];

// Global function for toggling product selection (accessible from HTML)
window.toggleProductSelection = function(productId, isChecked) {
    console.log('Toggle product selection:', productId, isChecked);
    
    if (isChecked) {
        if (!selectedProducts.includes(productId)) {
            selectedProducts.push(productId);
        }
    } else {
        selectedProducts = selectedProducts.filter(id => id !== productId);
        
        // Uncheck "select all" if any product is unchecked
        const selectAllCheckbox = document.querySelector('#checkAllProducts');
        if (selectAllCheckbox) {
            selectAllCheckbox.checked = false;
        }
    }
    
    updateSelectedCount();
};

// Global function for editing a product (accessible from HTML)
window.editProduct = function(productId) {
    console.log('Edit product:', productId);
    editProductInternal(productId);
};

// Global function for deleting a product (accessible from HTML)
window.deleteProduct = function(productId) {
    console.log('Delete product:', productId);
    deleteProductInternal(productId);
};

// Initialize products page
function initProductsPage() {
    console.log('Products page initializing...');
    
    // Initialize datatable if jQuery and DataTables available
    if (typeof $ !== 'undefined' && $.fn.DataTable) {
        try {
            productsTable = $('#productsTable').DataTable({
                paging: false,
                searching: false,
                ordering: false,
                info: false,
                responsive: true,
                language: {
                    emptyTable: "Ürün bulunamadı"
                },
                columns: [
                    { data: 'checkbox' },
                    { data: 'id' },
                    { data: 'image' },
                    { data: 'name' },
                    { data: 'category' },
                    { data: 'price' },
                    { data: 'stock' },
                    { data: 'featured' },
                    { data: 'actions' }
                ]
            });
            console.log('DataTable initialized successfully');
        } catch (error) {
            console.error('Error initializing DataTable:', error);
            showNotification('DataTables yüklenirken bir hata oluştu. Sayfayı yenileyin.', 'error');
        }
    } else {
        console.warn('jQuery or DataTables not available');
    }
    
    // Initialize filter events
    initProductFilters();
    
    // Load products
    loadProducts(currentPage);
    
    // Add event listeners for bulk actions
    const bulkActionApply = document.querySelector('#bulkActionApply');
    if (bulkActionApply) {
        bulkActionApply.addEventListener('click', applyBulkAction);
    }
    
    // Add event listener for product form submission
    const productForm = document.querySelector('#productForm');
    if (productForm) {
        productForm.addEventListener('submit', handleProductFormSubmit);
    }
    
    // Add event listener for check all checkbox
    const checkAllProducts = document.querySelector('#checkAllProducts');
    if (checkAllProducts) {
        checkAllProducts.addEventListener('change', function() {
            const isChecked = this.checked;
            document.querySelectorAll('.product-checkbox').forEach(checkbox => {
                checkbox.checked = isChecked;
                const productId = checkbox.value;
                if (isChecked) {
                    if (!selectedProducts.includes(productId)) {
                        selectedProducts.push(productId);
                    }
                } else {
                    selectedProducts = selectedProducts.filter(id => id !== productId);
                }
            });
            updateSelectedCount();
        });
    }
}

// Initialize product filters
function initProductFilters() {
    // Category filter
    const categoryFilter = document.querySelector('#categoryFilter');
    if (categoryFilter) {
        categoryFilter.addEventListener('change', function() {
            productFilters.category = this.value;
            currentPage = 1;
            loadProducts(currentPage);
        });
    }
    
    // Status filter
    const statusFilter = document.querySelector('#statusFilter');
    if (statusFilter) {
        statusFilter.addEventListener('change', function() {
            productFilters.status = this.value;
            currentPage = 1;
            loadProducts(currentPage);
        });
    }
    
    // Search filter
    const searchFilter = document.querySelector('#searchFilter');
    if (searchFilter) {
        searchFilter.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                productFilters.search = this.value;
                currentPage = 1;
                loadProducts(currentPage);
            }
        });
    }
    
    // Search button
    const searchBtn = document.querySelector('#searchBtn');
    if (searchBtn) {
        searchBtn.addEventListener('click', function() {
            productFilters.search = document.querySelector('#searchFilter').value;
            currentPage = 1;
            loadProducts(currentPage);
        });
    }
    
    // Reset filters
    const resetFiltersBtn = document.querySelector('#resetFilters');
    if (resetFiltersBtn) {
        resetFiltersBtn.addEventListener('click', function() {
            document.querySelector('#categoryFilter').value = '';
            document.querySelector('#statusFilter').value = '';
            document.querySelector('#searchFilter').value = '';
            
            productFilters = {
                category: '',
                status: '',
                search: '',
                sortBy: 'name',
                sortOrder: 'asc'
            };
            
            currentPage = 1;
            loadProducts(currentPage);
        });
    }
    
    // Sort options
    document.querySelectorAll('.sort-column').forEach(column => {
        column.addEventListener('click', function() {
            const sortBy = this.dataset.sort;
            
            // Toggle sort order if clicking the same column
            if (productFilters.sortBy === sortBy) {
                productFilters.sortOrder = productFilters.sortOrder === 'asc' ? 'desc' : 'asc';
            } else {
                productFilters.sortBy = sortBy;
                productFilters.sortOrder = 'asc';
            }
            
            // Update sort indicators
            document.querySelectorAll('.sort-column').forEach(col => {
                col.classList.remove('sort-asc', 'sort-desc');
            });
            
            this.classList.add(productFilters.sortOrder === 'asc' ? 'sort-asc' : 'sort-desc');
            
            loadProducts(currentPage);
        });
    });
}

// Load products from API
async function loadProducts(page) {
    try {
        showLoading('#productsTable');
        
        // Prepare parameters
        const params = {
            page: page,
            limit: pageSize,
            sort: productFilters.sortBy,
            order: productFilters.sortOrder,
            search: productFilters.search || undefined,
            category: productFilters.category || undefined,
            inStock: productFilters.status === 'inStock' ? true : undefined,
            outOfStock: productFilters.status === 'outOfStock' ? true : undefined
        };
        
        // Get products from API
        const data = await adminAPI.getProducts(params);
        console.log('API yanıtı:', data);
        
        // Veri yoksa veya null/undefined ise
        if (!data) {
            console.error('API yanıtı boş veya null/undefined.');
            showNotification('Ürünler yüklenirken bir hata oluştu. API yanıtı alınamadı.', 'error');
            renderProductsTable([]);
            return;
        }
        
        // Pagination bilgilerini güncelle (varsayılan değerler kullan)
        currentPage = data.page || 1;
        totalPages = data.totalPages || 1;
        
        // Yanıt tipini kontrol et
        let productsArray = [];
        
        // Eğer data bir dizi ise, doğrudan kullan
        if (Array.isArray(data)) {
            console.log('API yanıtı bir dizi:', data.length);
            productsArray = data;
        }
        // Eğer data.products bir dizi ise, onu kullan
        else if (data.products && Array.isArray(data.products)) {
            console.log('API yanıtında products dizisi bulundu:', data.products.length);
            productsArray = data.products;
        }
        // Eğer data bir obje ise ve id'si varsa, tek bir ürün olarak treat et
        else if (typeof data === 'object' && data.id) {
            console.log('API yanıtı tek bir ürün nesnesi:', data.id);
            productsArray = [data]; // Tek ürünü bir diziye çevir
        }
        // Hiçbiri değilse, boş dizi kullan
        else {
            console.warn('API yanıtında geçerli ürün verisi bulunamadı:', data);
            productsArray = [];
        }
        
        // Tabloyu render et
        renderProductsTable(productsArray);
        
        // Pagination oluştur
        renderPagination(currentPage, totalPages, loadProducts);
        
        // Toplam sayıyı güncelle
        const totalElement = document.querySelector('#totalProductsCount');
        if (totalElement) {
            totalElement.textContent = data.total || productsArray.length || '0';
        }
    } catch (error) {
        console.error('Ürünler yüklenirken hata oluştu:', error);
        showNotification('Ürünler yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.', 'error');
        // Hata durumunda boş dizi ile render et
        renderProductsTable([]);
    } finally {
        hideLoading('#productsTable');
    }
}

// Render products table
function renderProductsTable(products) {
    console.log('Rendering products table with:', products);
    
    // Ürünlerin dizi olduğundan emin ol
    if (!products || !Array.isArray(products)) {
        console.warn('Ürünler dizisi geçersiz, boş dizi kullanılıyor:', products);
        products = [];
    }
    
    // Check if DataTable is initialized
    if (typeof productsTable !== 'undefined' && productsTable) {
        try {
            // Clear table
            productsTable.clear();
            
            // Add products to table
            products.forEach(product => {
                productsTable.row.add({
                    checkbox: `<div class="form-check">
                                <input type="checkbox" class="form-check-input product-checkbox" value="${product.id}" 
                                ${selectedProducts.includes(product.id) ? 'checked' : ''}
                                onchange="toggleProductSelection('${product.id}', this.checked)">
                               </div>`,
                    id: product.id,
                    image: `<img src="${product.image || '/admin/img/no-image.png'}" alt="${product.name}" class="product-thumbnail">`,
                    name: `<div class="product-name">${product.name}</div>`,
                    category: `<span class="badge bg-info">${product.category}</span>`,
                    price: formatPrice(product.price),
                    stock: `<span class="badge ${product.stock > 0 ? 'bg-success' : 'bg-danger'}">${product.stock}</span>`,
                    featured: `<span class="badge ${product.featured ? 'bg-primary' : 'bg-secondary'}">${product.featured ? 'Öne Çıkan' : 'Normal'}</span>`,
                    actions: `<div class="action-buttons">
                                <button type="button" class="btn btn-sm btn-outline-primary" onclick="editProduct('${product.id}')">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button type="button" class="btn btn-sm btn-outline-danger" onclick="deleteProduct('${product.id}')">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>`
                });
            });
            
            // Draw table
            productsTable.draw();
        } catch (error) {
            console.error('Error rendering DataTable:', error);
            
            // Fallback to manual table rendering
            renderProductsTableManually(products);
        }
    } else {
        // Fallback to manual table rendering
        console.log('DataTable not initialized, using manual rendering');
        renderProductsTableManually(products);
    }
    
    // Update selection after redraw
    updateSelectedCount();
}

// Manual table rendering for when DataTables isn't available
function renderProductsTableManually(products) {
    const tableBody = document.querySelector('#productsTable tbody');
    if (!tableBody) return;
    
    // Ürünlerin dizi olduğundan emin ol
    if (!products || !Array.isArray(products)) {
        console.warn('Manual rendering: Ürünler dizisi geçersiz, boş dizi kullanılıyor:', products);
        products = [];
    }
    
    // Clear table
    tableBody.innerHTML = '';
    
    // Eğer ürün yoksa boş mesajı göster
    if (products.length === 0) {
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = `<td colspan="9" class="text-center">Ürün bulunamadı</td>`;
        tableBody.appendChild(emptyRow);
        return;
    }
    
    // Add products to table
    products.forEach(product => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>
                <div class="form-check">
                    <input type="checkbox" class="form-check-input product-checkbox" value="${product.id}" 
                    ${selectedProducts.includes(product.id) ? 'checked' : ''}
                    onchange="toggleProductSelection('${product.id}', this.checked)">
                </div>
            </td>
            <td>${product.id}</td>
            <td><img src="${product.image || '/admin/img/no-image.png'}" alt="${product.name}" class="product-thumbnail"></td>
            <td><div class="product-name">${product.name}</div></td>
            <td><span class="badge bg-info">${product.category}</span></td>
            <td>${formatPrice(product.price)}</td>
            <td><span class="badge ${product.stock > 0 ? 'bg-success' : 'bg-danger'}">${product.stock}</span></td>
            <td><span class="badge ${product.featured ? 'bg-primary' : 'bg-secondary'}">${product.featured ? 'Öne Çıkan' : 'Normal'}</span></td>
            <td>
                <div class="action-buttons">
                    <button type="button" class="btn btn-sm btn-outline-primary" onclick="editProduct('${product.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button type="button" class="btn btn-sm btn-outline-danger" onclick="deleteProduct('${product.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
}

// Toggle product selection - internal function
function toggleProductSelectionInternal(productId, isChecked) {
    // Call the global function
    window.toggleProductSelection(productId, isChecked);
}

// Update selected count
function updateSelectedCount() {
    const count = selectedProducts.length;
    const countElement = document.querySelector('#selectedCount');
    if (countElement) {
        countElement.textContent = count;
    }
    
    // Show/hide bulk actions
    const bulkActionsMenu = document.querySelector('#bulkActionsMenu');
    if (bulkActionsMenu) {
        if (count > 0) {
            bulkActionsMenu.classList.remove('d-none');
        } else {
            bulkActionsMenu.classList.add('d-none');
        }
    }
}

// Apply bulk action
async function applyBulkAction() {
    if (selectedProducts.length === 0) {
        showNotification('Lütfen işlem yapmak için ürün seçin.', 'warning');
        return;
    }
    
    const action = document.querySelector('#bulkAction').value;
    
    if (!action) {
        showNotification('Lütfen bir toplu işlem seçin.', 'warning');
        return;
    }
    
    try {
        showLoading('#productsTable');
        
        switch (action) {
            case 'delete':
                if (confirm(`${selectedProducts.length} ürünü silmek istediğinize emin misiniz?`)) {
                    await adminAPI.bulkDeleteProducts(selectedProducts);
                    showNotification(`${selectedProducts.length} ürün başarıyla silindi.`, 'success');
                    selectedProducts = [];
                    updateSelectedCount();
                    loadProducts(currentPage);
                }
                break;
                
            case 'feature':
                await adminAPI.bulkUpdateProducts(selectedProducts, { featured: true });
                showNotification(`${selectedProducts.length} ürün başarıyla öne çıkarıldı.`, 'success');
                loadProducts(currentPage);
                break;
                
            case 'unfeature':
                await adminAPI.bulkUpdateProducts(selectedProducts, { featured: false });
                showNotification(`${selectedProducts.length} ürün öne çıkarmadan kaldırıldı.`, 'success');
                loadProducts(currentPage);
                break;
                
            default:
                showNotification('Geçersiz işlem.', 'error');
                break;
        }
    } catch (error) {
        console.error('Toplu işlem uygulanırken hata oluştu:', error);
        showNotification('Toplu işlem uygulanırken bir hata oluştu.', 'error');
        
        // In demo mode, simulate success
        selectedProducts = [];
        updateSelectedCount();
        loadProducts(currentPage);
        showNotification('Demo modunda işlem başarıyla simüle edildi.', 'success');
    } finally {
        hideLoading('#productsTable');
    }
}

// Edit product - internal implementation
async function editProductInternal(productId) {
    try {
        showLoading('#content');
        
        // Get product details
        const productData = await adminAPI.getProductById(productId);
        
        console.log('Ürün detayları alındı:', productData);
        
        // API'den gelen veri yapısını kontrol et
        const product = productData.product || productData; // Eğer bir 'product' özelliği varsa onu kullan, yoksa direkt data'yı kullan
        
        if (!product || !product.id) {
            throw new Error('Ürün verileri geçersiz format');
        }
        
        // Populate form
        document.querySelector('#productId').value = product.id;
        document.querySelector('#productName').value = product.name || '';
        document.querySelector('#productCategory').value = product.category || '';
        document.querySelector('#productPrice').value = product.price || 0;
        document.querySelector('#productStock').value = product.stock || 0;
        document.querySelector('#productFeatured').checked = product.featured || false;
        document.querySelector('#productDescription').value = product.description || '';
        
        // Show image preview if exists
        if (product.image) {
            document.querySelector('#currentProductImage').src = product.image;
            document.querySelector('#currentProductImage').classList.remove('d-none');
        } else {
            document.querySelector('#currentProductImage').classList.add('d-none');
        }
        
        // Open modal
        const modal = new bootstrap.Modal(document.querySelector('#productModal'));
        modal.show();
    } catch (error) {
        console.error('Ürün detayları yüklenirken hata oluştu:', error);
        showNotification('Ürün detayları yüklenirken bir hata oluştu.', 'error');
    } finally {
        hideLoading('#content');
    }
}

// Delete product - internal implementation
async function deleteProductInternal(productId) {
    if (!confirm('Bu ürünü silmek istediğinize emin misiniz?')) {
        return;
    }
    
    try {
        showLoading('#productsTable');
        
        await adminAPI.deleteProduct(productId);
        showNotification('Ürün başarıyla silindi.', 'success');
        loadProducts(currentPage);
    } catch (error) {
        console.error('Ürün silinirken hata oluştu:', error);
        showNotification('Ürün silinirken bir hata oluştu.', 'error');
    } finally {
        hideLoading('#productsTable');
    }
}

// Handle product form submit
async function handleProductFormSubmit(e) {
    e.preventDefault();
    
    try {
        // Disable form
        const form = e.target;
        Array.from(form.elements).forEach(el => el.disabled = true);
        
        // Get form data
        const formData = new FormData(form);
        const productId = formData.get('id');
        
        if (productId) {
            // Update product
            await adminAPI.updateProduct(productId, formData);
            showNotification('Ürün başarıyla güncellendi.', 'success');
        } else {
            // Create product
            await adminAPI.createProduct(formData);
            showNotification('Ürün başarıyla oluşturuldu.', 'success');
        }
        
        // Close modal and reload products
        bootstrap.Modal.getInstance(document.querySelector('#productModal')).hide();
        loadProducts(currentPage);
    } catch (error) {
        console.error('Ürün kaydedilirken hata oluştu:', error);
        showNotification('Ürün kaydedilirken bir hata oluştu.', 'error');
    } finally {
        // Enable form
        Array.from(e.target.elements).forEach(el => el.disabled = false);
    }
}

// Make initProductsPage available globally
window.initProductsPage = initProductsPage;
})(); 