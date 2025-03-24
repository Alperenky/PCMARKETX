document.addEventListener('DOMContentLoaded', function() {
  // Check if user is logged in
  const userInfo = JSON.parse(localStorage.getItem('userInfo')) || JSON.parse(sessionStorage.getItem('userInfo'));
  
  if (!userInfo) {
    return;
  }
  
  // Get elements
  const addAddressBtn = document.getElementById('add-address-btn');
  const addressesList = document.querySelector('.addresses-list');
  
  if (addAddressBtn) {
    addAddressBtn.addEventListener('click', showAddressForm);
  }
  
  // Load user addresses
  loadAddresses();
  
  // Function to load user addresses
  async function loadAddresses() {
    try {
      const token = userInfo.token;
      
      const response = await fetch('/api/users/addresses', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (response.ok && data.addresses && data.addresses.length > 0) {
        // Clear empty state if exists
        const emptyState = addressesList.querySelector('.empty-state');
        if (emptyState) {
          addressesList.removeChild(emptyState);
        }
        
        // Render addresses
        renderAddresses(data.addresses);
      }
    } catch (error) {
      console.error('Error loading addresses:', error);
    }
  }
  
  // Function to render addresses
  function renderAddresses(addresses) {
    // Clear existing addresses
    addressesList.innerHTML = '';
    
    // Create addresses container
    const addressesContainer = document.createElement('div');
    addressesContainer.className = 'addresses-container';
    
    // Add button to add new address
    const addNewBtn = document.createElement('button');
    addNewBtn.className = 'btn btn-primary add-address-btn';
    addNewBtn.textContent = 'Yeni Adres Ekle';
    addNewBtn.addEventListener('click', showAddressForm);
    
    addressesContainer.appendChild(addNewBtn);
    
    // Add each address
    addresses.forEach(address => {
      const addressCard = createAddressCard(address);
      addressesContainer.appendChild(addressCard);
    });
    
    // Append to addresses list
    addressesList.appendChild(addressesContainer);
  }
  
  // Function to create address card
  function createAddressCard(address) {
    const card = document.createElement('div');
    card.className = 'address-card';
    card.dataset.id = address._id;
    
    const addressTitle = document.createElement('h4');
    addressTitle.textContent = address.title || 'Adres';
    
    const addressContent = document.createElement('p');
    addressContent.textContent = formatAddress(address);
    
    const actionButtons = document.createElement('div');
    actionButtons.className = 'address-actions';
    
    const editButton = document.createElement('button');
    editButton.className = 'btn btn-sm btn-outline';
    editButton.innerHTML = '<i class="fas fa-edit"></i> Düzenle';
    editButton.addEventListener('click', () => editAddress(address));
    
    const deleteButton = document.createElement('button');
    deleteButton.className = 'btn btn-sm btn-outline-danger';
    deleteButton.innerHTML = '<i class="fas fa-trash"></i> Sil';
    deleteButton.addEventListener('click', () => deleteAddress(address._id));
    
    actionButtons.appendChild(editButton);
    actionButtons.appendChild(deleteButton);
    
    card.appendChild(addressTitle);
    card.appendChild(addressContent);
    card.appendChild(actionButtons);
    
    return card;
  }
  
  // Function to format address
  function formatAddress(address) {
    const parts = [];
    
    if (address.street) parts.push(address.street);
    if (address.city) parts.push(address.city);
    if (address.state) parts.push(address.state);
    if (address.postalCode) parts.push(address.postalCode);
    if (address.country) parts.push(address.country);
    
    return parts.join(', ');
  }
  
  // Function to show address form
  function showAddressForm(addressData = null) {
    // Remove existing form if any
    const existingForm = document.querySelector('.address-form-container');
    if (existingForm) {
      existingForm.remove();
    }
    
    // Create form container
    const formContainer = document.createElement('div');
    formContainer.className = 'address-form-container';
    
    // Create form
    const form = document.createElement('form');
    form.className = 'address-form';
    form.id = 'address-form';
    
    // Form title
    const formTitle = document.createElement('h3');
    formTitle.textContent = addressData ? 'Adresi Düzenle' : 'Yeni Adres Ekle';
    form.appendChild(formTitle);
    
    // Address title
    const titleGroup = document.createElement('div');
    titleGroup.className = 'form-group';
    
    const titleLabel = document.createElement('label');
    titleLabel.setAttribute('for', 'address-title');
    titleLabel.textContent = 'Adres Başlığı';
    
    const titleInput = document.createElement('input');
    titleInput.type = 'text';
    titleInput.id = 'address-title';
    titleInput.name = 'title';
    titleInput.placeholder = 'Ev, İş, vb.';
    titleInput.value = addressData?.title || '';
    
    titleGroup.appendChild(titleLabel);
    titleGroup.appendChild(titleInput);
    form.appendChild(titleGroup);
    
    // Street
    const streetGroup = document.createElement('div');
    streetGroup.className = 'form-group';
    
    const streetLabel = document.createElement('label');
    streetLabel.setAttribute('for', 'address-street');
    streetLabel.textContent = 'Sokak Adresi';
    
    const streetInput = document.createElement('input');
    streetInput.type = 'text';
    streetInput.id = 'address-street';
    streetInput.name = 'street';
    streetInput.placeholder = 'Sokak adı, bina no, daire no';
    streetInput.value = addressData?.street || '';
    streetInput.required = true;
    
    streetGroup.appendChild(streetLabel);
    streetGroup.appendChild(streetInput);
    form.appendChild(streetGroup);
    
    // City and State
    const cityStateRow = document.createElement('div');
    cityStateRow.className = 'form-row';
    
    // City
    const cityGroup = document.createElement('div');
    cityGroup.className = 'form-group';
    
    const cityLabel = document.createElement('label');
    cityLabel.setAttribute('for', 'address-city');
    cityLabel.textContent = 'İlçe';
    
    const cityInput = document.createElement('input');
    cityInput.type = 'text';
    cityInput.id = 'address-city';
    cityInput.name = 'city';
    cityInput.placeholder = 'İlçe';
    cityInput.value = addressData?.city || '';
    cityInput.required = true;
    
    cityGroup.appendChild(cityLabel);
    cityGroup.appendChild(cityInput);
    cityStateRow.appendChild(cityGroup);
    
    // State
    const stateGroup = document.createElement('div');
    stateGroup.className = 'form-group';
    
    const stateLabel = document.createElement('label');
    stateLabel.setAttribute('for', 'address-state');
    stateLabel.textContent = 'İl';
    
    const stateInput = document.createElement('input');
    stateInput.type = 'text';
    stateInput.id = 'address-state';
    stateInput.name = 'state';
    stateInput.placeholder = 'İl';
    stateInput.value = addressData?.state || '';
    stateInput.required = true;
    
    stateGroup.appendChild(stateLabel);
    stateGroup.appendChild(stateInput);
    cityStateRow.appendChild(stateGroup);
    
    form.appendChild(cityStateRow);
    
    // Postal Code and Country
    const postalCountryRow = document.createElement('div');
    postalCountryRow.className = 'form-row';
    
    // Postal Code
    const postalGroup = document.createElement('div');
    postalGroup.className = 'form-group';
    
    const postalLabel = document.createElement('label');
    postalLabel.setAttribute('for', 'address-postal');
    postalLabel.textContent = 'Posta Kodu';
    
    const postalInput = document.createElement('input');
    postalInput.type = 'text';
    postalInput.id = 'address-postal';
    postalInput.name = 'postalCode';
    postalInput.placeholder = 'Posta Kodu';
    postalInput.value = addressData?.postalCode || '';
    
    postalGroup.appendChild(postalLabel);
    postalGroup.appendChild(postalInput);
    postalCountryRow.appendChild(postalGroup);
    
    // Country
    const countryGroup = document.createElement('div');
    countryGroup.className = 'form-group';
    
    const countryLabel = document.createElement('label');
    countryLabel.setAttribute('for', 'address-country');
    countryLabel.textContent = 'Ülke';
    
    const countryInput = document.createElement('input');
    countryInput.type = 'text';
    countryInput.id = 'address-country';
    countryInput.name = 'country';
    countryInput.placeholder = 'Ülke';
    countryInput.value = addressData?.country || 'Türkiye';
    
    countryGroup.appendChild(countryLabel);
    countryGroup.appendChild(countryInput);
    postalCountryRow.appendChild(countryGroup);
    
    form.appendChild(postalCountryRow);
    
    // Form actions
    const formActions = document.createElement('div');
    formActions.className = 'form-actions';
    
    const cancelButton = document.createElement('button');
    cancelButton.type = 'button';
    cancelButton.className = 'btn btn-outline';
    cancelButton.textContent = 'İptal';
    cancelButton.addEventListener('click', () => formContainer.remove());
    
    const submitButton = document.createElement('button');
    submitButton.type = 'submit';
    submitButton.className = 'btn btn-primary';
    submitButton.textContent = addressData ? 'Güncelle' : 'Kaydet';
    
    formActions.appendChild(cancelButton);
    formActions.appendChild(submitButton);
    form.appendChild(formActions);
    
    // Add hidden field for address ID if editing
    if (addressData && addressData._id) {
      const idInput = document.createElement('input');
      idInput.type = 'hidden';
      idInput.name = 'addressId';
      idInput.value = addressData._id;
      form.appendChild(idInput);
    }
    
    // Form submission
    form.addEventListener('submit', handleAddressFormSubmit);
    
    formContainer.appendChild(form);
    addressesList.appendChild(formContainer);
  }
  
  // Function to handle address form submission
  async function handleAddressFormSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    const addressData = {};
    
    for (const [key, value] of formData.entries()) {
      addressData[key] = value;
    }
    
    const isEditing = !!addressData.addressId;
    const token = userInfo.token;
    
    try {
      const url = isEditing 
        ? `/api/users/addresses/${addressData.addressId}` 
        : '/api/users/addresses';
      
      const method = isEditing ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(addressData)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Remove form
        form.parentElement.remove();
        
        // Reload addresses
        loadAddresses();
        
        // Show success message
        showNotification(
          isEditing ? 'Adres başarıyla güncellendi.' : 'Adres başarıyla eklendi.', 
          'success'
        );
      } else {
        showNotification(data.message || 'Bir hata oluştu.', 'error');
      }
    } catch (error) {
      console.error('Error saving address:', error);
      showNotification('Bir hata oluştu.', 'error');
    }
  }
  
  // Function to edit address
  function editAddress(address) {
    showAddressForm(address);
  }
  
  // Function to delete address
  async function deleteAddress(addressId) {
    if (!confirm('Bu adresi silmek istediğinizden emin misiniz?')) {
      return;
    }
    
    try {
      const token = userInfo.token;
      
      const response = await fetch(`/api/users/addresses/${addressId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        // Reload addresses
        loadAddresses();
        
        // Show success message
        showNotification('Adres başarıyla silindi.', 'success');
      } else {
        const data = await response.json();
        showNotification(data.message || 'Adres silinirken bir hata oluştu.', 'error');
      }
    } catch (error) {
      console.error('Error deleting address:', error);
      showNotification('Adres silinirken bir hata oluştu.', 'error');
    }
  }
  
  // Function to show notification
  function showNotification(message, type = 'info') {
    // Check if notification container exists
    let notificationContainer = document.querySelector('.notification-container');
    
    // Create container if it doesn't exist
    if (!notificationContainer) {
      notificationContainer = document.createElement('div');
      notificationContainer.className = 'notification-container';
      document.body.appendChild(notificationContainer);
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    // Create message element
    const messageElement = document.createElement('div');
    messageElement.textContent = message;
    
    // Create close button
    const closeButton = document.createElement('button');
    closeButton.className = 'notification-close';
    closeButton.innerHTML = '&times;';
    closeButton.addEventListener('click', () => {
      notification.style.animation = 'slideOut 0.3s ease-out forwards';
      setTimeout(() => {
        notification.remove();
      }, 300);
    });
    
    // Append elements to notification
    notification.appendChild(messageElement);
    notification.appendChild(closeButton);
    
    // Append notification to container
    notificationContainer.appendChild(notification);
    
    // Auto-remove notification after 5 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.style.animation = 'slideOut 0.3s ease-out forwards';
        setTimeout(() => {
          if (notification.parentNode) {
            notification.remove();
          }
        }, 300);
      }
    }, 5000);
  }
}); 