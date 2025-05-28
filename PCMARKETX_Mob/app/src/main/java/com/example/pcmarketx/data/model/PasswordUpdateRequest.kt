package com.example.pcmarketx.data.model

data class PasswordUpdateRequest(
    val currentPassword: String,
    val newPassword: String
) 