// Ana kategori ve alt kategori verilerini tutacak değişkenler
let parentCategories = {
  "bilgisayar-bilesenleri": {
    name: "Bilgisayar Bileşenleri",
    description: "Bilgisayar sistemlerinin temel yapı taşları olan en iyi bileşenleri keşfedin.",
    subcategories: [
      { name: "İşlemciler", slug: "islemciler", icon: "microchip" },
      { name: "Ekran Kartları", slug: "ekran-kartlari", icon: "tv" },
      { name: "Anakartlar", slug: "anakartlar", icon: "server" },
      { name: "RAM", slug: "ram", icon: "memory" },
      { name: "Depolama", slug: "depolama", icon: "hdd" },
      { name: "Güç Kaynakları", slug: "guc-kaynaklari", icon: "plug" },
      { name: "Bilgisayar Kasaları", slug: "kasalar", icon: "box" },
      { name: "Soğutma Sistemleri", slug: "sogutma-sistemleri", icon: "fan" }
    ]
  },
  "cevre-birimleri": {
    name: "Çevre Birimleri",
    description: "Bilgisayar deneyiminizi zenginleştirecek en kaliteli çevre birimleri.",
    subcategories: [
      { name: "Klavyeler", slug: "klavyeler", icon: "keyboard" },
      { name: "Mouse", slug: "mouse", icon: "mouse" },
      { name: "Kulaklıklar", slug: "kulakliklar", icon: "headphones" },
      { name: "Monitörler", slug: "monitorler", icon: "desktop" },
      { name: "Webcam", slug: "webcam", icon: "camera" },
      { name: "Mikrofonlar", slug: "mikrofonlar", icon: "microphone" },
      { name: "Hoparlörler", slug: "hoparlor", icon: "volume-up" },
      { name: "Yazıcılar", slug: "yazicilar", icon: "print" }
    ]
  }
};

// Simüle edilmiş demolar
const simulatedProducts = {
  "bilgisayar-bilesenleri": [
    { _id: "p1", name: "NVIDIA RTX 4080", brand: "NVIDIA", price: 29999, images: ["/images/products/rtx4080.jpg"], features: ["16GB GDDR6X", "DLSS 3.0"] },
    { _id: "p2", name: "AMD Ryzen 9 7950X", brand: "AMD", price: 14999, images: ["/images/products/ryzen9.jpg"], features: ["16 Çekirdek", "5.7GHz"] },
    { _id: "p3", name: "ASUS ROG Strix Z790-E", brand: "ASUS", price: 12500, images: ["/images/products/asus-z790.jpg"], features: ["DDR5", "PCIe 5.0"] },
    { _id: "p4", name: "G.Skill Trident Z5 RGB 32GB", brand: "G.Skill", price: 3499, images: ["/images/products/gskill.jpg"], features: ["DDR5-6000", "CL36"] },
    { _id: "p5", name: "Samsung 990 PRO 2TB", brand: "Samsung", price: 4299, images: ["/images/products/samsung990.jpg"], features: ["PCIe 4.0", "7000MB/s"] },
    { _id: "p6", name: "Corsair HX1000 Platinum", brand: "Corsair", price: 4999, images: ["/images/products/corsair-hx.jpg"], features: ["80+ Platinum", "Tam Modüler"] }
  ],
  "cevre-birimleri": [
    { _id: "p7", name: "Logitech G Pro X", brand: "Logitech", price: 2199, images: ["/images/products/logitech-gpx.jpg"], features: ["25K DPI Sensör", "Kablosuz"] },
    { _id: "p8", name: "SteelSeries Apex Pro", brand: "SteelSeries", price: 3899, images: ["/images/products/steelseries-apex.jpg"], features: ["Mekanik Tuşlar", "Ayarlanabilir Aktüatör"] },
    { _id: "p9", name: "Samsung Odyssey G7", brand: "Samsung", price: 12999, images: ["/images/products/odyssey-g7.jpg"], features: ["32 inç", "240Hz", "1000R Kavis"] },
    { _id: "p10", name: "HyperX Cloud Alpha", brand: "HyperX", price: 1799, images: ["/images/products/hyperx-cloud.jpg"], features: ["7.1 Surround Ses", "Çift Odacık Tasarım"] },
    { _id: "p11", name: "Logitech C922 Pro", brand: "Logitech", price: 1499, images: ["/images/products/logitech-c922.jpg"], features: ["1080p 60fps", "ChromaKey Arka Plan"] },
    { _id: "p12", name: "Blue Yeti X", brand: "Blue", price: 3299, images: ["/images/products/blue-yeti.jpg"], features: ["Dört Kapsül", "USB Bağlantı"] }
  ]
};

