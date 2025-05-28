// Cart functionality
document.addEventListener('DOMContentLoaded', function() {
  // Ana sayfadaki slider, popüler ürünler veya yeni ürün içeriklerini kaldır
  // Bunlar ana sayfaya özel içeriklerdir, sepet sayfasında olmamalıdır
  removeHomePageContent();
  
  // Load navbar
  if (document.getElementById('navbar-container')) {
    fetch('/components/navbar.html')
      .then(response => {
        if (!response.ok) {
          throw new Error('Navbar yüklenirken bir hata oluştu');
        }
        return response.text();
      })
      .then(data => {
        document.getElementById('navbar-container').innerHTML = data;
        
        // Sepet bağlantısına özel tıklama olayı ekle
        const cartLink = document.getElementById('cart-link');
        if (cartLink) {
          cartLink.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = '/html/cart.html';
          });
        }
        
        // Dropdown menülerin açılıp kapanması için olay dinleyicileri ekle
        setupDropdowns();
        
        // Kullanıcı durumunu güncelle
        if (typeof updateUserStatus === 'function') {
          updateUserStatus();
        }
        
        // Sepet sayısını güncelle
        updateCartCount();
      })
      .catch(error => {
        console.error('Navbar yüklenirken hata:', error);
        document.getElementById('navbar-container').innerHTML = '<div class="error">Menü yüklenemedi</div>';
      });
  }
  
  // Load cart items
  loadCart();
  
  // Load recommended products
  loadRecommendedProducts();
  
  // Event listeners
  document.getElementById('apply-coupon').addEventListener('click', applyCoupon);
  document.getElementById('checkout-btn').addEventListener('click', proceedToCheckout);
});

// Dropdown menüleri kurma
function setupDropdowns() {
  const dropdowns = document.querySelectorAll('.dropdown');
    
  dropdowns.forEach(dropdown => {
    const toggle = dropdown.querySelector('.dropdown-toggle');
    const menu = dropdown.querySelector('.dropdown-menu');
    
    // Tıklama ile açma/kapama
    if (toggle) {
      toggle.addEventListener('click', function(e) {
        e.preventDefault();
        dropdown.classList.toggle('active');
      });
    }
    
    // Hover ile açma/kapama
    dropdown.addEventListener('mouseenter', function() {
      this.classList.add('active');
    });
    
    dropdown.addEventListener('mouseleave', function() {
      this.classList.remove('active');
    });
  });
  
  // Mobil menü açma/kapama
  const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
  const mainNav = document.querySelector('.main-nav');
  
  if (mobileMenuToggle && mainNav) {
    mobileMenuToggle.addEventListener('click', function() {
      mainNav.classList.toggle('active');
    });
  }
}

// Ana sayfa içeriklerini temizleme fonksiyonu
function removeHomePageContent() {
  // Ana sayfaya özel bölümleri seçme ve silme
  const slidersToRemove = document.querySelectorAll('.modern-hero-section, .modern-slider-wrapper');
  const sectionsToRemove = document.querySelectorAll('.popular-products, .new-products, .advantages');
  
  // Slider ve modern hero bölümlerini kaldırma
  slidersToRemove.forEach(element => {
    if (element && element.parentNode) {
      element.parentNode.removeChild(element);
    }
  });
  
  // Popüler ürünler, yeni ürünler ve avantajlar bölümlerini kaldırma
  sectionsToRemove.forEach(element => {
    if (element && element.parentNode) {
      element.parentNode.removeChild(element);
    }
  });
  
  // Ana sayfa JS dosyalarının yüklenmesini engelleme
  // Modern slider, yeni ürünler ve popüler ürünler JS dosyalarını yüklememek için
  // bu dosyalara ait script elementlerini kaldırıyoruz
  const scriptsToRemove = Array.from(document.querySelectorAll('script')).filter(script => {
    const src = script.getAttribute('src') || '';
    return src.includes('modern-slider.js') || 
           src.includes('featured-products.js') || 
           src.includes('new-products.js') ||
           src.includes('main.js');
  });
  
  scriptsToRemove.forEach(script => {
    if (script && script.parentNode) {
      script.parentNode.removeChild(script);
    }
  });
  
  // Sayfa başlığını doğru şekilde ayarlama
  document.title = "Sepetim - PC MARKET X";
}

