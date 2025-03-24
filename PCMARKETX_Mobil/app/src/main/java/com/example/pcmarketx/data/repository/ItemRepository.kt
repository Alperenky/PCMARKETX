package com.example.pcmarketx.data.repository

import com.example.pcmarketx.data.api.ItemApi
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
    suspend fun getItems(
        category: String? = null,
        search: String? = null,
        page: Int? = null,
        limit: Int? = null
    ): Flow<NetworkResult<List<Item>>> = flow {
        emit(NetworkResult.Loading())
        try {
            val response = itemApi.getItems(category, search, page, limit)
            if (response.isSuccessful && response.body()?.success == true) {
                response.body()?.let { result ->
                    emit(NetworkResult.Success(result.items))
                }
            } else {
                val errorMsg = response.body()?.message ?: "Failed to get items"
                emit(NetworkResult.Error(errorMsg))
            }
        } catch (e: Exception) {
            emit(NetworkResult.Error("Item fetch error: ${e.message}"))
        }
    }.flowOn(Dispatchers.IO)
    
    suspend fun getItemById(id: String): Flow<NetworkResult<Item>> = flow {
        emit(NetworkResult.Loading())
        try {
            val response = itemApi.getItemById(id)
            if (response.isSuccessful && response.body()?.success == true) {
                response.body()?.let { result ->
                    emit(NetworkResult.Success(result.item))
                }
            } else {
                val errorMsg = response.body()?.message ?: "Failed to get item"
                emit(NetworkResult.Error(errorMsg))
            }
        } catch (e: Exception) {
            emit(NetworkResult.Error("Item detail error: ${e.message}"))
        }
    }.flowOn(Dispatchers.IO)
    
    suspend fun createItem(
        title: String,
        description: String,
        imageUrl: String,
        price: Double,
        category: String
    ): Flow<NetworkResult<Item>> = flow {
        emit(NetworkResult.Loading())
        try {
            val itemRequest = CreateItemRequest(title, description, imageUrl, price, category)
            val response = itemApi.createItem(itemRequest)
            if (response.isSuccessful && response.body()?.success == true) {
                response.body()?.let { result ->
                    emit(NetworkResult.Success(result.item))
                }
            } else {
                val errorMsg = response.body()?.message ?: "Failed to create item"
                emit(NetworkResult.Error(errorMsg))
            }
        } catch (e: Exception) {
            emit(NetworkResult.Error("Item creation error: ${e.message}"))
        }
    }.flowOn(Dispatchers.IO)
    
    suspend fun updateItem(
        id: String,
        title: String? = null,
        description: String? = null,
        imageUrl: String? = null,
        price: Double? = null,
        category: String? = null
    ): Flow<NetworkResult<Item>> = flow {
        emit(NetworkResult.Loading())
        try {
            val itemRequest = UpdateItemRequest(title, description, imageUrl, price, category)
            val response = itemApi.updateItem(id, itemRequest)
            if (response.isSuccessful && response.body()?.success == true) {
                response.body()?.let { result ->
                    emit(NetworkResult.Success(result.item))
                }
            } else {
                val errorMsg = response.body()?.message ?: "Failed to update item"
                emit(NetworkResult.Error(errorMsg))
            }
        } catch (e: Exception) {
            emit(NetworkResult.Error("Item update error: ${e.message}"))
        }
    }.flowOn(Dispatchers.IO)
    
    suspend fun deleteItem(id: String): Flow<NetworkResult<Boolean>> = flow {
        emit(NetworkResult.Loading())
        try {
            val response = itemApi.deleteItem(id)
            if (response.isSuccessful && response.body()?.success == true) {
                response.body()?.data?.let { result ->
                    emit(NetworkResult.Success(result["success"] ?: false))
                } ?: emit(NetworkResult.Success(true)) // No data but success true means operation succeeded
            } else {
                val errorMsg = response.body()?.message ?: "Failed to delete item"
                emit(NetworkResult.Error(errorMsg))
            }
        } catch (e: Exception) {
            emit(NetworkResult.Error("Item deletion error: ${e.message}"))
        }
    }.flowOn(Dispatchers.IO)

    // Pagination info getters
    suspend fun getTotalPages(): Flow<NetworkResult<Int>> = flow {
        emit(NetworkResult.Loading())
        try {
            val response = itemApi.getItems(page = 1, limit = 10)
            if (response.isSuccessful && response.body()?.success == true) {
                response.body()?.let { result ->
                    emit(NetworkResult.Success(result.pages))
                }
            } else {
                val errorMsg = response.body()?.message ?: "Failed to get pagination info"
                emit(NetworkResult.Error(errorMsg))
            }
        } catch (e: Exception) {
            emit(NetworkResult.Error("Pagination info error: ${e.message}"))
        }
    }.flowOn(Dispatchers.IO)
} 