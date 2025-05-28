package com.example.pcmarketx.data.repository

import com.example.pcmarketx.data.api.ItemApi
import com.example.pcmarketx.data.model.CategoryDetail
import com.example.pcmarketx.data.model.CreateItemRequest
import com.example.pcmarketx.data.model.Item
import com.example.pcmarketx.data.model.ItemDetailResponse
import com.example.pcmarketx.data.model.ItemListResponse
import com.example.pcmarketx.data.model.UpdateItemRequest
import com.example.pcmarketx.util.NetworkResult
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import kotlinx.coroutines.flow.flowOn
import javax.inject.Inject

class ItemRepository @Inject constructor(
    private val itemApi: ItemApi
) {
    suspend fun getProducts(
        category: String? = null,
        search: String? = null,
        page: Int? = null,
        limit: Int? = null,
        priceMin: Double? = null,
        priceMax: Double? = null,
        sort: String? = null,
        status: String? = null
    ): Flow<NetworkResult<List<Item>>> = flow {
        emit(NetworkResult.Loading())
        try {
            println("getProducts çağrılıyor - kategori: $category, arama: $search, sayfa: $page")
            
            val response = itemApi.getProducts(page, limit, category, search, priceMin, priceMax, sort, status)
            if (response.isSuccessful) {
                response.body()?.let { result ->
                    println("API yanıtı başarılı. Ürün sayısı: ${result.products.size}")
                    emit(NetworkResult.Success(result.products))
                } ?: run {
                    println("API yanıtı başarılı ama içerik boş")
                    emit(NetworkResult.Success(emptyList()))
                }
            } else {
                val errorMsg = "Failed to get products: ${response.code()}, ${response.message()}"
                println("API yanıtı başarısız: $errorMsg")
                emit(NetworkResult.Error(errorMsg))
            }
        } catch (e: Exception) {
            val errorMsg = "Product fetch error: ${e.message}"
            println("İstisna oluştu: $errorMsg")
            e.printStackTrace()
            emit(NetworkResult.Error(errorMsg))
        }
    }.flowOn(Dispatchers.IO)
    
    suspend fun getProductById(id: String): Flow<NetworkResult<Item>> = flow {
        emit(NetworkResult.Loading())
        try {
            val response = itemApi.getProductById(id)
            if (response.isSuccessful) {
                response.body()?.let { item ->
                    emit(NetworkResult.Success(item))
                }
            } else {
                emit(NetworkResult.Error("Failed to get product: ${response.code()}"))
            }
        } catch (e: Exception) {
            emit(NetworkResult.Error("Product detail error: ${e.message}"))
        }
    }.flowOn(Dispatchers.IO)
    
    suspend fun getProductsByCategory(
        slug: String,
        page: Int? = null,
        subcategories: String? = null,
        brands: String? = null,
        priceMin: Double? = null,
        priceMax: Double? = null,
        sort: String? = null
    ): Flow<NetworkResult<List<Item>>> = flow {
        emit(NetworkResult.Loading())
        try {
            println("Category slug: $slug, page: $page, sort: $sort")
            
            val response = itemApi.getProductsByCategory(slug, page, subcategories, brands, priceMin, priceMax, sort)
            if (response.isSuccessful) {
                response.body()?.let { result ->
                    println("API yanıtı başarılı. Ürün sayısı: ${result.products.size}, Sayfa: ${result.currentPage}, Toplam sayfa: ${result.totalPages}")
                    emit(NetworkResult.Success(result.products))
                } ?: run {
                    println("API yanıtı başarılı ama içerik boş")
                    emit(NetworkResult.Success(emptyList()))
                }
            } else {
                val errorMsg = "Failed to get products by category: ${response.code()}, ${response.message()}"
                println("API yanıtı başarısız: $errorMsg")
                emit(NetworkResult.Error(errorMsg))
            }
        } catch (e: Exception) {
            val errorMsg = "Category products error: ${e.message}"
            println("İstisna oluştu: $errorMsg")
            e.printStackTrace()
            emit(NetworkResult.Error(errorMsg))
        }
    }.flowOn(Dispatchers.IO)
    
    suspend fun getCategories(): Flow<NetworkResult<List<CategoryDetail>>> = flow {
        emit(NetworkResult.Loading())
        try {
            val response = itemApi.getCategories()
            if (response.isSuccessful) {
                response.body()?.let { result ->
                    emit(NetworkResult.Success(result))
                }
            } else {
                emit(NetworkResult.Error("Failed to get categories: ${response.code()}"))
            }
        } catch (e: Exception) {
            emit(NetworkResult.Error("Categories fetch error: ${e.message}"))
        }
    }.flowOn(Dispatchers.IO)
    
    suspend fun getCategoryBySlug(slug: String): Flow<NetworkResult<CategoryDetail>> = flow {
        emit(NetworkResult.Loading())
        try {
            val response = itemApi.getCategoryBySlug(slug)
            if (response.isSuccessful) {
                response.body()?.let { result ->
                    emit(NetworkResult.Success(result))
                }
            } else {
                emit(NetworkResult.Error("Failed to get category: ${response.code()}"))
            }
        } catch (e: Exception) {
            emit(NetworkResult.Error("Category fetch error: ${e.message}"))
        }
    }.flowOn(Dispatchers.IO)

    // Only provide pagination information getters
    suspend fun getTotalPagesInfo(limit: Int = 10): Flow<NetworkResult<Int>> = flow {
        emit(NetworkResult.Loading())
        try {
            println("Toplam sayfa bilgisi alınıyor. Limit: $limit")
            val response = itemApi.getProducts(page = 1, limit = limit)
            if (response.isSuccessful) {
                response.body()?.let { result ->
                    println("Toplam sayfa sayısı: ${result.totalPages}, Toplam ürün sayısı: ${result.totalProducts}")
                    emit(NetworkResult.Success(result.totalPages))
                } ?: run {
                    println("Sayfa bilgisi alınamadı (null)")
                    emit(NetworkResult.Success(1))
                }
            } else {
                val errorMsg = "Failed to get pagination info: ${response.code()}, ${response.message()}"
                println("Sayfa bilgisi alınamadı: $errorMsg")
                emit(NetworkResult.Error(errorMsg))
            }
        } catch (e: Exception) {
            val errorMsg = "Pagination info error: ${e.message}"
            println("Sayfa bilgisi alınırken hata: $errorMsg")
            e.printStackTrace()
            emit(NetworkResult.Error(errorMsg))
        }
    }.flowOn(Dispatchers.IO)
    
    suspend fun getCategoryPagesInfo(
        slug: String,
        subcategories: String? = null,
        brands: String? = null,
        priceMin: Double? = null,
        priceMax: Double? = null,
        sort: String? = null
    ): Flow<NetworkResult<Int>> = flow {
        emit(NetworkResult.Loading())
        try {
            println("Kategori sayfa bilgisi alınıyor. Slug: $slug")
            val response = itemApi.getProductsByCategory(slug, 1, subcategories, brands, priceMin, priceMax, sort)
            if (response.isSuccessful) {
                response.body()?.let { result ->
                    println("Kategori toplam sayfa sayısı: ${result.totalPages}, Toplam ürün sayısı: ${result.totalProducts}")
                    emit(NetworkResult.Success(result.totalPages))
                } ?: run {
                    println("Kategori sayfa bilgisi alınamadı (null)")
                    emit(NetworkResult.Success(1))
                }
            } else {
                val errorMsg = "Failed to get category pagination info: ${response.code()}, ${response.message()}"
                println("Kategori sayfa bilgisi alınamadı: $errorMsg")
                emit(NetworkResult.Error(errorMsg))
            }
        } catch (e: Exception) {
            val errorMsg = "Category pagination info error: ${e.message}"
            println("Kategori sayfa bilgisi alınırken hata: $errorMsg")
            e.printStackTrace()
            emit(NetworkResult.Error(errorMsg))
        }
    }.flowOn(Dispatchers.IO)
    
    suspend fun getPopularProducts(): Flow<NetworkResult<List<Item>>> = flow {
        emit(NetworkResult.Loading())
        try {
            println("=== API Call: GET /api/products/popular ===")
            val response = itemApi.getPopularProducts()
            
            println("=== Response Code: ${response.code()} ===")
            println("=== Response Message: ${response.message()} ===")
            
            if (response.isSuccessful) {
                response.body()?.let { result ->
                    println("=== Response Body: ${result.size} items ===")
                    result.forEach { item ->
                        println("Item: ${item.name}, Popular: ${item.popular}, Price: ${item.price}")
                    }
                    emit(NetworkResult.Success(result))
                } ?: run {
                    println("=== Response body is null ===")
                    emit(NetworkResult.Success(emptyList()))
                }
            } else {
                val errorBody = response.errorBody()?.string()
                val errorMsg = "Popüler ürünler alınamadı: ${response.code()} - ${response.message()}"
                println("=== API Error: $errorMsg ===")
                println("=== Error Body: $errorBody ===")
                
                // Eğer endpoint bulunamadıysa normal ürünlerden popüler olanları al
                if (response.code() == 404) {
                    println("=== /api/products/popular bulunamadı, fallback olarak normal ürünlerden popüler olanları alıyorum ===")
                    
                    try {
                        val fallbackResponse = itemApi.getProducts(page = 1, limit = 100)
                        if (fallbackResponse.isSuccessful) {
                            fallbackResponse.body()?.let { productsResponse ->
                                println("=== Fallback: Toplam ${productsResponse.products.size} ürün alındı ===")
                                
                                // İlk önce popüler/featured ürünleri al
                                val popularItems = productsResponse.products.filter { 
                                    it.popular == true || it.featured == true
                                }
                                
                                println("=== Popüler/Featured ürün sayısı: ${popularItems.size} ===")
                                
                                // Eğer yeterli değilse, rating'e göre genişlet
                                val highRatedItems = if (popularItems.size < 8) {
                                    productsResponse.products.filter { 
                                        (it.rating ?: 0.0) >= 4.0
                                    }.sortedByDescending { it.rating }
                                } else emptyList()
                                
                                println("=== Rating >=4.0 ürün sayısı: ${highRatedItems.size} ===")
                                
                                // Eğer hala yeterli değilse, satış kriterine göre genişlet
                                val topSellingItems = if ((popularItems + highRatedItems).distinctBy { it.id }.size < 8) {
                                    productsResponse.products.filter { 
                                        (it.sales ?: 0) > 10
                                    }.sortedByDescending { it.sales }
                                } else emptyList()
                                
                                println("=== Satış >10 ürün sayısı: ${topSellingItems.size} ===")
                                
                                // Eğer hala yeterli değilse, en yüksek rating'li ürünleri al
                                val finalItems = if ((popularItems + highRatedItems + topSellingItems).distinctBy { it.id }.size < 8) {
                                    productsResponse.products.sortedByDescending { it.rating ?: 0.0 }
                                } else emptyList()
                                
                                // Tüm listeleri birleştir ve duplikatları kaldır
                                val combinedItems = (popularItems + highRatedItems + topSellingItems + finalItems)
                                    .distinctBy { it.id }
                                    .take(10)
                                
                                println("=== Final: ${combinedItems.size} popüler ürün seçildi ===")
                                combinedItems.forEachIndexed { index, item ->
                                    println("$index. ${item.name} - Popüler: ${item.popular}, Featured: ${item.featured}, Rating: ${item.rating}, Sales: ${item.sales}")
                                }
                                
                                emit(NetworkResult.Success(combinedItems))
                                return@flow
                            }
                        }
                    } catch (fallbackException: Exception) {
                        println("=== Fallback de başarısız: ${fallbackException.message} ===")
                    }
                    
                    emit(NetworkResult.Error("Server'da /api/products/popular endpoint'i bulunamadı ve fallback de çalışmadı"))
                } else {
                    emit(NetworkResult.Error("$errorMsg\nDetay: $errorBody"))
                }
            }
        } catch (e: Exception) {
            val errorMsg = "Network hatası: ${e.message}"
            println("=== Exception: $errorMsg ===")
            e.printStackTrace()
            emit(NetworkResult.Error(errorMsg))
        }
    }.flowOn(Dispatchers.IO)
} 