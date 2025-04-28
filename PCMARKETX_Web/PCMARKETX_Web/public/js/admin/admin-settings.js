/**
 * Admin Settings JavaScript
 * Settings page functionality for the admin panel
 */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize the settings page
    initSettingsPage();
});

/**
 * Initialize the settings page
 */
function initSettingsPage() {
    // Initialize tabs
    initTabs();
    
    // Load settings
    loadSettings();
    
    // Set up event listeners
    document.getElementById('saveGeneralSettings').addEventListener('click', saveGeneralSettings);
    document.getElementById('savePaymentSettings').addEventListener('click', savePaymentSettings);
    document.getElementById('saveShippingSettings').addEventListener('click', saveShippingSettings);
    document.getElementById('saveEmailSettings').addEventListener('click', saveEmailSettings);
    document.getElementById('saveUserSettings').addEventListener('click', saveUserSettings);
    document.getElementById('testEmail').addEventListener('click', sendTestEmail);
    
    // Handle logo and favicon preview
    document.getElementById('logo').addEventListener('change', function() {
        previewImage(this, 'logoPreview');
    });
    
    document.getElementById('favicon').addEventListener('change', function() {
        previewImage(this, 'faviconPreview');
    });
    
    // Bank accounts
    document.getElementById('addBank').addEventListener('click', addBankAccount);
    document.querySelector('.remove-bank').addEventListener('click', function() {
        if (document.querySelectorAll('.bank-account').length > 1) {
            this.closest('.bank-account').remove();
        }
    });
    
    // Shipping companies
    document.getElementById('addShippingCompany').addEventListener('click', addShippingCompany);
    document.querySelector('.remove-shipping-company').addEventListener('click', function() {
        if (document.querySelectorAll('.shipping-company').length > 1) {
            this.closest('.shipping-company').remove();
        }
    });
}

/**
 * Initialize tabs functionality
 */
function initTabs() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.dataset.tab;
            
            // Remove active class from all tabs and content
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            
            // Add active class to selected tab and content
            btn.classList.add('active');
            document.getElementById(tabId).classList.add('active');
        });
    });
}

/**
 * Preview uploaded image
 * @param {HTMLElement} input - The file input element
 * @param {string} previewId - The ID of the preview container
 */
function previewImage(input, previewId) {
    const preview = document.getElementById(previewId);
    
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            preview.innerHTML = `<img src="${e.target.result}" alt="Image Preview">`;
        };
        
        reader.readAsDataURL(input.files[0]);
    }
}

/**
 * Load settings from the API
 */
