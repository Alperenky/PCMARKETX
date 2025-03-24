package com.example.pcmarketx.data.repository

import com.example.pcmarketx.data.api.OrderApi
import com.example.pcmarketx.data.model.CreateOrderRequest
import com.example.pcmarketx.data.model.Order
import com.example.pcmarketx.data.model.OrderDetailResponse
import com.example.pcmarketx.data.model.OrderItem
import com.example.pcmarketx.data.model.OrderListResponse
import com.example.pcmarketx.data.model.UpdateOrderStatusRequest
import com.example.pcmarketx.util.NetworkResult
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import kotlinx.coroutines.flow.flowOn
import javax.inject.Inject

class OrderRepository @Inject constructor(
    private val orderApi: OrderApi
) {
    suspend fun getOrders(): Flow<NetworkResult<List<Order>>> = flow {
        emit(NetworkResult.Loading())
        try {
            val response = orderApi.getOrders()
            if (response.isSuccessful && response.body()?.success == true) {
                response.body()?.let { result ->
                    emit(NetworkResult.Success(result.orders))
                }
            } else {
                val errorMsg = response.body()?.message ?: "Failed to get orders"
                emit(NetworkResult.Error(errorMsg))
            }
        } catch (e: Exception) {
            emit(NetworkResult.Error("Order fetch error: ${e.message}"))
        }
    }.flowOn(Dispatchers.IO)
    
    suspend fun getOrderById(id: String): Flow<NetworkResult<Order>> = flow {
        emit(NetworkResult.Loading())
        try {
            val response = orderApi.getOrderById(id)
            if (response.isSuccessful && response.body()?.success == true) {
                response.body()?.let { result ->
                    emit(NetworkResult.Success(result.order))
                }
            } else {
                val errorMsg = response.body()?.message ?: "Failed to get order"
                emit(NetworkResult.Error(errorMsg))
            }
        } catch (e: Exception) {
            emit(NetworkResult.Error("Order detail error: ${e.message}"))
        }
    }.flowOn(Dispatchers.IO)
    
    suspend fun createOrder(
        items: List<OrderItem>,
        totalAmount: Double
    ): Flow<NetworkResult<Order>> = flow {
        emit(NetworkResult.Loading())
        try {
            val orderRequest = CreateOrderRequest(items, totalAmount)
            val response = orderApi.createOrder(orderRequest)
            if (response.isSuccessful && response.body()?.success == true) {
                response.body()?.let { result ->
                    emit(NetworkResult.Success(result.order))
                }
            } else {
                val errorMsg = response.body()?.message ?: "Failed to create order"
                emit(NetworkResult.Error(errorMsg))
            }
        } catch (e: Exception) {
            emit(NetworkResult.Error("Order creation error: ${e.message}"))
        }
    }.flowOn(Dispatchers.IO)
    
    suspend fun updateOrderStatus(
        id: String,
        status: String
    ): Flow<NetworkResult<Order>> = flow {
        emit(NetworkResult.Loading())
        try {
            val statusRequest = UpdateOrderStatusRequest(status)
            val response = orderApi.updateOrderStatus(id, statusRequest)
            if (response.isSuccessful && response.body()?.success == true) {
                response.body()?.let { result ->
                    emit(NetworkResult.Success(result.order))
                }
            } else {
                val errorMsg = response.body()?.message ?: "Failed to update order"
                emit(NetworkResult.Error(errorMsg))
            }
        } catch (e: Exception) {
            emit(NetworkResult.Error("Order update error: ${e.message}"))
        }
    }.flowOn(Dispatchers.IO)
} 