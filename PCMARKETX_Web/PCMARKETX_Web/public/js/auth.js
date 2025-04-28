document.addEventListener('DOMContentLoaded', function() {
  // Form işlemleri
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  
  // Şifre görünürlük düğmeleri
  setupPasswordToggles();
  
  // Giriş formu işlemleri
  if (loginForm) {
    loginForm.addEventListener('submit', handleLoginSubmit);
  }
  
  // Kayıt formu işlemleri
  if (registerForm) {
    registerForm.addEventListener('submit', handleRegisterSubmit);
    
    // Şifre doğrulama
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('password-confirm');
    
    if (passwordInput && confirmPasswordInput) {
      confirmPasswordInput.addEventListener('input', function() {
        validatePasswordMatch(passwordInput, confirmPasswordInput);
      });
    }
  }
  
  // Kullanıcı durumunu kontrol et
  checkUserStatus();
});

// Şifre görünürlük düğmeleri ayarı
function setupPasswordToggles() {
  const toggleButtons = document.querySelectorAll('.toggle-password');
  
  toggleButtons.forEach(button => {
    button.addEventListener('click', function() {
      const input = this.previousElementSibling;
      const icon = this.querySelector('i');
      
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

// Giriş formu gönderimi
async function handleLoginSubmit(e) {
  e.preventDefault();
  
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const remember = document.getElementById('remember-me')?.checked;
  
  // Form doğrulama
  if (!email || !password) {
    showNotification('Lütfen tüm alanları doldurun', 'error');
    return;
  }
  
  try {
    // API'ye giriş isteği gönder
    const response = await fetch('/api/users/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Giriş işlemi başarısız');
    }
    
    // Kullanıcı bilgilerini ve token'ı localStorage'a kaydet
    if (remember) {
      localStorage.setItem('userInfo', JSON.stringify(data));
    } else {
      sessionStorage.setItem('userInfo', JSON.stringify(data));
    }
    
    // Başarılı bildirim göster
    showNotification('Giriş başarılı! Yönlendiriliyorsunuz...', 'success');
    
    // Ana sayfaya yönlendir
    setTimeout(() => {
      window.location.href = '/';
    }, 2000);
    
  } catch (error) {
    console.error('Hata:', error);
    showNotification(error.message, 'error');
  }
}

// Kayıt formu gönderimi
async function handleRegisterSubmit(e) {
  e.preventDefault();
  
  const username = document.getElementById('username').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const passwordConfirm = document.getElementById('password-confirm').value;
  const termsAccepted = document.getElementById('terms')?.checked;
  
  // Form doğrulama
  if (!username || !email || !password || !passwordConfirm) {
    showNotification('Lütfen tüm alanları doldurun', 'error');
    return;
  }
  
  if (password.length < 6) {
    showNotification('Şifre en az 6 karakter olmalıdır', 'error');
    return;
  }
  
  if (password !== passwordConfirm) {
    showNotification('Şifreler eşleşmiyor', 'error');
    return;
  }
  
  if (!termsAccepted) {
    showNotification('Kullanım şartlarını kabul etmelisiniz', 'error');
    return;
  }
  
  try {
    // API'ye kayıt isteği gönder
    const response = await fetch('/api/users/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, email, password })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Kayıt işlemi başarısız');
    }
    
    // Kullanıcı bilgilerini ve token'ı sessionStorage'a kaydet
    sessionStorage.setItem('userInfo', JSON.stringify(data));
    
    // Başarılı bildirim göster
    showNotification('Kayıt başarılı! Yönlendiriliyorsunuz...', 'success');
    
    // Ana sayfaya yönlendir
    setTimeout(() => {
      window.location.href = '/';
    }, 2000);
    
  } catch (error) {
    console.error('Hata:', error);
    showNotification(error.message, 'error');
  }
}

// Şifre eşleşme kontrolü
function validatePasswordMatch(passwordInput, confirmPasswordInput) {
  if (!passwordInput || !confirmPasswordInput) return;
  
  const password = passwordInput.value;
  const confirmPassword = confirmPasswordInput.value;
  
  if (confirmPassword === '') return;
  
  // Eşleşme mesajı elementi varsa güncelle
  const matchMessage = document.getElementById('password-match');
  if (matchMessage) {
    const icon = matchMessage.querySelector('i');
    
    if (password === confirmPassword) {
      matchMessage.classList.add('valid');
      icon.classList.remove('fa-times-circle');
      icon.classList.add('fa-check-circle');
      matchMessage.textContent = 'Şifreler eşleşiyor';
    } else {
      matchMessage.classList.remove('valid');
      icon.classList.remove('fa-check-circle');
      icon.classList.add('fa-times-circle');
      matchMessage.textContent = 'Şifreler eşleşmiyor';
    }
  }
}

// Kullanıcı durumunu kontrol et
function checkUserStatus() {
  // localStorage veya sessionStorage'dan kullanıcı bilgilerini al
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || sessionStorage.getItem('userInfo') || '{}');
  
  // Token varsa kullanıcı giriş yapmış demektir
  if (userInfo && userInfo.token) {
    // Kullanıcı giriş yapmışsa ve login/register sayfalarındaysa ana sayfaya yönlendir
    const currentPath = window.location.pathname;
    if (currentPath === '/login' || currentPath === '/register') {
      window.location.href = '/';
    }
  }
}

// Bildirim gösterme
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
  }, 5000);
} 