// Sayfa yüklendiğinde çalışacak ana fonksiyon
document.addEventListener('DOMContentLoaded', function() {
  initializeCategoryPage();
});

// Kategori sayfasını başlatan fonksiyon
async function initializeCategoryPage() {
  // URL'den kategori parametresini al
  const params = new URLSearchParams(window.location.search);
  const categorySlug = params.get('cat');
  
  if (!categorySlug) {
    showError('Kategori bulunamadı');
    return;
  }
  
  // Kategori bilgilerini yükle
  await loadCategoryInfo(categorySlug);
  
  // Filtreleri ayarla
  setupFilters(categorySlug);
  
  // Sayfalamayı ayarla
  setupPagination();
  
  // İlk sayfadaki ürünleri yükle
  loadProducts(1);
}

// Kategori bilgilerini yükleyen fonksiyon
async function loadCategoryInfo(categorySlug) {
  try {
    // Önce ana kategori mi kontrol et
    const parentCategory = parentCategories[categorySlug];
    
    if (parentCategory) {
      // Ana kategori
      document.title = `${parentCategory.name} - PC MARKET X`;
      document.getElementById('category-breadcrumb').textContent = parentCategory.name;
      document.getElementById('category-title').textContent = parentCategory.name;
      document.getElementById('category-description').textContent = parentCategory.description;
      
      // Alt kategori bölümünü göster
      document.getElementById('subcategory-section').style.display = 'block';
      
      // Alt kategorileri yükle
      loadSubcategories(parentCategory.subcategories);
      
      // Öne çıkan alt kategorileri göster
      showFeaturedSubcategories(parentCategory.subcategories);
    } else {
      // Alt kategori bilgilerini API'den al
      const response = await fetch(`/api/categories/slug/${categorySlug}`);
      if (!response.ok) throw new Error('Kategori bilgileri alınamadı');
      
      const category = await response.json();
      
      document.title = `${category.name} - PC MARKET X`;
      document.getElementById('category-breadcrumb').textContent = category.name;
      document.getElementById('category-title').textContent = category.name;
      document.getElementById('category-description').textContent = category.description || '';
      
      // Alt kategori bölümünü gizle
      document.getElementById('subcategory-section').style.display = 'none';
      document.getElementById('featured-subcategories').style.display = 'none';
    }
  } catch (error) {
    console.error('Kategori bilgileri yüklenirken hata:', error);
    showError('Kategori bilgileri yüklenirken bir hata oluştu');
  }
}

// Alt kategorileri filtre bölümüne ekleyen fonksiyon
function loadSubcategories(subcategories) {
  const subcategoryFilters = document.getElementById('subcategory-filters');
  
  // Mevcut alt kategorileri temizle (Tümü seçeneği hariç)
  const allCheckbox = subcategoryFilters.querySelector('#subcategory-all');
  if (allCheckbox) {
    const allCheckboxItem = allCheckbox.parentElement;
    subcategoryFilters.innerHTML = '';
    subcategoryFilters.appendChild(allCheckboxItem);
  }
  
  // Alt kategorileri ekle
  subcategories.forEach(subcategory => {
    const checkboxDiv = document.createElement('div');
    checkboxDiv.className = 'filter-checkbox';
    
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = `subcategory-${subcategory.slug}`;
    checkbox.value = subcategory.slug;
    
    const label = document.createElement('label');
    label.setAttribute('for', `subcategory-${subcategory.slug}`);
    label.textContent = subcategory.name;
    
    checkboxDiv.appendChild(checkbox);
    checkboxDiv.appendChild(label);
    subcategoryFilters.appendChild(checkboxDiv);
  });
  
  // Alt kategori olaylarını ayarla
  setupSubcategoryEvents();
}

