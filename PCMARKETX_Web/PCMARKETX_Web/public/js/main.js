document.addEventListener('DOMContentLoaded', function() {
  // Navbar Mobile Toggle
  const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
  const mainNav = document.querySelector('.main-nav');
  
  if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener('click', function() {
      mainNav.classList.toggle('active');
    });
  }
  
  // Category Dropdown Toggle for Mobile
  const categoryDropdowns = document.querySelectorAll('.category-dropdown');
  
  categoryDropdowns.forEach(dropdown => {
    const link = dropdown.querySelector('a');
    if (window.innerWidth <= 768) {
      link.addEventListener('click', function(e) {
        e.preventDefault();
        dropdown.classList.toggle('active');
      });
    }
  });
  
  // Hero Slider
  initHeroSlider();
  
  // Product Carousel
  initProductCarousel();
  
  // Add to Cart Functionality
  setupAddToCart();
  
  // Add to Favorites Functionality
  setupAddToFavorites();
  
  // Load Products from API
  loadFeaturedProducts();
});

// Initialize Hero Slider
function initHeroSlider() {
  const heroSlider = document.querySelector('.hero-slider');
  if (!heroSlider) return;
  
  // If using a library like Slick
  if (typeof $.fn.slick !== 'undefined') {
    $('.hero-slider').slick({
      dots: true,
      arrows: true,
      infinite: true,
      speed: 500,
      fade: true,
      cssEase: 'linear',
      autoplay: true,
      autoplaySpeed: 5000,
      prevArrow: '<button class="slick-prev"><i class="fas fa-chevron-left"></i></button>',
      nextArrow: '<button class="slick-next"><i class="fas fa-chevron-right"></i></button>'
    });
  } else {
    // Manual slider implementation
    const slides = heroSlider.querySelectorAll('.hero-slide');
    const dots = heroSlider.querySelectorAll('.slick-dots li');
    const prevBtn = heroSlider.querySelector('.slick-prev');
    const nextBtn = heroSlider.querySelector('.slick-next');
    
    let currentSlide = 0;
    
    function showSlide(index) {
      slides.forEach((slide, i) => {
        slide.style.display = i === index ? 'flex' : 'none';
      });
      
      dots.forEach((dot, i) => {
        dot.classList.toggle('slick-active', i === index);
      });
      
      currentSlide = index;
    }
    
    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        let index = currentSlide - 1;
        if (index < 0) index = slides.length - 1;
        showSlide(index);
      });
    }
    
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        let index = currentSlide + 1;
        if (index >= slides.length) index = 0;
        showSlide(index);
      });
    }
    
    dots.forEach((dot, i) => {
      dot.addEventListener('click', () => {
        showSlide(i);
      });
    });
    
    // Auto slide
    setInterval(() => {
      let index = currentSlide + 1;
      if (index >= slides.length) index = 0;
      showSlide(index);
    }, 5000);
    
    // Show first slide
    showSlide(0);
  }
}

// Initialize Product Carousel
function initProductCarousel() {
  // If using a library like Slick
  if (typeof $.fn.slick !== 'undefined') {
    $('.product-carousel').slick({
      dots: false,
      arrows: true,
      infinite: false,
      speed: 300,
      slidesToShow: 5,
      slidesToScroll: 1,
      prevArrow: '<button class="slick-prev"><i class="fas fa-chevron-left"></i></button>',
      nextArrow: '<button class="slick-next"><i class="fas fa-chevron-right"></i></button>',
      responsive: [
        {
          breakpoint: 1200,
          settings: {
            slidesToShow: 4
          }
        },
        {
          breakpoint: 992,
          settings: {
            slidesToShow: 3
          }
        },
        {
          breakpoint: 768,
          settings: {
            slidesToShow: 2
          }
        },
        {
          breakpoint: 576,
          settings: {
            slidesToShow: 2
          }
        }
      ]
    });
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
  
  addToFavoritesButtons.forEach(button => {
    button.addEventListener('click', function(e) {
      e.preventDefault();
      
      // Toggle active class
      this.classList.toggle('active');
      
      const productId = this.dataset.productId;
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

// Load Featured Products from API
function loadFeaturedProducts() {
  // API endpoint
  const apiUrl = '/api/products/featured';
  
  // Show loading state
  const productGrid = document.querySelector('.product-grid');
  if (productGrid) {
    productGrid.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i><p>Ürünler yükleniyor...</p></div>';
  }
  
  // Fetch products from API
  fetch(apiUrl)
    .then(response => {
      if (!response.ok) {
        throw new Error('Ürünler yüklenirken bir hata oluştu');
      }
      return response.json();
    })
    .then(products => {
      if (products.length === 0) {
        if (productGrid) {
          productGrid.innerHTML = '<div class="no-products"><i class="fas fa-box-open"></i><p>Henüz ürün bulunmamaktadır</p></div>';
        }
      } else {
        renderProducts(products);
      }
    })
    .catch(error => {
      console.error('Hata:', error);
      if (productGrid) {
        productGrid.innerHTML = `<div class="error"><i class="fas fa-exclamation-triangle"></i><p>${error.message}</p></div>`;
      }
    });
}

// Render Products
function renderProducts(products) {
  const productGrid = document.querySelector('.product-grid');
  if (!productGrid) return;
  
  // Clear existing products
  productGrid.innerHTML = '';
  
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
    productGrid.appendChild(productCard);
  });
  
  // Setup event listeners for new products
  setupAddToCart();
  setupAddToFavorites();
}

// Initialize cart count on page load
function initCartCount() {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  const count = cart.reduce((total, item) => total + item.quantity, 0);
  updateCartCount(count);
}

// Initialize favorites on page load
function initFavorites() {
  const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
  const buttons = document.querySelectorAll('.add-to-favorites');
  
  buttons.forEach(button => {
    const productId = button.dataset.productId;
    if (favorites.find(item => item.id === productId)) {
      button.classList.add('active');
    }
  });
}

// Call initialization functions
initCartCount();
initFavorites(); 