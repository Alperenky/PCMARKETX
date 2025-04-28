package com.example.pcmarketx.util

import com.example.pcmarketx.data.repository.PreferencesRepository
import okhttp3.Interceptor
import okhttp3.Response

class AuthInterceptor(private val preferencesRepository: PreferencesRepository) : Interceptor {
    override fun intercept(chain: Interceptor.Chain): Response {
        val token = preferencesRepository.getAuthToken()
        
        val request = if (!token.isNullOrEmpty()) {
            chain.request().newBuilder()
                .addHeader("Authorization", "Bearer $token")
                .build()
        } else {
            chain.request()
        }
        
        return chain.proceed(request)
    }
} 