package com.example.pcmarketx.data.model

import com.google.gson.annotations.SerializedName
import java.util.Date

data class Order(
    @SerializedName("_id")
    val id: String,
    val orderNumber: String,
    val customer: OrderCustomer,
    val items: List<OrderItem>,
    val total: Double,
    val status: String,
    val shippingAddress: String,
    val paymentMethod: String,
    val createdAt: Date,
    val updatedAt: Date
)

data class OrderCustomer(
    @SerializedName("_id")
    val id: String,
    val name: String,
    val email: String,
    val phone: String? = null
)

data class OrderItem(
    val product: OrderProduct,
    val quantity: Int,
    val price: Double
)

data class OrderProduct(
    @SerializedName("_id")
    val id: String,
    val name: String,
    val imageUrl: String,
    val price: Double? = null
)

data class OrdersResponse(
    val orders: List<Order>,
    val currentPage: Int,
    val totalPages: Int,
    val totalOrders: Int
)

data class CreateOrderRequest(
    val customer: String,
    val items: List<CreateOrderItem>,
    val total: Double,
    val shippingAddress: String,
    val paymentMethod: String
)

data class CreateOrderItem(
    val product: String,
    val quantity: Int,
    val price: Double
)

data class UpdateOrderStatusRequest(
    val status: String
) 