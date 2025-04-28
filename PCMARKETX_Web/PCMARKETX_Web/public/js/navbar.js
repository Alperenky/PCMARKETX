// Navbar.js - Navbar işlemleri

document.addEventListener('DOMContentLoaded', function() {
  // Mobil menü düğmesi
  setupMobileMenu();
  
  // Mega menü
  setupMegaMenu();
  
  // Kullanıcı durumunu kontrol et
  updateUserStatus();
  
  // Sepet sayısını güncelle
  updateCartCount();
  
  // Favoriler sayısını güncelle
  updateFavoritesCount();
});

// Mobil menü düğmesi
function setupMobileMenu() {
  const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
  const mainNav = document.querySelector('.main-nav');
  const searchBox = document.querySelector('.search-box');
  
  if (mobileMenuToggle && mainNav) {
    mobileMenuToggle.addEventListener('click', function() {
      mainNav.classList.toggle('active');
      this.classList.toggle('active');
      
      // Mobil görünümde arama kutusunu göster/gizle
      if (searchBox && window.innerWidth <= 768) {
        searchBox.classList.toggle('active');
      }
    });
  }
}

// Mega menü
function setupMegaMenu() {
  const categoryToggle = document.querySelector('.category-toggle');
  const megaMenu = document.querySelector('.mega-menu');
  const megaMenuContainer = document.querySelector('.mega-menu-container');
  
  if (categoryToggle && megaMenu && megaMenuContainer) {
    // Masaüstü için hover olayı
    if (window.innerWidth > 768) {
      megaMenuContainer.addEventListener('mouseenter', function() {
        megaMenu.classList.add('active');
      });
      
      megaMenuContainer.addEventListener('mouseleave', function() {
        megaMenu.classList.remove('active');
      });
    }
    
    // Mobil için tıklama olayı
    categoryToggle.addEventListener('click', function(e) {
      e.preventDefault();
      megaMenu.classList.toggle('active');
    });
    
    // Dışarı tıklandığında mega menüyü kapat
    document.addEventListener('click', function(e) {
      if (!megaMenuContainer.contains(e.target)) {
        megaMenu.classList.remove('active');
      }
    });
  }
}

// Kullanıcı durumunu güncelle
function updateUserStatus() {
  // localStorage veya sessionStorage'dan kullanıcı bilgilerini al
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || sessionStorage.getItem('userInfo') || '{}');
  
  // Kullanıcı hesabım butonunu bul
  const accountButton = document.querySelector('.user-action[href="/account.html"]');
  if (!accountButton) return;
  
  // Token varsa kullanıcı giriş yapmış demektir
  if (userInfo && userInfo.token) {
    // Kullanıcı adını göster
    const spanElement = accountButton.querySelector('span');
    if (spanElement) {
      spanElement.textContent = 'Hesabım';
    }
    
    // Link yönlendirmesini güncelle
    accountButton.href = '/profile';
  } else {
    // Kullanıcı giriş yapmamışsa
    const spanElement = accountButton.querySelector('span');
    if (spanElement) {
      spanElement.textContent = 'Giriş Yap';
    }
    
    // Link yönlendirmesini güncelle
    accountButton.href = '/login';
  }
}

// Sepet sayısını güncelle
function updateCartCount() {
  const cartCountElement = document.getElementById('cart-count');
  if (!cartCountElement) return;
  
  // localStorage'dan sepet bilgilerini al
  const cartItems = JSON.parse(localStorage.getItem('cartItems') || '[]');
  
  // Sepet sayısını güncelle
  cartCountElement.textContent = cartItems.length;
  
  // Sepet boş değilse animasyon ekle
  if (cartItems.length > 0) {
    cartCountElement.classList.add('pulse');
    setTimeout(() => {
      cartCountElement.classList.remove('pulse');
    }, 500);
  }
}

// Favoriler sayısını güncelle
function updateFavoritesCount() {
  const favoritesCountElement = document.getElementById('favorites-count');
  if (!favoritesCountElement) return;
  
  // localStorage'dan favoriler bilgilerini al
  const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
  
  // Favoriler sayısını güncelle
  favoritesCountElement.textContent = favorites.length;
}

// Bildirim gösterme
function showNotification(message, type = 'primary') {
  // Bildirim elementi oluştur
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;
  
  // Body'ye ekle
  document.body.appendChild(notification);
  
  // Bildirimi göster
  setTimeout(() => {
    notification.classList.add('show');
  }, 10);
  
  // 3 saniye sonra bildirimi kaldır
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => {
      notification.remove();
    }, 300);
  }, 3000);
}

// Add notification styles
const notificationStyle = document.createElement('style');
notificationStyle.textContent = `
  .notification {
    position: fixed;
    bottom: 20px;
    right: 20px;
    background-color: var(--vatan-primary);
    color: white;
    padding: 12px 20px;
    border-radius: 4px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    transform: translateY(100px);
    opacity: 0;
    transition: transform 0.3s, opacity 0.3s;
    z-index: 1000;
    font-size: 0.9rem;
  }
  
  .notification.show {
    transform: translateY(0);
    opacity: 1;
  }
  
  .notification.success {
    background-color: #4caf50;
  }
  
  .notification.error {
    background-color: #f44336;
  }
  
  .notification.info {
    background-color: #2196f3;
  }
  
  @keyframes pulse {
    0% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.2);
    }
    100% {
      transform: scale(1);
    }
  }
  
  .pulse {
    animation: pulse 0.5s;
  }
`;
document.head.appendChild(notificationStyle); 