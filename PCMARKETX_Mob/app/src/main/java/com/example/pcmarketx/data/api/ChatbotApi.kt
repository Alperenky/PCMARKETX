package com.example.pcmarketx.data.api

import com.example.pcmarketx.data.model.ChatRequest
import com.example.pcmarketx.data.model.ChatResponse
import retrofit2.http.Body
import retrofit2.http.Header
import retrofit2.http.Headers
import retrofit2.http.POST

interface ChatbotApi {
    @POST("chat/completions")
    @Headers(
        "Content-Type: application/json",
        "X-Title: PC Market X Mobile"
    )
    suspend fun sendMessage(
        @Header("Authorization") authorization: String,
        @Header("HTTP-Referer") referer: String,
        @Body request: ChatRequest
    ): ChatResponse
} 