// Alt kategori checkbox olaylarını ayarlayan fonksiyon
function setupSubcategoryEvents() {
  const subcategoryFilters = document.getElementById('subcategory-filters');
  const allCheckbox = document.getElementById('subcategory-all');
  
  // "Tümü" checkbox'ı için olay
  if (allCheckbox) {
    allCheckbox.addEventListener('change', function() {
      if (this.checked) {
        // Diğer tüm checkbox'ları kapat
        const checkboxes = subcategoryFilters.querySelectorAll('input[type="checkbox"]:not(#subcategory-all)');
        checkboxes.forEach(checkbox => checkbox.checked = false);
      }
    });
  }
  
  // Diğer checkbox'lar için olay
  const checkboxes = subcategoryFilters.querySelectorAll('input[type="checkbox"]:not(#subcategory-all)');
  checkboxes.forEach(checkbox => {
    checkbox.addEventListener('change', function() {
      if (this.checked && allCheckbox) {
        allCheckbox.checked = false;
      } else if (!Array.from(checkboxes).some(cb => cb.checked) && allCheckbox) {
        allCheckbox.checked = true;
      }
    });
  });
}

// Öne çıkan alt kategorileri gösteren fonksiyon
function showFeaturedSubcategories(subcategories) {
  const featuredSection = document.getElementById('featured-subcategories');
  const gridContainer = document.getElementById('subcategories-grid');
  
  if (!featuredSection || !gridContainer) return;
  
  // Grid'i temizle
  gridContainer.innerHTML = '';
  
  // Alt kategorileri ekle
  subcategories.forEach(subcategory => {
    const card = document.createElement('div');
    card.className = 'subcategory-card';
    
    card.innerHTML = `
      <div class="subcategory-icon">
        <i class="fas fa-${subcategory.icon}"></i>
      </div>
      <h3>${subcategory.name}</h3>
      <a href="/category.html?cat=${subcategory.slug}" class="btn btn-primary">İncele</a>
    `;
    
    gridContainer.appendChild(card);
  });
  
  // Bölümü göster
  featuredSection.style.display = 'block';
}

// Filtreleri ayarlayan fonksiyon
function setupFilters(categorySlug) {
  // Sıralama filtresi
  const sortSelect = document.getElementById('sort-options');
  if (sortSelect) {
    sortSelect.addEventListener('change', () => loadProducts(1));
  }
  
  // Fiyat filtresi
  const priceFilterBtn = document.getElementById('price-filter-btn');
  if (priceFilterBtn) {
    priceFilterBtn.addEventListener('click', () => loadProducts(1));
  }
  
  // Filtre temizleme butonu
  const clearFiltersBtn = document.querySelector('.clear-filters');
  if (clearFiltersBtn) {
    clearFiltersBtn.addEventListener('click', () => {
      resetFilters();
      loadProducts(1);
    });
  }
}

// Filtreleri sıfırlayan fonksiyon
function resetFilters() {
  // Sıralama
  const sortSelect = document.getElementById('sort-options');
  if (sortSelect) sortSelect.selectedIndex = 0;
  
  // Fiyat aralığı
  const minPrice = document.getElementById('price-min');
  const maxPrice = document.getElementById('price-max');
  if (minPrice) minPrice.value = '';
  if (maxPrice) maxPrice.value = '';
}

// Aktif filtreleri getiren fonksiyon
function getFilters() {
  const filters = {
    sort: document.getElementById('sort-options')?.value || 'price-asc',
    priceRange: {
      min: document.getElementById('price-min')?.value || null,
      max: document.getElementById('price-max')?.value || null
    }
  };
  
  return filters;
}

