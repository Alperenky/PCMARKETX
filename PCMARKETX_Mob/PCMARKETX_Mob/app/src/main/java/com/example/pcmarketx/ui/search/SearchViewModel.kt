package com.example.pcmarketx.ui.search

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.pcmarketx.data.model.Item
import com.example.pcmarketx.data.repository.ItemRepository
import com.example.pcmarketx.util.NetworkResult
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class SearchViewModel @Inject constructor(
    private val itemRepository: ItemRepository
) : ViewModel() {
    
    private val _searchQuery = MutableStateFlow("")
    val searchQuery: StateFlow<String> = _searchQuery.asStateFlow()
    
    private val _searchResults = MutableStateFlow<NetworkResult<List<Item>>>(NetworkResult.Loading())
    val searchResults: StateFlow<NetworkResult<List<Item>>> = _searchResults.asStateFlow()
    
    private val _selectedCategory = MutableStateFlow<String?>(null)
    val selectedCategory: StateFlow<String?> = _selectedCategory.asStateFlow()
    
    private val _currentPage = MutableStateFlow(1)
    val currentPage: StateFlow<Int> = _currentPage.asStateFlow()
    
    private val _totalPages = MutableStateFlow(1)
    val totalPages: StateFlow<Int> = _totalPages.asStateFlow()
    
    private var searchJob: Job? = null
    
    fun setSearchQuery(query: String) {
        _searchQuery.value = query
        _currentPage.value = 1
        
        // Debounce search to avoid too many API calls while typing
        searchJob?.cancel()
        if (query.isNotEmpty()) {
            searchJob = viewModelScope.launch {
                delay(500) // debounce delay
                search()
            }
        } else {
            _searchResults.value = NetworkResult.Success(emptyList())
        }
    }
    
    fun setCategory(category: String?) {
        _selectedCategory.value = category
        _currentPage.value = 1
        search()
    }
    
    fun search() {
        if (_searchQuery.value.isEmpty() && _selectedCategory.value == null) {
            _searchResults.value = NetworkResult.Success(emptyList())
            return
        }
        
        viewModelScope.launch {
            _searchResults.value = NetworkResult.Loading()
            itemRepository.getProducts(
                search = _searchQuery.value.ifEmpty { null },
                category = _selectedCategory.value?.lowercase(),
                page = _currentPage.value,
                limit = 10
            ).collect { result ->
                _searchResults.value = result
                
                // Update total pages count
                if (result is NetworkResult.Success) {
                    itemRepository.getTotalPagesInfo().collect { pagesResult ->
                        if (pagesResult is NetworkResult.Success) {
                            _totalPages.value = pagesResult.data ?: 1
                        }
                    }
                }
            }
        }
    }
    
    fun loadNextPage() {
        if (_searchResults.value is NetworkResult.Success) {
            if (_currentPage.value < _totalPages.value) {
                _currentPage.value++
                search()
            }
        }
    }
    
    fun refresh() {
        _currentPage.value = 1
        search()
    }
} 