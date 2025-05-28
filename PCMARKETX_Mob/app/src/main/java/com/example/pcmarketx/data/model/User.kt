package com.example.pcmarketx.data.model

import com.google.gson.annotations.SerializedName

data class User(
    @SerializedName("_id")
    val id: String,
    val username: String,
    val email: String,
    val firstName: String,
    val lastName: String,
    val phone: String? = null,
    val role: String,
    val token: String,
    val addresses: List<com.example.pcmarketx.data.model.Address> = emptyList()
)

data class AuthResponse(
    val _id: String,
    val username: String,
    val email: String,
    val firstName: String? = null,
    val lastName: String? = null,
    val phone: String? = null,
    val role: String,
    val token: String
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