// Ürünleri yükleyen fonksiyon
async function loadProducts(page = 1) {
  try {
    const categorySlug = new URLSearchParams(window.location.search).get('cat');
    const filters = getFilters();
    
    // Loading durumunu göster
    const productGrid = document.getElementById('product-grid');
    productGrid.innerHTML = `
      <div class="loading">
        <i class="fas fa-spinner fa-spin"></i>
        <p>Ürünler yükleniyor...</p>
      </div>
    `;
    
    try {
      // Seçilen alt kategorileri al
      const subcategoryElements = document.querySelectorAll('#subcategory-filters input[type="checkbox"]:not(#subcategory-all):checked');
      const selectedSubcategories = Array.from(subcategoryElements).map(checkbox => checkbox.value).join(',');
      
      // API endpoint'ini oluştur
      let apiUrl = `/api/products/by-category/${categorySlug}?page=${page}`;
      
      // Alt kategoriler seçilmişse ekle
      if (selectedSubcategories) {
        apiUrl += `&subcategories=${selectedSubcategories}`;
      }
      
      // Fiyat filtresi ekle
      if (filters.priceRange.min) {
        apiUrl += `&priceMin=${filters.priceRange.min}`;
      }
      
      if (filters.priceRange.max) {
        apiUrl += `&priceMax=${filters.priceRange.max}`;
      }
      
      // Sıralama filtresi ekle
      if (filters.sort) {
        apiUrl += `&sort=${filters.sort}`;
      }
      
      console.log("API isteği: " + apiUrl);
      
      // API'den ürünleri çek
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        throw new Error('Ürünler yüklenirken bir hata oluştu');
      }
      
      const data = await response.json();
      
      console.log("API yanıtı:", data);
      
      // Eğer ürünler dizisi yoksa kontrol et
      if (!data.products && data.products === undefined) {
        throw new Error('API yanıtı ürün verisi içermiyor');
      }
      
      // Ürünleri göster
      renderProducts(data.products);
      
      // Ürün sayısını güncelle
      updateProductCount(data.total);
      
      // Sayfalamayı güncelle
      updatePagination(data.total, page, data.pages);
      
    } catch (apiError) {
      console.error('API hatası:', apiError);
      
      // Simüle edilmiş verileri kullan
      console.info('Simüle edilmiş veriler kullanılıyor...');
      const simulatedData = simulatedProducts[categorySlug] || [];
      
      // Ürünleri göster
      renderProducts(simulatedData);
      
      // Ürün sayısını güncelle
      updateProductCount(simulatedData.length);
      
      // Sayfalamayı güncelle
      updatePagination(simulatedData.length, 1, 1);
      
      // Kullanıcıya bilgi ver
      showNotification('Geliştirme modunda simüle edilmiş veriler gösteriliyor.', 'info');
    }
    
  } catch (error) {
    console.error('Ürünler yüklenirken hata:', error);
    showError('Ürünler yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
  }
}

// Ürünleri gösteren fonksiyon
function renderProducts(products) {
  const productGrid = document.getElementById('product-grid');
  if (!productGrid) return;
  
  // Grid'i temizle
  productGrid.innerHTML = '';
  
  // Ürün yoksa bilgi göster
  if (!products || products.length === 0) {
    productGrid.innerHTML = `
      <div class="no-products">
        <i class="fas fa-search"></i>
        <p>Bu kriterlere uygun ürün bulunamadı.</p>
      </div>
    `;
    return;
  }
  
  // Ürünleri ekle
  products.forEach(product => {
    const productCard = document.createElement('div');
    productCard.className = 'product-item';
    
    // Fiyat etiketi bilgisi oluştur
    let priceTag = '';
    if (product.discount && product.discount > 0) {
      const discountedPrice = product.price * (1 - product.discount / 100);
      priceTag = `
        <div class="product-price">
          <span class="discount-rate">%${product.discount}</span>
          <span class="old-price">${product.price.toLocaleString('tr-TR')} TL</span>
          <span class="current-price">${discountedPrice.toLocaleString('tr-TR')} TL</span>
        </div>
      `;
    } else {
      priceTag = `
        <div class="product-price">
          <span class="current-price">${product.price.toLocaleString('tr-TR')} TL</span>
        </div>
      `;
    }
    
    // Ürün özellikleri
    let features = '';
    if (product.specifications && Object.keys(product.specifications).length > 0) {
      const specs = product.specifications;
      features = '<ul>';
      
      // Map veya obje olduğunu kontrol et
      if (specs instanceof Map) {
        // Map ise entries kullanarak dön
        for (const [key, value] of specs.entries()) {
          if (key && value) {
            features += `<li>${key}: ${value}</li>`;
          }
        }
      } else if (typeof specs === 'object') {
        // Obje ise veya MongoDB'den gelen bir obje ise
        for (const key in specs) {
          if (specs.hasOwnProperty(key) && specs[key]) {
            features += `<li>${key}: ${specs[key]}</li>`;
          }
        }
      }
      
      features += '</ul>';
    }
    
    // Resimler için kontrol
    const productImage = product.images && product.images.length > 0 
      ? product.images[0] 
      : (product.image ? product.image : '/images/placeholder.jpg');
    
    productCard.innerHTML = `
      <div class="product-image">
        <a href="/product-detail.html?id=${product._id}">
          <img src="${productImage}" alt="${product.name}" onerror="this.src='/images/placeholder.jpg'">
        </a>
      </div>
      <div class="product-info">
        <h3 class="product-name">
          <a href="/product-detail.html?id=${product._id}">${product.name}</a>
        </h3>
        <p class="product-brand">${product.brand || ''}</p>
        ${priceTag}
        <div class="product-features">
          ${features}
        </div>
        <div class="product-actions">
          <button class="btn btn-primary add-to-cart" data-product-id="${product._id}">
            <i class="fas fa-shopping-cart"></i> Sepete Ekle
          </button>
          <button class="btn btn-outline add-to-favorites" data-product-id="${product._id}">
            <i class="far fa-heart"></i>
          </button>
        </div>
      </div>
    `;
    
    productGrid.appendChild(productCard);
  });
  
  // Sepete ekle butonlarına olay ekle
  setupAddToCart();
  
  // Favorilere ekle butonlarına olay ekle
  setupAddToFavorites();
}

