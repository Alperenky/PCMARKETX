// Admin Siparişler sayfası için JavaScript

document.addEventListener('DOMContentLoaded', function() {
    console.log('Admin Orders JS yüklendi');
    initOrdersPage();
});

/**
 * Siparişleri listeleme sayfasını başlat
 */
function initOrdersPage() {
    console.log('Siparişler sayfası başlatılıyor...');
    let currentPage = 1;
    let ordersPerPage = 10;
    
    // Filtre elemanlarını seç
    const filterStatus = document.getElementById('filterStatus');
    const filterDateFrom = document.getElementById('filterDateFrom');
    const filterDateTo = document.getElementById('filterDateTo');
    const filterSearch = document.getElementById('filterSearch');
    const resetFiltersBtn = document.getElementById('resetFilters');
    
    // Filtreleri temizle butonu
    if (resetFiltersBtn) {
        resetFiltersBtn.addEventListener('click', function() {
            filterStatus.value = '';
            filterDateFrom.value = '';
            filterDateTo.value = '';
            filterSearch.value = '';
            loadOrders(1);
        });
    }
    
    // Filtre değiştiğinde siparişleri yeniden yükle
    if (filterStatus) filterStatus.addEventListener('change', () => loadOrders(1));
    if (filterDateFrom) filterDateFrom.addEventListener('change', () => loadOrders(1));
    if (filterDateTo) filterDateTo.addEventListener('change', () => loadOrders(1));
    if (filterSearch) {
        filterSearch.addEventListener('keyup', function(e) {
            if (e.key === 'Enter') {
                loadOrders(1);
            }
        });
    }
    
    // Export butonu
    const exportBtn = document.getElementById('exportOrders');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportOrders);
    }
    
    // Siparişleri yükle fonksiyonu
    async function loadOrders(page = 1) {
        try {
            currentPage = page;
            showLoading('#ordersTable');
            
            // Filtre parametrelerini hazırla
            const params = {
                page: page,
                limit: ordersPerPage
            };
            
            if (filterStatus && filterStatus.value) {
                params.status = filterStatus.value;
            }
            
            if (filterSearch && filterSearch.value) {
                params.search = filterSearch.value;
            }
            
            if (filterDateFrom && filterDateFrom.value) {
                params.dateFrom = filterDateFrom.value;
            }
            
            if (filterDateTo && filterDateTo.value) {
                params.dateTo = filterDateTo.value;
            }
            
            console.log('Sipariş API sorgusu:', params);
            
            // API'den siparişleri al
            const response = await AdminAPI.getOrders(params);
            console.log('Siparişler API yanıtı:', response);
            
            // Yanıt kontrolü
            if (!response || (!response.data && !response.orders)) {
                console.error('API yanıtı geçersiz:', response);
                showNotification('API yanıtı geçersiz format içeriyor', 'error');
                return;
            }
            
            // Eski API formatı için uyumluluk (data veya orders)
            const orders = response.data || response.orders || [];
            
            // Tabloyu güncelle
            renderOrdersTable(orders);
            
            // Sayfalama oluştur
            renderPagination(
                page, 
                response.totalPages || 1, 
                loadOrders, 
                'ordersPagination'
            );
            
        } catch (error) {
            console.error('Siparişler yüklenirken hata:', error);
            showNotification('Siparişler yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.', 'error');
            
            // Hata durumunda boş tablo göster
            renderOrdersTable([]);
            renderPagination(1, 1, loadOrders, 'ordersPagination');
        } finally {
            hideLoading('#ordersTable');
        }
    }
    
    // Siparişleri tabloya render et
    function renderOrdersTable(orders) {
        const tableBody = document.querySelector('#ordersTable tbody');
        if (!tableBody) return;
        
        console.log('Tabloya yüklenecek siparişler:', orders);
        
        tableBody.innerHTML = '';
        
        if (!orders || orders.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center">Sipariş bulunamadı</td>
                </tr>
            `;
            return;
        }
        
        orders.forEach(order => {
            try {
                if (!order || !order._id) {
                    console.error('Geçersiz sipariş verisi:', order);
                    return;
                }
                
                const row = document.createElement('tr');
                
                // Sipariş durumuna göre sınıf ekle
                const statusClass = getOrderStatusClass(order.status);
                const statusText = translateOrderStatus(order.status);
                
                // Kullanıcı veya müşteri bilgisi kontrolü
                let customerName = 'Misafir';
                if (order.user && order.user.username) {
                    customerName = order.user.username;
                } else if (order.customer && order.customer.name) {
                    customerName = order.customer.name;
                }
                
                let formattedDate = '';
                try {
                    formattedDate = formatDate(order.createdAt);
                } catch (e) {
                    console.warn('Tarih formatlanırken hata:', e);
                    formattedDate = order.createdAt || '';
                }
                
                row.innerHTML = `
                    <td><a href="#" class="order-link" data-id="${order._id}">${order.orderNumber || order._id}</a></td>
                    <td>${customerName}</td>
                    <td>${formattedDate}</td>
                    <td>${formatPrice(order.total || order.totalPrice || 0)}</td>
                    <td>${order.paymentMethod || 'Belirtilmemiş'}</td>
                    <td><span class="badge ${statusClass}">${statusText}</span></td>
                    <td>
                        <div class="table-actions">
                            <button class="btn btn-sm btn-light view-order" data-id="${order._id}" title="Görüntüle">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="btn btn-sm btn-primary edit-order" data-id="${order._id}" title="Düzenle">
                                <i class="fas fa-edit"></i>
                            </button>
                        </div>
                    </td>
                `;
                
                tableBody.appendChild(row);
            } catch (error) {
                console.error('Sipariş satırı oluşturulurken hata:', error, order);
            }
        });
        
        // Sipariş detayı butonlarını aktif et
        document.querySelectorAll('.view-order, .order-link').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                const orderId = this.getAttribute('data-id');
                viewOrderDetails(orderId);
            });
        });
        
        // Sipariş düzenleme butonlarını aktif et
        document.querySelectorAll('.edit-order').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                const orderId = this.getAttribute('data-id');
                editOrder(orderId);
            });
        });
    }
    
    // Sipariş durumuna göre sınıf döndür
    function getOrderStatusClass(status) {
        if (!status) return 'bg-warning';
        
        status = status.toUpperCase();
        
        switch(status) {
            case 'DELIVERED':
            case 'TESLİM EDİLDİ':
                return 'bg-success';
            case 'PROCESSING':
            case 'İŞLENİYOR':
                return 'bg-primary';
            case 'SHIPPED':
            case 'KARGOYA VERİLDİ':
                return 'bg-info';
            case 'CANCELED':
            case 'İPTAL EDİLDİ':
                return 'bg-danger';
            case 'PENDING':
            case 'BEKLEMEDE':
            default:
                return 'bg-warning';
        }
    }
    
    // Sipariş durumunu Türkçe'ye çevir
    function translateOrderStatus(status) {
        if (!status) return 'Beklemede';
        
        status = status.toUpperCase();
        
        switch(status) {
            case 'PENDING':
            case 'BEKLEMEDE':
                return 'Beklemede';
            case 'PROCESSING':
            case 'İŞLENİYOR':
                return 'İşleniyor';
            case 'SHIPPED':
            case 'KARGOYA VERİLDİ':
                return 'Kargoya Verildi';
            case 'DELIVERED':
            case 'TESLİM EDİLDİ':
                return 'Teslim Edildi';
            case 'CANCELED':
            case 'İPTAL EDİLDİ':
                return 'İptal Edildi';
            default:
                return status;
        }
    }
    
    // Sipariş detaylarını görüntüle
    async function viewOrderDetails(orderId) {
        try {
            console.log('Sipariş detayları görüntüleniyor, ID:', orderId);
            showLoading();
            
            // Siparişi getir
            const order = await AdminAPI.getOrderById(orderId);
            console.log('Sipariş detayları başarıyla alındı:', order);
            
            // Modal bilgilerini doldur
            document.getElementById('orderNumber').textContent = order.orderNumber || order._id;
            document.getElementById('orderDate').textContent = formatDate(order.createdAt);
            document.getElementById('orderStatus').textContent = translateOrderStatus(order.status);
            document.getElementById('paymentMethod').textContent = order.paymentMethod || 'Belirtilmemiş';
            document.getElementById('paymentStatus').textContent = order.isPaid ? 'Ödendi' : 'Ödenmedi';
            
            // Durum güncelleme selectbox
            const statusSelect = document.getElementById('newOrderStatus');
            if (statusSelect) {
                statusSelect.value = order.status.toLowerCase();
            }
            
            // Adres bilgileri
            const billingAddressEl = document.getElementById('billingAddress');
            const shippingAddressEl = document.getElementById('shippingAddress');
            
            if (billingAddressEl && order.billingAddress) {
                billingAddressEl.innerHTML = formatAddress(order.billingAddress);
            } else if (billingAddressEl) {
                billingAddressEl.innerHTML = '<p>Fatura adresi belirtilmemiş</p>';
            }
            
            if (shippingAddressEl && order.shippingAddress) {
                shippingAddressEl.innerHTML = formatAddress(order.shippingAddress);
            } else if (shippingAddressEl) {
                shippingAddressEl.innerHTML = '<p>Teslimat adresi belirtilmemiş</p>';
            }
            
            // Sipariş ürünleri
            const orderItemsEl = document.getElementById('orderItemsList');
            if (orderItemsEl && order.orderItems && order.orderItems.length > 0) {
                orderItemsEl.innerHTML = '';
                
                let subtotal = 0;
                
                order.orderItems.forEach(item => {
                    const row = document.createElement('tr');
                    const itemTotal = item.price * item.qty;
                    subtotal += itemTotal;
                    
                    row.innerHTML = `
                        <td>
                            <div style="display: flex; align-items: center; gap: 10px;">
                                <div style="width: 50px; height: 50px; overflow: hidden; border-radius: 4px;">
                                    <img src="${item.image || '../img/product-placeholder.png'}" alt="${item.name}" style="width: 100%; height: 100%; object-fit: cover;">
                                </div>
                                <div>
                                    <div style="font-weight: 500;">${item.name}</div>
                                    <div style="color: #666; font-size: 0.8rem;">${item.product}</div>
                                </div>
                            </div>
                        </td>
                        <td>${formatPrice(item.price)}</td>
                        <td>${item.qty}</td>
                        <td>${formatPrice(itemTotal)}</td>
                    `;
                    
                    orderItemsEl.appendChild(row);
                });
                
                // Toplam bilgileri
                document.getElementById('orderSubtotal').textContent = formatPrice(subtotal);
                
                // Diğer toplam alanları
                const taxRowEl = document.getElementById('taxRow');
                if (taxRowEl) {
                    if (order.taxPrice) {
                        document.getElementById('orderTax').textContent = formatPrice(order.taxPrice);
                        taxRowEl.style.display = '';
                    } else {
                        taxRowEl.style.display = 'none';
                    }
                }
                
                if (order.shippingPrice) {
                    document.getElementById('orderShipping').textContent = formatPrice(order.shippingPrice);
                } else {
                    document.getElementById('orderShipping').textContent = formatPrice(0);
                }
                
                const discountRowEl = document.getElementById('discountRow');
                if (discountRowEl) {
                    if (order.discount) {
                        document.getElementById('orderDiscount').textContent = formatPrice(order.discount);
                        discountRowEl.style.display = '';
                    } else {
                        discountRowEl.style.display = 'none';
                    }
                }
                
                document.getElementById('orderTotal').textContent = formatPrice(order.total);
            }
            
            // Müşteri bilgileri
            if (order.user) {
                document.getElementById('customerName').textContent = order.user.username || 'Belirtilmemiş';
                document.getElementById('customerEmail').textContent = order.user.email || 'Belirtilmemiş';
                document.getElementById('customerPhone').textContent = order.user.phone || 'Belirtilmemiş';
                document.getElementById('customerRegistered').textContent = formatDate(order.user.createdAt) || 'Belirtilmemiş';
                
                // Müşteri profil linki
                const viewCustomerLink = document.getElementById('viewCustomerLink');
                if (viewCustomerLink) {
                    viewCustomerLink.href = `customers.html?id=${order.user._id}`;
                }
            }
            
            // Durum güncelleme butonunu aktif et
            const updateStatusBtn = document.getElementById('updateStatus');
            if (updateStatusBtn) {
                updateStatusBtn.onclick = async function() {
                    try {
                        const newStatus = document.getElementById('newOrderStatus').value;
                        await AdminAPI.updateOrderStatus(orderId, newStatus);
                        showNotification('Sipariş durumu güncellendi', 'success');
                        
                        // Sipariş listesini yenile
                        loadOrders(currentPage);
                        
                        // Modal'ı kapat
                        closeModal('orderDetailModal');
                    } catch (error) {
                        console.error('Sipariş durumu güncellenirken hata:', error);
                        showNotification('Sipariş durumu güncellenirken bir hata oluştu', 'error');
                    }
                };
            }
            
            // Yazdır butonu
            const printOrderBtn = document.getElementById('printOrder');
            if (printOrderBtn) {
                printOrderBtn.onclick = function() {
                    printOrder(order);
                };
            }
            
            // Modal'ı aç - Direkt CSS özellikleri kullanarak açalım
            const modal = document.getElementById('orderDetailModal');
            console.log('Modal açılıyor:', modal);
            
            if (modal) {
                modal.style.display = 'flex';
                modal.style.opacity = '1';
                modal.style.visibility = 'visible';
                document.body.classList.add('modal-open');
                console.log('Modal başarıyla açıldı');
                
                // Modal kapatma işlemlerini tanımla
                const closeButtons = modal.querySelectorAll('.modal-close, [data-dismiss="modal"]');
                closeButtons.forEach(btn => {
                    btn.addEventListener('click', function() {
                        modal.style.display = 'none';
                        modal.style.opacity = '0';
                        modal.style.visibility = 'hidden';
                        document.body.classList.remove('modal-open');
                        console.log('Modal kapatıldı');
                    });
                });
            } else {
                console.error('Modal elementi bulunamadı: orderDetailModal');
                alert('Modal elementi bulunamadı! Lütfen sayfayı yenileyin.');
            }
            
        } catch (error) {
            console.error('Sipariş detayları yüklenirken hata:', error);
            showNotification('Sipariş detayları yüklenirken bir hata oluştu', 'error');
        } finally {
            hideLoading();
        }
    }
    
    // Adresi formatla
    function formatAddress(address) {
        if (!address) return 'Adres belirtilmemiş';
        
        const addressParts = [];
        if (address.address) addressParts.push(address.address);
        if (address.city) addressParts.push(address.city);
        if (address.postalCode) addressParts.push(address.postalCode);
        if (address.country) addressParts.push(address.country);
        
        return addressParts.join('<br>');
    }
    
    // Sipariş düzenleme
    function editOrder(orderId) {
        // Düzenleme sayfasına yönlendir
        window.location.href = `order-edit.html?id=${orderId}`;
    }
    
    // Siparişleri dışa aktar
    function exportOrders() {
        try {
            showLoading();
            
            // Filtre parametrelerini hazırla
            const params = {};
            
            if (filterStatus && filterStatus.value) {
                params.status = filterStatus.value;
            }
            
            if (filterSearch && filterSearch.value) {
                params.search = filterSearch.value;
            }
            
            if (filterDateFrom && filterDateFrom.value) {
                params.dateFrom = filterDateFrom.value;
            }
            
            if (filterDateTo && filterDateTo.value) {
                params.dateTo = filterDateTo.value;
            }
            
            // Tüm siparişleri getir
            AdminAPI.getOrders({ ...params, limit: 1000 })
                .then(response => {
                    const orders = response.data || [];
                    
                    if (orders.length === 0) {
                        showNotification('Dışa aktarılacak sipariş bulunamadı', 'warning');
                        return;
                    }
                    
                    // CSV formatına dönüştür
                    const csv = exportToCSV(orders);
                    
                    // İndirme bağlantısı oluştur
                    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                    const url = URL.createObjectURL(blob);
                    
                    const link = document.createElement('a');
                    link.href = url;
                    link.setAttribute('download', `siparisler-${new Date().toISOString().split('T')[0]}.csv`);
                    link.style.display = 'none';
                    
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    
                    showNotification(`${orders.length} sipariş başarıyla dışa aktarıldı`, 'success');
                })
                .catch(error => {
                    console.error('Siparişler dışa aktarılırken hata:', error);
                    showNotification('Siparişler dışa aktarılırken bir hata oluştu', 'error');
                })
                .finally(() => {
                    hideLoading();
                });
        } catch (error) {
            console.error('Siparişler dışa aktarılırken hata:', error);
            showNotification('Siparişler dışa aktarılırken bir hata oluştu', 'error');
            hideLoading();
        }
    }
    
    // CSV formatına dönüştür
    function exportToCSV(orders) {
        // CSV başlıkları
        const headers = [
            'Sipariş ID',
            'Sipariş Numarası',
            'Müşteri',
            'E-posta',
            'Tarih',
            'Toplam',
            'Ödeme Türü',
            'Durum'
        ].join(',');
        
        // Siparişleri CSV satırlarına dönüştür
        const rows = orders.map(order => {
            return [
                order._id,
                order.orderNumber || order._id,
                order.user ? order.user.username : 'Misafir',
                order.user ? order.user.email : '',
                new Date(order.createdAt).toLocaleString(),
                order.total,
                order.paymentMethod || '',
                order.status
            ].map(value => {
                // CSV formatı için değerleri düzenle
                if (value === null || value === undefined) return '';
                return `"${String(value).replace(/"/g, '""')}"`;
            }).join(',');
        });
        
        // Başlık ve satırları birleştir
        return headers + '\n' + rows.join('\n');
    }
    
    // Sipariş yazdır
    function printOrder(order) {
        const printWindow = window.open('', '_blank');
        
        if (!printWindow) {
            showNotification('Tarayıcınız açılır pencere açılmasını engelliyor olabilir', 'warning');
            return;
        }
        
        // Yazdırma HTML'ini oluştur
        let printContent = `
            <html>
            <head>
                <title>Sipariş #${order.orderNumber || order._id}</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    .header { text-align: center; margin-bottom: 20px; }
                    .logo { font-size: 24px; font-weight: bold; }
                    .info-section { margin-bottom: 20px; }
                    .info-section h3 { border-bottom: 1px solid #ddd; padding-bottom: 5px; }
                    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    table th, table td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
                    .totals { margin-top: 20px; text-align: right; }
                    .totals div { margin-bottom: 5px; }
                    .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #666; }
                    @media print {
                        body { margin: 0; }
                        .no-print { display: none; }
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <div class="logo">PC MARKET X</div>
                    <div>Sipariş #${order.orderNumber || order._id}</div>
                    <div>${formatDate(order.createdAt)}</div>
                </div>
                
                <div class="info-section">
                    <h3>Sipariş Bilgileri</h3>
                    <div class="info-grid">
                        <div>
                            <p><strong>Sipariş Durumu:</strong> ${translateOrderStatus(order.status)}</p>
                            <p><strong>Ödeme Türü:</strong> ${order.paymentMethod || 'Belirtilmemiş'}</p>
                            <p><strong>Ödeme Durumu:</strong> ${order.isPaid ? 'Ödendi' : 'Ödenmedi'}</p>
                        </div>
                        <div>
                            <p><strong>Müşteri:</strong> ${order.user ? order.user.username : 'Misafir'}</p>
                            <p><strong>E-posta:</strong> ${order.user ? order.user.email : ''}</p>
                            <p><strong>Telefon:</strong> ${order.user && order.user.phone ? order.user.phone : 'Belirtilmemiş'}</p>
                        </div>
                    </div>
                </div>
                
                <div class="info-section">
                    <h3>Adres Bilgileri</h3>
                    <div class="info-grid">
                        <div>
                            <h4>Fatura Adresi</h4>
                            ${order.billingAddress ? formatAddressPlain(order.billingAddress) : 'Belirtilmemiş'}
                        </div>
                        <div>
                            <h4>Teslimat Adresi</h4>
                            ${order.shippingAddress ? formatAddressPlain(order.shippingAddress) : 'Belirtilmemiş'}
                        </div>
                    </div>
                </div>
                
                <div class="info-section">
                    <h3>Sipariş Ürünleri</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>Ürün</th>
                                <th>Birim Fiyat</th>
                                <th>Miktar</th>
                                <th>Toplam</th>
                            </tr>
                        </thead>
                        <tbody>
        `;
        
        // Ürünleri ekle
        let subtotal = 0;
        if (order.orderItems && order.orderItems.length > 0) {
            order.orderItems.forEach(item => {
                const itemTotal = item.price * item.qty;
                subtotal += itemTotal;
                
                printContent += `
                    <tr>
                        <td>${item.name}</td>
                        <td>${formatPrice(item.price)}</td>
                        <td>${item.qty}</td>
                        <td>${formatPrice(itemTotal)}</td>
                    </tr>
                `;
            });
        } else {
            printContent += `
                <tr>
                    <td colspan="4" style="text-align: center;">Ürün bulunamadı</td>
                </tr>
            `;
        }
        
        // Toplam bilgilerini ekle
        printContent += `
                        </tbody>
                    </table>
                    
                    <div class="totals">
                        <div><strong>Ara Toplam:</strong> ${formatPrice(subtotal)}</div>
        `;
        
        if (order.discount) {
            printContent += `<div><strong>İndirim:</strong> ${formatPrice(order.discount)}</div>`;
        }
        
        if (order.taxPrice) {
            printContent += `<div><strong>Vergiler:</strong> ${formatPrice(order.taxPrice)}</div>`;
        }
        
        printContent += `
                        <div><strong>Kargo:</strong> ${formatPrice(order.shippingPrice || 0)}</div>
                        <div style="font-size: 1.2em;"><strong>Toplam:</strong> ${formatPrice(order.total)}</div>
                    </div>
                </div>
                
                <div class="footer">
                    <p>Bu sipariş ${formatDate(order.createdAt)} tarihinde oluşturulmuştur.</p>
                    <p>PC MARKET X © ${new Date().getFullYear()}</p>
                </div>
                
                <div class="no-print" style="text-align: center; margin-top: 20px;">
                    <button onclick="window.print()">Yazdır</button>
                </div>
            </body>
            </html>
        `;
        
        printWindow.document.open();
        printWindow.document.write(printContent);
        printWindow.document.close();
        
        // Sayfa yüklendikten sonra yazdır
        printWindow.onload = function() {
            printWindow.setTimeout(function() {
                printWindow.focus();
                printWindow.print();
            }, 1000);
        };
    }
    
    // Adres bilgilerini düz metin olarak formatla
    function formatAddressPlain(address) {
        if (!address) return 'Adres belirtilmemiş';
        
        const parts = [];
        if (address.address) parts.push(address.address);
        if (address.city) parts.push(address.city);
        if (address.postalCode) parts.push(address.postalCode);
        if (address.country) parts.push(address.country);
        
        return parts.map(part => `<p>${part}</p>`).join('');
    }
    
    // Modal fonksiyonları
    function openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('show');
            document.body.classList.add('modal-open');
            
            console.log('Modal açılıyor:', modalId, modal);
        } else {
            console.error('Modal bulunamadı:', modalId);
        }
    }
    
    function closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('show');
            document.body.classList.remove('modal-open');
        } else {
            console.error('Modal bulunamadı:', modalId);
        }
    }
    
    // Modal kapatma butonlarını etkinleştir
    document.querySelectorAll('.modal-close, [data-dismiss="modal"]').forEach(btn => {
        btn.addEventListener('click', function() {
            const modal = this.closest('.modal');
            if (modal) {
                modal.classList.remove('show');
                document.body.classList.remove('modal-open');
            }
        });
    });
    
    // Tab'ları etkinleştir
    document.querySelectorAll('.tab-btn').forEach(tab => {
        tab.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            
            // Tüm tab butonlarını pasif yap
            document.querySelectorAll('.tab-btn').forEach(t => t.classList.remove('active'));
            // Tüm tab içeriklerini gizle
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            
            // Seçilen tab'ı aktif yap
            this.classList.add('active');
            document.getElementById(tabId).classList.add('active');
        });
    });
    
    // İlk yüklemeyi başlat
    loadOrders(1);
} 