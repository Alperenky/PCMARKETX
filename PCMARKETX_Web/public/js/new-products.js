// New Products Loader
document.addEventListener('DOMContentLoaded', function() {
    loadNewProducts();
});

// Popüler ürünleri veri tabanından çeken fonksiyon
function loadNewProducts() {
    console.log('Yeni ürünler yükleniyor...');
    // API'den new ürünleri çekmek için fetch isteği
    fetch('/api/products/new')
        .then(response => {
            if (!response.ok) {
                throw new Error('Ürünler yüklenirken bir hata oluştu');
            }
            return response.json();
        })
        .then(data => {
            console.log('Yeni ürünler başarıyla yüklendi, adet:', data.length);
            displayNewProducts(data);
            
            // Butonların bağlanması için kısa bir gecikme ekle
            setTimeout(() => {
                setupFavoriteButtons();
                console.log('Yeni ürünler için favori butonları bağlandı.');
            }, 100);
        })
        .catch(error => {
            console.error('Ürünleri yüklerken hata:', error);
            
            // Hata durumunda boş ürün alanını göster ve kullanıcıya bilgi ver
            const productGrid = document.querySelector('.new-products .product-grid');
            if (productGrid) {
                productGrid.innerHTML = '<div class="no-products">Şu anda yeni ürünler yüklenemedi. Lütfen daha sonra tekrar deneyin.</div>';
            }
        });
}

// Yeni ürünleri görüntüleme fonksiyonu
function displayNewProducts(products) {
    const productGrid = document.querySelector('.new-products .product-grid');
    
    if (!productGrid) {
        console.error('Ürün grid elementi bulunamadı');
        return;
    }
    
    if (!products || products.length === 0) {
        productGrid.innerHTML = '<div class="no-products">Şu anda yeni ürün bulunmamaktadır.</div>';
        return;
    }
    
    // Grid içeriğini temizle
    productGrid.innerHTML = '';
    
    // En fazla 4 ürün göster
    const productsToShow = products.slice(0, 4);
    
    // Her ürün için kart oluştur
    productsToShow.forEach(product => {
        const productCard = createNewProductCard(product);
        productGrid.appendChild(productCard);
    });
    
    // Favori butonlarını ayarla
    setupFavoriteButtons();
}

// Ürün resminin tam URL'sini al
function getNewProductImageUrl(product) {
    console.log("Ürün:", product.name);
    console.log("Ürün resim bilgisi:", product.imageUrl);
    
    // Eğer ürünün imageUrl özelliği varsa ve boş değilse
    if (product.imageUrl && typeof product.imageUrl === 'string' && product.imageUrl.trim() !== '') {
        console.log("imageUrl özelliği bulundu:", product.imageUrl);
        
        // ImageUrl doğrudan kullanılabilir
        return product.imageUrl;
    }
    
    // Eğer product.images dizisi varsa ve içinde en az bir öğe varsa
    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
        console.log("İlk resim kullanılıyor:", product.images[0]);
        return product.images[0];
    }
    
    // Hiçbir resim bulunamazsa placeholder göster
    console.log("Resim bulunamadı, varsayılan resim kullanılıyor");
    return '/images/products/placeholder.jpg';
}