async function loadSettings() {
    try {
        showLoading(document.querySelector('.main-content'));
        
        // Fetch settings from API
        const settings = await AdminAPI.getSettings();
        
        // Populate general settings
        if (settings.general) {
            document.getElementById('siteName').value = settings.general.siteName || 'PC MARKET X';
            document.getElementById('siteDescription').value = settings.general.siteDescription || 'Bilgisayar ve Elektronik Ürünler';
            document.getElementById('contactEmail').value = settings.general.contactEmail || 'info@pcmarketx.com';
            document.getElementById('contactPhone').value = settings.general.contactPhone || '+90 555 123 4567';
            document.getElementById('contactAddress').value = settings.general.contactAddress || 'İstanbul, Türkiye';
            
            // Preview logo if exists
            if (settings.general.logo) {
                document.getElementById('logoPreview').innerHTML = `<img src="${settings.general.logo}" alt="Logo">`;
            }
            
            // Preview favicon if exists
            if (settings.general.favicon) {
                document.getElementById('faviconPreview').innerHTML = `<img src="${settings.general.favicon}" alt="Favicon">`;
            }
            
            // Set social media URLs
            document.getElementById('facebook').value = settings.general.social?.facebook || 'https://facebook.com/pcmarketx';
            document.getElementById('twitter').value = settings.general.social?.twitter || 'https://twitter.com/pcmarketx';
            document.getElementById('instagram').value = settings.general.social?.instagram || 'https://instagram.com/pcmarketx';
            document.getElementById('youtube').value = settings.general.social?.youtube || 'https://youtube.com/pcmarketx';
            
            // Set SEO settings
            document.getElementById('metaKeywords').value = settings.general.seo?.metaKeywords || 'bilgisayar, pc, laptop, donanım, elektronik';
            document.getElementById('metaDescription').value = settings.general.seo?.metaDescription || 'PC MARKET X - Bilgisayar ve elektronik ürünlerinde en uygun fiyatlar ve en iyi hizmet için doğru adres.';
            document.getElementById('googleAnalytics').value = settings.general.seo?.googleAnalytics || 'UA-XXXXXXXXX-X';
        }
        
        // Populate payment settings
        if (settings.payment) {
            document.getElementById('paymentCreditCard').checked = settings.payment.methods?.creditCard ?? true;
            document.getElementById('paymentBankTransfer').checked = settings.payment.methods?.bankTransfer ?? true;
            document.getElementById('paymentCashOnDelivery').checked = settings.payment.methods?.cashOnDelivery ?? true;
            
            document.getElementById('paymentProvider').value = settings.payment.provider?.name || 'iyzico';
            document.getElementById('paymentApiKey').value = settings.payment.provider?.apiKey || 'sandbox-xxxxxxxxxxxxx';
            document.getElementById('paymentApiSecret').value = settings.payment.provider?.apiSecret || 'sandbox-xxxxxxxxxxxxx';
            document.getElementById('paymentSandbox').checked = settings.payment.provider?.sandbox ?? true;
            
            // Set bank accounts
            if (settings.payment.bankAccounts && settings.payment.bankAccounts.length > 0) {
                document.getElementById('bankAccounts').innerHTML = '';
                
                settings.payment.bankAccounts.forEach(account => {
                    addBankAccount(account);
                });
            }
        }
        
        // Populate shipping settings
        if (settings.shipping) {
            document.getElementById('freeShippingThreshold').value = settings.shipping.freeShippingThreshold || 750;
            document.getElementById('standardShippingFee').value = settings.shipping.standardShippingFee || 25;
            document.getElementById('estimatedDeliveryDays').value = settings.shipping.estimatedDeliveryDays || 3;
            
            // Set shipping companies
            if (settings.shipping.companies && settings.shipping.companies.length > 0) {
                document.getElementById('shippingCompanies').innerHTML = '';
                
                settings.shipping.companies.forEach(company => {
                    addShippingCompany(company);
                });
            }
        }
        
        // Populate email settings
        if (settings.email) {
            document.getElementById('emailService').value = settings.email.service || 'smtp';
            document.getElementById('smtpHost').value = settings.email.smtp?.host || 'smtp.gmail.com';
            document.getElementById('smtpPort').value = settings.email.smtp?.port || 587;
            document.getElementById('smtpUser').value = settings.email.smtp?.user || 'info@pcmarketx.com';
            document.getElementById('smtpPassword').value = settings.email.smtp?.password || 'password';
            document.getElementById('senderEmail').value = settings.email.sender?.email || 'info@pcmarketx.com';
            document.getElementById('senderName').value = settings.email.sender?.name || 'PC MARKET X';
            document.getElementById('smtpSecure').checked = settings.email.smtp?.secure ?? true;
            
            document.getElementById('notifyNewOrder').checked = settings.email.notifications?.newOrder ?? true;
            document.getElementById('notifyOrderStatusChange').checked = settings.email.notifications?.orderStatusChange ?? true;
            document.getElementById('notifyLowStock').checked = settings.email.notifications?.lowStock ?? true;
            document.getElementById('notifyNewCustomer').checked = settings.email.notifications?.newCustomer ?? true;
        }
        
        // Populate user settings
        if (settings.user) {
            document.getElementById('userName').value = settings.user.name || 'Admin';
            document.getElementById('userEmail').value = settings.user.email || 'admin@pcmarketx.com';
        }
    } catch (error) {
        showNotification('Ayarlar yüklenirken bir hata oluştu.', 'error');
        console.error('Error loading settings:', error);
    } finally {
        hideLoading();
    }
}

/**
 * Add a bank account field
 * @param {Object} account - Bank account data
 */
function addBankAccount(account = null) {
    const bankName = account?.bankName || '';
    const accountName = account?.accountName || '';
    const iban = account?.iban || '';
    
    const accountsContainer = document.getElementById('bankAccounts');
    
    const bankAccount = document.createElement('div');
    bankAccount.className = 'bank-account';
    bankAccount.style = 'border: 1px solid #ddd; padding: 15px; border-radius: 4px; margin-bottom: 15px;';
    
    bankAccount.innerHTML = `
        <div class="form-grid">
            <div class="form-group">
                <label class="form-label">Banka Adı</label>
                <input type="text" class="form-control bank-name" value="${bankName}">
            </div>
            <div class="form-group">
                <label class="form-label">Hesap Sahibi</label>
                <input type="text" class="form-control bank-account-name" value="${accountName}">
            </div>
            <div class="form-group">
                <label class="form-label">IBAN</label>
                <input type="text" class="form-control bank-iban" value="${iban}">
            </div>
            <div class="form-group">
                <button type="button" class="btn btn-danger btn-sm remove-bank">
                    <i class="fas fa-trash"></i> Sil
                </button>
            </div>
        </div>
    `;
    
    accountsContainer.appendChild(bankAccount);
    
    // Add event listener to remove button
    bankAccount.querySelector('.remove-bank').addEventListener('click', function() {
        if (document.querySelectorAll('.bank-account').length > 1) {
            this.closest('.bank-account').remove();
        }
    });
}

