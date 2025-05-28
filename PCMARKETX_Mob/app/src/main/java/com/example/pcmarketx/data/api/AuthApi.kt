package com.example.pcmarketx.data.api

import com.example.pcmarketx.data.model.AuthResponse
import com.example.pcmarketx.data.model.BaseResponse
import com.example.pcmarketx.data.model.LoginRequest
import com.example.pcmarketx.data.model.RegisterRequest
import com.example.pcmarketx.data.model.User
import com.example.pcmarketx.data.model.PasswordUpdateRequest
import com.example.pcmarketx.data.model.MessageResponse
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.PUT

interface AuthApi {
    @POST("api/users/login")
    suspend fun login(@Body loginRequest: LoginRequest): Response<AuthResponse>
    
    @POST("api/users/register")
    suspend fun register(@Body registerRequest: RegisterRequest): Response<AuthResponse>
    
    @GET("api/users/profile")
    suspend fun getProfile(): Response<User>

    @PUT("api/users/profile")
    suspend fun updateProfile(@Body profileUpdateRequest: com.example.pcmarketx.data.remote.ProfileUpdateRequest): retrofit2.Response<com.example.pcmarketx.data.remote.ProfileUpdateResponse>

    @PUT("api/users/password")
    suspend fun updatePassword(@Body passwordUpdateRequest: PasswordUpdateRequest): Response<MessageResponse>
} 