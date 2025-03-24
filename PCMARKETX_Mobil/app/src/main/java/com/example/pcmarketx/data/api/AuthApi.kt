package com.example.pcmarketx.data.api

import com.example.pcmarketx.data.model.AuthResponse
import com.example.pcmarketx.data.model.BaseResponse
import com.example.pcmarketx.data.model.LoginRequest
import com.example.pcmarketx.data.model.RegisterRequest
import com.example.pcmarketx.data.model.User
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST

interface AuthApi {
    @POST("api/auth/login")
    suspend fun login(@Body loginRequest: LoginRequest): Response<AuthResponse>
    
    @POST("api/auth/register")
    suspend fun register(@Body registerRequest: RegisterRequest): Response<AuthResponse>
    
    @GET("api/auth/me")
    suspend fun getProfile(): Response<BaseResponse<User>>
} 