package com.example.pcmarketx.data.model

import com.google.gson.annotations.SerializedName
import java.util.Date

data class OrderItem(
    val itemId: String,
    val quantity: Int
)

data class Order(
    @SerializedName("_id")
    val id: String,
    @SerializedName("userId")
    val userId: String,
    val items: List<OrderItem>,
    val totalAmount: Double,
    val status: String,
    val createdAt: Date,
    val updatedAt: Date
)

data class CreateOrderRequest(
    val items: List<OrderItem>,
    val totalAmount: Double
)

data class UpdateOrderStatusRequest(
    val status: String
) 