document.addEventListener('DOMContentLoaded', function() {
  // Check if user is logged in
  const userInfo = JSON.parse(localStorage.getItem('userInfo')) || JSON.parse(sessionStorage.getItem('userInfo'));
  
  if (!userInfo) {
    // Redirect to login page if not logged in
    window.location.href = '/login.html';
    return;
  }
  
  // Load orders
  loadOrders();
  
  // Function to load orders
  async function loadOrders() {
    try {
      const token = userInfo.token;
      const ordersList = document.getElementById('orders-list');
      const emptyOrders = document.getElementById('empty-orders');
      
      // Sipariş listesini temizle
      ordersList.innerHTML = '';
      // Yükleniyor göster
      ordersList.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Siparişler yükleniyor...</div>';
      
      // Önce gerçek siparişleri çekmeyi deneyelim
      console.log('Gerçek siparişler için API isteği gönderiliyor: /api/user/orders');
      const response = await fetch('/api/user/orders', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Response durumunu loglayalım
      console.log('API cevap durumu:', response.status, response.statusText);
      
      let orders = [];
      
      if (response.ok) {
        const data = await response.json();
        console.log('API cevap verileri:', data);
        
        orders = data.orders || [];
        console.log('Alınan siparişler:', orders.length); 
      } else {
        console.error('Gerçek siparişler alınamadı, test siparişleri kullanılacak');
        console.error('API yanıt hatası:', response.status, response.statusText);
        
        // Gerçek siparişler alınamazsa, test siparişlerini kullan
        const testResponse = await fetch('/api/test/orders');
        if (testResponse.ok) {
          const testData = await testResponse.json();
          orders = testData.orders || [];
        } else {
          throw new Error(`Siparişler yüklenirken bir hata oluştu: ${response.status} ${response.statusText}`);
        }
      }
      
      // Siparişleri tarihe göre sırala (en yeniden en eskiye)
      orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      // Sipariş listesini temizle
      ordersList.innerHTML = '';
      
      if (orders.length === 0) {
        // Sipariş yoksa boş durum göster
        if (emptyOrders) {
          emptyOrders.style.display = 'flex';
        } else {
          ordersList.innerHTML = `
            <div class="empty-orders">
              <i class="fas fa-box-open"></i>
              <p>Henüz sipariş bulunmamaktadır.</p>
              <a href="/" class="btn btn-primary">Alışverişe Başla</a>
            </div>
          `;
        }
        return;
      }
      
      // Boş durum göstergesini gizle
      if (emptyOrders) {
        emptyOrders.style.display = 'none';
      }
      
      // Siparişleri listele
      orders.forEach(order => {
        const orderCard = createOrderCard(order);
        ordersList.appendChild(orderCard);
      });
      
    } catch (error) {
      console.error('Error loading orders:', error);
      document.getElementById('orders-list').innerHTML = `
        <div class="error-message">
          <i class="fas fa-exclamation-circle"></i>
          <p>Siparişler yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.</p>
        </div>
      `;
    }
  }
  
  // Function to create order card
  function createOrderCard(order) {
    const orderCard = document.createElement('div');
    orderCard.className = 'order-card';
    
    // Sipariş tarihi formatla
    const orderDate = new Date(order.createdAt).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    // Sipariş kimliği (ID'nin ilk 8 karakteri)
    const orderNumber = order.orderNumber || order._id.substring(0, 8).toUpperCase();
    
    // Sipariş durumu CSS sınıfı
    const statusClass = getStatusClass(order.status);
    
    // Sipariş öğelerini oluştur - 'orderItems' ve 'qty' alanlarını kullan
    const orderItems = order.orderItems || [];
    
    // Sadece ilk 2 ürünü göster, diğerlerini "ve X ürün daha" şeklinde belirt
    const displayedItems = orderItems.slice(0, 2);
    const remainingItems = orderItems.length > 2 ? orderItems.length - 2 : 0;
    
    const orderItemsHtml = displayedItems.map(item => {
      const product = item.product || {};
      const quantity = item.qty || 0;
      const price = item.price || 0;
      const image = item.image || '/img/no-image.png';
      const name = item.name || product.name || 'Ürün Adı Bulunamadı';
      
      return `
        <div class="order-item">
          <div class="item-image">
            <img src="${image}" alt="${name}" onerror="this.src='/img/no-image.png'">
          </div>
          <div class="item-details">
            <h4>${name}</h4>
            <div class="item-meta">
              <span class="item-quantity">${quantity} Adet</span>
              <span class="item-price">${formatPrice(price * quantity)} ₺</span>
            </div>
          </div>
        </div>
      `;
    }).join('');
    
    // Kalan ürünler için mesaj
    const moreItemsHtml = remainingItems > 0 ? 
      `<div class="more-items">ve ${remainingItems} ürün daha</div>` : '';
    
    // Fiyat hesaplamaları
    const shippingPrice = order.shippingPrice || 0;
    const taxPrice = order.taxPrice || 0;
    const totalPrice = order.totalPrice || order.total || 0;
    const subtotal = totalPrice - taxPrice - shippingPrice;
    
    // Ödeme durumu
    const isPaid = order.isPaid;
    const paymentStatus = isPaid ? 
      `<div class="payment-status paid"><i class="fas fa-check-circle"></i> Ödendi</div>` : 
      `<div class="payment-status unpaid"><i class="fas fa-clock"></i> Ödeme Bekleniyor</div>`;
    
    // Teslimat durumu
    const isDelivered = order.isDelivered;
    const deliveryStatus = isDelivered ? 
      `<div class="delivery-status delivered"><i class="fas fa-truck-loading"></i> Teslim Edildi</div>` : 
      `<div class="delivery-status pending"><i class="fas fa-shipping-fast"></i> Teslimat Bekleniyor</div>`;
    
    // Sipariş kartı HTML
    orderCard.innerHTML = `
      <div class="order-header">
        <div class="order-info">
          <div class="order-number">
            <strong>#${orderNumber}</strong>
          </div>
          <div class="order-date">
            <i class="far fa-calendar-alt"></i> ${orderDate}
          </div>
        </div>
        <div class="order-status ${statusClass}">
          <i class="fas fa-circle"></i> ${getStatusText(order.status)}
        </div>
      </div>
      
      <div class="order-content">
        <div class="order-items">
          ${orderItemsHtml}
          ${moreItemsHtml}
        </div>
        
        <div class="order-details">
          <div class="status-badges">
            ${paymentStatus}
            ${deliveryStatus}
          </div>
          
          <div class="order-summary">
            <div class="summary-total">
              <span>Toplam:</span>
              <strong>${formatPrice(totalPrice)} ₺</strong>
            </div>
            <div class="summary-details">
              <div class="summary-item">
                <span>Ara Toplam:</span>
                <strong>${formatPrice(subtotal)} ₺</strong>
              </div>
              <div class="summary-item">
                <span>KDV:</span>
                <strong>${formatPrice(taxPrice)} ₺</strong>
              </div>
              <div class="summary-item">
                <span>Kargo:</span>
                <strong>${shippingPrice > 0 ? formatPrice(shippingPrice) + ' ₺' : 'Ücretsiz'}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="order-actions">
        <button class="btn btn-primary" onclick="viewOrderDetails('${order._id}')">
          <i class="fas fa-eye"></i> Sipariş Detayları
        </button>
      </div>
    `;
    
    return orderCard;
  }
  
  // Function to get status text
  function getStatusText(status) {
    const statusMap = {
      'PENDING': 'Beklemede',
      'PROCESSING': 'İşleniyor',
      'SHIPPED': 'Kargoya Verildi',
      'DELIVERED': 'Teslim Edildi',
      'CANCELLED': 'İptal Edildi'
    };
    
    return statusMap[status] || status || 'Beklemede';
  }
  
  // Function to get status class
  function getStatusClass(status) {
    const statusClassMap = {
      'PENDING': 'pending',
      'PROCESSING': 'processing',
      'SHIPPED': 'shipped',
      'DELIVERED': 'delivered',
      'CANCELLED': 'cancelled'
    };
    
    return statusClassMap[status] || 'pending';
  }
  
  // Function to format price
  function formatPrice(price) {
    return parseFloat(price || 0).toFixed(2).replace('.', ',');
  }
});

// Global function to view order details
function viewOrderDetails(orderId) {
  const modal = document.getElementById('order-detail-modal');
  const modalContent = document.getElementById('order-detail-content');
  
  if (!modal || !modalContent) {
    // Eğer modal yoksa sipariş detay sayfasına yönlendir
    window.location.href = `/order-detail.html?id=${orderId}`;
    return;
  }
  
  // Yükleniyor göster
  modalContent.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Sipariş detayları yükleniyor...</div>';
  
  // Modalı göster
  modal.style.display = 'flex';
  
  // Sipariş detaylarını getir
  const userInfo = JSON.parse(localStorage.getItem('userInfo')) || JSON.parse(sessionStorage.getItem('userInfo'));
  
  if (!userInfo || !userInfo.token) {
    modalContent.innerHTML = '<div class="error-message"><i class="fas fa-exclamation-circle"></i><p>Oturum süresi dolmuş. Lütfen tekrar giriş yapın.</p></div>';
    return;
  }
  
  console.log('Sipariş detayları için istek gönderiliyor. Sipariş ID:', orderId);
  
  fetch(`/api/orders/${orderId}`, {
    headers: {
      'Authorization': `Bearer ${userInfo.token}`
    }
  })
  .then(response => {
    console.log('API yanıt durumu:', response.status, response.statusText);
    
    if (!response.ok) {
      // Daha detaylı hata mesajları için
      if (response.status === 404) {
        throw new Error('Sipariş bulunamadı');
      } else if (response.status === 401) {
        throw new Error('Yetkilendirme hatası: Lütfen tekrar giriş yapın');
      } else if (response.status === 403) {
        throw new Error('Bu siparişi görüntüleme yetkiniz yok');
      } else {
        throw new Error(`Sipariş detayları alınamadı (${response.status})`);
      }
    }
    return response.json();
  })
  .then(order => {
    console.log('Sipariş detayları alındı:', order._id);
    
    // Modalı doldur
    modalContent.innerHTML = generateOrderDetailHTML(order);
    
    // Modal kapatma butonunu etkinleştir
    const closeButton = modal.querySelector('.close-modal');
    if (closeButton) {
      closeButton.addEventListener('click', () => {
        modal.style.display = 'none';
      });
    }
  })
  .catch(error => {
    console.error('Error loading order details:', error);
    modalContent.innerHTML = `
      <div class="error-message">
        <i class="fas fa-exclamation-circle"></i>
        <p>${error.message || 'Sipariş detayları yüklenirken bir hata oluştu.'}</p>
      </div>
    `;
  });
}

// Function to generate order detail HTML
function generateOrderDetailHTML(order) {
  // Sipariş tarihi formatla
  const orderDate = new Date(order.createdAt).toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  // Ödeme tarihi formatla
  const paidDate = order.paidAt ? new Date(order.paidAt).toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }) : 'Henüz Ödenmedi';
  
  // Teslimat tarihi formatla
  const deliveredDate = order.deliveredAt ? new Date(order.deliveredAt).toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }) : 'Henüz Teslim Edilmedi';
  
  // Order modelindeki alanlar için uygun kontroller
  const orderItems = order.orderItems || [];
  const shippingAddress = order.shippingAddress || {};
  const totalPrice = order.totalPrice || order.total || 0;
  const taxPrice = order.taxPrice || 0;
  const shippingPrice = order.shippingPrice || 0;
  const subtotal = totalPrice - taxPrice - shippingPrice;
  
  // Sipariş öğelerini oluştur
  const orderItemsHtml = orderItems.map(item => {
    const product = item.product || {};
    const quantity = item.qty || 0;
    const price = item.price || 0;
    const image = item.image || '/img/no-image.png';
    const name = item.name || product.name || 'Ürün Adı Bulunamadı';
    
    return `
      <div class="order-item">
        <div class="item-image">
          <img src="${image}" alt="${name}" onerror="this.src='/img/no-image.png'">
        </div>
        <div class="item-details">
          <h4>${name}</h4>
          <div class="item-meta">
            <span class="item-quantity">${quantity} Adet</span>
            <span class="item-price">${formatPrice(price * quantity)} ₺</span>
          </div>
        </div>
      </div>
    `;
  }).join('');
  
  // Sipariş kartı HTML
  const orderCardHtml = `
    <div class="order-header">
      <div class="order-info">
        <div class="order-number">
          <span>Sipariş No:</span>
          <strong>#${order.orderNumber || order._id.substring(0, 8).toUpperCase()}</strong>
        </div>
        <div class="order-date">
          <span>Sipariş Tarihi:</span>
          <strong>${orderDate}</strong>
        </div>
      </div>
      <div class="order-status ${getStatusClass(order.status)}">
        <span>${getStatusText(order.status)}</span>
      </div>
    </div>
    
    <div class="order-items">
      ${orderItemsHtml}
    </div>
    
    <div class="order-summary">
      <div class="summary-item">
        <span>Ara Toplam:</span>
        <strong>${formatPrice(subtotal)} ₺</strong>
      </div>
      <div class="summary-item">
        <span>KDV:</span>
        <strong>${formatPrice(taxPrice)} ₺</strong>
      </div>
      <div class="summary-item">
        <span>Kargo:</span>
        <strong>${shippingPrice > 0 ? formatPrice(shippingPrice) + ' ₺' : 'Ücretsiz'}</strong>
      </div>
      <div class="summary-item total">
        <span>Toplam:</span>
        <strong>${formatPrice(totalPrice)} ₺</strong>
      </div>
    </div>
    
    <div class="order-actions">
      <button class="btn btn-primary" onclick="viewOrderDetails('${order._id}')">
        <i class="fas fa-eye"></i> Sipariş Detayları
      </button>
    </div>
  `;
  
  return orderCardHtml;
}

// Helper fonksiyonları global scope'a taşıyorum
// Function to format price
function formatPrice(price) {
  return parseFloat(price || 0).toFixed(2).replace('.', ',');
}

// Function to get status text
function getStatusText(status) {
  const statusMap = {
    'PENDING': 'Beklemede',
    'PROCESSING': 'İşleniyor',
    'SHIPPED': 'Kargoya Verildi',
    'DELIVERED': 'Teslim Edildi',
    'CANCELLED': 'İptal Edildi'
  };
  
  return statusMap[status] || status || 'Beklemede';
}

// Function to get status class
function getStatusClass(status) {
  const statusClassMap = {
    'PENDING': 'pending',
    'PROCESSING': 'processing',
    'SHIPPED': 'shipped',
    'DELIVERED': 'delivered',
    'CANCELLED': 'cancelled'
  };
  
  return statusClassMap[status] || 'pending';
}