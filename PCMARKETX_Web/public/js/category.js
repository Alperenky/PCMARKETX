document.addEventListener('DOMContentLoaded', function() {
  // Initialize category page
  initCategoryPage();
});

// Initialize category page
function initCategoryPage() {
  // Get category slug from URL
  const categorySlug = getCategorySlugFromUrl();
  
  // Set category title and description
  setCategoryInfo(categorySlug);
  
  // Setup filters
  setupFilters();
  
  // Setup pagination
  setupPagination();
  
  // Setup add to cart
  setupAddToCart();
  
  // Setup add to favorites
  setupAddToFavorites();
}

// Load products from API
function loadProducts(page = 1, filters = {}) {
  // Show loading state
  const productGrid = document.getElementById('product-grid');
  if (productGrid) {
    productGrid.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i><p>Ürünler yükleniyor...</p></div>';
  }
  
  // Build API URL with query parameters
  let apiUrl = `/api/products?page=${page}`;
  
  // Add category filter using categoryId (from setCategoryInfo)
  if (filters.categoryId) {
    apiUrl += `&category=${filters.categoryId}`;
  } else {
    // Eğer categoryId yoksa ancak slug varsa, kategori bilgilerini al
    const categorySlug = getCategorySlugFromUrl();
    if (categorySlug) {
      // Bu durumda önce setCategoryInfo çağrılmalı (initCategoryPage içinde)
      return;
    }
  }
  
  // Add sort filter
  if (filters.sort) {
    apiUrl += `&sort=${filters.sort}`;
  }
  
  // Add brand filter
  if (filters.brands && filters.brands.length > 0) {
    apiUrl += `&brands=${filters.brands.join(',')}`;
  }
  
  // Add price filter
  if (filters.priceMin) {
    apiUrl += `&priceMin=${filters.priceMin}`;
  }
  
  if (filters.priceMax) {
    apiUrl += `&priceMax=${filters.priceMax}`;
  }
  
  // Fetch products from API
  fetch(apiUrl)
    .then(response => {
      if (!response.ok) {
        throw new Error('Ürünler yüklenirken bir hata oluştu');
      }
      return response.json();
    })
    .then(data => {
      if (!data.products || data.products.length === 0) {
        if (productGrid) {
          productGrid.innerHTML = '<div class="no-products"><i class="fas fa-box-open"></i><p>Bu kategoride ürün bulunmamaktadır</p></div>';
        }
        
        // Update product count
        const productCount = document.getElementById('product-count');
        if (productCount) {
          productCount.textContent = '0 ürün bulundu';
        }
        
        // Hide pagination
        const pagination = document.getElementById('pagination');
        if (pagination) {
          pagination.style.display = 'none';
        }
      } else {
        // Render products
        renderProducts(data.products, productGrid);
        
        // Update product count
        const productCount = document.getElementById('product-count');
        if (productCount) {
          productCount.textContent = `${data.totalProducts} ürün bulundu`;
        }
        
        // Update pagination
        updatePagination(data.totalProducts, data.currentPage, data.totalPages);
      }
      
      // Load brands for filter
      loadBrands(data.products);
    })
    .catch(error => {
      console.error('Hata:', error);
      if (productGrid) {
        productGrid.innerHTML = `<div class="error"><i class="fas fa-exclamation-triangle"></i><p>${error.message}</p></div>`;
      }
    });
}

// Get category slug from URL
function getCategorySlugFromUrl() {
  const path = window.location.pathname;
  const filename = path.substring(path.lastIndexOf('/') + 1);
  return filename.replace('.html', '');
}

