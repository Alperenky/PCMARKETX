/**
 * Admin Products JavaScript
 * Products page functionality for the admin panel
 */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize the products page
    initProductsPage();
});

// Product filters object
const productFilters = {
    category: '',
    status: '',
    priceMin: '',
    priceMax: '',
    search: ''
};

// Selected products for bulk actions
let selectedProducts = [];

/**
 * Initialize the products page
 */
function initProductsPage() {
    // Set page variables
    currentPage = 1;
    pageSize = 10;
    
    // Initialize product filters
    initProductFilters();
    
    // Load categories for filters
    loadCategoriesForFilters();
    
    // Load products on page load
    loadProducts(currentPage);
    
    // Set up event listeners
    document.getElementById('openAddProductModal').addEventListener('click', () => openProductModal());
    document.getElementById('saveProduct').addEventListener('click', saveProduct);
    document.getElementById('confirmDelete').addEventListener('click', deleteProduct);
    document.getElementById('productImage').addEventListener('change', handleProductImageUpload);
    document.getElementById('addSpec').addEventListener('click', addSpecificationField);
    document.getElementById('selectAllProducts').addEventListener('change', toggleSelectAllProducts);
    document.getElementById('bulkActions').addEventListener('click', openBulkActionsModal);
    document.getElementById('applyBulkAction').addEventListener('click', applyBulkAction);
    document.getElementById('exportProducts').addEventListener('click', exportProducts);
    
    // Bulk action type change event
    document.getElementById('bulkActionType').addEventListener('change', function() {
        // Hide all option divs
        document.querySelectorAll('[id^="bulk"][id$="Options"]').forEach(div => {
            div.style.display = 'none';
        });
        
        // Show the selected option div
        const selectedAction = this.value;
        if (selectedAction) {
            const optionsDiv = document.getElementById(`bulk${selectedAction.charAt(0).toUpperCase() + selectedAction.slice(1)}Options`);
            if (optionsDiv) {
                optionsDiv.style.display = 'block';
            }
        }
    });
    
    // Load categories for product form
    loadCategoriesForProduct();
    
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
 * Initialize product filters
 */
function initProductFilters() {
    // Get filter elements
    const filterCategory = document.getElementById('categoryFilter');
    const filterStatus = document.getElementById('statusFilter');
    const filterPriceMin = document.getElementById('filterPriceMin');
    const filterPriceMax = document.getElementById('filterPriceMax');
    const filterSearch = document.getElementById('searchFilter');
    const resetFilters = document.getElementById('resetFilters');
    
    // Add event listeners to filters
    filterCategory.addEventListener('change', updateFilters);
    filterStatus.addEventListener('change', updateFilters);
    filterPriceMin.addEventListener('input', updateFilters);
    filterPriceMax.addEventListener('input', updateFilters);
    
    // Add event listener for search input (with debounce)
    let searchTimeout;
    filterSearch.addEventListener('input', () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            updateFilters();
        }, 500);
    });
    
    // Add event listener for reset button
    resetFilters.addEventListener('click', resetProductFilters);
}

/**
 * Update filters and reload products
 */
function updateFilters() {
    // Update filter values
    productFilters.category = document.getElementById('categoryFilter').value;
    productFilters.status = document.getElementById('statusFilter').value;
    productFilters.priceMin = document.getElementById('filterPriceMin').value;
    productFilters.priceMax = document.getElementById('filterPriceMax').value;
    productFilters.search = document.getElementById('searchFilter').value;
    
    // Reset to first page and reload products
    currentPage = 1;
    loadProducts(currentPage);
}

/**
 * Reset all product filters
 */
function resetProductFilters() {
    // Reset filter values
    document.getElementById('categoryFilter').value = '';
    document.getElementById('statusFilter').value = '';
    document.getElementById('filterPriceMin').value = '';
    document.getElementById('filterPriceMax').value = '';
    document.getElementById('searchFilter').value = '';
    
    // Clear filter object
    Object.keys(productFilters).forEach(key => {
        productFilters[key] = '';
    });
    
    // Reset to first page and reload products
    currentPage = 1;
    loadProducts(currentPage);
}

