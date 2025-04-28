package com.example.pcmarketx.data.repository

import com.example.pcmarketx.data.model.CartItem
import com.example.pcmarketx.data.model.CreateOrderItem
import com.example.pcmarketx.data.model.Item
import com.example.pcmarketx.data.model.OrderItem
import com.example.pcmarketx.data.model.OrderProduct
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class CartRepository @Inject constructor() {
    
    private val _cartItems = MutableStateFlow<List<CartItem>>(emptyList())
    val cartItems: StateFlow<List<CartItem>> = _cartItems.asStateFlow()
    
    fun addToCart(item: Item, quantity: Int) {
        val currentItems = _cartItems.value.toMutableList()
        val existingItemIndex = currentItems.indexOfFirst { it.item.id == item.id }
        
        if (existingItemIndex >= 0) {
            // Item already exists, update quantity
            val existingItem = currentItems[existingItemIndex]
            val updatedItem = existingItem.copy(quantity = existingItem.quantity + quantity)
            currentItems[existingItemIndex] = updatedItem
        } else {
            // New item, add to cart
            currentItems.add(CartItem(item, quantity))
        }
        
        _cartItems.value = currentItems
    }
    
    fun removeFromCart(itemId: String) {
        _cartItems.update { items ->
            items.filter { it.item.id != itemId }
        }
    }
    
    fun updateQuantity(itemId: String, quantity: Int) {
        if (quantity <= 0) {
            removeFromCart(itemId)
            return
        }
        
        _cartItems.update { items ->
            items.map { 
                if (it.item.id == itemId) it.copy(quantity = quantity) else it 
            }
        }
    }
    
    fun clearCart() {
        _cartItems.value = emptyList()
    }
    
    fun getTotalPrice(): Double {
        return _cartItems.value.sumOf { it.totalPrice }
    }
    
    // For UI display
    fun getOrderItems(): List<OrderItem> {
        return _cartItems.value.map { cartItem ->
            OrderItem(
                product = OrderProduct(
                    id = cartItem.item.id,
                    name = cartItem.item.name,
                    imageUrl = cartItem.item.imageUrl,
                    price = cartItem.item.price
                ),
                quantity = cartItem.quantity,
                price = cartItem.item.price
            )
        }
    }
    
    // For API requests
    fun getCreateOrderItems(): List<CreateOrderItem> {
        return _cartItems.value.map { cartItem ->
            CreateOrderItem(
                product = cartItem.item.id,
                quantity = cartItem.quantity,
                price = cartItem.item.price
            )
        }
    }
} 