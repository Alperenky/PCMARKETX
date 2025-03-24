package com.example.pcmarketx.data.model

import com.google.gson.annotations.SerializedName
import java.util.Date

data class Item(
    @SerializedName("_id")
    val id: String,
    val title: String,
    val description: String,
    val imageUrl: String,
    val price: Double,
    val category: String,
    @SerializedName("userId")
    val userId: String,
    val createdAt: Date,
    val updatedAt: Date
)

data class ItemResponse(
    val items: List<Item>,
    val total: Int,
    val page: Int,
    val pages: Int
)

data class CreateItemRequest(
    val title: String,
    val description: String,
    val imageUrl: String,
    val price: Double,
    val category: String
)

data class UpdateItemRequest(
    val title: String? = null,
    val description: String? = null,
    val imageUrl: String? = null,
    val price: Double? = null,
    val category: String? = null
) 