// Cart data structure
let cart = [];
const SHIPPING_THRESHOLD = 500; // Free shipping for orders over 500 TL
const SHIPPING_COST = 29.99;
let appliedCoupon = null;

// Load cart from localStorage
function loadCart() {
  const savedCart = localStorage.getItem('cart');
  
  if (savedCart) {
    cart = JSON.parse(savedCart);
  }
  
  renderCart();
  updateCartSummary();
}

// Render cart items
function renderCart() {
  const cartItemsContainer = document.getElementById('cart-items');
  const emptyCartElement = document.getElementById('empty-cart');
  
  // Clear previous items except empty cart message
  const items = cartItemsContainer.querySelectorAll('.cart-item');
  items.forEach(item => item.remove());
  
  if (cart.length === 0) {
    // Show empty cart message
    emptyCartElement.style.display = 'block';
    return;
  }
  
  // Hide empty cart message
  emptyCartElement.style.display = 'none';
  
  // Add cart items
  cart.forEach((item, index) => {
    const cartItem = document.createElement('div');
    cartItem.className = 'cart-item';
    cartItem.innerHTML = `
      <div class="cart-item-image">
        <img src="${item.image}" alt="${item.name}" class="product-image">
      </div>
      <div class="cart-item-details">
        <h3 class="cart-item-title">${item.name}</h3>
        <div class="cart-item-price">${formatPrice(item.price)} ₺</div>
        <div class="cart-item-actions">
          <div class="quantity-control">
            <button class="quantity-btn minus" data-index="${index}">-</button>
            <input type="number" class="quantity-input" value="${item.quantity}" min="1" max="99" data-index="${index}">
            <button class="quantity-btn plus" data-index="${index}">+</button>
          </div>
          <div class="item-total">${formatPrice(item.price * item.quantity)} ₺</div>
          <div class="remove-item" data-index="${index}">
            <i class="fas fa-trash-alt"></i> Kaldır
          </div>
        </div>
      </div>
    `;
    
    cartItemsContainer.insertBefore(cartItem, emptyCartElement);
  });
  
  // Add event listeners to quantity buttons and remove buttons
  const minusButtons = document.querySelectorAll('.quantity-btn.minus');
  const plusButtons = document.querySelectorAll('.quantity-btn.plus');
  const quantityInputs = document.querySelectorAll('.quantity-input');
  const removeButtons = document.querySelectorAll('.remove-item');
  
  minusButtons.forEach(button => {
    button.addEventListener('click', decreaseQuantity);
  });
  
  plusButtons.forEach(button => {
    button.addEventListener('click', increaseQuantity);
  });
  
  quantityInputs.forEach(input => {
    input.addEventListener('change', updateQuantity);
  });
  
  removeButtons.forEach(button => {
    button.addEventListener('click', removeItem);
  });
}

// Decrease item quantity
function decreaseQuantity(event) {
  const index = event.target.dataset.index;
  if (cart[index].quantity > 1) {
    cart[index].quantity--;
    saveCart();
    renderCart();
    updateCartSummary();
  }
}

// Increase item quantity
function increaseQuantity(event) {
  const index = event.target.dataset.index;
  cart[index].quantity++;
  saveCart();
  renderCart();
  updateCartSummary();
}

// Update item quantity from input
function updateQuantity(event) {
  const index = event.target.dataset.index;
  const newQuantity = parseInt(event.target.value);
  
  if (newQuantity > 0 && newQuantity <= 99) {
    cart[index].quantity = newQuantity;
  } else if (newQuantity > 99) {
    cart[index].quantity = 99;
  } else {
    cart[index].quantity = 1;
  }
  
  saveCart();
  renderCart();
  updateCartSummary();
}

// Remove item from cart
function removeItem(event) {
  const index = event.target.closest('.remove-item').dataset.index;
  // Silinen ürün bilgisini tutuyoruz
  const removedItem = cart[index];
  
  cart.splice(index, 1);
  saveCart();
  renderCart();
  updateCartSummary();
  updateCartCount();
  
  // Silme animasyonu sonrası bildirim gösterme
  showNotification(`${removedItem.name} sepetten çıkarıldı`, 'info');
}

