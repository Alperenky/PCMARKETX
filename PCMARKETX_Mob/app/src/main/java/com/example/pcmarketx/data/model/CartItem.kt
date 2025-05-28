package com.example.pcmarketx.data.model

data class CartItem(
    val item: Item,
    val quantity: Int
) {
    val totalPrice: Double
        get() = item.price * quantity
} 