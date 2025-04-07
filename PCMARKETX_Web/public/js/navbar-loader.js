/**
 * Navbar Loader - Dinamik olarak navbar içeriğini yükler
 */
document.addEventListener('DOMContentLoaded', function() {
    const navbarContainer = document.getElementById('navbar-container');
    
    if (!navbarContainer) {
        console.error('Navbar container bulunamadı!');
        return;
    }
    
    // Navbar HTML yapısını oluştur
    const navbarHTML = `
        
        <!-- Main Header -->
        <header class="main-header">
            <div class="container">
                <div class="header-content">
                    <div class="logo">
                        <a href="/">
                            <img src="/images/logo.png" alt="PC MARKET X">
                        </a>
                    </div>
                    
                    <div class="search-box">
                        <form action="/search" method="GET">
                            <input type="text" name="q" placeholder="Ürün, kategori veya marka ara...">
                            <button type="submit"><i class="fas fa-search"></i></button>
                        </form>
                    </div>
                    
                    <div class="user-actions">
                        <a href="/favorites.html" class="user-action">
                            <i class="fas fa-heart"></i>
                            <span>Favorilerim</span>
                            <span class="badge" id="favorites-count">0</span>
                        </a>
                        <a href="/cart.html" class="user-action">
                            <i class="fas fa-shopping-cart"></i>
                            <span>Sepetim</span>
                            <span class="badge" id="cart-count">0</span>
                        </a>
                        <div class="user-dropdown">
                            <a href="#" class="user-action" id="account-action">
                                <i class="fas fa-user"></i>
                                <span>Hesabım</span>
                                <i class="fas fa-chevron-down"></i>
                            </a>
                            <div class="dropdown-menu" id="user-dropdown-menu">
                                <!-- Menü içeriği updateUserStatus fonksiyonunda dinamik olarak güncellenir -->
                            </div>
                        </div>
                    </div>

                    <button class="mobile-menu-toggle">
                        <i class="fas fa-bars"></i>
                    </button>
                </div>
            </div>
        </header>
        
        <!-- Main Navigation -->
        <nav class="main-nav">
            <div class="container">
                <div class="nav-list">
                    <div class="mega-menu-container">
                        <a href="#" class="category-toggle">
                            <i class="fas fa-bars"></i>
                            <span>Kategoriler</span>
                        </a>
                        <div class="mega-menu">
                            <div class="mega-menu-content">
                                <div class="mega-menu-column">
                                    <h3>Bilgisayar Bileşenleri</h3>
                                    <ul>
                                        <li><a href="/category/islemciler.html"><i class="fas fa-microchip"></i> İşlemciler</a></li>
                                        <li><a href="/category/ekran-kartlari.html"><i class="fas fa-tv"></i> Ekran Kartları</a></li>
                                        <li><a href="/category/anakartlar.html"><i class="fas fa-server"></i> Anakartlar</a></li>
                                        <li><a href="/category/ram.html"><i class="fas fa-memory"></i> RAM</a></li>
                                        <li><a href="/category/depolama.html"><i class="fas fa-hdd"></i> Depolama</a></li>
                                        <li><a href="/category/guc-kaynaklari.html"><i class="fas fa-plug"></i> Güç Kaynakları</a></li>
                                    </ul>
                                </div>
                                <div class="mega-menu-column">
                                    <h3>Bilgisayar Donanımları</h3>
                                    <ul>
                                        <li><a href="/category/kasalar.html"><i class="fas fa-desktop"></i> Bilgisayar Kasaları</a></li>
                                        <li><a href="/category/sogutma-sistemleri.html"><i class="fas fa-fan"></i> Soğutma Sistemleri</a></li>
                                        <li><a href="/category/monitorler.html"><i class="fas fa-desktop"></i> Monitörler</a></li>
                                    </ul>
                                </div>
                                <div class="mega-menu-column">
                                    <h3>Çevre Birimleri</h3>
                                    <ul>
                                        <li><a href="/category/klavyeler.html"><i class="fas fa-keyboard"></i> Klavyeler</a></li>
                                        <li><a href="/category/mouse.html"><i class="fas fa-mouse"></i> Mouse</a></li>
                                        <li><a href="/category/kulakliklar.html"><i class="fas fa-headphones"></i> Kulaklıklar</a></li>

                                    </ul>
                                </div>
                                </div>
                        </div>
                    </div>
                    <ul class="nav-links">
                        <li><a href="/bestsellers.html"><i class="fas fa-fire"></i> Çok Satanlar</a></li>
                        <li><a href="/new-products.html"><i class="fas fa-bolt"></i> Yeni Ürünler</a></li>
                    </ul>
                </div>
            </div>
        </nav>
    `;
    
    // Navbar içeriğini yükle
    navbarContainer.innerHTML = navbarHTML;
    
    // Kategori mega menünün açılıp kapanması için olay dinleyici ekle
    const categoryToggle = document.querySelector('.category-toggle');
    const megaMenu = document.querySelector('.mega-menu');
    
    if (categoryToggle && megaMenu) {
        categoryToggle.addEventListener('click', function(e) {
            e.preventDefault();
            megaMenu.classList.toggle('active');
        });
        
        // Sayfa herhangi bir yerine tıklandığında mega menüyü kapat
        document.addEventListener('click', function(e) {
            if (!categoryToggle.contains(e.target) && !megaMenu.contains(e.target)) {
                megaMenu.classList.remove('active');
            }
        });

        // Mega menü üzerine gelindiğinde aç, çıkınca kapat
        const megaMenuContainer = document.querySelector('.mega-menu-container');
        if (megaMenuContainer) {
            megaMenuContainer.addEventListener('mouseenter', function() {
                megaMenu.classList.add('active');
            });
            
            megaMenuContainer.addEventListener('mouseleave', function() {
                megaMenu.classList.remove('active');
            });
        }
    }
    
    // Mobil menü açma/kapama
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const mainNav = document.querySelector('.main-nav');
    
    if (mobileMenuToggle && mainNav) {
        mobileMenuToggle.addEventListener('click', function() {
            mainNav.classList.toggle('active');
        });
    }
    
    // Sepet ve favoriler sayısını localStorage'dan yükle
    updateCartCount();
    updateFavoritesCount();
    
    // Kullanıcı durumunu güncelle
    updateUserStatus();
});

