(function() {
// Products page variables
let productsTable;
let productFilters = {
    category: '',
    status: '',
    search: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
};
// Globals are already defined in admin.js:
// currentPage, totalPages, PAGE_SIZE
let pageSize = 50;
let selectedProducts = new Set();

// Global function for toggling product selection (accessible from HTML)
window.toggleProductSelection = function(productId, isChecked) {
    console.log('Toggle product selection:', productId, isChecked);
    
    if (isChecked) {
        if (!selectedProducts.has(productId)) {
            selectedProducts.add(productId);
        }
    } else {
        selectedProducts.delete(productId);
        
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
    
    // Kategorileri yükle
    loadCategories();
    
    // Initialize filter events
    initProductFilters();
    
    // Load products
    loadProducts(currentPage);
    
    // Add event listeners for bulk actions
    const bulkActionApply = document.querySelector('#bulkActionApply');
    if (bulkActionApply) {
        bulkActionApply.addEventListener('click', applyBulkAction);
    }
    
    // Add event listener for "Yeni Ürün Ekle" button
    const addProductButton = document.querySelector('#openAddProductModal');
    if (addProductButton) {
        addProductButton.addEventListener('click', openAddProductModal);
    }
    
    // Add event listener for product form submission
    const productForm = document.querySelector('#productForm');
    if (productForm) {
        productForm.addEventListener('submit', handleProductFormSubmit);
    }
    
    // Add event listener for save product button
    const saveProductButton = document.querySelector('#saveProduct');
    if (saveProductButton) {
        saveProductButton.addEventListener('click', function() {
            const form = document.querySelector('#productForm');
            if (form) form.dispatchEvent(new Event('submit'));
        });
    }
    
    // Add event listener for add specification button
    const addSpecButton = document.querySelector('#addSpec');
    if (addSpecButton) {
        addSpecButton.addEventListener('click', function() {
            addSpecificationField();
        });
    }
    
    // Add event listener for image preview click
    const imagePreview = document.querySelector('#productImagePreview');
    if (imagePreview) {
        imagePreview.addEventListener('click', function() {
            document.querySelector('#productImage').click();
        });
    }
    
    // Add event listener for image file input change
    const imageInput = document.querySelector('#productImage');
    if (imageInput) {
        imageInput.addEventListener('change', function(e) {
            if (e.target.files && e.target.files[0]) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    const imagePreview = document.querySelector('#productImagePreview');
                    imagePreview.style.backgroundImage = `url('${event.target.result}')`;
                    imagePreview.innerHTML = '';
                };
                reader.readAsDataURL(e.target.files[0]);
            }
        });
    }
    
    // Add event listener for check all checkbox
    const checkAllProducts = document.querySelector('#selectAllProducts');
    if (checkAllProducts) {
        checkAllProducts.addEventListener('change', function() {
            const isChecked = this.checked;
            selectedProducts.forEach(productId => {
                if (isChecked) {
                    if (!selectedProducts.has(productId)) {
                        selectedProducts.add(productId);
                    }
                } else {
                    selectedProducts.delete(productId);
                }
            });
            updateSelectedCount();
        });
    }
}

// Initialize product filters
async function initProductFilters() {
    try {
        // Kategori filtresini yükle
        const categories = await loadCategories();
        
        if (categories && categories.length > 0) {
            // Kategori filtresi ve ürün ekleme/düzenleme formunu güncelle
            updateCategorySelects(categories);
        } else {
            console.warn('Kategoriler yüklenemedi veya boş, varsayılan kategoriler kullanılacak.');
            // Varsayılan kategorileri kullan
            const defaultCategories = AdminAPI._getSimulatedCategories().data;
            updateCategorySelects(defaultCategories);
        }
        
        // Filtre olaylarını tanımla
        setupFilterEvents();
    } catch (error) {
        console.error('Filtre başlatma hatası:', error);
        showNotification('Ürün filtreleri yüklenirken bir hata oluştu.', 'error');
    }
}

// Kategori seçimlerini güncelle
function updateCategorySelects(categories) {
    // Kategori filtresi için select elementi
    const categoryFilter = document.querySelector('#categoryFilter');
    const productCategory = document.querySelector('#productCategory');
    
    if (categoryFilter) {
        // Varsayılan "Tümü" seçeneği
        categoryFilter.innerHTML = '<option value="">Tümü</option>';
        
        // Ana kategorileri bul (parent'ı olmayanlar)
        const mainCategories = categories.filter(cat => 
            !cat.parent || 
            cat.parent === null || 
            cat.parent === undefined || 
            (typeof cat.parent === 'object' && Object.keys(cat.parent).length === 0)
        );
        
        console.log('Ana kategoriler:', mainCategories.length);
        
        // Ana kategorileri optgroup olarak ekle
        mainCategories.forEach(mainCat => {
            const optgroup = document.createElement('optgroup');
            optgroup.label = mainCat.name;
            
            // Ana kategorinin kendisini ekle
            const mainOption = document.createElement('option');
            mainOption.value = mainCat._id || mainCat.id;
            mainOption.textContent = `Tüm ${mainCat.name}`;
            optgroup.appendChild(mainOption);
            
            // Alt kategorileri bul ve ekle
            const subCategories = categories.filter(cat => 
                cat.parent && 
                (
                    (typeof cat.parent === 'object' && 
                        (cat.parent._id === mainCat._id || 
                        cat.parent._id === mainCat.id || 
                        cat.parent.id === mainCat._id || 
                        cat.parent.id === mainCat.id || 
                        cat.parent.name === mainCat.name)
                    ) ||
                    (typeof cat.parent === 'string' && 
                        (cat.parent === mainCat._id || 
                        cat.parent === mainCat.id)
                    )
                )
            );
            
            console.log(`${mainCat.name} alt kategorileri:`, subCategories.length);
            
            subCategories.forEach(subCat => {
                const option = document.createElement('option');
                option.value = subCat._id || subCat.id;
                option.textContent = subCat.name;
                optgroup.appendChild(option);
            });
            
            categoryFilter.appendChild(optgroup);
        });
        
        // Sayfa yüklendiğinde URL'den kategori parametresini alıp seçili yapma
        const urlParams = new URLSearchParams(window.location.search);
        const categoryParam = urlParams.get('category');
        
        if (categoryParam) {
            categoryFilter.value = categoryParam;
            productFilters.category = categoryParam;
            // Sayfa yüklendiğinde filtreyi uygula
            loadProducts(currentPage);
        }
    }
    
    // Ürün düzenleme modalı için kategori select'i
    if (productCategory) {
        // Varsayılan "Kategori seçin" seçeneği
        productCategory.innerHTML = '<option value="">Kategori Seçin</option>';
        
        // Ana kategoriler
        const mainCategories = categories.filter(cat => 
            !cat.parent || 
            cat.parent === null || 
            cat.parent === undefined || 
            (typeof cat.parent === 'object' && Object.keys(cat.parent).length === 0)
        );
        
        // Önce ana kategorileri basit seçenekler olarak ekle
        mainCategories.forEach(mainCat => {
            const option = document.createElement('option');
            option.value = mainCat._id || mainCat.id;
            option.textContent = `${mainCat.name} (Ana Kategori)`;
            option.classList.add('main-category-option');
            productCategory.appendChild(option);
        });
        
        // Sonra alt kategorileri grup olarak ekle
        mainCategories.forEach(mainCat => {
            const optgroup = document.createElement('optgroup');
            optgroup.label = `${mainCat.name} - Alt Kategoriler`;
            
            // Alt kategorileri bul ve ekle
            const subCategories = categories.filter(cat => 
                cat.parent && 
                (
                    (typeof cat.parent === 'object' && 
                        (cat.parent._id === mainCat._id || 
                        cat.parent._id === mainCat.id || 
                        cat.parent.id === mainCat._id || 
                        cat.parent.id === mainCat.id || 
                        cat.parent.name === mainCat.name)
                    ) ||
                    (typeof cat.parent === 'string' && 
                        (cat.parent === mainCat._id || 
                        cat.parent === mainCat.id)
                    )
                )
            );
            
            if (subCategories.length > 0) {
                subCategories.forEach(subCat => {
                    const option = document.createElement('option');
                    option.value = subCat._id || subCat.id;
                    option.textContent = subCat.name;
                    optgroup.appendChild(option);
                });
                
                productCategory.appendChild(optgroup);
            }
        });
    }
}

// Filtreleme olaylarını ayarla
function setupFilterEvents() {
    // DOM elementlerini bul
    const searchInput = document.querySelector('#searchInput');
    const searchBtn = document.querySelector('#searchBtn');
    const categoryFilter = document.querySelector('#categoryFilter');
    const statusFilter = document.querySelector('#statusFilter');
    const sortByFilter = document.querySelector('#sortByFilter');
    const clearFilterBtn = document.querySelector('#clearFilterBtn');
    
    // Arama butonu olayı
    if (searchBtn) {
        searchBtn.addEventListener('click', function() {
            if (searchInput) {
                productFilters.search = searchInput.value.trim();
                loadProducts(1); // İlk sayfadan başla
            }
        });
    }
    
    // Arama inputu Enter olayı
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                productFilters.search = searchInput.value.trim();
                loadProducts(1); // İlk sayfadan başla
            }
        });
    }
    
    // Kategori filtresi olayı
    if (categoryFilter) {
        categoryFilter.addEventListener('change', function() {
            productFilters.category = this.value;
            loadProducts(1); // İlk sayfadan başla
        });
    }
    
    // Durum filtresi olayı
    if (statusFilter) {
        statusFilter.addEventListener('change', function() {
            productFilters.status = this.value;
            loadProducts(1); // İlk sayfadan başla
        });
    }
    
    // Sıralama filtresi olayı
    if (sortByFilter) {
        sortByFilter.addEventListener('change', function() {
            const value = this.value;
            if (value.includes(':')) {
                const [sortBy, sortOrder] = value.split(':');
                productFilters.sortBy = sortBy;
                productFilters.sortOrder = sortOrder;
            }
            loadProducts(currentPage);
        });
    }
    
    // Filtreleri temizleme olayı
    if (clearFilterBtn) {
        clearFilterBtn.addEventListener('click', function() {
            // Input ve select elementlerini sıfırla
            if (searchInput) searchInput.value = '';
            if (categoryFilter) categoryFilter.value = '';
            if (statusFilter) statusFilter.value = '';
            if (sortByFilter) sortByFilter.value = 'createdAt:desc';
            
            // Filtre objesi sıfırla
            productFilters = {
                search: '',
                category: '',
                status: '',
                sortBy: 'createdAt',
                sortOrder: 'desc'
            };
            
            loadProducts(1);
        });
    }
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
        
        console.log('Ürünler isteniyor, parametreler:', params);
        
        try {
            // Get products from API
            const response = await AdminAPI.getProducts(params);
            console.log('API yanıtı:', response);
            
            // Veri yoksa veya null/undefined ise
            if (!response) {
                console.error('API yanıtı boş veya null/undefined.');
                showNotification('Ürünler yüklenirken bir hata oluştu. API yanıtı alınamadı.', 'error');
                renderProductsTable([]);
                return;
            }
            
            // Pagination bilgilerini güncelle
            let productsArray = [];
            let totalCount = 0;
            let totalPageCount = 1;
            
            // Yanıt tipini kontrol et - farklı API formatlarını destekleyelim
            if (Array.isArray(response)) {
                console.log('API yanıtı bir dizi:', response.length);
                productsArray = response;
                totalCount = response.length;
                totalPageCount = Math.ceil(totalCount / pageSize);
            } 
            else if (response.products && Array.isArray(response.products)) {
                console.log('API yanıtında products dizisi bulundu:', response.products.length);
                productsArray = response.products;
                totalCount = response.total || response.products.length;
                totalPageCount = response.totalPages || Math.ceil(totalCount / pageSize);
            }
            else if (response.data && Array.isArray(response.data)) {
                console.log('API yanıtında data dizisi bulundu:', response.data.length);
                productsArray = response.data;
                totalCount = response.total || response.data.length;
                totalPageCount = response.totalPages || Math.ceil(totalCount / pageSize);
            }
            else if (typeof response === 'object' && (response.id || response._id)) {
                console.log('API yanıtı tek bir ürün nesnesi:', response.id || response._id);
                productsArray = [response];
                totalCount = 1;
                totalPageCount = 1;
            } 
            else {
                console.warn('API yanıtında geçerli ürün verisi bulunamadı:', response);
                productsArray = [];
                totalCount = 0;
                totalPageCount = 1;
            }
            
            // Ürünlerin doğru ID'ye sahip olduğundan emin olalım
            productsArray = productsArray.map(product => {
                // MongoDB _id'yi düzeltme
                if (product._id && !product.id) {
                    product.id = product._id;
                }
                return product;
            });
            
            console.log('İşlenmiş ürün dizisi:', productsArray);
            
            // Güncellenen sayfalama değerleri
            currentPage = Number(page) || 1;
            totalPages = totalPageCount;
            
            // Tabloyu render et
            renderProductsTable(productsArray);
            
            // Pagination oluştur
            renderImprovedPagination(currentPage, totalPages, loadProducts);
            
            // Toplam sayıyı güncelle
            const totalElement = document.querySelector('#totalProductsCount');
            if (totalElement) {
                totalElement.textContent = totalCount.toString();
            }
        } catch (apiError) {
            console.error('API isteği sırasında hata oluştu:', apiError);
            showNotification('Ürünler yüklenirken API hatası oluştu, simülasyon verileri kullanılıyor.', 'warning');
            
            // Simülasyon verilerini kullan
            const demoProducts = AdminAPI._getSimulatedProducts().products;
            
            // Tabloyu render et
            renderProductsTable(demoProducts);
            
            // Pagination oluştur
            renderImprovedPagination(1, 1, loadProducts);
            
            // Toplam sayıyı güncelle
            const totalElement = document.querySelector('#totalProductsCount');
            if (totalElement) {
                totalElement.textContent = demoProducts.length.toString();
            }
        }
    } catch (error) {
        console.error('Ürünler yüklenirken hata oluştu:', error);
        showNotification('Ürün yükleme işlemi başarısız oldu. Sayfayı yenilemeyi deneyin.', 'error');
        
        // Hata durumunda boş dizi ile render et
        renderProductsTable([]);
    } finally {
        hideLoading('#productsTable');
    }
}

