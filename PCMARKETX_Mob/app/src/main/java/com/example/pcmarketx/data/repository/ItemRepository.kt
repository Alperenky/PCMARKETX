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
            val response = itemApi.getProducts(page, limit, category, search, priceMin, priceMax, sort, status)
            if (response.isSuccessful) {
                response.body()?.let { result ->
                    emit(NetworkResult.Success(result.products))
                }
            } else {
                emit(NetworkResult.Error("Failed to get products: ${response.code()}"))
            }
        } catch (e: Exception) {
            emit(NetworkResult.Error("Product fetch error: ${e.message}"))
        }
    }.flowOn(Dispatchers.IO)
    
    suspend fun getProductById(id: String): Flow<NetworkResult<Item>> = flow {
        emit(NetworkResult.Loading())
        try {
            val response = itemApi.getProductById(id)
            if (response.isSuccessful) {
                response.body()?.let { result ->
                    emit(NetworkResult.Success(result.item))
                }
            } else {
                emit(NetworkResult.Error("Failed to get product: ${response.code()}"))
            }
        } catch (e: Exception) {
            emit(NetworkResult.Error("Product detail error: ${e.message}"))
        }
    }.flowOn(Dispatchers.IO)
    
    suspend fun getProductsByCategory(slug: String): Flow<NetworkResult<List<Item>>> = flow {
        emit(NetworkResult.Loading())
        try {
            val response = itemApi.getProductsByCategory(slug)
            if (response.isSuccessful) {
                response.body()?.let { result ->
                    emit(NetworkResult.Success(result))
                }
            } else {
                emit(NetworkResult.Error("Failed to get products by category: ${response.code()}"))
            }
        } catch (e: Exception) {
            emit(NetworkResult.Error("Category products error: ${e.message}"))
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
            val response = itemApi.getProducts(page = 1, limit = limit)
            if (response.isSuccessful) {
                response.body()?.let { result ->
                    emit(NetworkResult.Success(result.totalPages))
                }
            } else {
                emit(NetworkResult.Error("Failed to get pagination info: ${response.code()}"))
            }
        } catch (e: Exception) {
            emit(NetworkResult.Error("Pagination info error: ${e.message}"))
        }
    }.flowOn(Dispatchers.IO)
} 