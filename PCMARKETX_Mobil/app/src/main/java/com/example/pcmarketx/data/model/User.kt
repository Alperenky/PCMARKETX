package com.example.pcmarketx.data.model

import com.google.gson.annotations.SerializedName
import java.util.Date

data class User(
    @SerializedName("_id")
    val id: String,
    val username: String,
    val email: String,
    val createdAt: Date
)

data class AuthResponse(
    val token: String,
    val user: User
)

data class LoginRequest(
    val email: String,
    val password: String
)

data class RegisterRequest(
    val username: String,
    val email: String,
    val password: String
) 