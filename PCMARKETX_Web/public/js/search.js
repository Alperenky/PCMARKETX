/**
 * Search.js - Arama sayfası işlemleri
 */
document.addEventListener('DOMContentLoaded', function() {
  // URL'den arama parametrelerini al
  const urlParams = new URLSearchParams(window.location.search);
  const keyword = urlParams.get('q') || '';
  const page = parseInt(urlParams.get('page')) || 1;
  const sort = urlParams.get('sort') || 'newest';
  const priceMin = urlParams.get('priceMin') || '';
  const priceMax = urlParams.get('priceMax') || '';
  
  console.log('Arama parametreleri:', { keyword, page, sort, priceMin, priceMax });
  
  // Global değişkenler
  let currentFilters = {
    keyword,
    page,
    sort,
    priceMin,
    priceMax
  };
  
  let totalPages = 1;
  
  // DOM elementleri
  const searchKeywordElement = document.getElementById('search-keyword');
  const searchCountElement = document.getElementById('search-count');
  const searchResultsElement = document.getElementById('search-results');
  const noResultsElement = document.getElementById('no-results');
  const loadingElement = document.getElementById('loading');
  const paginationElement = document.getElementById('pagination');
  const sortSelectElement = document.getElementById('sort-select');
  const priceMinInput = document.getElementById('price-min');
  const priceMaxInput = document.getElementById('price-max');
  const applyPriceFilterButton = document.getElementById('apply-price-filter');
  
  // Arama sonuçlarını yükle
  loadSearchResults();
  
  // Arayüz başlangıç durumunu ayarla
  initializeUI();
  
  // Olay dinleyicileri
  setupEventListeners();
  
  /**
   * Arama sonuçlarını yükle
   */
  function loadSearchResults() {
    // Loading göster
    loadingElement.style.display = 'flex';
    noResultsElement.style.display = 'none';
    
    // Arama keyword'ünü göster
    if (searchKeywordElement) {
      searchKeywordElement.textContent = currentFilters.keyword;
    }
    
    // Filtreleri URL parametrelerine dönüştür
    let params = new URLSearchParams();
    
    // keyword parametresini "search" olarak gönder (API öyle bekliyor)
    if (currentFilters.keyword) {
      params.append('search', currentFilters.keyword);
    }
    
    // Sıralama parametresini biçimlendir (API biçimine göre)
    if (currentFilters.sort) {
      let sortParam;
      switch(currentFilters.sort) {
        case 'price-asc':
          sortParam = 'price:asc';
          break;
        case 'price-desc':
          sortParam = 'price:desc';
          break;
        case 'newest':
          sortParam = 'createdAt:desc';
          break;
        case 'popular':
          sortParam = 'numReviews:desc';
          break;
        default:
          sortParam = 'createdAt:desc';
      }
      params.append('sort', sortParam);
    }
    
    if (currentFilters.priceMin) {
      params.append('priceMin', currentFilters.priceMin);
    }
    
    if (currentFilters.priceMax) {
      params.append('priceMax', currentFilters.priceMax);
    }
    
    params.append('page', currentFilters.page);
    params.append('limit', 12); // Her sayfada 12 ürün göster
    
    console.log('API isteği:', `/api/products?${params.toString()}`);
    
    // API'den arama sonuçlarını getir
    fetch(`/api/products?${params.toString()}`)
      .then(response => {
        console.log('API yanıt durumu:', response.status);
        if (!response.ok) {
          throw new Error(`Arama sonuçları alınamadı: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        console.log('API yanıt verisi:', data);
        
        // Loading gizle
        loadingElement.style.display = 'none';
        
        // Toplam sonuç sayısını göster
        if (searchCountElement) {
          searchCountElement.textContent = data.totalProducts || 0;
        }
        
        // Toplam sayfa sayısını ayarla
        totalPages = data.totalPages || 1;
        
        // Sonuç var mı kontrol et
        if (!data.products || data.products.length === 0) {
          noResultsElement.style.display = 'block';
          searchResultsElement.innerHTML = ''; // Önceki sonuçları temizle
          paginationElement.innerHTML = ''; // Sayfalama temizle
          return;
        }
        
        // Ürün sonuçlarını göster
        renderProducts(data.products);
        
        // Sayfalamayı göster
        renderPagination(data.currentPage, data.totalPages);
        
        // URL'yi güncelle (sayfa yenilenmeden)
        updateURL();
      })
      .catch(error => {
        console.error('Arama hatası:', error);
        loadingElement.style.display = 'none';
        noResultsElement.style.display = 'block';
      });
  }
  
  /**
   * Ürünleri sayfada göster
   */
  function renderProducts(products) {
    const productsGrid = document.querySelector('.products-grid');
    if (!productsGrid) return;

    productsGrid.innerHTML = products.map(product => `
      <div class="product-card">
        <div class="product-image">
          <img src="${product.images[0]}" alt="${product.title}">
          <button class="add-to-favorites" data-product-id="${product._id}">
            <i class="far fa-heart"></i>
          </button>
        </div>
        <div class="product-info">
          <span class="product-brand">${product.brand}</span>
          <h3 class="product-title">${product.title}</h3>
          <div class="product-price">
            <span class="current-price">${product.price.toLocaleString('tr-TR')} TL</span>
            ${product.oldPrice ? `<span class="old-price">${product.oldPrice.toLocaleString('tr-TR')} TL</span>` : ''}
          </div>
          <button class="btn btn-primary add-to-cart" data-product-id="${product._id}">
            Sepete Ekle
          </button>
        </div>
      </div>
    `).join('');

    // Favori butonlarını ayarla
    setupFavoriteButtons();
  }
  
  /**
   * Sayfalama göster
   */
  function renderPagination(currentPage, totalPages) {
    if (!paginationElement || totalPages <= 1) {
      paginationElement.innerHTML = '';
      return;
    }
    
    paginationElement.innerHTML = '';
    
    // Önceki sayfa butonu
    const prevButton = document.createElement('button');
    prevButton.className = `pagination-button ${currentPage === 1 ? 'disabled' : ''}`;
    prevButton.innerHTML = '<i class="fas fa-chevron-left"></i>';
    prevButton.disabled = currentPage === 1;
    prevButton.addEventListener('click', function() {
      if (currentPage > 1) {
        currentFilters.page = currentPage - 1;
        loadSearchResults();
      }
    });
    paginationElement.appendChild(prevButton);
    
    // Sayfa numaraları
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, startPage + 4);
    
    for (let i = startPage; i <= endPage; i++) {
      const pageButton = document.createElement('button');
      pageButton.className = `pagination-button ${i === currentPage ? 'active' : ''}`;
      pageButton.textContent = i;
      pageButton.addEventListener('click', function() {
        currentFilters.page = i;
        loadSearchResults();
      });
      paginationElement.appendChild(pageButton);
    }
    
    // Sonraki sayfa butonu
    const nextButton = document.createElement('button');
    nextButton.className = `pagination-button ${currentPage === totalPages ? 'disabled' : ''}`;
    nextButton.innerHTML = '<i class="fas fa-chevron-right"></i>';
    nextButton.disabled = currentPage === totalPages;
    nextButton.addEventListener('click', function() {
      if (currentPage < totalPages) {
        currentFilters.page = currentPage + 1;
        loadSearchResults();
      }
    });
    paginationElement.appendChild(nextButton);
  }
  
  /**
   * UI başlangıç durumunu ayarla
   */
  function initializeUI() {
    // Sıralama seçeneğini ayarla
    if (sortSelectElement) {
      sortSelectElement.value = currentFilters.sort;
    }
    
    // Fiyat filtre alanlarını ayarla
    if (priceMinInput) {
      priceMinInput.value = currentFilters.priceMin;
    }
    
    if (priceMaxInput) {
      priceMaxInput.value = currentFilters.priceMax;
    }
  }
  
  /**
   * Event dinleyicileri kur
   */
  function setupEventListeners() {
    // Sıralama seçeneği değiştiğinde
    if (sortSelectElement) {
      sortSelectElement.addEventListener('change', function() {
        currentFilters.sort = this.value;
        currentFilters.page = 1; // Sayfa 1'e dön
        loadSearchResults();
      });
    }
    
    // Fiyat filtresi uygulandığında
    if (applyPriceFilterButton) {
      applyPriceFilterButton.addEventListener('click', function() {
        currentFilters.priceMin = priceMinInput.value;
        currentFilters.priceMax = priceMaxInput.value;
        currentFilters.page = 1; // Sayfa 1'e dön
        loadSearchResults();
      });
    }
  }
  
  /**
   * URL'yi güncelle (sayfa yenilenmeden)
   */
  function updateURL() {
    let params = new URLSearchParams();
    
    if (currentFilters.keyword) {
      params.append('q', currentFilters.keyword);
    }
    
    if (currentFilters.sort && currentFilters.sort !== 'newest') {
      params.append('sort', currentFilters.sort);
    }
    
    if (currentFilters.priceMin) {
      params.append('priceMin', currentFilters.priceMin);
    }
    
    if (currentFilters.priceMax) {
      params.append('priceMax', currentFilters.priceMax);
    }
    
    if (currentFilters.page > 1) {
      params.append('page', currentFilters.page);
    }
    
    const newURL = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState({}, '', newURL);
  }
  
  /**
   * Sepete ürün ekle
   */
  function addToCart(product) {
    let cartItems = JSON.parse(localStorage.getItem('cartItems') || '[]');
    
    // Ürün zaten sepette mi kontrol et
    const existingItem = cartItems.find(item => item.product === product._id);
    
    if (existingItem) {
      // Ürün zaten sepetteyse miktar arttır
      existingItem.quantity += 1;
    } else {
      // Yeni ürün ekle
      cartItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        image: product.imageUrl,
        quantity: 1
      });
    }
    
    // Sepeti güncelle
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
    
    // Sepet sayısını güncelle
    updateCartCount();
    
    // Bildirim göster
    showNotification('Ürün sepete eklendi', 'success');
  }
  
  /**
   * Favorilere ekle/çıkar
   */
  function setupFavoriteButtons() {
    document.querySelectorAll('.add-to-favorites').forEach(button => {
      // Önceki event listener'ları temizle
      button.removeEventListener('click', handleFavoriteButton);
      // Yeni event listener ekle
      button.addEventListener('click', handleFavoriteButton);
    });
  }

  // Favori butonuna basıldığında tetiklenen fonksiyon
  async function handleFavoriteButton(e) {
    e.preventDefault();
    e.stopPropagation();

    const button = e.currentTarget;
    const productId = button.dataset.productId;
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
        
        button.classList.remove('active');
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
        
        button.classList.add('active');
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
      
      if (!response.ok) return;
      
      const favorites = await response.json();
      const favoriteCount = favorites.length;
      
      // Navbar'daki favori sayısını güncelle
      const favoriteBadge = document.querySelector('.user-dropdown .dropdown-menu a[href="/favorites"] .badge');
      if (favoriteBadge) {
        favoriteBadge.textContent = favoriteCount;
        favoriteBadge.style.display = favoriteCount > 0 ? 'flex' : 'none';
      }
    } catch (error) {
      console.error('Favori sayısı güncellenirken hata:', error);
    }
  }
  
  /**
   * Bildirim göster
   */
  function showNotification(message, type = 'info') {
    // navbar.js içindeki showNotification fonksiyonunu kullan
    if (window.showNotification) {
      window.showNotification(message, type);
    } else {
      // Fallback: Navbar'daki fonksiyon yoksa basit bir bildirim göster
      alert(message);
    }
  }
}); 