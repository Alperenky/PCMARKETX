package com.example.pcmarketx.ui.itemdetail

import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.pcmarketx.data.model.Item
import com.example.pcmarketx.data.model.OrderItem
import com.example.pcmarketx.data.repository.CartRepository
import com.example.pcmarketx.data.repository.ItemRepository
import com.example.pcmarketx.ui.navigation.Routes
import com.example.pcmarketx.util.NetworkResult
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class ItemDetailViewModel @Inject constructor(
    private val itemRepository: ItemRepository,
    private val cartRepository: CartRepository,
    savedStateHandle: SavedStateHandle
) : ViewModel() {
    
    private val _itemState = MutableStateFlow<NetworkResult<Item>>(NetworkResult.Loading())
    val itemState: StateFlow<NetworkResult<Item>> = _itemState.asStateFlow()
    
    private val _quantity = MutableStateFlow(1)
    val quantity: StateFlow<Int> = _quantity.asStateFlow()
    
    private val _addedToCart = MutableStateFlow(false)
    val addedToCart: StateFlow<Boolean> = _addedToCart.asStateFlow()
    
    private val itemId: String = checkNotNull(savedStateHandle[Routes.ItemDetail.ITEM_ID_ARG])
    
    init {
        getItemDetails()
    }
    
    fun getItemDetails() {
        viewModelScope.launch {
            itemRepository.getItemById(itemId).collect { result ->
                _itemState.value = result
            }
        }
    }
    
    fun increaseQuantity() {
        _quantity.value += 1
    }
    
    fun decreaseQuantity() {
        if (_quantity.value > 1) {
            _quantity.value -= 1
        }
    }
    
    fun addToCart() {
        val currentState = _itemState.value
        if (currentState is NetworkResult.Success) {
            currentState.data?.let { item ->
                cartRepository.addToCart(item, _quantity.value)
                _addedToCart.value = true
            }
        }
    }
    
    fun resetAddedToCart() {
        _addedToCart.value = false
    }
} 