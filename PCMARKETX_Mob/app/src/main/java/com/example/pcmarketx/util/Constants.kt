package com.example.pcmarketx.util

object Constants {
    // API URL
    const val BASE_URL = "http://10.0.2.2:5001/"
    
    // Preference Keys
    const val PREFERENCES_NAME = "pcmarketx_preferences"
    const val AUTH_TOKEN_KEY = "auth_token"
    
    // Order Status
    const val ORDER_STATUS_PENDING = "PENDING"
    const val ORDER_STATUS_PROCESSING = "PROCESSING"
    const val ORDER_STATUS_SHIPPED = "SHIPPED"
    const val ORDER_STATUS_DELIVERED = "DELIVERED"
    const val ORDER_STATUS_CANCELLED = "CANCELLED"
    
    /**
     * Relative image path'i tam URL'e dönüştürür
     */
    fun getFullImageUrl(imageUrl: String?): String {
        return when {
            imageUrl.isNullOrEmpty() -> ""
            imageUrl.startsWith("http") -> imageUrl // Zaten tam URL
            imageUrl.startsWith("/") -> BASE_URL.trimEnd('/') + imageUrl // Relative path
            else -> BASE_URL.trimEnd('/') + "/" + imageUrl // Sadece dosya adı
        }
    }
} 