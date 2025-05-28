package com.example.pcmarketx.ui.search

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.pcmarketx.data.model.CategoryDetail
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
    
    // Categories state
    private val _categories = MutableStateFlow<NetworkResult<List<CategoryDetail>>>(NetworkResult.Loading())
    val categories: StateFlow<NetworkResult<List<CategoryDetail>>> = _categories.asStateFlow()
    
    // Filter states for new API parameters
    private val _selectedSort = MutableStateFlow<String?>(null)
    val selectedSort: StateFlow<String?> = _selectedSort.asStateFlow()
    
    private val _priceMin = MutableStateFlow<Double?>(null)
    val priceMin: StateFlow<Double?> = _priceMin.asStateFlow()
    
    private val _priceMax = MutableStateFlow<Double?>(null)
    val priceMax: StateFlow<Double?> = _priceMax.asStateFlow()
    
    private val _selectedBrands = MutableStateFlow<String?>(null)
    val selectedBrands: StateFlow<String?> = _selectedBrands.asStateFlow()
    
    private var searchJob: Job? = null
    
    init {
        // Load categories when ViewModel is created
        loadCategories()
    }
    
    private fun loadCategories() {
        viewModelScope.launch {
            try {
                println("Kategoriler yükleniyor...")
                itemRepository.getCategories().collect { result ->
                    _categories.value = result
                    if (result is NetworkResult.Success) {
                        println("Kategoriler başarıyla yüklendi. Kategori sayısı: ${result.data?.size}")
                        result.data?.forEach { category ->
                            println("Kategori: ${category.name} - Slug: ${category.slug}")
                        }
                    } else if (result is NetworkResult.Error) {
                        println("Kategoriler yüklenemedi: ${result.message}")
                    }
                }
            } catch (e: Exception) {
                println("Kategoriler yüklenirken hata: ${e.message}")
                _categories.value = NetworkResult.Error("Kategoriler yüklenemedi: ${e.message}")
            }
        }
    }
    
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
            
            try {
                // Kategori seçilmişse, by-category endpoint'ini kullan
                if (_selectedCategory.value != null && _searchQuery.value.isEmpty()) {
                    println("Kategori araması yapılıyor: ${_selectedCategory.value}, sayfa: ${_currentPage.value}")
                    itemRepository.getProductsByCategory(
                        slug = _selectedCategory.value!!,
                        page = _currentPage.value,
                        subcategories = null,
                        brands = _selectedBrands.value,
                        priceMin = _priceMin.value,
                        priceMax = _priceMax.value,
                        sort = _selectedSort.value
                    ).collect { result ->
                        _searchResults.value = result
                        
                        // Update total pages count for category search
                        if (result is NetworkResult.Success && _currentPage.value == 1) {
                            itemRepository.getCategoryPagesInfo(
                                slug = _selectedCategory.value!!,
                                subcategories = null,
                                brands = _selectedBrands.value,
                                priceMin = _priceMin.value,
                                priceMax = _priceMax.value,
                                sort = _selectedSort.value
                            ).collect { pagesResult ->
                                if (pagesResult is NetworkResult.Success) {
                                    _totalPages.value = pagesResult.data ?: 1
                                }
                            }
                        } else if (result is NetworkResult.Error) {
                            println("Kategori araması başarısız: ${result.message}")
                        }
                    }
                } else {
                    // Arama sorgusu varsa veya kategori yoksa, normal products endpoint'ini kullan
                    println("Metin araması yapılıyor: ${_searchQuery.value}, kategori: ${_selectedCategory.value}")
                    itemRepository.getProducts(
                        search = _searchQuery.value.ifEmpty { null },
                        category = if (_selectedCategory.value != null && _searchQuery.value.isNotEmpty()) _selectedCategory.value else null,
                        page = _currentPage.value,
                        limit = 12,
                        priceMin = _priceMin.value,
                        priceMax = _priceMax.value,
                        sort = _selectedSort.value
                    ).collect { result ->
                        _searchResults.value = result
                        
                        // Update total pages count
                        if (result is NetworkResult.Success) {
                            itemRepository.getTotalPagesInfo(12).collect { pagesResult ->
                                if (pagesResult is NetworkResult.Success) {
                                    _totalPages.value = pagesResult.data ?: 1
                                }
                            }
                        } else if (result is NetworkResult.Error) {
                            println("Arama başarısız: ${result.message}")
                        }
                    }
                }
            } catch (e: Exception) {
                println("Arama yapılırken hata: ${e.message}")
                _searchResults.value = NetworkResult.Error("Arama yapılırken hata oluştu: ${e.message}")
                e.printStackTrace()
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
    
    // Filter setter methods
    fun setSort(sort: String?) {
        _selectedSort.value = sort
        _currentPage.value = 1
        search()
    }
    
    fun setPriceRange(min: Double?, max: Double?) {
        _priceMin.value = min
        _priceMax.value = max
        _currentPage.value = 1
        search()
    }
    
    fun setBrands(brands: String?) {
        _selectedBrands.value = brands
        _currentPage.value = 1
        search()
    }
} 