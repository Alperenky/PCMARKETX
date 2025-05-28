/**
 * Navbar Loader - Dinamik olarak navbar içeriğini yükler
 */
document.addEventListener('DOMContentLoaded', function() {
    const navbarContainer = document.getElementById('navbar-container');
    
    if (!navbarContainer) {
        console.error('Navbar container bulunamadı!');
        return;
    }
    
    // İlk olarak kök dizindeki navbar.html dosyasını yüklemeyi dene
    loadNavbar('/navbar.html')
        .catch(() => {
            // Eğer kök dizinde bulamazsa /html/ klasöründen yükleme yap
            return loadNavbar('/html/navbar.html');
        })
        .catch(error => {
            console.error('Navbar yüklenirken hata oluştu:', error);
            navbarContainer.innerHTML = `
                <div class="error-navbar">
                    <p>Menü yüklenirken bir hata oluştu.</p>
                </div>
            `;
        });
        
    // Navbar yükleme fonksiyonu
    function loadNavbar(path) {
        return fetch(path)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Navbar ${path} konumundan yüklenemedi`);
                }
                return response.text();
            })
            .then(html => {
                // HTML içeriğini navbar container'a ekle
                navbarContainer.innerHTML = html;
                
                // Sepet bağlantısına özel tıklama olayı ekle
                const cartLink = document.getElementById('cart-link');
                if (cartLink) {
                    cartLink.addEventListener('click', function(e) {
                        e.preventDefault();
                        window.location.href = '/html/cart.html';
                    });
                }
                
                // Dropdown menülerin açılıp kapanması için olay dinleyicileri ekle
                const dropdowns = document.querySelectorAll('.dropdown');
                
                dropdowns.forEach(dropdown => {
                    const toggle = dropdown.querySelector('.dropdown-toggle');
                    const menu = dropdown.querySelector('.dropdown-menu');
                    
                    if (toggle && menu) {
                        // Tıklama ile açma/kapama
                        toggle.addEventListener('click', function(e) {
                            e.preventDefault();
                            dropdown.classList.toggle('active');
                        });
                        
                        // Hover ile açma/kapama
                        dropdown.addEventListener('mouseenter', function() {
                            this.classList.add('active');
                        });
                        
                        dropdown.addEventListener('mouseleave', function() {
                            this.classList.remove('active');
                        });
                    }
                });
                
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
                
                // Arama formu event listener'ı ekle
                setupSearchForm();
                
                console.log('Navbar başarıyla yüklendi:', path);
            });
    }
});

/**
 * Arama formu
 */
function setupSearchForm() {
    const searchForm = document.getElementById('search-form');
    const searchInput = document.getElementById('search-input');
    
    if (searchForm && searchInput) {
        // Sayfada zaten bir arama anahtar kelimesi varsa input'a yerleştir
        const urlParams = new URLSearchParams(window.location.search);
        const keyword = urlParams.get('q');
        if (keyword) {
            searchInput.value = keyword;
        }
        
        // Form gönderildiğinde
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Boş arama yapılmasını engelle
            if (!searchInput.value.trim()) {
                // Bildirim göster
                if (typeof showNotification === 'function') {
                    showNotification('Lütfen arama yapmak için bir şeyler yazın.', 'warning');
                }
                return;
            }
            
            // Konsola log
            console.log(`Arama yapılıyor: ${searchInput.value}`);
            
            // Arama sayfasına yönlendir
            window.location.href = `/search?q=${encodeURIComponent(searchInput.value.trim())}`;
        });
    }
}

/**
 * Sepet sayısını günceller
 */
function updateCartCount() {
    const cartCountElement = document.getElementById('cart-count');
    if (cartCountElement) {
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        const count = cart.reduce((total, item) => total + item.quantity, 0);
        cartCountElement.textContent = count;
    }
}

/**
 * Favoriler sayısını günceller
 */
function updateFavoritesCount() {
    const favoritesCountDropdown = document.getElementById('favorites-count-dropdown');
    if (favoritesCountDropdown) {
        let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
        favoritesCountDropdown.textContent = favorites.length;
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
            <a href="/profile"><i class="fas fa-user"></i> Profilim</a>
            <a href="/orders"><i class="fas fa-box"></i> Siparişlerim</a>
            <a href="/favorites.html"><i class="fas fa-heart"></i> Favorilerim <span class="badge" id="favorites-count-dropdown">0</span></a>
            <a href="#" id="logout-link"><i class="fas fa-sign-out-alt"></i> Çıkış Yap</a>
        `;
        
        // Favoriler sayısını dropdown menüdeki badge'e de ekle
        const favoritesCountDropdown = dropdownMenu.querySelector('#favorites-count-dropdown');
        if (favoritesCountDropdown) {
            let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
            favoritesCountDropdown.textContent = favorites.length;
        }
        
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
            <a href="/login"><i class="fas fa-sign-in-alt"></i> Giriş Yap</a>
            <a href="/register"><i class="fas fa-user-plus"></i> Kayıt Ol</a>
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
        e.stopPropagation(); // Event propagation'ı durdur
        dropdownMenu.classList.toggle('active');
    });
    
    // Dropdown menü içindeki linklere tıklandığında menüyü kapat
    dropdownMenu.addEventListener('click', function(e) {
        if (e.target.tagName === 'A') {
            dropdownMenu.classList.remove('active');
        }
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