package com.example.pcmarketx.ui.cart

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.pcmarketx.data.model.CartItem
import com.example.pcmarketx.data.model.Order
import com.example.pcmarketx.data.repository.CartRepository
import com.example.pcmarketx.data.repository.OrderRepository
import com.example.pcmarketx.util.NetworkResult
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class CartViewModel @Inject constructor(
    private val cartRepository: CartRepository,
    private val orderRepository: OrderRepository
) : ViewModel() {
    
    val cartItems = cartRepository.cartItems
    
    private val _orderState = MutableStateFlow<NetworkResult<Order>?>(null)
    val orderState: StateFlow<NetworkResult<Order>?> = _orderState.asStateFlow()
    
    private val _checkoutState = MutableStateFlow(false)
    val checkoutState: StateFlow<Boolean> = _checkoutState.asStateFlow()
    
    val totalPrice: StateFlow<Double> = cartRepository.cartItems.map { items ->
        items.sumOf { it.totalPrice }
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), 0.0)
    
    fun updateQuantity(itemId: String, quantity: Int) {
        cartRepository.updateQuantity(itemId, quantity)
    }
    
    fun removeFromCart(itemId: String) {
        cartRepository.removeFromCart(itemId)
    }
    
    fun clearCart() {
        cartRepository.clearCart()
    }
    
    fun checkout() {
        viewModelScope.launch {
            val orderItems = cartRepository.getOrderItems()
            if (orderItems.isEmpty()) return@launch
            
            val totalAmount = cartRepository.getTotalPrice()
            
            _orderState.value = NetworkResult.Loading()
            orderRepository.createOrder(orderItems, totalAmount).collect { result ->
                _orderState.value = result
                if (result is NetworkResult.Success) {
                    cartRepository.clearCart()
                    _checkoutState.value = true
                }
            }
        }
    }
    
    fun resetCheckoutState() {
        _checkoutState.value = false
        _orderState.value = null
    }
} 