// Ürün kartı oluşturma fonksiyonu
function createNewProductCard(product) {
    const card = document.createElement('div');
    card.className = 'new-product-card';
    
    // DEBUG - tüm ürün verisini konsola logla
    console.log("YENİ ÜRÜN DETAYI:", JSON.stringify(product, null, 2));
    
    // Yıldız sayısını hesapla
    const rating = product.rating || Math.floor(Math.random() * 2) + 3; // 3-5 arası rastgele rating
    const stars = calculateStars(rating);
    
    // İndirim varsa eski fiyatı göster
    const oldPriceHtml = product.discount > 0 
        ? `<span class="old-price">${product.price.toLocaleString('tr-TR')} TL</span>` 
        : '';
    
    // Mevcut fiyatı al (indirimli veya normal)
    const currentPrice = product.discount > 0 
        ? product.price - (product.price * product.discount / 100) 
        : product.price;
    
    // Kategori adını al
    let categoryName = 'Bilgisayar Parçası';
    if (product.category) {
        if (typeof product.category === 'object' && product.category.name) {
            categoryName = product.category.name;
        } else if (typeof product.category === 'string') {
            categoryName = product.category;
        }
    }
    
    // Resim URL'si
    let imageUrl = '/images/products/placeholder.jpg';
    if (product.imageUrl && typeof product.imageUrl === 'string') {
        imageUrl = product.imageUrl;
    } else if (product.images && Array.isArray(product.images) && product.images.length > 0) {
        imageUrl = product.images[0];
    }
    
    card.innerHTML = `
        <span class="new-badge">Yeni</span>
        <div class="new-product-image">
            <img src="${imageUrl}" alt="${product.name}">
            <div class="product-overlay">
                <a href="/product-detail.html?id=${product._id}" class="product-action view-product"><i class="fas fa-eye"></i></a>
                <button class="product-action favorite-btn" data-product-id="${product._id}"><i class="far fa-heart"></i></button>
                <button class="product-action cart-btn" onclick="addToNewCart('${product._id}', '${product.name.replace(/'/g, "\\'")}', ${currentPrice}, '${imageUrl}')"><i class="fas fa-shopping-cart"></i></button>
            </div>
        </div>
        <div class="new-product-info">
            <span class="new-product-category">${categoryName}</span>
            <h3 class="new-product-name">
              <a href="/product-detail.html?id=${product._id}">${product.name}</a>
            </h3>
            <div class="new-product-rating">
                <div class="rating-stars">
                    ${stars}
                </div>
                <span class="rating-count">(${product.sales || Math.floor(Math.random() * 50 + 5)})</span>
            </div>
            <div class="new-product-price">
                <div>
                    ${oldPriceHtml}
                    <span>${currentPrice.toLocaleString('tr-TR')} TL</span>
                </div>
                <button class="btn-add-cart" onclick="addToNewCart('${product._id}', '${product.name.replace(/'/g, "\\'")}', ${currentPrice}, '${imageUrl}')"><i class="fas fa-shopping-cart"></i></button>
            </div>
        </div>
    `;
    
    // Ayrıca resim yüklenmesini kontrol etmek için event listener ekle
    const img = card.querySelector('img');
    img.addEventListener('load', function() {
        console.log('Resim başarıyla yüklendi:', this.src);
    });
    img.addEventListener('error', function() {
        console.error('Resim yüklenemedi:', this.src);
        this.src = '/images/products/placeholder.jpg';
    });
    
    return card;
}

// Favori butonlarına tıklama işlevselliğini ekle
function setupFavoriteButtons() {
    console.log("Yeni ürünler için favori butonlarını bağlama başlatılıyor...");
    
    // Önce tüm favori butonlarını seç
    const favoriteButtons = document.querySelectorAll('.new-products .favorite-btn');
    
    console.log("Yeni ürünlerde bulunan favori buton sayısı:", favoriteButtons.length);
    
    if (favoriteButtons.length === 0) {
        console.warn("Yeni ürünlerde hiç favori butonu bulunamadı!");
        return;
    }
    
    favoriteButtons.forEach((button, index) => {
        console.log(`${index+1}. buton için data-product-id:`, button.dataset.productId);
        
        // Önceki event listener'ları temizlemek için doğrudan click event handler'ı ekle
        button.onclick = function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const productId = this.dataset.productId;
            console.log("Yeni ürün favori butonuna tıklandı, ürün ID:", productId);
            
            if (!productId) {
                console.error("Ürün ID bulunamadı!");
                showNotification('Bir hata oluştu. Ürün ID bulunamadı.', 'error');
                return;
            }
            
            toggleFavorite(this, productId);
        };
    });
    
    console.log("Yeni ürünler için favori butonları bağlandı.");
}