/**
 * Load categories for filters dropdown
 */
async function loadCategoriesForFilters() {
    try {
        // Fetch all categories
        const response = await AdminAPI.getCategories({ limit: 100 });
        const filterCategory = document.getElementById('categoryFilter');
        
        // Clear existing options except the first one
        while (filterCategory.options.length > 1) {
            filterCategory.remove(1);
        }
        
        // API'den dönen veri yapısını kontrol et
        let categories = [];
        if (Array.isArray(response)) {
            // Doğrudan dizi olarak döndüyse
            categories = response;
        } else if (response && response.data && Array.isArray(response.data)) {
            // data özelliği içinde dizi olarak döndüyse
            categories = response.data;
        } else if (response && typeof response === 'object') {
            // response bir nesne ise ve categories içindeyse
            categories = Object.values(response);
        }
        
        console.log('Filtreler için yüklenen kategoriler:', categories);
        
        // Ana kategorileri bul
        const mainCategories = categories.filter(cat => !cat.parent);
        
        // Ana kategorileri optgroup olarak ekle
        mainCategories.forEach(mainCat => {
            const optgroup = document.createElement('optgroup');
            optgroup.label = mainCat.name;
            
            // Ana kategorinin kendisini ekle
            const mainOption = document.createElement('option');
            mainOption.value = mainCat._id;
            mainOption.textContent = `Tüm ${mainCat.name}`;
            optgroup.appendChild(mainOption);
            
            // Alt kategorileri bul ve ekle
            const subCategories = categories.filter(cat => 
                cat.parent && (cat.parent._id === mainCat._id || cat.parent.id === mainCat._id)
            );
            
            subCategories.forEach(subCat => {
                const option = document.createElement('option');
                option.value = subCat._id;
                option.textContent = subCat.name;
                optgroup.appendChild(option);
            });
            
            filterCategory.appendChild(optgroup);
        });
    } catch (error) {
        showNotification('Kategoriler yüklenirken bir hata oluştu.', 'error');
        console.error('Error loading categories for filters:', error);
    }
}

/**
 * Load categories for product form
 */
async function loadCategoriesForProduct() {
    try {
        // Fetch all categories
        const response = await AdminAPI.getCategories({ limit: 100 });
        const productCategory = document.getElementById('productCategory');
        const bulkCategory = document.getElementById('bulkCategory');
        
        // Clear existing options except the first one
        const defaultOption = productCategory.options[0];
        productCategory.innerHTML = '';
        productCategory.appendChild(defaultOption);
        
        bulkCategory.innerHTML = '';
        const defaultBulkOption = document.createElement('option');
        defaultBulkOption.value = '';
        defaultBulkOption.textContent = 'Kategori Seçin';
        bulkCategory.appendChild(defaultBulkOption);
        
        // API'den dönen veri yapısını kontrol et
        let categories = [];
        if (Array.isArray(response)) {
            // Doğrudan dizi olarak döndüyse
            categories = response;
        } else if (response && response.data && Array.isArray(response.data)) {
            // data özelliği içinde dizi olarak döndüyse
            categories = response.data;
        } else if (response && typeof response === 'object') {
            // response bir nesne ise ve categories içindeyse
            categories = Object.values(response);
        }
        
        console.log('Yüklenen kategoriler:', categories);
        
        // Ana kategorileri bul
        const mainCategories = categories.filter(cat => !cat.parent);
        
        // Ana kategorileri optgroup olarak ekle (sadece ürün formu için)
        mainCategories.forEach(mainCat => {
            const optgroup = document.createElement('optgroup');
            optgroup.label = mainCat.name;
            
            // Alt kategorileri bul ve ekle
            const subCategories = categories.filter(cat => 
                cat.parent && (cat.parent._id === mainCat._id || cat.parent.id === mainCat._id)
            );
            
            subCategories.forEach(subCat => {
                // Ürün formu için
                const option1 = document.createElement('option');
                option1.value = subCat._id;
                option1.textContent = subCat.name;
                optgroup.appendChild(option1);
                
                // Toplu işlemler için düz liste olarak ekle
                const option2 = document.createElement('option');
                option2.value = subCat._id;
                option2.textContent = `${mainCat.name} > ${subCat.name}`;
                bulkCategory.appendChild(option2);
            });
            
            productCategory.appendChild(optgroup);
        });
    } catch (error) {
        showNotification('Kategoriler yüklenirken bir hata oluştu.', 'error');
        console.error('Error loading categories for product form:', error);
    }
}