// Update cart summary
function updateCartSummary() {
  const subtotalElement = document.getElementById('subtotal');
  const shippingElement = document.getElementById('shipping');
  const discountElement = document.getElementById('discount');
  const discountContainer = document.getElementById('discount-container');
  const totalElement = document.getElementById('total');
  const checkoutButton = document.getElementById('checkout-btn');
  
  // Calculate subtotal
  const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  
  // Calculate shipping
  const shipping = subtotal >= SHIPPING_THRESHOLD || subtotal === 0 ? 0 : SHIPPING_COST;
  
  // Calculate discount
  let discount = 0;
  if (appliedCoupon && subtotal >= appliedCoupon.minAmount) {
    discount = subtotal * appliedCoupon.discount;
  } else if (appliedCoupon && subtotal < appliedCoupon.minAmount) {
    // Reset coupon if minimum amount is not met
    const minAmount = appliedCoupon.minAmount;
    appliedCoupon = null;
    document.getElementById('coupon-message').textContent = `Kupon için minimum sepet tutarı: ${minAmount} ₺`;
    document.getElementById('coupon-message').style.color = '#78767b';
  }
  
  // Calculate total
  const total = subtotal + shipping - discount;
  
  // Update elements
  subtotalElement.textContent = `${formatPrice(subtotal)} ₺`;
  shippingElement.textContent = shipping === 0 ? 'Ücretsiz' : `${formatPrice(shipping)} ₺`;
  
  if (discount > 0) {
    discountElement.textContent = `-${formatPrice(discount)} ₺`;
    discountContainer.style.display = 'flex';
  } else {
    discountContainer.style.display = 'none';
  }
  
  totalElement.textContent = `${formatPrice(total)} ₺`;
  
  // Enable/disable checkout button
  checkoutButton.disabled = cart.length === 0;
  
  // Kargo bilgisi güncelleme
  const freeShippingInfo = document.getElementById('free-shipping-info');
  if (freeShippingInfo) {
    if (subtotal >= SHIPPING_THRESHOLD) {
      freeShippingInfo.textContent = 'Ücretsiz kargo kazandınız!';
      freeShippingInfo.classList.add('success');
    } else {
      const remaining = SHIPPING_THRESHOLD - subtotal;
      freeShippingInfo.textContent = `${formatPrice(remaining)} ₺ daha ekleyin, ücretsiz kargo kazanın!`;
      freeShippingInfo.classList.remove('success');
    }
  }
}

// Apply coupon
function applyCoupon() {
  const couponInput = document.getElementById('coupon-code');
  const couponMessage = document.getElementById('coupon-message');
  const couponCode = couponInput.value.trim().toUpperCase();
  
  if (!couponCode) {
    couponMessage.textContent = 'Lütfen bir kupon kodu girin';
    couponMessage.style.color = '#78767b';
    return;
  }
  
  // API'den kupon doğrulama
  fetch(`/api/coupons/validate?code=${couponCode}`)
    .then(response => response.json())
    .then(data => {
      if (data.valid) {
        appliedCoupon = data.coupon;
        const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
        
        if (subtotal < appliedCoupon.minAmount) {
          couponMessage.textContent = `Bu kupon için minimum sepet tutarı: ${appliedCoupon.minAmount} ₺`;
          couponMessage.style.color = '#78767b';
          appliedCoupon = null;
        } else {
          couponMessage.textContent = `%${Math.round(appliedCoupon.discount * 100)} indirim uygulandı!`;
          couponMessage.style.color = '#4caf50';
        }
      } else {
        couponMessage.textContent = data.message || 'Geçersiz kupon kodu';
        couponMessage.style.color = '#78767b';
      }
      
      updateCartSummary();
    })
    .catch(error => {
      console.error('Kupon doğrulama hatası:', error);
      couponMessage.textContent = 'Kupon doğrulanırken bir hata oluştu';
      couponMessage.style.color = '#78767b';
    });
}

// Proceed to checkout
function proceedToCheckout() {
  // Ödeme sayfasına yönlendirme
  window.location.href = '/checkout.html';
}

// Update cart count in navbar
function updateCartCount() {
  const cartCountElement = document.getElementById('cart-count');
  if (cartCountElement) {
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    cartCountElement.textContent = count;
    
    // Animasyon ekle
    cartCountElement.classList.add('pulse');
    setTimeout(() => {
      cartCountElement.classList.remove('pulse');
    }, 500);
  }
}

// Save cart to localStorage
function saveCart() {
  localStorage.setItem('cart', JSON.stringify(cart));
}

