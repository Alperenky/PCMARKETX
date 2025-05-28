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
  
  // Product Carousel
  initProductCarousel();
  
  // Add to Cart Functionality
  setupAddToCart();
  
  // Favori butonlarını ayarla
  setupFavoriteButtons();
  
  // Load Products from API
  loadFeaturedProducts();
});

// Initialize Product Carousel
function initProductCarousel() {
  // Check if jQuery is defined first, then check for slick
  if (typeof jQuery !== 'undefined') {
    if (typeof jQuery.fn.slick !== 'undefined') {
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
    } else {
      console.warn('Slick Carousel kütüphanesi bulunamadı');
    }
  } else {
    console.warn('jQuery kütüphanesi bulunamadı');
  }
}

// Setup Add to Cart Functionality
function setupAddToCart() {
  const addToCartButtons = document.querySelectorAll('.add-to-cart');
  
  addToCartButtons.forEach(button => {
    button.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      
      const productId = this.dataset.productId || this.dataset.id;
      const productName = this.dataset.productName || this.dataset.name;
      const productPrice = parseFloat(this.dataset.productPrice || this.dataset.price);
      const productImage = this.dataset.productImage || this.dataset.image;
      
      // Add to cart logic
      addToCart(productId, productName, productPrice, productImage);
    });
  });
}

// Add to Cart Function
function addToCart(productId, productName, productPrice, productImage) {
  try {
    // Önce API çağrısını yap
    fetch('/api/cart/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ productId, quantity: 1 })
    })
    .then(response => response.json())
    .then(responseData => {
      // API çağrısı başarılı olsa da olmasa da localStorage'a kaydet
      // Bu şekilde en azından client-side sepet çalışacaktır
      
      // Get existing cart from localStorage
      let cart = JSON.parse(localStorage.getItem('cart')) || [];
      
      // Check if product already in cart
      const existingProduct = cart.find(item => item.id === productId);
      
      if (existingProduct) {
        // Increase quantity
        existingProduct.quantity += 1;
        showNotification(`${productName} sepetinizdeki miktarı artırıldı!`, 'success');
      } else {
        // Add new product
        cart.push({
          id: productId,
          name: productName,
          price: productPrice,
          image: productImage || '/images/placeholder.png',
          quantity: 1
        });
        showNotification(`${productName} sepetinize eklendi!`, 'success');
      }
      
      // Save cart to localStorage
      localStorage.setItem('cart', JSON.stringify(cart));
      
      // Update cart count
      updateCartCount(cart.reduce((total, item) => total + item.quantity, 0));
    })
    .catch(error => {
      console.error('Sepete ekleme API hatası:', error);
      
      // API hatası durumunda hata yakala, ama yine de localStorage'a ekle
      let cart = JSON.parse(localStorage.getItem('cart')) || [];
      
      // Check if product already in cart
      const existingProduct = cart.find(item => item.id === productId);
      
      if (existingProduct) {
        existingProduct.quantity += 1;
        showNotification(`${productName} sepetinizdeki miktarı artırıldı!`, 'success');
      } else {
        cart.push({
          id: productId,
          name: productName,
          price: productPrice,
          image: productImage || '/images/placeholder.png',
          quantity: 1
        });
        showNotification(`${productName} sepetinize eklendi!`, 'success');
      }
      
      localStorage.setItem('cart', JSON.stringify(cart));
      updateCartCount(cart.reduce((total, item) => total + item.quantity, 0));
    });
  } catch (error) {
    console.error('Sepete ekleme fonksiyonu hatası:', error);
    showNotification('Bir hata oluştu. Lütfen tekrar deneyin.', 'error');
  }
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