/**
 * Load products from the API
 * @param {number} page - The page number to load
 */
async function loadProducts(page = 1) {
    try {
        showLoading(document.querySelector('#productsTable').closest('.card-body'));
        
        // Veritabanı bağlantısını kontrol et
        const isConnected = true; // Veritabanından gelecek verileri zorla kullanmak için
        localStorage.setItem('mongodb_connected', 'true'); // MongoDB bağlantısının aktif olduğunu işaretle
        
        // Fetch products from API with filters
        const params = {
            page: page,
            limit: pageSize,
            ...productFilters
        };
        
        const response = await AdminAPI.getProducts(params);
        
        // Update pagination
        totalPages = Math.ceil(response.total / pageSize);
        currentPage = page;
        
        // Render the products table
        renderProductsTable(response.data);
        
        // Render pagination
        renderPagination(
            document.getElementById('productsPagination'),
            currentPage,
            totalPages,
            loadProducts
        );
        
        // Clear selected products
        selectedProducts = [];
        document.getElementById('selectAllProducts').checked = false;
        updateBulkActionsButton();
    } catch (error) {
        showNotification('Ürünler yüklenirken bir hata oluştu.', 'error');
        console.error('Error loading products:', error);
    } finally {
        hideLoading();
    }
}

/**
 * Render the products table
 * @param {Array} products - Array of product objects
 */
