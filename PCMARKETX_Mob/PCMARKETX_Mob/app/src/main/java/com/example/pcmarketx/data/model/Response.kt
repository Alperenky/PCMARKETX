package com.example.pcmarketx.data.model

import com.google.gson.annotations.SerializedName

/**
 * Tüm API yanıtları için temel sınıf
 */
data class BaseResponse<T>(
    val success: Boolean,
    val message: String? = null,
    val statusCode: Int? = null,
    val errors: List<ValidationError>? = null,
    // T tipinde içerik (items, user, order, vb.)
    val data: T? = null
)

/**
 * Validasyon hatalarını temsil eden model
 */
data class ValidationError(
    val field: String,
    val message: String
)

/**
 * Item listesi yanıtı 
 */
data class ItemListResponse(
    val success: Boolean,
    val message: String? = null,
    val items: List<Item>,
    val total: Int,
    val page: Int,
    val pages: Int
)

/**
 * Tek item yanıtı
 */
data class ItemDetailResponse(
    val success: Boolean,
    val message: String? = null,
    val item: Item
)

/**
 * Siparişler listesi yanıtı
 */
data class OrderListResponse(
    val success: Boolean,
    val message: String? = null,
    val orders: List<Order>
)

/**
 * Tek sipariş yanıtı
 */
data class OrderDetailResponse(
    val success: Boolean,
    val message: String? = null,
    val order: Order
)

// For customer-specific responses
data class CustomerResponse(
    val customer: Customer,
    val orders: List<CustomerOrder>
)

data class Customer(
    @SerializedName("_id")
    val id: String,
    val name: String,
    val email: String,
    val phone: String,
    val address: String,
    val createdAt: String,
    val updatedAt: String
)

data class CustomerOrder(
    @SerializedName("_id")
    val id: String,
    val orderNumber: String,
    val total: Double,
    val status: String,
    val createdAt: String
)

// For stats response
data class StatsResponse(
    val orders: StatItem,
    val revenue: StatItem,
    val customers: StatItem,
    val products: StatItem
)

data class StatItem(
    val total: Int,
    val lastMonth: Int,
    val prevMonth: Int,
    val trend: Int
) 