// Set category title and description
function setCategoryInfo(categorySlug) {
  if (!categorySlug) return;
  
  // Fetch category info from API
  fetch(`/api/categories/slug/${categorySlug}`)
    .then(response => {
      if (!response.ok) {
        throw new Error('Kategori bilgileri yüklenirken bir hata oluştu');
      }
      return response.json();
    })
    .then(category => {
      // Update page title
      document.title = `${category.name} - PC MARKET X`;
      
      // Update category title and description
      const categoryTitle = document.querySelector('.category-overlay h1');
      const categoryDescription = document.querySelector('.category-overlay p');
      
      if (categoryTitle) {
        categoryTitle.textContent = category.name;
      }
      
      if (categoryDescription) {
        categoryDescription.textContent = category.description || '';
      }
      
      // Update category banner
      const categoryBanner = document.querySelector('.category-banner img');
      if (categoryBanner && category.imageUrl) {
        categoryBanner.src = category.imageUrl;
      }
      
      // Kategori ID'sini kullanarak ürünleri yükle
      loadProducts(1, { categoryId: category._id });
    })
    .catch(error => {
      console.error('Kategori bilgileri yüklenirken hata:', error);
    });
}

// Render products
function renderProducts(products, container) {
  if (!container) return;
  
  // Clear container
  container.innerHTML = '';
  
  // Add products
  products.forEach(product => {
    const productCard = document.createElement('div');
    productCard.className = 'product-card';
    
    // Add badge if new or has discount
    if (product.isNewProduct) {
      const badge = document.createElement('div');
      badge.className = 'product-badge new';
      badge.textContent = 'Yeni';
      productCard.appendChild(badge);
    } else if (product.discount > 0) {
      const badge = document.createElement('div');
      badge.className = 'product-badge discount';
      badge.textContent = `%${product.discount}`;
      productCard.appendChild(badge);
    }
    
    // Product image
    const productImage = document.createElement('div');
    productImage.className = 'product-image';
    const imageSrc = product.images && product.images.length > 0 ? product.images[0] : '/images/products/placeholder.jpg';
    productImage.innerHTML = `<img src="${imageSrc}" alt="${product.name}">`;
    productCard.appendChild(productImage);
    
    // Product info
    const productInfo = document.createElement('div');
    productInfo.className = 'product-info';
    
    // Brand
    const brand = document.createElement('div');
    brand.className = 'product-brand';
    brand.textContent = product.brand;
    productInfo.appendChild(brand);
    
    // Title
    const title = document.createElement('h3');
    title.className = 'product-title';
    title.textContent = product.name;
    productInfo.appendChild(title);
    
    // Price
    const price = document.createElement('div');
    price.className = 'product-price';
    
    const currentPrice = document.createElement('span');
    currentPrice.className = 'current-price';
    currentPrice.textContent = `${product.price.toLocaleString('tr-TR')} TL`;
    price.appendChild(currentPrice);
    
    if (product.oldPrice) {
      const oldPrice = document.createElement('span');
      oldPrice.className = 'old-price';
      oldPrice.textContent = `${product.oldPrice.toLocaleString('tr-TR')} TL`;
      price.appendChild(oldPrice);
    }
    
    productInfo.appendChild(price);
    
    // Actions
    const actions = document.createElement('div');
    actions.className = 'product-actions';
    
    const addToCartBtn = document.createElement('button');
    addToCartBtn.className = 'btn btn-primary add-to-cart';
    addToCartBtn.innerHTML = '<i class="fas fa-shopping-cart"></i> Sepete Ekle';
    addToCartBtn.dataset.productId = product._id;
    addToCartBtn.dataset.productName = product.name;
    addToCartBtn.dataset.productPrice = product.price;
    actions.appendChild(addToCartBtn);
    
    const addToFavoritesBtn = document.createElement('button');
    addToFavoritesBtn.className = 'add-to-favorites';
    addToFavoritesBtn.innerHTML = '<i class="far fa-heart"></i>';
    addToFavoritesBtn.dataset.productId = product._id;
    addToFavoritesBtn.dataset.productName = product.name;
    actions.appendChild(addToFavoritesBtn);
    
    productInfo.appendChild(actions);
    
    productCard.appendChild(productInfo);
    
    // Add to grid
    container.appendChild(productCard);
  });
  
  // Setup event listeners for new products
  setupAddToCart();
  setupAddToFavorites();
}