// Ürün sayısını güncelleyen fonksiyon
function updateProductCount(total) {
  const countElement = document.getElementById('product-count');
  if (countElement) {
    countElement.textContent = `${total} ürün bulundu`;
  }
}

// Sayfalamayı ayarlayan fonksiyon
function setupPagination() {
  const pagination = document.getElementById('pagination');
  if (!pagination) return;
  
  // Önceki sayfa butonu
  const prevButton = pagination.querySelector('.pagination-prev');
  if (prevButton) {
    prevButton.addEventListener('click', () => {
      const currentPage = parseInt(pagination.dataset.currentPage) || 1;
      if (currentPage > 1) {
        loadProducts(currentPage - 1);
      }
    });
  }
  
  // Sonraki sayfa butonu
  const nextButton = pagination.querySelector('.pagination-next');
  if (nextButton) {
    nextButton.addEventListener('click', () => {
      const currentPage = parseInt(pagination.dataset.currentPage) || 1;
      const totalPages = parseInt(pagination.dataset.totalPages) || 1;
      if (currentPage < totalPages) {
        loadProducts(currentPage + 1);
      }
    });
  }
}

// Sayfalama bilgilerini güncelleyen fonksiyon
function updatePagination(total, currentPage, totalPages) {
  const pagination = document.getElementById('pagination');
  if (!pagination) return;
  
  // Sayfalama verilerini sakla
  pagination.dataset.currentPage = currentPage;
  pagination.dataset.totalPages = totalPages;
  
  // Sayfa numaralarını göster
  const numbersContainer = pagination.querySelector('.pagination-numbers');
  if (numbersContainer) {
    numbersContainer.innerHTML = '';
    
    // Maksimum 5 sayfa numarası göster
    const maxPages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPages / 2));
    let endPage = Math.min(totalPages, startPage + maxPages - 1);
    
    if (endPage - startPage + 1 < maxPages) {
      startPage = Math.max(1, endPage - maxPages + 1);
    }
    
    // İlk sayfa
    if (startPage > 1) {
      const firstBtn = document.createElement('button');
      firstBtn.textContent = '1';
      firstBtn.addEventListener('click', () => loadProducts(1));
      numbersContainer.appendChild(firstBtn);
      
      if (startPage > 2) {
        const dots = document.createElement('span');
        dots.textContent = '...';
        dots.className = 'pagination-dots';
        numbersContainer.appendChild(dots);
      }
    }
    
    // Sayfa numaraları
    for (let i = startPage; i <= endPage; i++) {
      const pageBtn = document.createElement('button');
      pageBtn.textContent = i;
      if (i === currentPage) pageBtn.className = 'active';
      pageBtn.addEventListener('click', () => loadProducts(i));
      numbersContainer.appendChild(pageBtn);
    }
    
    // Son sayfa
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        const dots = document.createElement('span');
        dots.textContent = '...';
        dots.className = 'pagination-dots';
        numbersContainer.appendChild(dots);
      }
      
      const lastBtn = document.createElement('button');
      lastBtn.textContent = totalPages;
      lastBtn.addEventListener('click', () => loadProducts(totalPages));
      numbersContainer.appendChild(lastBtn);
    }
  }
  
  // Önceki/Sonraki butonlarını güncelle
  const prevButton = pagination.querySelector('.pagination-prev');
  const nextButton = pagination.querySelector('.pagination-next');
  
  if (prevButton) prevButton.disabled = currentPage === 1;
  if (nextButton) nextButton.disabled = currentPage === totalPages;
}

