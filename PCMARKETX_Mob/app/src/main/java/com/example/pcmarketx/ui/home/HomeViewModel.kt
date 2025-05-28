package com.example.pcmarketx.ui.home

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
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class HomeViewModel @Inject constructor(
    private val itemRepository: ItemRepository,
    private val cartRepository: CartRepository
) : ViewModel() {
    
    private val _items = MutableStateFlow<NetworkResult<List<Item>>>(NetworkResult.Loading())
    val items: StateFlow<NetworkResult<List<Item>>> = _items.asStateFlow()
    
    private val _popularProducts = MutableStateFlow<NetworkResult<List<Item>>>(NetworkResult.Loading())
    val popularProducts: StateFlow<NetworkResult<List<Item>>> = _popularProducts.asStateFlow()
    
    private val _searchQuery = MutableStateFlow<String?>(null)
    val searchQuery: StateFlow<String?> = _searchQuery.asStateFlow()
    
    private val _currentPage = MutableStateFlow(1)
    val currentPage: StateFlow<Int> = _currentPage.asStateFlow()
    
    private val _totalPages = MutableStateFlow(1)
    val totalPages: StateFlow<Int> = _totalPages.asStateFlow()
    
    private val _message = MutableStateFlow<String?>(null)
    val message: StateFlow<String?> = _message.asStateFlow()
    
    init {
        getProducts()
        getPopularProducts()
    }
    
    fun getProducts() {
        viewModelScope.launch {
            _items.value = NetworkResult.Loading()
            try {
                println("Tüm ürünler getiriliyor. Sayfa: ${_currentPage.value}")
                itemRepository.getProducts(
                    category = null,
                    search = _searchQuery.value,
                    page = _currentPage.value,
                    limit = 20
                ).collect { result ->
                    _items.value = result
                    
                    // Update total pages count
                    if (result is NetworkResult.Success) {
                        println("Tüm ürünler başarıyla alındı. Ürün sayısı: ${result.data?.size ?: 0}")
                        itemRepository.getTotalPagesInfo(20).collect { pagesResult ->
                            if (pagesResult is NetworkResult.Success) {
                                _totalPages.value = pagesResult.data ?: 1
                                println("Toplam sayfa sayısı: ${_totalPages.value}")
                            }
                        }
                    } else if (result is NetworkResult.Error) {
                        println("Tüm ürünler alınamadı: ${result.message}")
                    }
                }
            } catch (e: Exception) {
                println("Tüm ürünler alınırken hata: ${e.message}")
                _items.value = NetworkResult.Error("Tüm ürünler alınırken hata oluştu: ${e.message}")
            }
        }
    }
    
    fun setSearchQuery(query: String?) {
        _searchQuery.value = query
        _currentPage.value = 1
        getProducts()
    }
    
    fun loadNextPage() {
        if (_items.value is NetworkResult.Success) {
            if (_currentPage.value < _totalPages.value) {
                _currentPage.value++
                getProducts()
            }
        }
    }
    
    fun refresh() {
        _currentPage.value = 1
        getProducts()
        getPopularProducts()
    }
    
    fun getPopularProducts() {
        viewModelScope.launch {
            _popularProducts.value = NetworkResult.Loading()
            try {
                println("=== Popüler ürünler getiriliyor... ===")
                itemRepository.getPopularProducts().collect { result ->
                    _popularProducts.value = result
                    
                    if (result is NetworkResult.Success) {
                        println("=== Popüler ürünler başarıyla alındı. Ürün sayısı: ${result.data?.size ?: 0} ===")
                        result.data?.forEach { product ->
                            println("Popüler ürün: ${product.name} - Popüler: ${product.popular}")
                        }
                    } else if (result is NetworkResult.Error) {
                        println("=== Popüler ürünler alınamadı: ${result.message} ===")
                    } else if (result is NetworkResult.Loading) {
                        println("=== Popüler ürünler yükleniyor... ===")
                    }
                }
            } catch (e: Exception) {
                println("=== Popüler ürünler alınırken hata: ${e.message} ===")
                e.printStackTrace()
                _popularProducts.value = NetworkResult.Error("Popüler ürünler alınırken hata oluştu: ${e.message}")
            }
        }
    }
    
    fun addToCart(item: Item, quantity: Int) {
        viewModelScope.launch {
            try {
                cartRepository.addToCart(item, quantity)
                _message.value = "${item.name} sepete eklendi"
                // Mesajı temizle
                launch {
                    kotlinx.coroutines.delay(2000)
                    _message.value = null
                }
            } catch (e: Exception) {
                _message.value = "Sepete eklenirken bir hata oluştu"
                launch {
                    kotlinx.coroutines.delay(2000)
                    _message.value = null
                }
            }
        }
    }
} 