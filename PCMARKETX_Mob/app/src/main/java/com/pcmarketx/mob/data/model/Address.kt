package com.pcmarketx.mob.data.model

data class Address(
    val id: Int,
    val title: String,
    val address: String,
    val district: String,
    val city: String,
    val isDefault: Boolean
) 