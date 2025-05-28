package com.example.pcmarketx.ui.viewmodels

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.pcmarketx.data.model.Item
import com.example.pcmarketx.data.repository.CartRepository
import com.example.pcmarketx.data.repository.ItemRepository
import com.example.pcmarketx.util.NetworkResult
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class ItemDetailViewModel @Inject constructor(
    private val itemRepository: ItemRepository,
    private val cartRepository: CartRepository
) : ViewModel() {

    private val _productDetail = MutableStateFlow<NetworkResult<Item>>(NetworkResult.Loading())
    val productDetail: StateFlow<NetworkResult<Item>> = _productDetail.asStateFlow()

    private val _isAddingToCart = MutableStateFlow(false)
    val isAddingToCart: StateFlow<Boolean> = _isAddingToCart.asStateFlow()

    private val _addToCartMessage = MutableStateFlow<String?>(null)
    val addToCartMessage: StateFlow<String?> = _addToCartMessage.asStateFlow()

    fun getProductDetail(productId: String) {
        viewModelScope.launch {
            itemRepository.getProductById(productId).collectLatest { result ->
                when (result) {
                    is NetworkResult.Success -> {
                        println("Ürün detayları başarıyla alındı: ${result.data?.name}, ${result.data?.id}")
                    }
                    is NetworkResult.Error -> {
                        println("Ürün detayları alınırken hata: ${result.message}")
                    }
                    is NetworkResult.Loading -> {
                        println("Ürün detayları yükleniyor...")
                    }
                    is NetworkResult.Idle -> {
                        println("Ürün detayları bekleniyor...")
                    }
                }
                _productDetail.value = result
            }
        }
    }

    fun addToCart(item: Item, quantity: Int = 1) {
        viewModelScope.launch {
            _isAddingToCart.value = true
            try {
                cartRepository.addToCart(item, quantity)
                _addToCartMessage.value = "Ürün sepete eklendi"
            } catch (e: Exception) {
                _addToCartMessage.value = "Hata: ${e.message}"
            } finally {
                _isAddingToCart.value = false
            }
        }
    }

    fun clearAddToCartMessage() {
        _addToCartMessage.value = null
    }
} 