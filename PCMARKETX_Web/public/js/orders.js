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
      
      // Sipariş verilerini API'den çek
      const response = await fetch('/api/orders', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Siparişler yüklenirken bir hata oluştu');
      }
      
      const data = await response.json();
      const orders = data.orders || [];
      
      // Render orders
      renderOrders(orders);
    } catch (error) {
      console.error('Error loading orders:', error);
      showNotification('Siparişler yüklenirken bir hata oluştu.', 'error');
    }
  }
  
  // Function to render orders
  function renderOrders(orders) {
    const ordersContainer = document.querySelector('.orders-container');
    
    // Clear existing content except empty state
    const emptyState = ordersContainer.querySelector('.empty-state');
    ordersContainer.innerHTML = '';
    
    if (orders.length === 0) {
      // Show empty state
      ordersContainer.appendChild(emptyState);
      return;
    }
    
    // Create order cards
    orders.forEach(order => {
      const orderCard = createOrderCard(order);
      ordersContainer.appendChild(orderCard);
    });
  }
  
  // Function to create order card
  function createOrderCard(order) {
    const orderCard = document.createElement('div');
    orderCard.className = 'order-card';
    
    const orderHeader = document.createElement('div');
    orderHeader.className = 'order-header';
    
    const orderInfo = document.createElement('div');
    orderInfo.className = 'order-info';
    
    const orderDate = new Date(order.createdAt).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    orderInfo.innerHTML = `
      <div class="order-number">
        <span>Sipariş No:</span>
        <strong>#${order._id.substring(0, 8)}</strong>
      </div>
      <div class="order-date">
        <span>Sipariş Tarihi:</span>
        <strong>${orderDate}</strong>
      </div>
    `;
    
    const orderStatus = document.createElement('div');
    orderStatus.className = `order-status ${order.status.toLowerCase()}`;
    orderStatus.innerHTML = `
      <span>${getStatusText(order.status)}</span>
    `;
    
    orderHeader.appendChild(orderInfo);
    orderHeader.appendChild(orderStatus);
    
    const orderItems = document.createElement('div');
    orderItems.className = 'order-items';
    
    order.items.forEach(item => {
      const orderItem = document.createElement('div');
      orderItem.className = 'order-item';
      orderItem.innerHTML = `
        <div class="item-image">
          <img src="${item.image}" alt="${item.name}">
        </div>
        <div class="item-details">
          <h4>${item.name}</h4>
          <div class="item-meta">
            <span class="item-quantity">${item.quantity} Adet</span>
            <span class="item-price">${(item.price * item.quantity).toFixed(2).replace('.', ',')} ₺</span>
          </div>
        </div>
      `;
      orderItems.appendChild(orderItem);
    });
    
    const orderSummary = document.createElement('div');
    orderSummary.className = 'order-summary';
    orderSummary.innerHTML = `
      <div class="summary-item">
        <span>Ara Toplam:</span>
        <strong>${order.subTotal.toFixed(2).replace('.', ',')} ₺</strong>
      </div>
      <div class="summary-item">
        <span>Kargo:</span>
        <strong>${order.shipping > 0 ? order.shipping.toFixed(2).replace('.', ',') + ' ₺' : 'Ücretsiz'}</strong>
      </div>
      ${order.discount > 0 ? `
        <div class="summary-item discount">
          <span>İndirim:</span>
          <strong>-${order.discount.toFixed(2).replace('.', ',')} ₺</strong>
        </div>
      ` : ''}
      <div class="summary-item total">
        <span>Toplam:</span>
        <strong>${order.total.toFixed(2).replace('.', ',')} ₺</strong>
      </div>
    `;
    
    const orderActions = document.createElement('div');
    orderActions.className = 'order-actions';
    
    const viewDetailsBtn = document.createElement('button');
    viewDetailsBtn.className = 'btn btn-primary';
    viewDetailsBtn.textContent = 'Sipariş Detayları';
    viewDetailsBtn.addEventListener('click', () => viewOrderDetails(order._id));
    
    orderActions.appendChild(viewDetailsBtn);
    
    orderCard.appendChild(orderHeader);
    orderCard.appendChild(orderItems);
    orderCard.appendChild(orderSummary);
    orderCard.appendChild(orderActions);
    
    return orderCard;
  }
  
  // Function to get status text
  function getStatusText(status) {
    const statusMap = {
      'pending': 'Sipariş Alındı',
      'processing': 'Hazırlanıyor',
      'shipped': 'Kargoya Verildi',
      'delivered': 'Teslim Edildi',
      'cancelled': 'İptal Edildi'
    };
    
    return statusMap[status.toLowerCase()] || 'Bilinmeyen Durum';
  }
  
  // Function to view order details
  function viewOrderDetails(orderId) {
    // In real application, this would navigate to order details page
    window.location.href = `/order-details.html?id=${orderId}`;
  }
  
  // Function to show notification
  function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
      <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
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
}); 