package com.example.pcmarketx.data.model

import com.google.gson.annotations.SerializedName
import java.util.Date

data class CategoryDetail(
    @SerializedName("_id")
    val id: String,
    val name: String,
    val slug: String,
    val description: String,
    val imageUrl: String,
    val createdAt: Date,
    val updatedAt: Date
) 