/**
 * Sepet sayısını günceller
 */
function updateCartCount() {
    const cartCountElement = document.getElementById('cart-count');
    if (cartCountElement) {
        let cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
        cartCountElement.textContent = cartItems.length;
    }
}

/**
 * Favoriler sayısını günceller
 */
function updateFavoritesCount() {
    const favoritesCountElement = document.getElementById('favorites-count');
    if (favoritesCountElement) {
        let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
        favoritesCountElement.textContent = favorites.length;
    }
}

/**
 * Kullanıcı durumunu günceller
 */
function updateUserStatus() {
    // localStorage veya sessionStorage'dan kullanıcı bilgilerini al
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || sessionStorage.getItem('userInfo') || '{}');
    
    // Hesabım butonunu bul
    const accountAction = document.getElementById('account-action');
    if (!accountAction) return;
    
    // Kullanıcı span elementini bul
    const spanElement = accountAction.querySelector('span');
    
    // Dropdown menüyü bul
    const dropdownMenu = document.getElementById('user-dropdown-menu');
    if (!dropdownMenu) return;
    
    // Token varsa kullanıcı giriş yapmış demektir
    if (userInfo && userInfo.token) {
        // Kullanıcı adını göster
        if (spanElement) {
            spanElement.textContent = userInfo.username || 'Hesabım';
        }
        
        // Dropdown menüyü güncelle - giriş yapılmış
        dropdownMenu.innerHTML = `
            <a href="/profile">Profilim</a>
            <a href="/orders">Siparişlerim</a>
            <a href="#" id="logout-link">Çıkış Yap</a>
        `;
        
        // Çıkış yapma işlemi
        const logoutLink = dropdownMenu.querySelector('#logout-link');
        if (logoutLink) {
            logoutLink.addEventListener('click', function(e) {
                e.preventDefault();
                
                // localStorage ve sessionStorage'dan kullanıcı bilgilerini temizle
                localStorage.removeItem('userInfo');
                sessionStorage.removeItem('userInfo');
                
                // Sayfayı yenile
                window.location.reload();
            });
        }
    } else {
        // Kullanıcı giriş yapmamışsa
        if (spanElement) {
            spanElement.textContent = 'Hesabım';
        }
        
        // Dropdown menüyü güncelle - giriş yapılmamış
        dropdownMenu.innerHTML = `
            <a href="/login">Giriş Yap</a>
            <a href="/register">Kayıt Ol</a>
        `;
    }
    
    // Kullanıcı dropdown açma/kapama
    setupUserDropdown();
}

/**
 * Kullanıcı dropdown açma/kapama
 */
function setupUserDropdown() {
    const accountAction = document.getElementById('account-action');
    const dropdownMenu = document.getElementById('user-dropdown-menu');
    const userDropdown = document.querySelector('.user-dropdown');
    
    if (!accountAction || !dropdownMenu || !userDropdown) return;
    
    // Hesabım butonuna tıklandığında dropdown'ı aç/kapat
    accountAction.addEventListener('click', function(e) {
        e.preventDefault();
        dropdownMenu.classList.toggle('active');
    });
    
    // Sayfa herhangi bir yerine tıklandığında dropdown'ı kapat
    document.addEventListener('click', function(e) {
        if (!userDropdown.contains(e.target)) {
            dropdownMenu.classList.remove('active');
        }
    });
}

// Sayfa değişimi veya sepet/favoriler güncellendiğinde bu fonksiyonlar tetiklenmelidir
window.addEventListener('storage', function(e) {
    if (e.key === 'cartItems') {
        updateCartCount();
    } else if (e.key === 'favorites') {
        updateFavoritesCount();
    } else if (e.key === 'userInfo') {
        updateUserStatus();
    }
}); 