// Sepete ekleme fonksiyonları
function setupAddToCart() {
  document.querySelectorAll('.add-to-cart').forEach(button => {
    button.addEventListener('click', function() {
      const productId = this.dataset.productId;
      addToCart(productId);
    });
  });
}

async function addToCart(productId) {
  try {
    // Önce API çağrısını yap
    const response = await fetch('/api/cart/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ productId, quantity: 1 })
    });
    
    const responseData = await response.json();
    
    if (!response.ok) {
      throw new Error(responseData.message || 'Ürün sepete eklenirken bir hata oluştu');
    }
    
    // Ürün bilgilerini al
    const productCard = document.querySelector(`.product-item button[data-product-id="${productId}"]`).closest('.product-item');
    const productName = productCard.querySelector('.product-name').textContent.trim();
    const productPrice = parseFloat(productCard.querySelector('.current-price').textContent.replace(/[^0-9,]/g, '').replace(',', '.'));
    const productImage = productCard.querySelector('img').src;
    
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
        price: productPrice,
        image: productImage || '/images/placeholder.png',
        quantity: 1
      });
      showNotification('Ürün sepete eklendi', 'success');
    }
    
    // Sepeti localStorage'a kaydet
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Sepet sayısını güncelle
    updateCartCount();
  } catch (error) {
    console.error('Sepete ekleme hatası:', error);
    showNotification(error.message, 'error');
  }
}

// Favorilere ekleme fonksiyonları
function setupAddToFavorites() {
  document.querySelectorAll('.add-to-favorites').forEach(button => {
    // Önceki event listener'ları temizle
    const newButton = button.cloneNode(true);
    button.parentNode.replaceChild(newButton, button);
    
    // Yeni event listener ekle
    newButton.addEventListener('click', handleFavoriteClick);
  });
}

// Favori tıklama işleyicisi
async function handleFavoriteClick(e) {
  // Event'i tamamen engelle
  e.preventDefault();
  e.stopPropagation();
  e.stopImmediatePropagation();
  
  // Butonun varsayılan davranışını engelle
  this.blur();
  
  const productId = this.dataset.productId;
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

// Sayfa yüklendiğinde favorileri başlat
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    initializeFavorites();
    setupAddToFavorites();
  }, 500);
});

// Favorileri başlatma
async function initializeFavorites() {
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
    document.querySelectorAll('.add-to-favorites').forEach(button => {
      const productId = button.dataset.productId;
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

// Bildirim gösterme fonksiyonu
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.innerHTML = `
    <div class="notification-content">
      <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
      <span>${message}</span>
    </div>
  `;
  
  document.body.appendChild(notification);
  
  // 3 saniye sonra bildirim kaybolsun
  setTimeout(() => {
    notification.classList.add('fade-out');
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Hata gösterme fonksiyonu
function showError(message) {
  const mainContent = document.querySelector('.main-content');
  if (mainContent) {
    mainContent.innerHTML = `
      <div class="error-container">
        <i class="fas fa-exclamation-triangle"></i>
        <h2>Hata</h2>
        <p>${message}</p>
        <a href="/" class="btn btn-primary">Anasayfaya Dön</a>
      </div>
    `;
  }
} 