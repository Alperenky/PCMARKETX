class ChatBot {
    constructor() {
        this.apiKey = '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';
        this.apiUrl = 'https://openrouter.ai/api/v1/chat/completions';
        this.model = 'google/gemma-3n-e4b-it:free';
        this.isOpen = false;
        this.isTyping = false;
        this.messages = [];
        
        this.init();
    }

    init() {
        this.createChatbotHTML();
        this.addEventListeners();
        this.addWelcomeMessage();
    }

    createChatbotHTML() {
        // Floating Button
        const floatingBtn = document.createElement('div');
        floatingBtn.className = 'chatbot-floating-button';
        floatingBtn.innerHTML = '<i class="fas fa-comments"></i>';
        floatingBtn.id = 'chatbot-btn';

        // Chat Window
        const chatWindow = document.createElement('div');
        chatWindow.className = 'chatbot-window';
        chatWindow.id = 'chatbot-window';
        chatWindow.innerHTML = `
            <div class="chatbot-header">
                <div class="chatbot-header-info">
                    <div class="chatbot-avatar">
                        <i class="fas fa-robot"></i>
                    </div>
                    <div>
                        <h3 class="chatbot-title">PC Market X Asistan</h3>
                        <p class="chatbot-status">Çevrimiçi</p>
                    </div>
                </div>
                <button class="chatbot-close" id="chatbot-close">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="chatbot-messages" id="chatbot-messages">
                <div class="welcome-message">
                    <h3>Merhaba! 👋</h3>
                    <p>PC Market X'e hoş geldiniz! Size nasıl yardımcı olabilirim?</p>
                </div>
            </div>
            <div class="chatbot-input">
                <input type="text" id="chatbot-input" placeholder="Mesajınızı yazın..." maxlength="500">
                <button class="chatbot-send-btn" id="chatbot-send">
                    <i class="fas fa-paper-plane"></i>
                </button>
            </div>
        `;

        document.body.appendChild(floatingBtn);
        document.body.appendChild(chatWindow);
    }

    addEventListeners() {
        const floatingBtn = document.getElementById('chatbot-btn');
        const closeBtn = document.getElementById('chatbot-close');
        const sendBtn = document.getElementById('chatbot-send');
        const input = document.getElementById('chatbot-input');

        floatingBtn.addEventListener('click', () => this.toggleChat());
        closeBtn.addEventListener('click', () => this.closeChat());
        sendBtn.addEventListener('click', () => this.sendMessage());
        
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Close chat when clicking outside
        document.addEventListener('click', (e) => {
            const chatWindow = document.getElementById('chatbot-window');
            const floatingBtn = document.getElementById('chatbot-btn');
            
            if (this.isOpen && !chatWindow.contains(e.target) && !floatingBtn.contains(e.target)) {
                this.closeChat();
            }
        });
    }

    toggleChat() {
        if (this.isOpen) {
            this.closeChat();
        } else {
            this.openChat();
        }
    }

    openChat() {
        const chatWindow = document.getElementById('chatbot-window');
        const floatingBtn = document.getElementById('chatbot-btn');
        
        chatWindow.classList.add('active');
        floatingBtn.classList.add('active');
        this.isOpen = true;
        
        // Focus input
        setTimeout(() => {
            document.getElementById('chatbot-input').focus();
        }, 300);
    }

    closeChat() {
        const chatWindow = document.getElementById('chatbot-window');
        const floatingBtn = document.getElementById('chatbot-btn');
        
        chatWindow.classList.remove('active');
        floatingBtn.classList.remove('active');
        this.isOpen = false;
    }

    addWelcomeMessage() {
        const welcomeMessages = [
            "🛒 Ürün hakkında bilgi almak",
            "💰 Fiyat karşılaştırması yapmak", 
            "🔧 Teknik destek almak",
            "📦 Sipariş durumu sorgulamak"
        ];

        const messagesContainer = document.getElementById('chatbot-messages');
        const welcomeDiv = messagesContainer.querySelector('.welcome-message');
        
        const optionsHtml = welcomeMessages.map(msg => 
            `<div class="quick-option" onclick="chatbot.handleQuickOption('${msg}')">${msg}</div>`
        ).join('');
        
        welcomeDiv.innerHTML += `
            <div class="quick-options">
                <p>Size nasıl yardımcı olabilirim:</p>
                ${optionsHtml}
            </div>
        `;
    }

    handleQuickOption(option) {
        const input = document.getElementById('chatbot-input');
        input.value = option;
        this.sendMessage();
    }

    async sendMessage() {
        const input = document.getElementById('chatbot-input');
        const message = input.value.trim();
        
        if (!message || this.isTyping) return;
        
        // Add user message
        this.addMessage(message, 'user');
        input.value = '';
        
        // Show typing indicator
        this.showTypingIndicator();
        
        try {
            const response = await this.callOpenRouterAPI(message);
            this.hideTypingIndicator();
            this.addMessage(response, 'bot');
        } catch (error) {
            console.error('Chatbot API Error:', error);
            this.hideTypingIndicator();
            this.addMessage('Üzgünüm, şu anda bir sorun yaşıyorum. Lütfen daha sonra tekrar deneyin.', 'bot');
        }
    }

    async callOpenRouterAPI(message) {
        // PC Market X context'ini user message içine dahil et
        const contextualMessage = `Sen PC Market X'in yapay zeka asistanısın. PC Market X, Türkiye'nin önde gelen bilgisayar parçaları ve çevre birimleri e-ticaret sitesidir.

Görevlerin:
1. Müşterilere ürünler hakkında bilgi vermek
2. Teknik destek sağlamak  
3. Sipariş süreçlerinde yardım etmek
4. Fiyat ve ürün karşılaştırmaları yapmak
5. PC toplama önerileri vermek

Ana ürün kategorilerimiz:
- İşlemciler (Intel, AMD)
- Ekran Kartları (NVIDIA, AMD)
- Anakartlar
- RAM & Bellek
- Depolama (SSD, HDD)
- Monitörler
- Gaming Bilgisayarlar
- Çevre Birimleri

Her zaman yardımcı, samimi ve profesyonel ol. Türkçe cevap ver ve müşteri memnuniyetini ön planda tut.

Kullanıcı sorusu: ${message}`;

        this.messages.push({ role: 'user', content: message });

        const requestBody = {
            model: this.model,
            messages: [
                { role: 'user', content: contextualMessage },
                ...this.messages.slice(-4) // Son 4 mesajı gönder (system message olmadığından daha az)
            ],
            max_tokens: 400,
            temperature: 0.7
        };

        console.log('API Request:', requestBody);

        const response = await fetch(this.apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`,
                'HTTP-Referer': window.location.origin,
                'X-Title': 'PC Market X Chatbot'
            },
            body: JSON.stringify(requestBody)
        });

        console.log('API Response Status:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('API Error Response:', errorText);
            throw new Error(`API Error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        console.log('API Response Data:', data);
        
        if (!data.choices || !data.choices[0] || !data.choices[0].message) {
            throw new Error('Invalid API response format');
        }
        
        const botResponse = data.choices[0].message.content;
        
        this.messages.push({ role: 'assistant', content: botResponse });
        
        return botResponse;
    }

    addMessage(content, sender) {
        const messagesContainer = document.getElementById('chatbot-messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;
        
        const currentTime = new Date().toLocaleTimeString('tr-TR', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        messageDiv.innerHTML = `
            <div class="message-content">${content}</div>
            <div class="message-time">${currentTime}</div>
        `;
        
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    showTypingIndicator() {
        const messagesContainer = document.getElementById('chatbot-messages');
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message bot typing';
        typingDiv.id = 'typing-indicator';
        typingDiv.innerHTML = `
            <div class="typing-indicator">
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
            </div>
        `;
        
        messagesContainer.appendChild(typingDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        this.isTyping = true;
        
        // Disable send button
        document.getElementById('chatbot-send').disabled = true;
    }

    hideTypingIndicator() {
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
        this.isTyping = false;
        
        // Enable send button
        document.getElementById('chatbot-send').disabled = false;
    }
}

// Quick options styling
const quickOptionsStyle = document.createElement('style');
quickOptionsStyle.textContent = `
    .quick-options {
        margin-top: 15px;
    }
    
    .quick-options p {
        font-weight: 600;
        margin-bottom: 10px;
        color: #333;
    }
    
    .quick-option {
        background: #f8f9fa;
        border: 1px solid #e9ecef;
        border-radius: 20px;
        padding: 8px 15px;
        margin: 5px 0;
        cursor: pointer;
        transition: all 0.3s ease;
        font-size: 13px;
    }
    
    .quick-option:hover {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        transform: translateY(-1px);
    }
`;
document.head.appendChild(quickOptionsStyle);

// Initialize chatbot when DOM is loaded
let chatbot;
document.addEventListener('DOMContentLoaded', function() {
    chatbot = new ChatBot();
}); 