/**
 * Admin Categories JavaScript
 * Categories page functionality for the admin panel
 */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize the categories page
    initCategoriesPage();
});

/**
 * Initialize the categories page
 */
function initCategoriesPage() {
    // Set page variables
    currentPage = 1;
    pageSize = 10;
    
    // Load categories on page load
    loadCategories(currentPage);
    
    // Set up event listeners
    document.getElementById('openAddCategoryModal').addEventListener('click', () => openCategoryModal());
    document.getElementById('saveCategory').addEventListener('click', saveCategory);
    document.getElementById('confirmDeleteCategory').addEventListener('click', deleteCategory);
    
    // Set up icon preview
    document.getElementById('categoryIcon').addEventListener('input', updateIconPreview);
    
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
 * Load categories from the API
 * @param {number} page - The page number to load
 */
async function loadCategories(page = 1) {
    try {
        showLoading(document.querySelector('#categoriesTable').closest('.card-body'));
        
        // Fetch categories from API
        const params = {
            page: page,
            limit: pageSize
        };
        
        const response = await AdminAPI.getCategories(params);
        
        // API'den dönen veri yapısını kontrol et
        let categories = [];
        let total = 0;
        
        if (Array.isArray(response)) {
            // Doğrudan dizi olarak döndüyse
            categories = response;
            total = response.length;
        } else if (response && response.data && Array.isArray(response.data)) {
            // data özelliği içinde dizi olarak döndüyse
            categories = response.data;
            total = response.total || categories.length;
        } else if (response && typeof response === 'object') {
            // başka bir format
            categories = Object.values(response);
            total = categories.length;
        }
        
        console.log('Yüklenen kategoriler:', categories);
        
        // Update pagination
        totalPages = Math.ceil(total / pageSize);
        currentPage = page;
        
        // Render the categories table
        renderCategoriesTable(categories);
        
        // Render pagination
        renderPagination(
            document.getElementById('categoriesPagination'),
            currentPage,
            totalPages,
            loadCategories
        );
    } catch (error) {
        showNotification('Kategoriler yüklenirken bir hata oluştu.', 'error');
        console.error('Error loading categories:', error);
    } finally {
        hideLoading();
    }
}

/**
 * Render the categories table
 * @param {Array} categories - Array of category objects
 */
function renderCategoriesTable(categories) {
    const tableBody = document.querySelector('#categoriesTable tbody');
    tableBody.innerHTML = '';
    
    if (categories.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `<td colspan="7" class="text-center">Kategori bulunamadı.</td>`;
        tableBody.appendChild(row);
        return;
    }
    
    categories.forEach(category => {
        const row = document.createElement('tr');
        
        // Format the status
        const statusClass = category.active ? 'success' : 'danger';
        const statusText = category.active ? 'Aktif' : 'Pasif';
        
        // Format parent category name
        const parentName = category.parent ? category.parent.name : '-';
        
        row.innerHTML = `
            <td>${category._id}</td>
            <td><i class="fas ${category.icon || 'fa-tag'}"></i></td>
            <td>${category.name}</td>
            <td>${parentName}</td>
            <td>${category.productCount || 0}</td>
            <td><span class="status-badge status-${statusClass.toLowerCase()}">${statusText}</span></td>
            <td>
                <button class="btn btn-sm btn-light btn-icon edit-category" data-id="${category._id}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger btn-icon delete-category" data-id="${category._id}">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // Add event listeners to action buttons
    document.querySelectorAll('.edit-category').forEach(button => {
        button.addEventListener('click', () => openCategoryModal(button.dataset.id));
    });
    
    document.querySelectorAll('.delete-category').forEach(button => {
        button.addEventListener('click', () => openDeleteCategoryModal(button.dataset.id));
    });
}

/**
 * Open the category modal for adding or editing
 * @param {string} categoryId - The ID of the category to edit (null for adding)
 */
async function openCategoryModal(categoryId = null) {
    const modal = document.getElementById('categoryModal');
    const title = document.getElementById('categoryModalTitle');
    const form = document.getElementById('categoryForm');
    
    // Reset the form
    form.reset();
    document.getElementById('categoryId').value = '';
    
    // Update title based on whether we're adding or editing
    if (categoryId) {
        title.textContent = 'Kategori Düzenle';
        
        try {
            showLoading(modal.querySelector('.modal-body'));
            
            // Fetch the category details
            const category = await AdminAPI.getCategoryById(categoryId);
            
            // Populate the form with category data
            document.getElementById('categoryId').value = category._id;
            document.getElementById('categoryName').value = category.name;
            document.getElementById('categoryDescription').value = category.description || '';
            document.getElementById('categoryIcon').value = category.icon || '';
            document.getElementById('categoryActive').checked = category.active;
            document.getElementById('categoryFeatured').checked = category.featured || false;
            
            // Update the icon preview
            updateIconPreview();
            
            // Set parent category if exists
            if (category.parent) {
                document.getElementById('parentCategory').value = category.parent._id;
            }
        } catch (error) {
            showNotification('Kategori detayları yüklenirken bir hata oluştu.', 'error');
            console.error('Error loading category details:', error);
        } finally {
            hideLoading();
        }
    } else {
        title.textContent = 'Yeni Kategori Ekle';
        updateIconPreview();
    }
    
    // Load parent categories for the dropdown
    loadParentCategories(categoryId);
    
    // Show the modal
    modal.classList.add('show');
}

/**
 * Load parent categories for the dropdown
 * @param {string} excludeId - ID to exclude from the parent list (when editing)
 */
async function loadParentCategories(excludeId = null) {
    try {
        // Fetch all categories for parent dropdown
        const response = await AdminAPI.getCategories({ limit: 100 });
        const parentSelect = document.getElementById('parentCategory');
        
        // Clear existing options except the first one
        const defaultOption = parentSelect.options[0];
        parentSelect.innerHTML = '';
        parentSelect.appendChild(defaultOption);
        
        // API'den dönen veri yapısını kontrol et
        let categories = [];
        
        if (Array.isArray(response)) {
            // Doğrudan dizi olarak döndüyse
            categories = response;
        } else if (response && response.data && Array.isArray(response.data)) {
            // data özelliği içinde dizi olarak döndüyse
            categories = response.data;
        } else if (response && typeof response === 'object') {
            // başka bir format
            categories = Object.values(response);
        }
        
        console.log('Üst kategoriler için yüklenen kategoriler:', categories);
        
        // Ana kategorileri grup olarak ekle
        const mainCategories = categories.filter(cat => !cat.parent && cat._id !== excludeId);
        
        if (mainCategories.length > 0) {
            // Ana kategorileri ekle
            const optgroup = document.createElement('optgroup');
            optgroup.label = 'Ana Kategoriler';
            
            mainCategories.forEach(category => {
                const option = document.createElement('option');
                option.value = category._id;
                option.textContent = category.name;
                optgroup.appendChild(option);
            });
            
            parentSelect.appendChild(optgroup);
        }
    } catch (error) {
        showNotification('Üst kategoriler yüklenirken bir hata oluştu.', 'error');
        console.error('Error loading parent categories:', error);
    }
}

/**
 * Update the icon preview when the icon input changes
 */
function updateIconPreview() {
    const iconInput = document.getElementById('categoryIcon');
    const iconPreview = document.getElementById('iconPreview');
    
    // Clear existing classes except for 'fas'
    iconPreview.className = 'fas';
    
    // Add the new icon class if it exists
    if (iconInput.value) {
        iconPreview.classList.add(iconInput.value);
    } else {
        iconPreview.classList.add('fa-tag');
    }
}

/**
 * Save the category (create or update)
 */
async function saveCategory() {
    try {
        // Get form data
        const formData = {
            name: document.getElementById('categoryName').value,
            description: document.getElementById('categoryDescription').value,
            icon: document.getElementById('categoryIcon').value,
            active: document.getElementById('categoryActive').checked,
            featured: document.getElementById('categoryFeatured').checked
        };
        
        // Add parent category if selected
        const parentCategoryId = document.getElementById('parentCategory').value;
        if (parentCategoryId) {
            formData.parent = parentCategoryId;
        }
        
        const categoryId = document.getElementById('categoryId').value;
        let response;
        
        if (categoryId) {
            // Update existing category
            response = await AdminAPI.updateCategory(categoryId, formData);
            showNotification('Kategori başarıyla güncellendi.', 'success');
        } else {
            // Create new category
            response = await AdminAPI.createCategory(formData);
            showNotification('Kategori başarıyla oluşturuldu.', 'success');
        }
        
        // Close the modal
        document.getElementById('categoryModal').classList.remove('show');
        
        // Reload categories
        loadCategories(currentPage);
    } catch (error) {
        showNotification('Kategori kaydedilirken bir hata oluştu.', 'error');
        console.error('Error saving category:', error);
    }
}

/**
 * Open the delete category confirmation modal
 * @param {string} categoryId - The ID of the category to delete
 */
async function openDeleteCategoryModal(categoryId) {
    try {
        // Get category details to check if it has products
        const category = await AdminAPI.getCategoryById(categoryId);
        
        const modal = document.getElementById('deleteCategoryModal');
        document.getElementById('deleteCategoryId').value = categoryId;
        
        // Show warning if category has products
        const hasProductsWarning = document.getElementById('hasCategoryProductsWarning');
        const noProductsWarning = document.getElementById('noCategoryProductsWarning');
        const deleteButton = document.getElementById('confirmDeleteCategory');
        
        if (category.productCount && category.productCount > 0) {
            hasProductsWarning.style.display = 'block';
            noProductsWarning.style.display = 'none';
            document.getElementById('categoryProductCount').textContent = category.productCount;
            deleteButton.disabled = true;
        } else {
            hasProductsWarning.style.display = 'none';
            noProductsWarning.style.display = 'block';
            deleteButton.disabled = false;
        }
        
        // Show the modal
        modal.classList.add('show');
    } catch (error) {
        showNotification('Kategori bilgileri alınırken bir hata oluştu.', 'error');
        console.error('Error getting category details:', error);
    }
}

/**
 * Delete a category
 */
async function deleteCategory() {
    const categoryId = document.getElementById('deleteCategoryId').value;
    
    if (!categoryId) return;
    
    try {
        await AdminAPI.deleteCategory(categoryId);
        
        // Close the modal
        document.getElementById('deleteCategoryModal').classList.remove('show');
        
        // Show success notification
        showNotification('Kategori başarıyla silindi.', 'success');
        
        // Reload categories
        loadCategories(currentPage);
    } catch (error) {
        showNotification('Kategori silinirken bir hata oluştu.', 'error');
        console.error('Error deleting category:', error);
    }
} 