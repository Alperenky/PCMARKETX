document.addEventListener('DOMContentLoaded', () => {
    loadFavorites();
    setupAddToCartButtons();
});

// Favorileri yükle
async function loadFavorites() {
    const favoritesGrid = document.querySelector('.favorites-grid');
    const emptyFavorites = document.querySelector('.empty-favorites');
    const loading = document.querySelector('.loading');
    const favoritesCount = document.querySelector('.favorites-count');

    try {
        // Yükleme durumunu göster
        loading.style.display = 'block';
        favoritesGrid.style.display = 'none';
        emptyFavorites.style.display = 'none';
        
        // Kullanıcı bilgilerini al
        const userInfo = JSON.parse(localStorage.getItem('userInfo') || sessionStorage.getItem('userInfo') || '{}');
        if (!userInfo.token) {
            // Kullanıcı giriş yapmamışsa login sayfasına yönlendir
            window.location.href = '/login?redirect=/favorites';
            return;
        }

        // API'den favorileri al
        const response = await fetch('/api/users/favorites', {
            headers: {
                'Authorization': `Bearer ${userInfo.token}`
            }
        });

        if (!response.ok) {
            if (response.status === 401) {
                window.location.href = '/login?redirect=/favorites';
                return;
            }
            throw new Error('Favoriler alınamadı');
        }

        const favorites = await response.json();

        // Favori sayısını güncelle
        favoritesCount.textContent = `${favorites.length} ürün`;

        if (favorites.length === 0) {
            // Favori yoksa boş durumu göster
            emptyFavorites.style.display = 'block';
            favoritesGrid.style.display = 'none';
        } else {
            // Favorileri göster
            renderFavorites(favorites);
            favoritesGrid.style.display = 'grid';
            emptyFavorites.style.display = 'none';
        }
    } catch (error) {
        console.error('Favoriler yüklenirken hata:', error);
        favoritesGrid.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-circle"></i>
                <p>Favoriler yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.</p>
            </div>
        `;
        favoritesGrid.style.display = 'block';
    } finally {
        loading.style.display = 'none';
    }
}

// Favorileri görüntüle
function renderFavorites(favorites) {
    const favoritesGrid = document.querySelector('.favorites-grid');
    favoritesGrid.innerHTML = '';

    favorites.forEach(product => {
        const productCard = createProductCard(product);
        favoritesGrid.appendChild(productCard);
    });

    // Favori kaldırma butonlarını ayarla
    setupRemoveButtons();
    // Sepete ekleme butonlarını ayarla
    setupAddToCartButtons();
}

// Ürün kartı oluştur
function createProductCard(product) {
    // Ürün resmini belirle
    let productImage = '/images/products/placeholder.jpg';
    if (product.images && product.images.length > 0) {
        productImage = product.images[0];
    } else if (product.imageUrl) {
        productImage = product.imageUrl;
    }

    // İndirim varsa hesapla
    let oldPriceHtml = '';
    let currentPrice = product.price;
    if (product.oldPrice && product.oldPrice > product.price) {
        oldPriceHtml = `<span class="old-price">${product.oldPrice.toLocaleString('tr-TR')} TL</span>`;
    } else if (product.discount && product.discount > 0) {
        const discountedPrice = product.price - (product.price * product.discount / 100);
        oldPriceHtml = `<span class="old-price">${product.price.toLocaleString('tr-TR')} TL</span>`;
        currentPrice = discountedPrice;
    }

    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
        <div class="product-image">
            <a href="/product-detail.html?id=${product._id}">
                <img src="${productImage}" alt="${product.name}" onerror="this.src='/images/products/placeholder.jpg'">
            </a>
        </div>
        <div class="product-info">
            <div class="product-brand">${product.brand || 'PC MARKET X'}</div>
            <h3 class="product-title">
                <a href="/product-detail.html?id=${product._id}">${product.name}</a>
            </h3>
            <div class="product-price">
                <span class="current-price">${currentPrice.toLocaleString('tr-TR')} TL</span>
                ${oldPriceHtml}
            </div>
            <div class="product-actions">
                <button class="btn btn-primary add-to-cart" 
                        data-product-id="${product._id}" 
                        data-product-name="${product.name}" 
                        data-product-price="${currentPrice}"
                        data-product-image="${productImage}">
                    <i class="fas fa-shopping-cart"></i> Sepete Ekle
                </button>
                <button class="remove-favorite" data-product-id="${product._id}" title="Favorilerden Çıkar">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `;
    return card;
}

// Favori kaldırma butonlarını ayarla
function setupRemoveButtons() {
    document.querySelectorAll('.remove-favorite').forEach(button => {
        button.addEventListener('click', async (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            const productId = button.dataset.productId;
            const productCard = button.closest('.product-card');
            
            // Kullanıcı bilgilerini al
            const userInfo = JSON.parse(localStorage.getItem('userInfo') || sessionStorage.getItem('userInfo') || '{}');
            if (!userInfo.token) {
                window.location.href = '/login?redirect=/favorites';
                return;
            }
            
            try {
                // Silme işlemi öncesi animasyon başlat
                productCard.style.opacity = '0.5';
                productCard.style.pointerEvents = 'none';
                
                const response = await fetch(`/api/users/favorites/${productId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${userInfo.token}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Favori kaldırılamadı');
                }

                // Ürünü animasyonla kaldır
                productCard.style.opacity = '0';
                productCard.style.transform = 'scale(0.8)';
                setTimeout(() => {
                    productCard.remove();
                    
                    // Favori sayısını güncelle
                    const favoritesGrid = document.querySelector('.favorites-grid');
                    const remainingProducts = favoritesGrid.children.length;
                    document.querySelector('.favorites-count').textContent = `${remainingProducts} ürün`;

                    // Eğer favori kalmadıysa boş durumu göster
                    if (remainingProducts === 0) {
                        document.querySelector('.empty-favorites').style.display = 'block';
                        favoritesGrid.style.display = 'none';
                    }
                }, 300);

                // Bildirim göster
                showNotification('Ürün favorilerden kaldırıldı', 'info');
                
                // Navbar'daki favori sayısını güncelle
                updateFavoritesCount();
            } catch (error) {
                console.error('Favori kaldırılırken hata:', error);
                showNotification('Favori kaldırılırken bir hata oluştu. Lütfen daha sonra tekrar deneyin.', 'error');
                
                // Hata durumunda ürün kartını normal haline getir
                productCard.style.opacity = '1';
                productCard.style.pointerEvents = 'auto';
                productCard.style.transform = 'scale(1)';
            }
        });
    });
}

// Sepete ekleme butonlarını ayarla
function setupAddToCartButtons() {
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const productId = this.dataset.productId;
            const productName = this.dataset.productName;
            const productPrice = parseFloat(this.dataset.productPrice);
            const productImage = this.dataset.productImage || '/images/products/placeholder.jpg';
            
            // Sepete ekle
            addToCart(productId, productName, productPrice, productImage);
            
            // Buton animasyonu
            this.classList.add('adding');
            this.innerHTML = '<i class="fas fa-check"></i> Eklendi';
            
            setTimeout(() => {
                this.classList.remove('adding');
                this.innerHTML = '<i class="fas fa-shopping-cart"></i> Sepete Ekle';
            }, 1500);
        });
    });
}

// Sepete ürün ekle
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
            
            // LocalStorage'dan sepeti al
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
                    price: productPrice,
                    image: productImage,
                    quantity: 1
                });
                showNotification(`${productName} sepetinize eklendi!`, 'success');
            }
            
            // Sepeti localStorage'a kaydet
            localStorage.setItem('cart', JSON.stringify(cart));
            
            // Sepet sayısını güncelle
            updateCartCount(cart.reduce((total, item) => total + item.quantity, 0));
        })
        .catch(error => {
            console.error('Sepete ekleme API hatası:', error);
            
            // API hatası durumunda hata yakala, ama yine de localStorage'a ekle
            let cart = JSON.parse(localStorage.getItem('cart')) || [];
            
            const existingProduct = cart.find(item => item.id === productId);
            
            if (existingProduct) {
                existingProduct.quantity += 1;
                showNotification(`${productName} sepetinizdeki miktarı artırıldı!`, 'success');
            } else {
                cart.push({
                    id: productId,
                    name: productName,
                    price: productPrice,
                    image: productImage,
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

// Sepet sayısını güncelle
function updateCartCount(count) {
    const cartCount = document.getElementById('cart-count');
    if (cartCount) {
        cartCount.textContent = count;
        cartCount.classList.add('pulse');
        setTimeout(() => {
            cartCount.classList.remove('pulse');
        }, 500);
    }
}

// Bildirim göster
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
    // Kullanıcı bilgilerini al
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || sessionStorage.getItem('userInfo') || '{}');
    if (!userInfo.token) return;
    
    try {
        const response = await fetch('/api/users/favorites', {
            headers: {
                'Authorization': `Bearer ${userInfo.token}`
            }
        });
        
        if (!response.ok) return;
        
        const favorites = await response.json();
        const favoritesCount = favorites.length;
        
        // Navbar'daki favori sayısını güncelle
        const favoritesBadge = document.querySelector('.user-dropdown .dropdown-menu a[href="/favorites"] .badge');
        if (favoritesBadge) {
            favoritesBadge.textContent = favoritesCount;
            favoritesBadge.style.display = favoritesCount > 0 ? 'flex' : 'none';
        }
    } catch (error) {
        console.error('Favori sayısı güncellenirken hata:', error);
    }
} 