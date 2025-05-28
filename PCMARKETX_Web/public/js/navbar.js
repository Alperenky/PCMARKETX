/**
 * Navbar.js - Navbar işlevleri
 */

// Global showNotification fonksiyonu
function showNotification(message, type = 'info') {
  // Hali hazırda varsa eski bildirimi temizle
  const existingNotification = document.querySelector('.notification');
  if (existingNotification) {
    existingNotification.remove();
  }
  
  // Yeni bildirim oluştur
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.innerHTML = `
    <div class="notification-content">
      <span class="notification-message">${message}</span>
      <button class="notification-close">&times;</button>
    </div>
  `;
  
  // Body'ye ekle
  document.body.appendChild(notification);
  
  // Animasyon için sınıf ekle
  setTimeout(() => {
    notification.classList.add('active');
  }, 10);
  
  // Kapatma butonu işlevi
  const closeBtn = notification.querySelector('.notification-close');
  closeBtn.addEventListener('click', () => {
    notification.classList.remove('active');
    setTimeout(() => {
      notification.remove();
    }, 300); // Animasyon süresi
  });
  
  // Otomatik kapanma
  setTimeout(() => {
    if (notification.parentNode) {
      notification.classList.remove('active');
      setTimeout(() => {
        if (notification.parentNode) {
          notification.remove();
        }
      }, 300); // Animasyon süresi
    }
  }, 5000); // 5 saniye sonra kapat
}

// Belgenin yüklenmesi tamamlandığında çalışacak kod
document.addEventListener('DOMContentLoaded', function() {
    // Kullanıcı menüsünü aç/kapat
    const accountAction = document.getElementById('account-action');
    const userDropdownMenu = document.getElementById('user-dropdown-menu');
    
    if (accountAction && userDropdownMenu) {
        // Menü toggle
        accountAction.addEventListener('click', function(e) {
            e.preventDefault();
            userDropdownMenu.classList.toggle('active');
        });
        
        // Dışarı tıklandığında kapat
        document.addEventListener('click', function(e) {
            if (!accountAction.contains(e.target) && !userDropdownMenu.contains(e.target)) {
                userDropdownMenu.classList.remove('active');
            }
        });
    }
    
    // Mobil menü
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    const mainNav = document.querySelector('.main-nav');
    
    if (mobileToggle && mainNav) {
        mobileToggle.addEventListener('click', function() {
            mainNav.classList.toggle('active');
        });
    }
  
  // Mega menü
  setupMegaMenu();
  
  // Kullanıcı durumunu kontrol et
  updateUserStatus();
  
  // Sepet sayısını güncelle
  updateCartCount();
  
  // Favoriler sayısını güncelle
  updateFavoritesCount();
});

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
  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  
  // Sepet sayısını güncelle
  const count = cart.reduce((total, item) => total + item.quantity, 0);
  cartCountElement.textContent = count;
  
  // Sepet boş değilse animasyon ekle
  if (count > 0) {
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