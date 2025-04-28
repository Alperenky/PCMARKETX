package com.example.pcmarketx.data.model

import com.google.gson.annotations.SerializedName
import java.util.Date

data class Item(
    @SerializedName("_id")
    val id: String,
    val name: String,
    val price: Double,
    val description: String,
    val brand: String,
    val imageUrl: String,
    val stock: Int,
    val category: Category,
    val status: String,
    val features: List<String>?,
    val sales: Int?,
    val createdAt: Date,
    val updatedAt: Date
)

data class Category(
    @SerializedName("_id")
    val id: String,
    val name: String,
    val slug: String
)

data class ProductsResponse(
    val products: List<Item>,
    val currentPage: Int,
    val totalPages: Int,
    val totalProducts: Int
)

data class CategoryResponse(
    val _id: String,
    val name: String,
    val slug: String,
    val description: String,
    val imageUrl: String,
    val createdAt: Date,
    val updatedAt: Date
)

data class CreateItemRequest(
    val name: String,
    val price: Double,
    val description: String,
    val brand: String,
    val imageUrl: String,
    val stock: Int,
    val category: String,
    val features: List<String>?
)

data class UpdateItemRequest(
    val name: String? = null,
    val price: Double? = null,
    val description: String? = null,
    val brand: String? = null,
    val imageUrl: String? = null,
    val stock: Int? = null,
    val category: String? = null,
    val features: List<String>? = null
) 