// İyileştirilmiş sayfalama
function renderImprovedPagination(currentPage, totalPages, callback) {
    const paginationContainer = document.getElementById('productsPagination');
    if (!paginationContainer) return;
    
    paginationContainer.innerHTML = '';
    
    // Sayfa sayısı 1 ise sayfalama gösterme
    if (totalPages <= 1) return;
    
    // Önceki sayfa butonu
    const prevButton = document.createElement('button');
    prevButton.classList.add('pagination-item');
    prevButton.textContent = '«';
    prevButton.disabled = currentPage === 1;
    prevButton.addEventListener('click', () => callback(currentPage - 1));
    paginationContainer.appendChild(prevButton);
    
    // Sayfa numaraları
    const maxPages = 5; // Gösterilecek maksimum sayfa numarası
    let startPage = Math.max(1, currentPage - Math.floor(maxPages / 2));
    let endPage = Math.min(totalPages, startPage + maxPages - 1);
    
    // Başlangıç sayfasını ayarla
    if (endPage - startPage + 1 < maxPages) {
        startPage = Math.max(1, endPage - maxPages + 1);
    }
    
    // İlk sayfa ve ... (gerekirse)
    if (startPage > 1) {
        const firstPageButton = document.createElement('button');
        firstPageButton.classList.add('pagination-item');
        firstPageButton.textContent = '1';
        firstPageButton.addEventListener('click', () => callback(1));
        paginationContainer.appendChild(firstPageButton);
        
        if (startPage > 2) {
            const ellipsis = document.createElement('span');
            ellipsis.classList.add('pagination-ellipsis');
            ellipsis.textContent = '...';
            paginationContainer.appendChild(ellipsis);
        }
    }
    
    // Sayfa numaraları
    for (let i = startPage; i <= endPage; i++) {
        const pageButton = document.createElement('button');
        pageButton.classList.add('pagination-item');
        if (i === currentPage) {
            pageButton.classList.add('active');
        }
        pageButton.textContent = i.toString();
        pageButton.addEventListener('click', () => callback(i));
        paginationContainer.appendChild(pageButton);
    }
    
    // Son sayfa ve ... (gerekirse)
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            const ellipsis = document.createElement('span');
            ellipsis.classList.add('pagination-ellipsis');
            ellipsis.textContent = '...';
            paginationContainer.appendChild(ellipsis);
        }
        
        const lastPageButton = document.createElement('button');
        lastPageButton.classList.add('pagination-item');
        lastPageButton.textContent = totalPages.toString();
        lastPageButton.addEventListener('click', () => callback(totalPages));
        paginationContainer.appendChild(lastPageButton);
    }
    
    // Sonraki sayfa butonu
    const nextButton = document.createElement('button');
    nextButton.classList.add('pagination-item');
    nextButton.textContent = '»';
    nextButton.disabled = currentPage === totalPages;
    nextButton.addEventListener('click', () => callback(currentPage + 1));
    paginationContainer.appendChild(nextButton);
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
                // Ürün resmini belirleme:
                // 1. Önce images dizisine bak
                // 2. Sonra image alanına bak
                // 3. Hiçbiri yoksa varsayılan görsel kullan
                let productImage = '/admin/img/no-image.png';
                
                if (product.images && Array.isArray(product.images) && product.images.length > 0) {
                    productImage = product.images[0];
                } else if (product.image) {
                    productImage = product.image;
                } else if (product.imageUrl) {
                    productImage = product.imageUrl;
                }
                
                // Ürün durumları için balonları oluştur
                const isFeatured = product.featured === true;
                const isNewProduct = product.isNewProduct === true;
                const isActive = product.isActive !== false; // undefined veya true ise aktif
                
                const statusBadges = `
                    <div class="status-badges">
                        <span class="status-badge ${isActive ? 'status-active' : 'status-inactive'}" 
                              title="${isActive ? 'Aktif Ürün' : 'Pasif Ürün'}">
                            <i class="fas fa-circle"></i> ${isActive ? 'Aktif' : 'Pasif'}
                        </span>
                        ${isFeatured ? `
                        <span class="status-badge status-featured" title="Öne Çıkan Ürün">
                            <i class="fas fa-star"></i> Öne Çıkan
                        </span>
                        ` : ''}
                        ${isNewProduct ? `
                        <span class="status-badge status-new" title="Yeni Ürün">
                            <i class="fas fa-certificate"></i> Yeni
                        </span>
                        ` : ''}
                    </div>
                `;
                
                // Kategori adını belirle
                let categoryName = 'Belirtilmemiş';
                if (product.category) {
                    if (typeof product.category === 'object' && product.category.name) {
                        categoryName = product.category.name;
                    } else if (typeof product.category === 'string') {
                        categoryName = product.category;
                    }
                }
                
                productsTable.row.add({
                    checkbox: `<div class="form-check">
                                <input type="checkbox" class="form-check-input product-checkbox" value="${product._id || product.id}" 
                                ${selectedProducts.has(product._id || product.id) ? 'checked' : ''}
                                onchange="toggleProductSelection('${product._id || product.id}', this.checked)">
                               </div>`,
                    id: product._id || product.id,
                    image: `<div class="product-card-container">
                              <div class="product-card-image">
                                <img src="${productImage}" alt="${product.name}" class="product-thumbnail">
                              </div>
                              <div class="product-card-info">
                                <div class="product-name">${product.name}</div>
                                <div class="product-category"><span class="category-badge">${categoryName}</span></div>
                                ${statusBadges}
                              </div>
                            </div>`,
                    name: `<div class="d-none">${product.name}</div>`, // Gizli alan
                    category: `<div class="d-none">${categoryName}</div>`, // Gizli alan
                    price: formatPrice(product.price),
                    stock: `<span class="stock-badge ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}">${product.stock}</span>`,
                    actions: `<div class="btn-group" role="group">
                                <button class="btn btn-sm btn-outline-primary" onclick="editProduct('${product._id || product.id}')">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="btn btn-sm btn-outline-danger" onclick="deleteProduct('${product._id || product.id}')">
                                    <i class="fas fa-trash"></i>
                                </button>
                             </div>`
                });
            });
            
            // Draw table
            productsTable.draw();
            
        } catch (error) {
            console.error('DataTable render hatası:', error);
        }
    } else {
        console.warn('productsTable tanımlı değil veya başlatılmamış.');
    }
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
        emptyRow.innerHTML = `<td colspan="8" class="text-center">Ürün bulunamadı</td>`;
        tableBody.appendChild(emptyRow);
        return;
    }
    
    // Add products to table
    products.forEach(product => {
        const row = document.createElement('tr');
        
        // Ürün durumları için balonları oluştur
        const isFeatured = product.featured === true;
        const isNewProduct = product.isNewProduct === true;
        const isActive = product.isActive !== false;
        
        const statusBadges = `
            <div class="status-badges">
                <span class="status-badge ${isActive ? 'status-active' : 'status-inactive'}" 
                    title="${isActive ? 'Aktif Ürün' : 'Pasif Ürün'}">
                    <i class="fas fa-circle"></i> ${isActive ? 'Aktif' : 'Pasif'}
                </span>
                ${isFeatured ? `
                <span class="status-badge status-featured" title="Öne Çıkan Ürün">
                    <i class="fas fa-star"></i> Öne Çıkan
                </span>
                ` : ''}
                ${isNewProduct ? `
                <span class="status-badge status-new" title="Yeni Ürün">
                    <i class="fas fa-certificate"></i> Yeni
                </span>
                ` : ''}
            </div>
        `;
        
        // Kategori adını belirle
        let categoryName = 'Belirtilmemiş';
        if (product.category) {
            if (typeof product.category === 'object' && product.category.name) {
                categoryName = product.category.name;
            } else if (typeof product.category === 'string') {
                categoryName = product.category;
            }
        }
        
        row.innerHTML = `
            <td>
                <div class="form-check">
                    <input type="checkbox" class="form-check-input product-checkbox" value="${product.id}" 
                    ${selectedProducts.has(product.id) ? 'checked' : ''}
                    onchange="toggleProductSelection('${product.id}', this.checked)">
                </div>
            </td>
            <td>${product.id}</td>
            <td>
                <div class="product-card-container">
                    <div class="product-card-image">
                        <img src="${product.image || '/admin/img/no-image.png'}" alt="${product.name}" class="product-thumbnail">
                    </div>
                    <div class="product-card-info">
                        <div class="product-name">${product.name}</div>
                        <div class="product-category"><span class="category-badge">${categoryName}</span></div>
                        ${statusBadges}
                    </div>
                </div>
            </td>
            <td><div class="d-none">${product.name}</div></td>
            <td><div class="d-none">${categoryName}</div></td>
            <td>${formatPrice(product.price)}</td>
            <td><span class="stock-badge ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}">${product.stock}</span></td>
            <td>
                <div class="btn-group" role="group">
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
    const count = selectedProducts.size;
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
    if (selectedProducts.size === 0) {
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
                if (confirm(`${selectedProducts.size} ürünü silmek istediğinize emin misiniz?`)) {
                    await AdminAPI.bulkDeleteProducts(Array.from(selectedProducts));
                    showNotification(`${selectedProducts.size} ürün başarıyla silindi.`, 'success');
                    selectedProducts.clear();
                    updateSelectedCount();
                    loadProducts(currentPage);
                }
                break;
                
            case 'feature':
                await AdminAPI.bulkUpdateProducts(Array.from(selectedProducts), { featured: true });
                showNotification(`${selectedProducts.size} ürün başarıyla öne çıkarıldı.`, 'success');
                loadProducts(currentPage);
                break;
                
            case 'unfeature':
                await AdminAPI.bulkUpdateProducts(Array.from(selectedProducts), { featured: false });
                showNotification(`${selectedProducts.size} ürün öne çıkarmadan kaldırıldı.`, 'success');
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
        selectedProducts.clear();
        updateSelectedCount();
        loadProducts(currentPage);
        showNotification('Demo modunda işlem başarıyla simüle edildi.', 'success');
    } finally {
        hideLoading('#productsTable');
    }
}

// Load categories from API
async function loadCategories() {
    try {
        // Get categories from API
        const response = await AdminAPI.getCategories();
        
        // API yanıtını kontrol edelim
        if (!response) {
            console.error('API yanıtı boş veya null.');
            return [];
        }
        
        // Farklı API yanıt formatlarını destekleyelim
        let categories = [];
        
        if (Array.isArray(response)) {
            categories = response;
        } else if (response.data && Array.isArray(response.data)) {
            categories = response.data;
        } else if (response.categories && Array.isArray(response.categories)) {
            categories = response.categories;
        } else if (typeof response === 'object' && Object.keys(response).length > 0) {
            // Diğer olası formatlar
            console.warn('API kategorileri farklı bir formatta döndürdü:', response);
            
            // Tüm object değerlerini kontrol et ve array olan ilk özelliği kullan
            for (const key in response) {
                if (Array.isArray(response[key])) {
                    console.log(`Kategori dizisi olarak '${key}' özelliği kullanılıyor:`, response[key].length);
                    categories = response[key];
                    break;
                }
            }
            
            // Hala boş ise tüm response'u kullan
            if (categories.length === 0 && !Array.isArray(response)) {
                categories = [response]; // Tek bir kategori nesnesi
            }
        }
        
        // Kategorileri ID'lere göre normalleştir
        categories = categories.map(category => {
            // MongoDB _id'yi düzeltme
            if (category._id && !category.id) {
                category.id = category._id;
            } else if (!category._id && category.id) {
                category._id = category.id;
            }
            return category;
        });
        
        return categories;
    } catch (error) {
        console.error('Categories API error:', error);
        showNotification('Kategoriler yüklenirken bir hata oluştu.', 'error');
        return [];
    }
}

// Edit product - internal implementation
async function editProductInternal(productId) {
    try {
        showLoading('#productsTable');
        
        // Ürün verilerini al
        const product = await AdminAPI.getProductById(productId);
        
        if (!product) {
            showNotification('Ürün bulunamadı.', 'error');
            return;
        }
        
        console.log('Düzenlenecek ürün:', product);
        
        // Form alanlarını doldur
        document.querySelector('#productId').value = product._id || product.id;
        document.querySelector('#productName').value = product.name;
        document.querySelector('#productDescription').value = product.description;
        document.querySelector('#productPrice').value = product.price;
        document.querySelector('#productStock').value = product.stock || 0;
        
        // Kategori seçimi
        const categorySelect = document.querySelector('#productCategory');
        if (categorySelect) {
            // Önce formu resetleyerek tüm seçimleri temizle
            categorySelect.value = '';
            
            // Ürünün kategori bilgisini al
            let categoryId = '';
            
            // Kategori objesi mi yoksa string (ID) mi?
            if (product.category) {
                if (typeof product.category === 'object' && product.category._id) {
                    categoryId = product.category._id;
                } else if (typeof product.category === 'string') {
                    categoryId = product.category;
                }
            }
            
            console.log('Kategori ID:', categoryId);
            
            // Kategori seçiliyse form elemanında seç
            if (categoryId) {
                // Önce kategorinin select'te olup olmadığını kontrol et
                const optionExists = Array.from(categorySelect.options).some(option => option.value === categoryId);
                
                if (optionExists) {
                    categorySelect.value = categoryId;
                } else {
                    console.warn(`Kategori bulunamadı, ID: ${categoryId}`);
                    // Eğer kategori listede yoksa ama ID'si biliniyorsa manuel ekle
                    if (typeof product.category === 'object' && product.category.name) {
                        const newOption = document.createElement('option');
                        newOption.value = categoryId;
                        newOption.textContent = product.category.name;
                        categorySelect.appendChild(newOption);
                        categorySelect.value = categoryId;
                    }
                }
            }
        }
        
        // Diğer form alanlarını doldur
        document.querySelector('#productBrand').value = product.brand || '';
        document.querySelector('#productModel').value = product.model || '';
        document.querySelector('#productDiscount').value = product.discount || 0;
        
        // Checkbox durumları
        document.querySelector('#productFeatured').checked = product.featured === true;
        document.querySelector('#productNewProduct').checked = product.isNewProduct === true;
        const productStatus = document.querySelector('#productStatus');
        if (productStatus) {
            productStatus.value = product.status || 'active';
        }
        
        // Resim önizleme
        const imagePreview = document.querySelector('#productImagePreview');
        
        // Ürün resmi yolunu belirle
        let imageUrl = '';
        if (product.images && Array.isArray(product.images) && product.images.length > 0) {
            imageUrl = product.images[0];
        } else if (product.image) {
            imageUrl = product.image;
        } else if (product.imageUrl) {
            imageUrl = product.imageUrl;
        }
        
        if (imageUrl && imagePreview) {
            imagePreview.style.backgroundImage = `url('${imageUrl}')`;
            imagePreview.innerHTML = '';
        } else if (imagePreview) {
            imagePreview.style.backgroundImage = '';
            imagePreview.innerHTML = '<i class="fas fa-image"></i>';
        }
        
        // Ürün özellikleri (specifications)
        const specsContainer = document.querySelector('#productSpecs');
        
        if (specsContainer) {
            // Mevcut satırları temizle
            specsContainer.innerHTML = '';
            
            if (product.specifications && typeof product.specifications === 'object') {
                // Özellikleri ekle
                Object.entries(product.specifications).forEach(([key, value]) => {
                    addSpecificationField(key, value);
                });
            } else {
                // Varsayılan olarak bir boş özellik satırı ekle
                addSpecificationField();
            }
        }
        
        // Modal başlığını güncelle
        document.querySelector('#productModalTitle').textContent = 'Ürün Düzenle';
        
        // Modalı aç
        const modalElement = document.querySelector('#productModal');
        if (modalElement) {
            const modal = new bootstrap.Modal(modalElement);
            modal.show();
        }
    } catch (error) {
        console.error('Ürün düzenleme formu açılırken hata oluştu:', error);
        showNotification('Ürün düzenleme formu açılırken bir hata oluştu.', 'error');
    } finally {
        hideLoading('#productsTable');
    }
}

// Yeni özellik alanı ekle
function addSpecificationField(key = '', value = '') {
    const specsContainer = document.querySelector('#productSpecs');
    if (!specsContainer) return;
    
    const specItem = document.createElement('div');
    specItem.className = 'spec-item';
    specItem.innerHTML = `
        <input type="text" class="form-control spec-key" placeholder="Özellik (örn. İşlemci)" value="${key}">
        <input type="text" class="form-control spec-value" placeholder="Değer (örn. Intel Core i7)" value="${value}">
        <button type="button" class="btn btn-danger btn-icon remove-spec">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Silme butonuna tıklama olayı ekle
    const removeButton = specItem.querySelector('.remove-spec');
    if (removeButton) {
        removeButton.addEventListener('click', function() {
            specItem.remove();
        });
    }
    
    specsContainer.appendChild(specItem);
}

// Delete product - internal implementation
async function deleteProductInternal(productId) {
    if (!confirm('Bu ürünü silmek istediğinize emin misiniz?')) {
        return;
    }
    
    try {
        showLoading('#productsTable');
        
        await AdminAPI.deleteProduct(productId);
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
        
        // Loading göstergesi
        showLoading('#productModal');
        
        // Form verilerinin geçerliliğini kontrol et
        const productName = document.querySelector('#productName').value.trim();
        if (!productName) {
            throw new Error('Ürün adı boş olamaz');
        }
        
        const productPrice = document.querySelector('#productPrice').value.trim();
        if (!productPrice || isNaN(parseFloat(productPrice)) || parseFloat(productPrice) <= 0) {
            throw new Error('Lütfen geçerli bir fiyat giriniz');
        }
        
        const productCategory = document.querySelector('#productCategory').value.trim();
        
        // FormData objesi oluştur
        const formData = new FormData();
        
        // Ürün özelliklerini topla
        const specItems = document.querySelectorAll('.spec-item');
        const specifications = {};
        
        specItems.forEach(item => {
            const key = item.querySelector('.spec-key').value.trim();
            const value = item.querySelector('.spec-value').value.trim();
            
            if (key && value) {
                specifications[key] = value;
            }
        });
        
        // Form verilerini FormData'ya ekle
        formData.append('name', productName);
        formData.append('description', document.querySelector('#productDescription').value);
        formData.append('price', productPrice);
        // Kategori sadece seçiliyse ekle
        if (productCategory) {
            formData.append('category', productCategory);
        }
        
        // Diğer alanları ekle
        const brandValue = document.querySelector('#productBrand').value.trim();
        if (brandValue) formData.append('brand', brandValue);
        
        const modelValue = document.querySelector('#productModel').value.trim();
        if (modelValue) formData.append('model', modelValue);
        
        formData.append('stock', document.querySelector('#productStock').value);
        
        const discountValue = document.querySelector('#productDiscount').value.trim();
        if (discountValue) formData.append('discount', discountValue || '0');
        
        // Durum checkbox'larını ekle
        formData.append('featured', document.querySelector('#productFeatured').checked);
        formData.append('isNewProduct', document.querySelector('#productNewProduct').checked);
        const statusElement = document.querySelector('#productStatus');
        // Status değerinin kontrolü: boş ise varsayılan olarak 'active' kullan, 
        // değilse küçük harfe dönüştür (enum değerleri küçük harfle tanımlı)
        const statusValue = statusElement && statusElement.value ? statusElement.value.toLowerCase() : 'active';
        formData.append('status', statusValue);
        
        if (Object.keys(specifications).length > 0) {
            formData.append('specifications', JSON.stringify(specifications));
        }
        
        // Görsel dosyasını ekle
        const imageInput = document.querySelector('#productImage');
        const imageFile = imageInput.files[0];
        
        if (imageFile) {
            // Resim dosya türünü kontrol et
            const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/jpg'];
            if (!validImageTypes.includes(imageFile.type)) {
                throw new Error('Geçersiz resim formatı. Sadece JPEG, PNG, GIF veya WEBP yükleyebilirsiniz.');
            }
            
            // Dosya boyutu kontrolü
            const maxSize = 10 * 1024 * 1024; // 10MB
            if (imageFile.size > maxSize) {
                throw new Error('Resim dosyası çok büyük. En fazla 10MB yükleyebilirsiniz.');
            }
            
            console.log('Resim dosyası seçildi:', imageFile.name, imageFile.type, imageFile.size);
            formData.append('image', imageFile);
        } else {
            console.log('Resim dosyası seçilmedi.');
        }
        
        // Debug: FormData içeriğini kontrol et
        console.log('FormData içeriği:');
        for (let [key, value] of formData.entries()) {
            console.log(`${key}: ${value instanceof File ? 'Dosya: ' + value.name : value}`);
        }
        
        const productId = document.getElementById('productId').value;
        let result;
        
        if (productId) {
            // Update product
            formData.append('id', productId);
            console.log(`Ürün güncelleniyor, ID: ${productId}`);
            result = await AdminAPI.updateProduct(productId, formData);
            
            // API yanıtında _id veya id varsa başarılı kabul et
            if (result && (result._id || result.id)) {
                showNotification('Ürün başarıyla güncellendi.', 'success');
            } else {
                throw new Error(result?.message || 'Ürün güncellenemedi.');
            }
        } else {
            // Create product
            // Yeni ürün eklenirken kategori zorunlu
            if (!productCategory) {
                throw new Error('Lütfen bir kategori seçin');
            }
            
            console.log('Yeni ürün oluşturuluyor');
            result = await AdminAPI.createProduct(formData);
            
            // API yanıtında _id veya id varsa başarılı kabul et
            if (result && (result._id || result.id)) {
                showNotification('Ürün başarıyla oluşturuldu.', 'success');
            } else {
                throw new Error(result?.message || 'Ürün oluşturulamadı.');
            }
        }
        
        // Detaylı loglama
        console.log('API yanıtı:', result);
        
        // Close modal and reload products
        const modalElement = document.querySelector('#productModal');
        if (modalElement) {
            const modalInstance = bootstrap.Modal.getInstance(modalElement);
            if (modalInstance) modalInstance.hide();
            else {
                $(modalElement).modal('hide'); // jQuery alternative
            }
        }
        
        // Ürünleri yeniden yükle
        loadProducts(currentPage);
    } catch (error) {
        console.error('Ürün kaydedilirken hata oluştu:', error);
        showNotification('Ürün kaydedilirken bir hata oluştu: ' + error.message, 'error');
    } finally {
        // Loading göstergesini kaldır
        hideLoading('#productModal');
        
        // Enable form
        const form = document.getElementById('productForm');
        if (form) {
            Array.from(form.elements).forEach(el => el.disabled = false);
        }
    }
}

// Open the "Add Product" modal
function openAddProductModal() {
    // Reset form
    const form = document.querySelector('#productForm');
    if (form) form.reset();
    
    // Clear hidden ID field
    document.querySelector('#productId').value = '';
    
    // Default değerleri ayarla
    if (document.querySelector('#productStatus')) {
        document.querySelector('#productStatus').value = 'active'; // Yeni ürün varsayılan olarak aktif
    }
    document.querySelector('#productFeatured').checked = false;
    document.querySelector('#productNewProduct').checked = true; // Yeni ürün olarak işaretle
    
    // Clear image preview
    const imagePreview = document.querySelector('#productImagePreview');
    if (imagePreview) {
        imagePreview.style.backgroundImage = '';
        imagePreview.innerHTML = '<i class="fas fa-image"></i>';
    }
    
    // Reset specifications
    const specsContainer = document.querySelector('#productSpecs');
    if (specsContainer) {
        // Mevcut özellikleri temizle (ilk öğe hariç)
        while (specsContainer.children.length > 1) {
            specsContainer.removeChild(specsContainer.lastChild);
        }
        
        // İlk öğeyi sıfırla
        if (specsContainer.children.length > 0) {
            const firstSpec = specsContainer.children[0];
            const keyInput = firstSpec.querySelector('.spec-key');
            const valueInput = firstSpec.querySelector('.spec-value');
            if (keyInput) keyInput.value = '';
            if (valueInput) valueInput.value = '';
        }
    }
    
    // Update modal title
    document.querySelector('#productModalTitle').textContent = 'Yeni Ürün Ekle';
    
    // Open modal
    const modalElement = document.querySelector('#productModal');
    if (modalElement) {
        const modal = new bootstrap.Modal(modalElement);
        modal.show();
    }
}

// Make initProductsPage available globally
window.initProductsPage = initProductsPage;
})(); 