/**
 * Add a shipping company field
 * @param {Object} company - Shipping company data
 */
function addShippingCompany(company = null) {
    const name = company?.name || '';
    const fee = company?.fee || '';
    const active = company?.active ?? true;
    
    const companiesContainer = document.getElementById('shippingCompanies');
    
    const shippingCompany = document.createElement('div');
    shippingCompany.className = 'shipping-company';
    shippingCompany.style = 'border: 1px solid #ddd; padding: 15px; border-radius: 4px; margin-bottom: 15px;';
    
    shippingCompany.innerHTML = `
        <div class="form-grid">
            <div class="form-group">
                <label class="form-label">Firma Adı</label>
                <input type="text" class="form-control shipping-company-name" value="${name}">
            </div>
            <div class="form-group">
                <label class="form-label">Fiyat (₺)</label>
                <input type="number" class="form-control shipping-company-fee" value="${fee}">
            </div>
            <div class="form-group">
                <div class="form-check">
                    <input type="checkbox" class="form-check-input shipping-company-active" ${active ? 'checked' : ''}>
                    <label class="form-label">Aktif</label>
                </div>
            </div>
            <div class="form-group">
                <button type="button" class="btn btn-danger btn-sm remove-shipping-company">
                    <i class="fas fa-trash"></i> Sil
                </button>
            </div>
        </div>
    `;
    
    companiesContainer.appendChild(shippingCompany);
    
    // Add event listener to remove button
    shippingCompany.querySelector('.remove-shipping-company').addEventListener('click', function() {
        if (document.querySelectorAll('.shipping-company').length > 1) {
            this.closest('.shipping-company').remove();
        }
    });
}

/**
 * Save general settings
 */
async function saveGeneralSettings() {
    try {
        // Create FormData object for file upload
        const formData = new FormData();
        
        // Get form data
        const generalSettings = {
            siteName: document.getElementById('siteName').value,
            siteDescription: document.getElementById('siteDescription').value,
            contactEmail: document.getElementById('contactEmail').value,
            contactPhone: document.getElementById('contactPhone').value,
            contactAddress: document.getElementById('contactAddress').value,
            social: {
                facebook: document.getElementById('facebook').value,
                twitter: document.getElementById('twitter').value,
                instagram: document.getElementById('instagram').value,
                youtube: document.getElementById('youtube').value
            },
            seo: {
                metaKeywords: document.getElementById('metaKeywords').value,
                metaDescription: document.getElementById('metaDescription').value,
                googleAnalytics: document.getElementById('googleAnalytics').value
            }
        };
        
        // Add logo if uploaded
        const logoInput = document.getElementById('logo');
        if (logoInput.files && logoInput.files[0]) {
            formData.append('logo', logoInput.files[0]);
        }
        
        // Add favicon if uploaded
        const faviconInput = document.getElementById('favicon');
        if (faviconInput.files && faviconInput.files[0]) {
            formData.append('favicon', faviconInput.files[0]);
        }
        
        // Add general settings as JSON
        formData.append('settings', JSON.stringify(generalSettings));
        
        // Save settings
        await AdminAPI.saveSettings('general', formData);
        
        // Show success notification
        showNotification('Genel ayarlar başarıyla kaydedildi.', 'success');
    } catch (error) {
        showNotification('Genel ayarlar kaydedilirken bir hata oluştu.', 'error');
        console.error('Error saving general settings:', error);
    }
}

/**
 * Save payment settings
 */
async function savePaymentSettings() {
    try {
        // Get form data
        const paymentSettings = {
            methods: {
                creditCard: document.getElementById('paymentCreditCard').checked,
                bankTransfer: document.getElementById('paymentBankTransfer').checked,
                cashOnDelivery: document.getElementById('paymentCashOnDelivery').checked
            },
            provider: {
                name: document.getElementById('paymentProvider').value,
                apiKey: document.getElementById('paymentApiKey').value,
                apiSecret: document.getElementById('paymentApiSecret').value,
                sandbox: document.getElementById('paymentSandbox').checked
            },
            bankAccounts: []
        };
        
        // Get bank accounts
        document.querySelectorAll('.bank-account').forEach(account => {
            const bankName = account.querySelector('.bank-name').value.trim();
            const accountName = account.querySelector('.bank-account-name').value.trim();
            const iban = account.querySelector('.bank-iban').value.trim();
            
            if (bankName && accountName && iban) {
                paymentSettings.bankAccounts.push({
                    bankName,
                    accountName,
                    iban
                });
            }
        });
        
        // Save settings
        await AdminAPI.saveSettings('payment', paymentSettings);
        
        // Show success notification
        showNotification('Ödeme ayarları başarıyla kaydedildi.', 'success');
    } catch (error) {
        showNotification('Ödeme ayarları kaydedilirken bir hata oluştu.', 'error');
        console.error('Error saving payment settings:', error);
    }
}

