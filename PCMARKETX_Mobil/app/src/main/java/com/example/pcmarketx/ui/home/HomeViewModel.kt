package com.example.pcmarketx.ui.home

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.pcmarketx.data.model.Item
import com.example.pcmarketx.data.model.ItemListResponse
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
    private val itemRepository: ItemRepository
) : ViewModel() {
    
    private val _items = MutableStateFlow<NetworkResult<List<Item>>>(NetworkResult.Loading())
    val items: StateFlow<NetworkResult<List<Item>>> = _items.asStateFlow()
    
    private val _selectedCategory = MutableStateFlow<String?>(null)
    val selectedCategory: StateFlow<String?> = _selectedCategory.asStateFlow()
    
    private val _searchQuery = MutableStateFlow<String?>(null)
    val searchQuery: StateFlow<String?> = _searchQuery.asStateFlow()
    
    private val _currentPage = MutableStateFlow(1)
    val currentPage: StateFlow<Int> = _currentPage.asStateFlow()
    
    private val _totalPages = MutableStateFlow(1)
    val totalPages: StateFlow<Int> = _totalPages.asStateFlow()
    
    init {
        getItems()
    }
    
    fun getItems() {
        viewModelScope.launch {
            itemRepository.getItems(
                category = _selectedCategory.value,
                search = _searchQuery.value,
                page = _currentPage.value,
                limit = 10
            ).collect { result ->
                _items.value = result
                
                // Update total pages count
                if (result is NetworkResult.Success) {
                    itemRepository.getTotalPages().collect { pagesResult ->
                        if (pagesResult is NetworkResult.Success) {
                            _totalPages.value = pagesResult.data ?: 1
                        }
                    }
                }
            }
        }
    }
    
    fun setCategory(category: String?) {
        _selectedCategory.value = category
        _currentPage.value = 1
        getItems()
    }
    
    fun setSearchQuery(query: String?) {
        _searchQuery.value = query
        _currentPage.value = 1
        getItems()
    }
    
    fun loadNextPage() {
        if (_items.value is NetworkResult.Success) {
            if (_currentPage.value < _totalPages.value) {
                _currentPage.value++
                getItems()
            }
        }
    }
    
    fun refresh() {
        _currentPage.value = 1
        getItems()
    }
} 