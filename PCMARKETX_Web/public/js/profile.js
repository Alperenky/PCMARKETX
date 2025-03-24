document.addEventListener('DOMContentLoaded', function() {
  // Check if user is logged in
  const userInfo = JSON.parse(localStorage.getItem('userInfo')) || JSON.parse(sessionStorage.getItem('userInfo'));
  
  if (!userInfo) {
    // Redirect to login page if not logged in
    window.location.href = '/login.html';
    return;
  }
  
  // Populate user information
  populateUserInfo(userInfo);
  
  // Setup tab navigation
  setupTabNavigation();
  
  // Setup form submissions
  setupFormSubmissions();
  
  // Setup password visibility toggles
  setupPasswordToggles();
  
  // Setup logout functionality
  document.getElementById('logout-link').addEventListener('click', function(e) {
    e.preventDefault();
    handleLogout();
  });
});

// Populate user information in the profile
function populateUserInfo(userInfo) {
  // Set username and email in the sidebar
  document.getElementById('profile-username').textContent = userInfo.name || userInfo.username;
  document.getElementById('profile-email').textContent = userInfo.email;
  
  // Populate form fields
  document.getElementById('username').value = userInfo.username || '';
  document.getElementById('email').value = userInfo.email || '';
  document.getElementById('first-name').value = userInfo.firstName || '';
  document.getElementById('last-name').value = userInfo.lastName || '';
  document.getElementById('phone').value = userInfo.phone || '';
}

// Setup tab navigation
function setupTabNavigation() {
  const menuItems = document.querySelectorAll('.profile-menu li a');
  const tabs = document.querySelectorAll('.profile-tab');
  
  menuItems.forEach(item => {
    item.addEventListener('click', function(e) {
      e.preventDefault();
      
      // Get the target tab id from the href attribute
      const targetId = this.getAttribute('href').substring(1);
      
      // Remove active class from all menu items and tabs
      menuItems.forEach(menuItem => {
        menuItem.parentElement.classList.remove('active');
      });
      
      tabs.forEach(tab => {
        tab.classList.remove('active');
      });
      
      // Add active class to clicked menu item and corresponding tab
      this.parentElement.classList.add('active');
      document.getElementById(targetId).classList.add('active');
    });
  });
}

// Setup form submissions
function setupFormSubmissions() {
  // Profile form submission
  const profileForm = document.getElementById('profile-form');
  if (profileForm) {
    profileForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      try {
        const formData = {
          username: document.getElementById('username').value,
          firstName: document.getElementById('first-name').value,
          lastName: document.getElementById('last-name').value,
          phone: document.getElementById('phone').value
        };
        
        const userInfo = JSON.parse(localStorage.getItem('userInfo')) || JSON.parse(sessionStorage.getItem('userInfo'));
        const token = userInfo.token;
        
        const response = await fetch('/api/users/profile', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        
        if (response.ok) {
          // Update stored user info
          const storage = localStorage.getItem('userInfo') ? localStorage : sessionStorage;
          const updatedUserInfo = { ...userInfo, ...data };
          storage.setItem('userInfo', JSON.stringify(updatedUserInfo));
          
          // Update displayed info
          populateUserInfo(updatedUserInfo);
          
          // Show success message
          showNotification('Profil bilgileriniz başarıyla güncellendi.', 'success');
        } else {
          showNotification(data.message || 'Profil güncellenirken bir hata oluştu.', 'error');
        }
      } catch (error) {
        console.error('Error updating profile:', error);
        showNotification('Profil güncellenirken bir hata oluştu.', 'error');
      }
    });
  }
  
  // Password form submission
  const passwordForm = document.getElementById('password-form');
  if (passwordForm) {
    passwordForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      const currentPassword = document.getElementById('current-password').value;
      const newPassword = document.getElementById('new-password').value;
      const confirmPassword = document.getElementById('confirm-password').value;
      
      // Validate passwords
      if (newPassword !== confirmPassword) {
        showNotification('Yeni şifreler eşleşmiyor.', 'error');
        return;
      }
      
      // Validate password requirements
      if (!validatePassword(newPassword)) {
        showNotification('Şifre en az 6 karakter uzunluğunda olmalıdır.', 'error');
        return;
      }
      
      try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo')) || JSON.parse(sessionStorage.getItem('userInfo'));
        const token = userInfo.token;
        
        const response = await fetch('/api/users/password', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            currentPassword,
            newPassword
          })
        });
        
        const data = await response.json();
        
        if (response.ok) {
          // Clear password fields
          passwordForm.reset();
          
          // Show success message
          showNotification('Şifreniz başarıyla güncellendi.', 'success');
        } else {
          showNotification(data.message || 'Şifre güncellenirken bir hata oluştu.', 'error');
        }
      } catch (error) {
        console.error('Error updating password:', error);
        showNotification('Şifre güncellenirken bir hata oluştu.', 'error');
      }
    });
  }
}

// Setup password visibility toggles
function setupPasswordToggles() {
  const toggleButtons = document.querySelectorAll('.toggle-password');
  
  toggleButtons.forEach(button => {
    button.addEventListener('click', function() {
      const input = this.previousElementSibling;
      const icon = this.querySelector('i');
      
      // Toggle password visibility
      if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
      } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
      }
    });
  });
}

// Handle logout
function handleLogout() {
  // Clear user data from storage
  localStorage.removeItem('userInfo');
  sessionStorage.removeItem('userInfo');
  
  // Redirect to home page
  window.location.href = '/';
}

// Validate password
function validatePassword(password) {
  return password.length >= 6;
}

// Show notification
function showNotification(message, type = 'info') {
  // Check if notification container exists
  let notificationContainer = document.querySelector('.notification-container');
  
  // Create container if it doesn't exist
  if (!notificationContainer) {
    notificationContainer = document.createElement('div');
    notificationContainer.className = 'notification-container';
    document.body.appendChild(notificationContainer);
    
    // Add styles if not already in CSS
    const style = document.createElement('style');
    style.textContent = `
      .notification-container {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 1000;
      }
      
      .notification {
        padding: 15px 20px;
        margin-bottom: 10px;
        border-radius: 5px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        display: flex;
        align-items: center;
        justify-content: space-between;
        min-width: 300px;
        max-width: 400px;
        animation: slideIn 0.3s ease-out forwards;
      }
      
      @keyframes slideIn {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      
      @keyframes slideOut {
        from {
          transform: translateX(0);
          opacity: 1;
        }
        to {
          transform: translateX(100%);
          opacity: 0;
        }
      }
      
      .notification.success {
        background-color: #d4edda;
        color: #155724;
        border-left: 4px solid #28a745;
      }
      
      .notification.error {
        background-color: #f8d7da;
        color: #721c24;
        border-left: 4px solid #dc3545;
      }
      
      .notification.info {
        background-color: #d1ecf1;
        color: #0c5460;
        border-left: 4px solid #17a2b8;
      }
      
      .notification-close {
        background: none;
        border: none;
        color: inherit;
        cursor: pointer;
        font-size: 16px;
        margin-left: 10px;
      }
    `;
    document.head.appendChild(style);
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