// Setup filters
function setupFilters() {
  // Sort options
  const sortOptions = document.getElementById('sort-options');
  if (sortOptions) {
    sortOptions.addEventListener('change', function() {
      const filters = getFilters();
      loadProducts(1, filters);
    });
  }
  
  // Price filter
  const priceFilterBtn = document.getElementById('price-filter-btn');
  if (priceFilterBtn) {
    priceFilterBtn.addEventListener('click', function() {
      const filters = getFilters();
      loadProducts(1, filters);
    });
  }
  
  // Apply filters button
  const applyFiltersBtn = document.querySelector('.apply-filters');
  if (applyFiltersBtn) {
    applyFiltersBtn.addEventListener('click', function() {
      const filters = getFilters();
      loadProducts(1, filters);
    });
  }
  
  // Clear filters button
  const clearFiltersBtn = document.querySelector('.clear-filters');
  if (clearFiltersBtn) {
    clearFiltersBtn.addEventListener('click', function() {
      // Reset sort options
      if (sortOptions) {
        sortOptions.selectedIndex = 0;
      }
      
      // Reset brand filters
      const brandFilters = document.querySelectorAll('#brand-filters input[type="checkbox"]');
      brandFilters.forEach(checkbox => {
        checkbox.checked = checkbox.id === 'brand-all';
      });
      
      // Reset price filters
      const priceMin = document.getElementById('price-min');
      const priceMax = document.getElementById('price-max');
      
      if (priceMin) priceMin.value = '';
      if (priceMax) priceMax.value = '';
      
      // Load products without filters
      loadProducts(1);
    });
  }
}

// Load brands for filter
function loadBrands(products) {
  const brandFilters = document.getElementById('brand-filters');
  if (!brandFilters) return;
  
  // Get all brand checkboxes except "all"
  const existingBrands = Array.from(brandFilters.querySelectorAll('input[type="checkbox"]:not(#brand-all)'))
    .map(checkbox => checkbox.value);
  
  // Get unique brands from products
  const brands = [...new Set(products.map(product => product.brand))];
  
  // Add new brands
  brands.forEach(brand => {
    if (!existingBrands.includes(brand)) {
      const brandDiv = document.createElement('div');
      brandDiv.className = 'filter-checkbox';
      
      const brandInput = document.createElement('input');
      brandInput.type = 'checkbox';
      brandInput.id = `brand-${brand.toLowerCase().replace(/\s+/g, '-')}`;
      brandInput.value = brand;
      
      const brandLabel = document.createElement('label');
      brandLabel.htmlFor = brandInput.id;
      brandLabel.textContent = brand;
      
      brandDiv.appendChild(brandInput);
      brandDiv.appendChild(brandLabel);
      
      brandFilters.appendChild(brandDiv);
      
      // Add event listener
      brandInput.addEventListener('change', function() {
        // If a specific brand is checked, uncheck "all"
        if (this.checked) {
          const allBrand = document.getElementById('brand-all');
          if (allBrand) {
            allBrand.checked = false;
          }
        }
        
        // If no brands are checked, check "all"
        const checkedBrands = brandFilters.querySelectorAll('input[type="checkbox"]:checked:not(#brand-all)');
        if (checkedBrands.length === 0) {
          const allBrand = document.getElementById('brand-all');
          if (allBrand) {
            allBrand.checked = true;
          }
        }
      });
    }
  });
  
  // Add event listener to "all" checkbox
  const allBrand = document.getElementById('brand-all');
  if (allBrand) {
    allBrand.addEventListener('change', function() {
      if (this.checked) {
        // Uncheck all other brands
        const brandCheckboxes = brandFilters.querySelectorAll('input[type="checkbox"]:not(#brand-all)');
        brandCheckboxes.forEach(checkbox => {
          checkbox.checked = false;
        });
      }
    });
  }
}

