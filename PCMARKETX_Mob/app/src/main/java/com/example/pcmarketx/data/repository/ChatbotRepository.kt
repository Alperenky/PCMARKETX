package com.example.pcmarketx.data.repository

import com.example.pcmarketx.data.api.ChatbotApi
import com.example.pcmarketx.data.model.ChatMessage
import com.example.pcmarketx.data.model.ChatRequest
import com.example.pcmarketx.data.model.ChatResponse
import javax.inject.Inject

class ChatbotRepository @Inject constructor(
    private val chatbotApi: ChatbotApi
) {
    companion object {
        private const val API_KEY = "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"
        private const val MODEL = "google/gemma-3n-e4b-it:free"
        private const val REFERER = "https://pcmarketx.com"
        private const val MAX_TOKENS = 400
        private const val TEMPERATURE = 0.7
        
        // PC Market X bağlam bilgisi
        private const val PC_MARKET_X_CONTEXT = """Sen PC Market X'in yapay zeka asistanısın. PC Market X, Türkiye'nin önde gelen bilgisayar parçaları ve çevre birimleri e-ticaret sitesidir.

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

Her zaman yardımcı, samimi ve profesyonel ol. Türkçe cevap ver ve müşteri memnuniyetini ön planda tut."""
    }

    // Sohbet geçmişini saklamak için değişken
    private val messageHistory = mutableListOf<ChatMessage>()

    suspend fun sendMessage(message: String): Result<ChatResponse> {
        return try {
            // Kullanıcı mesajını geçmişe ekle
            val userMessage = ChatMessage("user", message)
            messageHistory.add(userMessage)
            
            // PC Market X bağlamını içeren bağlamsal mesaj
            val contextualMessage = "${PC_MARKET_X_CONTEXT}\n\nKullanıcı sorusu: $message"
            val contextMessage = ChatMessage("user", contextualMessage)
            
            // Son 4 mesajı içeren liste
            val recentMessages = if (messageHistory.size > 1) {
                // Son 4 mesajı al (kontekst hariç)
                messageHistory.takeLast(minOf(4, messageHistory.size))
            } else {
                // Sadece şu anki mesaj varsa
                listOf(userMessage)
            }
            
            // Context mesajını ve son mesajları içeren request oluştur
            val requestMessages = mutableListOf<ChatMessage>().apply {
                add(contextMessage)
                // Eğer geçmişte mesajlar varsa ve şu anki mesaj dışında başka mesajlar varsa ekle
                if (recentMessages.size > 1) {
                    addAll(recentMessages.dropLast(1))
                }
            }
            
            val request = ChatRequest(
                model = MODEL,
                messages = requestMessages,
                max_tokens = MAX_TOKENS,
                temperature = TEMPERATURE
            )
            
            val response = chatbotApi.sendMessage(
                authorization = "Bearer $API_KEY",
                referer = REFERER,
                request = request
            )
            
            // Bot yanıtını geçmişe ekle
            val botMessage = response.choices.firstOrNull()?.message
            if (botMessage != null) {
                messageHistory.add(botMessage)
            }
            
            Result.success(response)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    fun clearChatHistory() {
        messageHistory.clear()
    }
} 