/**
 * Save shipping settings
 */
async function saveShippingSettings() {
    try {
        // Get form data
        const shippingSettings = {
            freeShippingThreshold: document.getElementById('freeShippingThreshold').value,
            standardShippingFee: document.getElementById('standardShippingFee').value,
            estimatedDeliveryDays: document.getElementById('estimatedDeliveryDays').value,
            companies: []
        };
        
        // Get shipping companies
        document.querySelectorAll('.shipping-company').forEach(company => {
            const name = company.querySelector('.shipping-company-name').value.trim();
            const fee = company.querySelector('.shipping-company-fee').value.trim();
            const active = company.querySelector('.shipping-company-active').checked;
            
            if (name && fee) {
                shippingSettings.companies.push({
                    name,
                    fee,
                    active
                });
            }
        });
        
        // Save settings
        await AdminAPI.saveSettings('shipping', shippingSettings);
        
        // Show success notification
        showNotification('Kargo ayarları başarıyla kaydedildi.', 'success');
    } catch (error) {
        showNotification('Kargo ayarları kaydedilirken bir hata oluştu.', 'error');
        console.error('Error saving shipping settings:', error);
    }
}

/**
 * Save email settings
 */
async function saveEmailSettings() {
    try {
        // Get form data
        const emailSettings = {
            service: document.getElementById('emailService').value,
            smtp: {
                host: document.getElementById('smtpHost').value,
                port: document.getElementById('smtpPort').value,
                user: document.getElementById('smtpUser').value,
                password: document.getElementById('smtpPassword').value,
                secure: document.getElementById('smtpSecure').checked
            },
            sender: {
                email: document.getElementById('senderEmail').value,
                name: document.getElementById('senderName').value
            },
            notifications: {
                newOrder: document.getElementById('notifyNewOrder').checked,
                orderStatusChange: document.getElementById('notifyOrderStatusChange').checked,
                lowStock: document.getElementById('notifyLowStock').checked,
                newCustomer: document.getElementById('notifyNewCustomer').checked
            }
        };
        
        // Save settings
        await AdminAPI.saveSettings('email', emailSettings);
        
        // Show success notification
        showNotification('E-posta ayarları başarıyla kaydedildi.', 'success');
    } catch (error) {
        showNotification('E-posta ayarları kaydedilirken bir hata oluştu.', 'error');
        console.error('Error saving email settings:', error);
    }
}

/**
 * Save user settings
 */
async function saveUserSettings() {
    try {
        // Get form data
        const userSettings = {
            name: document.getElementById('userName').value,
            email: document.getElementById('userEmail').value
        };
        
        // Add password if provided
        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        if (currentPassword && newPassword && confirmPassword) {
            // Check if passwords match
            if (newPassword !== confirmPassword) {
                showNotification('Yeni şifre ve şifre tekrarı eşleşmiyor.', 'error');
                return;
            }
            
            userSettings.currentPassword = currentPassword;
            userSettings.newPassword = newPassword;
        }
        
        // Save settings
        await AdminAPI.saveSettings('user', userSettings);
        
        // Clear password fields
        document.getElementById('currentPassword').value = '';
        document.getElementById('newPassword').value = '';
        document.getElementById('confirmPassword').value = '';
        
        // Show success notification
        showNotification('Kullanıcı ayarları başarıyla kaydedildi.', 'success');
    } catch (error) {
        showNotification('Kullanıcı ayarları kaydedilirken bir hata oluştu.', 'error');
        console.error('Error saving user settings:', error);
    }
}

/**
 * Send a test email
 */
async function sendTestEmail() {
    try {
        // Get sender and recipient
        const senderEmail = document.getElementById('senderEmail').value;
        const senderName = document.getElementById('senderName').value;
        const recipientEmail = document.getElementById('userEmail').value;
        
        if (!senderEmail || !recipientEmail) {
            showNotification('Gönderici ve alıcı e-posta adresleri gereklidir.', 'error');
            return;
        }
        
        // Send test email
        await AdminAPI.sendTestEmail({
            senderEmail,
            senderName,
            recipientEmail
        });
        
        // Show success notification
        showNotification('Test e-postası başarıyla gönderildi.', 'success');
    } catch (error) {
        showNotification('Test e-postası gönderilirken bir hata oluştu.', 'error');
        console.error('Error sending test email:', error);
    }
} 