function renderProductsTable(products) {
    const tableBody = document.querySelector('#productsTable tbody');
    tableBody.innerHTML = '';
    
    if (products.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `<td colspan="9" class="text-center">Ürün bulunamadı.</td>`;
        tableBody.appendChild(row);
        return;
    }
    
    products.forEach(product => {
        const row = document.createElement('tr');
        
        // Format the status
        let statusClass = 'info';
        let statusText = 'Aktif';
        
        if (product.status === 'inactive') {
            statusClass = 'danger';
            statusText = 'Pasif';
        } else if (product.featured) {
            statusClass = 'success';
            statusText = 'Öne Çıkan';
        }
        
        // Format price with discount
        let priceDisplay = formatPrice(product.price);
        if (product.discount > 0) {
            const discountedPrice = product.price * (1 - product.discount / 100);
            priceDisplay = `<span style="text-decoration: line-through; color: #999;">${formatPrice(product.price)}</span> ${formatPrice(discountedPrice)}`;
        }
        
        row.innerHTML = `
            <td>
                <input type="checkbox" class="select-product" data-id="${product._id}">
            </td>
            <td>${product._id}</td>
            <td>
                <img src="${product.image || '../images/product-placeholder.jpg'}" alt="${product.name}" style="width: 50px; height: 50px; object-fit: contain;">
            </td>
            <td>${product.name}</td>
            <td>${product.category ? product.category.name : '-'}</td>
            <td>${product.stock}</td>
            <td>${priceDisplay}</td>
            <td><span class="status-badge status-${statusClass.toLowerCase()}">${statusText}</span></td>
            <td>
                <button class="btn btn-sm btn-light btn-icon edit-product" data-id="${product._id}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger btn-icon delete-product" data-id="${product._id}">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // Add event listeners to action buttons
    document.querySelectorAll('.edit-product').forEach(button => {
        button.addEventListener('click', () => openProductModal(button.dataset.id));
    });
    
    document.querySelectorAll('.delete-product').forEach(button => {
        button.addEventListener('click', () => openDeleteProductModal(button.dataset.id));
    });
    
    // Add event listeners to checkboxes
    document.querySelectorAll('.select-product').forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            const productId = checkbox.dataset.id;
            
            if (checkbox.checked) {
                // Add to selected products if not already there
                if (!selectedProducts.includes(productId)) {
                    selectedProducts.push(productId);
                }
            } else {
                // Remove from selected products
                selectedProducts = selectedProducts.filter(id => id !== productId);
                
                // Uncheck "select all" checkbox
                document.getElementById('selectAllProducts').checked = false;
            }
            
            updateBulkActionsButton();
        });
    });
}

/**
 * Toggle select all products
 */
function toggleSelectAllProducts() {
    const selectAllCheckbox = document.getElementById('selectAllProducts');
    const productCheckboxes = document.querySelectorAll('.select-product');
    
    productCheckboxes.forEach(checkbox => {
        checkbox.checked = selectAllCheckbox.checked;
        
        const productId = checkbox.dataset.id;
        
        if (checkbox.checked) {
            // Add to selected products if not already there
            if (!selectedProducts.includes(productId)) {
                selectedProducts.push(productId);
            }
        } else {
            // Remove from selected products
            selectedProducts = selectedProducts.filter(id => id !== productId);
        }
    });
    
    updateBulkActionsButton();
}

/**
 * Update bulk actions button state
 */
function updateBulkActionsButton() {
    const bulkActionsButton = document.getElementById('bulkActions');
    bulkActionsButton.disabled = selectedProducts.length === 0;
    
    if (selectedProducts.length > 0) {
        bulkActionsButton.textContent = `Toplu İşlemler (${selectedProducts.length})`;
    } else {
        bulkActionsButton.textContent = 'Toplu İşlemler';
    }
}

/**
 * Open the bulk actions modal
 */
function openBulkActionsModal() {
    if (selectedProducts.length === 0) return;
    
    const modal = document.getElementById('bulkActionsModal');
    
    // Reset the form
    document.getElementById('bulkActionType').value = '';
    document.querySelectorAll('[id^="bulk"][id$="Options"]').forEach(div => {
        div.style.display = 'none';
    });
    
    // Show the modal
    modal.classList.add('show');
}

/**
 * Apply the selected bulk action
 */
async function applyBulkAction() {
    if (selectedProducts.length === 0) return;
    
    const actionType = document.getElementById('bulkActionType').value;
    
    if (!actionType) {
        showNotification('Lütfen bir işlem seçin.', 'warning');
        return;
    }
    
    try {
        let data = {};
        let message = '';
        
        switch (actionType) {
            case 'status':
                data.status = document.getElementById('bulkStatus').value;
                message = 'Seçili ürünlerin durumu başarıyla güncellendi.';
                break;
                
            case 'category':
                data.category = document.getElementById('bulkCategory').value;
                message = 'Seçili ürünlerin kategorisi başarıyla güncellendi.';
                break;
                
            case 'discount':
                data.discount = document.getElementById('bulkDiscount').value;
                message = 'Seçili ürünlere indirim başarıyla uygulandı.';
                break;
                
            case 'featured':
                data.featured = document.getElementById('bulkFeatured').checked;
                message = `Seçili ürünler ${data.featured ? 'öne çıkan' : 'normal'} olarak işaretlendi.`;
                break;
                
            case 'popular':
                data.popular = document.getElementById('bulkPopular').checked;
                message = `Seçili ürünler ${data.popular ? 'popüler' : 'normal'} olarak işaretlendi.`;
                break;
                
            case 'delete':
                // Delete products
                await AdminAPI.bulkDeleteProducts(selectedProducts);
                message = 'Seçili ürünler başarıyla silindi.';
                break;
        }
        
        // Update products if not deleting
        if (actionType !== 'delete') {
            await AdminAPI.bulkUpdateProducts(selectedProducts, data);
        }
        
        // Close the modal
        document.getElementById('bulkActionsModal').classList.remove('show');
        
        // Show success notification
        showNotification(message, 'success');
        
        // Reload products
        loadProducts(currentPage);
    } catch (error) {
        showNotification('Toplu işlem uygulanırken bir hata oluştu.', 'error');
        console.error('Error applying bulk action:', error);
    }
}

/**
 * Export products to CSV
 */
function exportProducts() {
    try {
        // Get table headers
        const headers = [];
        document.querySelectorAll('#productsTable thead th').forEach((th, index) => {
            // Skip checkbox and actions columns
            if (index !== 0 && index !== 8) {
                headers.push(th.textContent.trim());
            }
        });
        
        // Get table rows
        const rows = [];
        document.querySelectorAll('#productsTable tbody tr').forEach(tr => {
            const row = [];
            tr.querySelectorAll('td').forEach((td, index) => {
                // Skip checkbox and actions columns
                if (index !== 0 && index !== 8) {
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
        link.setAttribute('download', `products_export_${new Date().toISOString().slice(0, 10)}.csv`);
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showNotification('Ürünler başarıyla dışa aktarıldı.', 'success');
    } catch (error) {
        showNotification('Ürünler dışa aktarılırken bir hata oluştu.', 'error');
        console.error('Error exporting products:', error);
    }
}

/**
 * Open the product modal for adding or editing
 * @param {string} productId - The ID of the product to edit (null for adding)
 */
async function openProductModal(productId = null) {
    const modal = document.getElementById('productModal');
    const title = document.getElementById('productModalTitle');
    const form = document.getElementById('productForm');
    
    // Reset the form
    form.reset();
    document.getElementById('productId').value = '';
    document.getElementById('productImagePreview').innerHTML = '<i class="fas fa-image"></i>';
    
    // Reset specifications
    document.getElementById('productSpecs').innerHTML = `
        <div class="spec-item" style="display: flex; gap: 10px; margin-bottom: 10px;">
            <input type="text" class="form-control spec-key" placeholder="Özellik (örn. İşlemci)">
            <input type="text" class="form-control spec-value" placeholder="Değer (örn. Intel Core i7)">
            <button type="button" class="btn btn-danger btn-icon remove-spec">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    // Add event listener to remove button
    document.querySelector('.remove-spec').addEventListener('click', function() {
        if (document.querySelectorAll('.spec-item').length > 1) {
            this.closest('.spec-item').remove();
        }
    });
    
    // Update title based on whether we're adding or editing
    if (productId) {
        title.textContent = 'Ürün Düzenle';
        
        try {
            showLoading(modal.querySelector('.modal-body'));
            
            // Fetch the product details
            const product = await AdminAPI.getProductById(productId);
            console.log("Düzenlenecek ürün bilgileri:", product);
            
            // Populate the form with product data
            document.getElementById('productId').value = product._id;
            document.getElementById('productName').value = product.name;
            document.getElementById('productModel').value = product.model || '';
            document.getElementById('productBrand').value = product.brand || '';
            document.getElementById('productPrice').value = product.price;
            document.getElementById('productStock').value = product.stock;
            document.getElementById('productDiscount').value = product.discount || 0;
            document.getElementById('productDescription').value = product.description || '';
            
            // Status alanını ayarla (enum: ['active', 'inactive', 'out_of_stock'])
            const productStatusSelect = document.getElementById('productStatus');
            if (product.status) {
                const normalizedStatus = product.status.toLowerCase();
                // Select listesindeki değeri ayarla
                for (let i = 0; i < productStatusSelect.options.length; i++) {
                    if (productStatusSelect.options[i].value === normalizedStatus) {
                        productStatusSelect.selectedIndex = i;
                        break;
                    }
                }
                console.log(`Ürün status değeri: ${product.status} -> Seçilen: ${productStatusSelect.value}`);
            } else {
                // Varsayılan olarak 'active' seç
                productStatusSelect.value = 'active';
            }
            
            document.getElementById('productFeatured').checked = product.featured || false;
            document.getElementById('productPopular').checked = product.popular || false;
            document.getElementById('productNewProduct').checked = product.isNewProduct || false;
            
            // Set category if exists
            if (product.category) {
                document.getElementById('productCategory').value = product.category._id || product.category;
            }
            
            // Set image if exists
            if (product.image || product.imageUrl) {
                const imageUrl = product.image || product.imageUrl;
                document.getElementById('productImagePreview').innerHTML = `
                    <img src="${imageUrl}" alt="${product.name}">
                `;
            }
            
            // Set specifications if exist
            if (product.specifications && typeof product.specifications === 'object') {
                document.getElementById('productSpecs').innerHTML = '';
                
                // Map veya obje olduğunu kontrol et
                if (product.specifications instanceof Map) {
                    // Map ise entries ile dön
                    for (const [key, value] of product.specifications.entries()) {
                        addSpecificationField(key, value);
                    }
                } else {
                    // Obje ise Object.entries ile dön
                    for (const [key, value] of Object.entries(product.specifications)) {
                        addSpecificationField(key, value);
                    }
                }
            }
        } catch (error) {
            showNotification('Ürün detayları yüklenirken bir hata oluştu.', 'error');
            console.error('Error loading product details:', error);
        } finally {
            hideLoading();
        }
    } else {
        title.textContent = 'Yeni Ürün Ekle';
        // Yeni ürün için varsayılan değerler
        document.getElementById('productStatus').value = 'active';
    }
    
    // Show the modal
    modal.classList.add('show');
}

/**
 * Handle product image upload
 */
function handleProductImageUpload() {
    const fileInput = document.getElementById('productImage');
    const preview = document.getElementById('productImagePreview');
    
    if (fileInput.files && fileInput.files[0]) {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            preview.innerHTML = `<img src="${e.target.result}" alt="Product Image">`;
        };
        
        reader.readAsDataURL(fileInput.files[0]);
    }
}

/**
 * Add a new specification field
 * @param {string} key - The specification key
 * @param {string} value - The specification value
 */
function addSpecificationField(key = '', value = '') {
    const specsContainer = document.getElementById('productSpecs');
    
    const specItem = document.createElement('div');
    specItem.className = 'spec-item';
    specItem.style = 'display: flex; gap: 10px; margin-bottom: 10px;';
    
    specItem.innerHTML = `
        <input type="text" class="form-control spec-key" placeholder="Özellik (örn. İşlemci)" value="${key}">
        <input type="text" class="form-control spec-value" placeholder="Değer (örn. Intel Core i7)" value="${value}">
        <button type="button" class="btn btn-danger btn-icon remove-spec">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    specsContainer.appendChild(specItem);
    
    // Add event listener to remove button
    specItem.querySelector('.remove-spec').addEventListener('click', function() {
        if (document.querySelectorAll('.spec-item').length > 1) {
            this.closest('.spec-item').remove();
        }
    });
}

/**
 * Save the product (create or update)
 */
async function saveProduct() {
    try {
        // Create FormData object for file upload
        const formData = new FormData();
        
        // Add basic product data
        formData.append('name', document.getElementById('productName').value);
        formData.append('category', document.getElementById('productCategory').value);
        formData.append('model', document.getElementById('productModel').value);
        formData.append('brand', document.getElementById('productBrand').value);
        formData.append('price', document.getElementById('productPrice').value);
        formData.append('stock', document.getElementById('productStock').value);
        formData.append('discount', document.getElementById('productDiscount').value);
        
        // Status değerini küçük harfle ekleyelim - enum değerleri 'active', 'inactive', 'out_of_stock'
        const statusElement = document.getElementById('productStatus');
        const statusValue = statusElement.value.toLowerCase();
        formData.append('status', statusValue);
        
        formData.append('description', document.getElementById('productDescription').value);
        formData.append('featured', document.getElementById('productFeatured').checked);
        formData.append('popular', document.getElementById('productPopular').checked);
        
        // Add image if uploaded
        const fileInput = document.getElementById('productImage');
        if (fileInput.files && fileInput.files[0]) {
            const imageFile = fileInput.files[0];
            console.log('Resim dosyası seçildi:', imageFile.name, 'Tip:', imageFile.type, 'Boyut:', imageFile.size);
            
            // formData nesnesine resmi ekle
            formData.append('image', imageFile);
        }
        
        // Add specifications
        const specifications = [];
        document.querySelectorAll('.spec-item').forEach(item => {
            const key = item.querySelector('.spec-key').value.trim();
            const value = item.querySelector('.spec-value').value.trim();
            
            if (key && value) {
                specifications.push({ key, value });
            }
        });
        
        formData.append('specifications', JSON.stringify(specifications));
        
        // FormData içeriğini konsola yazdır (hata ayıklama)
        console.log('FormData içeriği:');
        for (const pair of formData.entries()) {
            if (pair[0] === 'image') {
                console.log(`${pair[0]}: Dosya: ${pair[1].name}`);
            } else {
                console.log(`${pair[0]}: ${pair[1]}`);
            }
        }
        
        // Get product ID
        const productId = document.getElementById('productId').value;
        
        if (productId) {
            // Update existing product
            console.log('Ürün güncelleniyor, ID:', productId);
            try {
                const response = await AdminAPI.updateProduct(productId, formData);
                console.log('Ürün güncelleme yanıtı:', response);
                
                // Kapama ve yenileme işlemlerinden önce başarılı yanıtı doğrula
                if (response && response._id) {
                    // Close the modal
                    document.getElementById('productModal').classList.remove('show');
                    
                    // Show success notification
                    showNotification('Ürün başarıyla güncellendi.', 'success');
                    
                    // Reload products
                    loadProducts(currentPage);
                } else {
                    throw new Error('API yanıtı geçersiz veya eksik');
                }
            } catch (error) {
                console.error('Ürün güncellenirken hata oluştu:', error);
                showNotification(`Ürün kaydedilirken hata oluştu: ${error.message}`, 'error');
            }
        } else {
            // Create new product
            console.log('Yeni ürün oluşturuluyor');
            try {
                const response = await AdminAPI.createProduct(formData);
                console.log('Ürün oluşturma yanıtı:', response);
                
                // Kapama ve yenileme işlemlerinden önce başarılı yanıtı doğrula
                if (response && response._id) {
                    // Close the modal
                    document.getElementById('productModal').classList.remove('show');
                    
                    // Show success notification
                    showNotification('Ürün başarıyla oluşturuldu.', 'success');
                    
                    // Reload products
                    loadProducts(currentPage);
                } else {
                    throw new Error('API yanıtı geçersiz veya eksik');
                }
            } catch (error) {
                console.error('Ürün oluşturulurken hata oluştu:', error);
                showNotification(`Ürün kaydedilirken hata oluştu: ${error.message}`, 'error');
            }
        }
    } catch (error) {
        console.error('Ürün kaydedilirken genel hata:', error);
        showNotification(`Ürün kaydedilirken hata oluştu: ${error.message}`, 'error');
    }
}

/**
 * Open the delete product confirmation modal
 * @param {string} productId - The ID of the product to delete
 */
function openDeleteProductModal(productId) {
    const modal = document.getElementById('deleteProductModal');
    document.getElementById('deleteProductId').value = productId;
    
    // Show the modal
    modal.classList.add('show');
}

/**
 * Delete a product
 */
async function deleteProduct() {
    const productId = document.getElementById('deleteProductId').value;
    
    if (!productId) return;
    
    try {
        await AdminAPI.deleteProduct(productId);
        
        // Close the modal
        document.getElementById('deleteProductModal').classList.remove('show');
        
        // Show success notification
        showNotification('Ürün başarıyla silindi.', 'success');
        
        // Reload products
        loadProducts(currentPage);
    } catch (error) {
        showNotification('Ürün silinirken bir hata oluştu.', 'error');
        console.error('Error deleting product:', error);
    }
} 