// Favorileri ekleyip çıkarmak için ayrı fonksiyon
async function toggleFavorite(button, productId) {
    const isFavorite = button.classList.contains('active');
    const icon = button.querySelector('i');
    
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
        
        console.log("Favori işlemi başlatılıyor...");
        
        if (isFavorite) {
            // Favorilerden çıkar
            console.log("Favorilerden çıkarma isteği gönderiliyor:", productId);
            const response = await fetch(`/api/users/favorites/${productId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${userInfo.token}`
                }
            });
            
            if (!response.ok) {
                console.error("API hatası:", await response.text());
                throw new Error('Favori kaldırılamadı');
            }
            
            button.classList.remove('active');
            if (icon) {
                icon.classList.remove('fas');
                icon.classList.add('far');
            }
            showNotification('Ürün favorilerden çıkarıldı', 'info');
        } else {
            // Favorilere ekle
            console.log("Favorilere ekleme isteği gönderiliyor:", productId);
            const response = await fetch('/api/users/favorites', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userInfo.token}`
                },
                body: JSON.stringify({ productId })
            });
            
            if (!response.ok) {
                console.error("API hatası:", await response.text());
                throw new Error('Favorilere eklenemedi');
            }
            
            button.classList.add('active');
            if (icon) {
                icon.classList.remove('far');
                icon.classList.add('fas');
            }
            showNotification('Ürün favorilere eklendi', 'success');
        }
        
        // Favori sayısını güncelle
        updateFavoritesCount();
        
    } catch (error) {
        console.error('Favori işlemi sırasında hata:', error);
        showNotification('Bir hata oluştu. Lütfen tekrar deneyin.', 'error');
    }
}

// Bildirim gösterme fonksiyonu
function showNotification(message, type = 'info') {
    // Eğer mevcut bildirim varsa kaldır
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Yeni bildirim oluştur
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span>${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;
    
    // Body'ye ekle
    document.body.appendChild(notification);
    
    // Animasyon ekle
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Kapatma düğmesi
    const closeButton = notification.querySelector('.notification-close');
    closeButton.addEventListener('click', () => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    });
    
    // Otomatik kapat
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Navbar'daki favori sayısını güncelle
async function updateFavoritesCount() {
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || sessionStorage.getItem('userInfo') || '{}');
    if (!userInfo.token) return;
    
    try {
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
        const favoritesCount = Array.isArray(favorites) ? favorites.length : 0;
        
        const favoritesBadge = document.querySelector('.user-dropdown .dropdown-menu a[href="/favorites"] .badge');
        if (favoritesBadge) {
            favoritesBadge.textContent = favoritesCount;
            favoritesBadge.style.display = favoritesCount > 0 ? 'flex' : 'none';
        }
    } catch (error) {
        console.error('Favori sayısı güncellenirken hata:', error);
        // Hata mesajını göster ama uygulamanın çalışmasına izin ver
    }
}

// Ürün yıldız görünümünü hesapla
function calculateStars(rating) {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    
    let starsHtml = '';
    
    // Dolu yıldızlar
    for (let i = 0; i < fullStars; i++) {
        starsHtml += '<i class="fas fa-star"></i>';
    }
    
    // Yarım yıldız
    if (halfStar) {
        starsHtml += '<i class="fas fa-star-half-alt"></i>';
    }
    
    // Boş yıldızlar
    for (let i = 0; i < emptyStars; i++) {
        starsHtml += '<i class="far fa-star"></i>';
    }
    
    return starsHtml;
}

// Sepete ekleme fonksiyonu
function addToNewCart(productId, productName, price, imageUrl) {
    try {
        console.log(`Ürün sepete ekleniyor: ${productName} (${productId})`);
        
        // Önce API'ye istek yap
        fetch('/api/cart/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ productId, quantity: 1 })
        })
        .then(response => {
            return response.json().then(responseData => {
                if (!response.ok) {
                    throw new Error(responseData.message || 'Ürün sepete eklenirken bir hata oluştu');
                }
                
                // LocalStorage'daki sepeti al
                let cart = JSON.parse(localStorage.getItem('cart')) || [];
                
                // Ürün sepette var mı kontrol et
                const existingProduct = cart.find(item => item.id === productId);
                
                if (existingProduct) {
                    // Miktarı artır
                    existingProduct.quantity += 1;
                    showNotification(`${productName} sepetinizdeki miktarı artırıldı!`, 'success');
                } else {
                    // Yeni ürün ekle
                    cart.push({
                        id: productId,
                        name: productName,
                        price: price,
                        image: imageUrl || '/images/placeholder.png',
                        quantity: 1
                    });
                    showNotification(`${productName} sepete eklendi!`, 'success');
                }
                
                // Sepeti localStorage'a kaydet
                localStorage.setItem('cart', JSON.stringify(cart));
                
                // Sepet sayısını güncelle
                updateCartCount();
            });
        })
        .catch(error => {
            console.error('Sepete ekleme hatası:', error);
            showNotification(error.message, 'error');
        });
    } catch (error) {
        console.error('Sepete ekleme fonksiyonu hatası:', error);
        showNotification('Bir hata oluştu. Lütfen tekrar deneyin.', 'error');
    }
    
    // Varsayılan link davranışını engelle
    event.preventDefault();
}

// Sepet sayısını güncelle
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    
    const cartCount = document.getElementById('cart-count');
    if (cartCount) {
        cartCount.textContent = count;
        cartCount.classList.add('pulse');
        setTimeout(() => {
            cartCount.classList.remove('pulse');
        }, 500);
    }
}

// Sayfa yüklendiğinde favorileri başlat
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        initializeFavorites();
    }, 500);
});

// Favorileri başlatma
async function initializeFavorites() {
    try {
        console.log("Yeni ürünler için favoriler başlatılıyor...");
        const userInfo = JSON.parse(localStorage.getItem('userInfo') || sessionStorage.getItem('userInfo') || '{}');
        
        if (!userInfo.token) {
            console.log("Kullanıcı giriş yapmamış, favoriler yüklenmeyecek");
            return;
        }

        console.log("Kullanıcı favorileri yükleniyor...");
        // Favorileri al
        const response = await fetch('/api/users/favorites', {
            headers: {
                'Authorization': `Bearer ${userInfo.token}`
            }
        });

        if (!response.ok) {
            console.error("Favorileri alma hatası:", response.status, response.statusText);
            return;
        }

        const favorites = await response.json();
        console.log("Yeni ürünler için kullanıcı favorileri yüklendi:", favorites.length);
        
        if (!favorites || !Array.isArray(favorites) || favorites.length === 0) {
            console.log("Kullanıcının hiç favorisi yok");
            return;
        }
        
        const favoriteIds = favorites.map(fav => fav._id);

        // Tüm favori butonlarını güncelle - daha net seçici kullanarak
        console.log("Yeni ürünlerde favori butonları güncelleniyor...");
        const favoriteButtons = document.querySelectorAll('.new-products .favorite-btn');
        console.log("Güncellenecek yeni ürün favori buton sayısı:", favoriteButtons.length);
        
        favoriteButtons.forEach(button => {
            const productId = button.dataset.productId;
            const isFavorite = favoriteIds.includes(productId);
            
            console.log("Ürün ID:", productId, "Favori mi?", isFavorite);
            
            if (isFavorite) {
                button.classList.add('active');
                const icon = button.querySelector('i');
                if (icon) {
                    icon.classList.remove('far');
                    icon.classList.add('fas');
                }
            }
        });

        // Favori sayısını güncelle
        updateFavoritesCount();
    } catch (error) {
        console.error('Yeni ürünler için favoriler başlatılırken hata oluştu:', error);
    }
} 