// Get filters
function getFilters() {
  const filters = {};
  
  // Sort
  const sortOptions = document.getElementById('sort-options');
  if (sortOptions) {
    filters.sort = sortOptions.value;
  }
  
  // Brands
  const brandCheckboxes = document.querySelectorAll('#brand-filters input[type="checkbox"]:checked:not(#brand-all)');
  if (brandCheckboxes.length > 0) {
    filters.brands = Array.from(brandCheckboxes).map(checkbox => checkbox.value);
  }
  
  // Price range
  const priceMin = document.getElementById('price-min');
  const priceMax = document.getElementById('price-max');
  
  if (priceMin && priceMin.value) {
    filters.priceMin = parseFloat(priceMin.value);
  }
  
  if (priceMax && priceMax.value) {
    filters.priceMax = parseFloat(priceMax.value);
  }
  
  return filters;
}

// Setup pagination
function setupPagination() {
  const pagination = document.getElementById('pagination');
  if (!pagination) return;
  
  // Previous button
  const prevButton = pagination.querySelector('.pagination-prev');
  if (prevButton) {
    prevButton.addEventListener('click', function() {
      if (!this.classList.contains('disabled')) {
        const currentPage = parseInt(pagination.dataset.currentPage) || 1;
        if (currentPage > 1) {
          const filters = getFilters();
          loadProducts(currentPage - 1, filters);
        }
      }
    });
  }
  
  // Next button
  const nextButton = pagination.querySelector('.pagination-next');
  if (nextButton) {
    nextButton.addEventListener('click', function() {
      if (!this.classList.contains('disabled')) {
        const currentPage = parseInt(pagination.dataset.currentPage) || 1;
        const totalPages = parseInt(pagination.dataset.totalPages) || 1;
        
        if (currentPage < totalPages) {
          const filters = getFilters();
          loadProducts(currentPage + 1, filters);
        }
      }
    });
  }
  
  // Page numbers will be added dynamically in updatePagination
}

// Update pagination
function updatePagination(totalProducts, currentPage, totalPages) {
  const pagination = document.getElementById('pagination');
  if (!pagination) return;
  
  // Store current page and total pages in dataset
  pagination.dataset.currentPage = currentPage;
  pagination.dataset.totalPages = totalPages;
  
  // Show pagination if there are products
  pagination.style.display = totalProducts > 0 ? 'flex' : 'none';
  
  // Update previous button
  const prevButton = pagination.querySelector('.pagination-prev');
  if (prevButton) {
    prevButton.classList.toggle('disabled', currentPage <= 1);
  }
  
  // Update next button
  const nextButton = pagination.querySelector('.pagination-next');
  if (nextButton) {
    nextButton.classList.toggle('disabled', currentPage >= totalPages);
  }
  
  // Update page numbers
  const paginationNumbers = pagination.querySelector('.pagination-numbers');
  if (paginationNumbers) {
    paginationNumbers.innerHTML = '';
    
    // Determine which page numbers to show
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + 4);
    
    // Adjust if we're near the end
    if (endPage - startPage < 4 && startPage > 1) {
      startPage = Math.max(1, endPage - 4);
    }
    
    // Add first page if not included
    if (startPage > 1) {
      const firstPage = document.createElement('button');
      firstPage.className = 'page-number';
      firstPage.textContent = '1';
      firstPage.addEventListener('click', function() {
        const filters = getFilters();
        loadProducts(1, filters);
      });
      paginationNumbers.appendChild(firstPage);
      
      // Add dots if there's a gap
      if (startPage > 2) {
        const dots = document.createElement('span');
        dots.className = 'page-dots';
        dots.textContent = '...';
        paginationNumbers.appendChild(dots);
      }
    }
    
    // Add page numbers
    for (let i = startPage; i <= endPage; i++) {
      const pageNumber = document.createElement('button');
      pageNumber.className = 'page-number';
      if (i === currentPage) {
        pageNumber.classList.add('active');
      }
      pageNumber.textContent = i;
      
      // Add click event
      pageNumber.addEventListener('click', function() {
        if (i !== currentPage) {
          const filters = getFilters();
          loadProducts(i, filters);
        }
      });
      
      paginationNumbers.appendChild(pageNumber);
    }
    
    // Add last page if not included
    if (endPage < totalPages) {
      // Add dots if there's a gap
      if (endPage < totalPages - 1) {
        const dots = document.createElement('span');
        dots.className = 'page-dots';
        dots.textContent = '...';
        paginationNumbers.appendChild(dots);
      }
      
      const lastPage = document.createElement('button');
      lastPage.className = 'page-number';
      lastPage.textContent = totalPages;
      lastPage.addEventListener('click', function() {
        const filters = getFilters();
        loadProducts(totalPages, filters);
      });
      paginationNumbers.appendChild(lastPage);
    }
  }
}