// Favori butonlarını ayarlayan fonksiyon
function setupFavoriteButtons() {
  document.querySelectorAll('.add-to-favorites, .btn-favorite').forEach(button => {
    // Önceki event listener'ları temizle
    const newButton = button.cloneNode(true);
    button.parentNode.replaceChild(newButton, button);
    
    // Yeni event listener ekle
    newButton.addEventListener('click', async function(e) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      
      const productId = this.dataset.productId || this.dataset.id;
      const isFavorite = this.classList.contains('active');
      const icon = this.querySelector('i');

      try {
        // Kullanıcı bilgilerini kontrol et
        const userInfo = JSON.parse(localStorage.getItem('userInfo') || sessionStorage.getItem('userInfo') || '{}');
        if (!userInfo.token) {
          // Kullanıcı giriş yapmamışsa, mevcut sayfanın URL'sini kaydet ve login'e yönlendir
          localStorage.setItem('redirectAfterLogin', window.location.href);
          showNotification('Favorilere eklemek için giriş yapmalısınız', 'warning');
          setTimeout(() => {
            window.location.href = '/login';
          }, 2000);
          return;
        }
        
        if (isFavorite) {
          const response = await fetch(`/api/users/favorites/${productId}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${userInfo.token}`
            }
          });
          
          if (!response.ok) {
            throw new Error('Favori kaldırılamadı');
          }
          
          this.classList.remove('active');
          if (icon) {
            icon.classList.replace('fas', 'far');
          }
          showNotification('Ürün favorilerden çıkarıldı', 'info');
        } else {
          const response = await fetch('/api/users/favorites', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${userInfo.token}`
            },
            body: JSON.stringify({ productId })
          });
          
          if (!response.ok) {
            throw new Error('Favorilere eklenemedi');
          }
          
          this.classList.add('active');
          if (icon) {
            icon.classList.replace('far', 'fas');
          }
          showNotification('Ürün favorilere eklendi', 'success');
        }
        
        // Favori sayısını güncelle
        updateFavoriteCount();
      } catch (error) {
        console.error('Favori işlemi sırasında hata:', error);
        showNotification('Bir hata oluştu. Lütfen tekrar deneyin.', 'error');
      }
    });
  });
}

// Favori sayısını güncelleme
async function updateFavoriteCount() {
  try {
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || sessionStorage.getItem('userInfo') || '{}');
    if (!userInfo.token) return;

    // Favorileri al
    const response = await fetch('/api/users/favorites', {
      headers: {
        'Authorization': `Bearer ${userInfo.token}`
      }
    });
    
    if (!response.ok) {
      console.error('Favorileri alma hatası:', response.status, response.statusText);
      return;
    }
    
    const favorites = await response.json();
    const favoriteCount = Array.isArray(favorites) ? favorites.length : 0;
    
    // Navbar'daki favori sayısını güncelle
    const favoriteBadge = document.querySelector('.user-dropdown .dropdown-menu a[href="/favorites"] .badge');
    if (favoriteBadge) {
      favoriteBadge.textContent = favoriteCount;
      favoriteBadge.style.display = favoriteCount > 0 ? 'flex' : 'none';
    }
  } catch (error) {
    console.error('Favori sayısı güncellenirken hata:', error);
    // Hata mesajını göster ama uygulamanın çalışmasına izin ver
  }
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
    productImage.innerHTML = `
      <a href="/product-detail.html?id=${product._id}">
        <img src="${imageSrc}" alt="${product.name}">
      </a>
    `;
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
    title.innerHTML = `<a href="/product-detail.html?id=${product._id}">${product.name}</a>`;
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
  setupFavoriteButtons();
}

// Initialize cart count on page load
function initCartCount() {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  const count = cart.reduce((total, item) => total + item.quantity, 0);
  updateCartCount(count);
}

// Initialize favorites on page load
function initFavorites() {
  // Favorileri yükleme işlemini gerçekleştir
  setTimeout(() => {
    initializeFavoritesData();
  }, 500);
}

// Favorileri başlatma
async function initializeFavoritesData() {
  try {
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || sessionStorage.getItem('userInfo') || '{}');
    if (!userInfo.token) return;

    // Favorileri al
    const response = await fetch('/api/users/favorites', {
      headers: {
        'Authorization': `Bearer ${userInfo.token}`
      }
    });

    if (!response.ok) return;

    const favorites = await response.json();
    const favoriteIds = favorites.map(fav => fav._id);

    // Tüm favori butonlarını güncelle
    document.querySelectorAll('.add-to-favorites, .btn-favorite').forEach(button => {
      const productId = button.dataset.productId || button.dataset.id;
      if (favoriteIds.includes(productId)) {
        button.classList.add('active');
        const icon = button.querySelector('i');
        if (icon) {
          icon.classList.replace('far', 'fas');
        }
      }
    });

    // Favori sayısını güncelle
    updateFavoriteCount();
  } catch (error) {
    console.error('Favoriler yüklenirken hata:', error);
  }
}

// Call initialization functions
initCartCount();
initFavorites(); 