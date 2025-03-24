// Cart functionality
document.addEventListener('DOMContentLoaded', function() {
  // Load navbar
  if (document.getElementById('navbar-container')) {
    fetch('/components/navbar.html')
      .then(response => response.text())
      .then(data => {
        document.getElementById('navbar-container').innerHTML = data;
        
        // Initialize navbar functionality after loading
        if (typeof initNavbar === 'function') {
          initNavbar();
        }
        
        // Update cart count
        updateCartCount();
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
      <img src="${item.image}" alt="${item.name}" class="cart-item-image">
      <div class="cart-item-details">
        <h3 class="cart-item-title">${item.name}</h3>
        <div class="cart-item-price">${formatPrice(item.price)} ₺</div>
        <div class="cart-item-actions">
          <div class="quantity-control">
            <button class="quantity-btn minus" data-index="${index}">-</button>
            <input type="number" class="quantity-input" value="${item.quantity}" min="1" max="99" data-index="${index}">
            <button class="quantity-btn plus" data-index="${index}">+</button>
          </div>
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
  cart.splice(index, 1);
  saveCart();
  renderCart();
  updateCartSummary();
  updateCartCount();
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
    document.getElementById('coupon-message').style.color = '#e81f2a';
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
}

// Apply coupon
function applyCoupon() {
  const couponInput = document.getElementById('coupon-code');
  const couponMessage = document.getElementById('coupon-message');
  const couponCode = couponInput.value.trim().toUpperCase();
  
  if (!couponCode) {
    couponMessage.textContent = 'Lütfen bir kupon kodu girin';
    couponMessage.style.color = '#e81f2a';
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
          couponMessage.style.color = '#e81f2a';
          appliedCoupon = null;
        } else {
          couponMessage.textContent = `%${Math.round(appliedCoupon.discount * 100)} indirim uygulandı!`;
          couponMessage.style.color = '#4caf50';
        }
      } else {
        couponMessage.textContent = data.message || 'Geçersiz kupon kodu';
        couponMessage.style.color = '#e81f2a';
      }
      
      updateCartSummary();
    })
    .catch(error => {
      console.error('Kupon doğrulama hatası:', error);
      couponMessage.textContent = 'Kupon doğrulanırken bir hata oluştu';
      couponMessage.style.color = '#e81f2a';
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
            <div class="product-price">${formatPrice(product.price)} ₺</div>
          </div>
        `;
        
        productsContainer.appendChild(productCard);
      });
      
      // Add event listeners to add to cart buttons
      const addToCartButtons = document.querySelectorAll('.add-to-cart');
      addToCartButtons.forEach(button => {
        button.addEventListener('click', addToCart);
      });
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
  } else {
    // Add new product to cart
    cart.push({
      id: productId,
      name: productName,
      price: productPrice,
      image: productImage,
      quantity: 1
    });
  }
  
  // Save cart and update UI
  saveCart();
  renderCart();
  updateCartSummary();
  updateCartCount();
  
  // Show success message
  showNotification(`${productName} sepete eklendi!`, 'success');
}

// Show notification
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.innerHTML = `
    <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-info-circle'}"></i>
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