// Format price with thousand separator
function formatPrice(price) {
  return price.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

// Load recommended products
function loadRecommendedProducts() {
  const productsContainer = document.getElementById('recommended-products');
  
  // API'den önerilen ürünleri çek
  fetch('/api/products/recommended')
    .then(response => response.json())
    .then(products => {
      // Container'ı temizle
      productsContainer.innerHTML = '';
      
      // Her bir ürün için kart oluştur
      products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.innerHTML = `
          <div class="product-image">
            <img src="${product.image}" alt="${product.name}">
            <div class="product-badges">
              ${product.isNew ? '<span class="badge new">Yeni</span>' : ''}
              ${product.discount > 0 ? `<span class="badge discount">%${product.discount}</span>` : ''}
            </div>
            <div class="product-actions">
              <button class="add-to-cart" data-id="${product._id}" data-name="${product.name}" data-price="${product.price}" data-image="${product.image}">
                <i class="fas fa-shopping-cart"></i> Sepete Ekle
              </button>
              <button class="add-to-favorites" data-id="${product._id}">
                <i class="far fa-heart"></i>
              </button>
            </div>
          </div>
          <div class="product-info">
            <h3 class="product-title">${product.name}</h3>
            <div class="product-price">
              ${product.oldPrice ? `<span class="old-price">${formatPrice(product.oldPrice)} ₺</span>` : ''}
              <span class="current-price">${formatPrice(product.price)} ₺</span>
            </div>
            ${product.stock <= 5 ? `<div class="stock-info">Son ${product.stock} ürün!</div>` : ''}
          </div>
        `;
        
        productsContainer.appendChild(productCard);
      });
      
      // Add event listeners to add to cart buttons
      const addToCartButtons = document.querySelectorAll('.add-to-cart');
      addToCartButtons.forEach(button => {
        button.addEventListener('click', addToCart);
      });
      
      // Favori butonlarına olay dinleyicileri ekle
      setupFavoriteButtons();
    })
    .catch(error => {
      console.error('Önerilen ürünleri yükleme hatası:', error);
      productsContainer.innerHTML = '<p class="error-message">Ürünler yüklenirken bir hata oluştu.</p>';
    });
}

// Add product to cart
function addToCart(event) {
  const button = event.currentTarget;
  const productId = button.dataset.id;
  const productName = button.dataset.name;
  const productPrice = parseFloat(button.dataset.price);
  const productImage = button.dataset.image;
  
  // Check if product is already in cart
  const existingItemIndex = cart.findIndex(item => item.id === productId);
  
  if (existingItemIndex !== -1) {
    // Increase quantity if product is already in cart
    cart[existingItemIndex].quantity++;
    showNotification(`${productName} sepetinizdeki miktarı artırıldı!`, 'success');
  } else {
    // Add new product to cart
    cart.push({
      id: productId,
      name: productName,
      price: productPrice,
      image: productImage,
      quantity: 1
    });
    showNotification(`${productName} sepetinize eklendi!`, 'success');
  }
  
  // Save cart and update UI
  saveCart();
  renderCart();
  updateCartSummary();
  updateCartCount();
}

// Setup favorite buttons
function setupFavoriteButtons() {
  document.querySelectorAll('.add-to-favorites').forEach(button => {
    button.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      
      const productId = this.dataset.id;
      const productName = this.dataset.name || 'Ürün';
      const icon = this.querySelector('i');
      const isFavorite = this.classList.contains('active');
      
      // Kullanıcı giriş yapmış mı kontrol et
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || sessionStorage.getItem('userInfo') || '{}');
      if (!userInfo.token) {
        showNotification('Favorilere eklemek için giriş yapmalısınız', 'warning');
        return;
      }
      
      if (isFavorite) {
        // Favorilerden çıkar
        this.classList.remove('active');
        if (icon) icon.classList.replace('fas', 'far');
        showNotification(`${productName} favorilerinizden çıkarıldı`, 'info');
      } else {
        // Favorilere ekle
        this.classList.add('active');
        if (icon) icon.classList.replace('far', 'fas');
        showNotification(`${productName} favorilerinize eklendi`, 'success');
      }
    });
  });
}

// Show notification
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.innerHTML = `
    <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'warning' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
    <span>${message}</span>
  `;
  
  document.body.appendChild(notification);
  
  // Show notification
  setTimeout(() => {
    notification.classList.add('show');
  }, 10);
  
  // Hide notification after 3 seconds
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => {
      notification.remove();
    }, 300);
  }, 3000);
} 