// Setup Add to Cart Functionality
function setupAddToCart() {
  const addToCartButtons = document.querySelectorAll('.add-to-cart');
  
  addToCartButtons.forEach(button => {
    button.addEventListener('click', function(e) {
      e.preventDefault();
      
      const productId = this.dataset.productId;
      const productName = this.dataset.productName;
      const productPrice = this.dataset.productPrice;
      
      // Add to cart logic
      addToCart(productId, productName, productPrice);
      
      // Show notification
      showNotification(`${productName} sepete eklendi!`, 'success');
    });
  });
}

// Add to Cart Function
function addToCart(productId, productName, productPrice) {
  // Get existing cart from localStorage
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  
  // Check if product already in cart
  const existingProduct = cart.find(item => item.id === productId);
  
  if (existingProduct) {
    // Increase quantity
    existingProduct.quantity += 1;
  } else {
    // Add new product
    cart.push({
      id: productId,
      name: productName,
      price: productPrice,
      quantity: 1
    });
  }
  
  // Save cart to localStorage
  localStorage.setItem('cart', JSON.stringify(cart));
  
  // Update cart count
  updateCartCount(cart.reduce((total, item) => total + item.quantity, 0));
}

// Update Cart Count
function updateCartCount(count) {
  const cartCount = document.getElementById('cart-count');
  if (cartCount) {
    cartCount.textContent = count;
    
    // Add animation
    cartCount.classList.add('pulse');
    setTimeout(() => {
      cartCount.classList.remove('pulse');
    }, 500);
  }
}

// Setup Add to Favorites Functionality
function setupAddToFavorites() {
  const addToFavoritesButtons = document.querySelectorAll('.add-to-favorites');
  
  // Check if products are in favorites
  const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
  
  addToFavoritesButtons.forEach(button => {
    const productId = button.dataset.productId;
    
    // Set initial state
    if (favorites.find(item => item.id === productId)) {
      button.classList.add('active');
    }
    
    button.addEventListener('click', function(e) {
      e.preventDefault();
      
      // Toggle active class
      this.classList.toggle('active');
      
      const productName = this.dataset.productName;
      const isActive = this.classList.contains('active');
      
      // Add/remove from favorites
      if (isActive) {
        addToFavorites(productId, productName);
        showNotification(`${productName} favorilere eklendi!`, 'success');
      } else {
        removeFromFavorites(productId);
        showNotification(`${productName} favorilerden çıkarıldı!`, 'info');
      }
    });
  });
}

// Add to Favorites Function
function addToFavorites(productId, productName) {
  // Get existing favorites from localStorage
  let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
  
  // Check if product already in favorites
  if (!favorites.find(item => item.id === productId)) {
    // Add new product
    favorites.push({
      id: productId,
      name: productName
    });
    
    // Save favorites to localStorage
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }
}

// Remove from Favorites Function
function removeFromFavorites(productId) {
  // Get existing favorites from localStorage
  let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
  
  // Filter out the product
  favorites = favorites.filter(item => item.id !== productId);
  
  // Save favorites to localStorage
  localStorage.setItem('favorites', JSON.stringify(favorites));
}

// Show Notification
function showNotification(message, type = 'info') {
  // Create notification element
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;
  
  // Add to body
  document.body.appendChild(notification);
  
  // Show notification
  setTimeout(() => {
    notification.classList.add('show');
  }, 10);
  
  // Hide and remove notification
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 3000);
} 