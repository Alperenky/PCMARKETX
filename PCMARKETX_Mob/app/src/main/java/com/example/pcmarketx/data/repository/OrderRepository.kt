package com.example.pcmarketx.data.repository

import com.example.pcmarketx.data.api.OrderApi
import com.example.pcmarketx.data.model.CreateOrderItem
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
    suspend fun getOrders(
        page: Int? = null,
        limit: Int? = null,
        status: String? = null,
        customerId: String? = null,
        sort: String? = null
    ): Flow<NetworkResult<List<Order>>> = flow {
        emit(NetworkResult.Loading())
        try {
            val response = orderApi.getOrders(page, limit, status, customerId, sort)
            if (response.isSuccessful) {
                response.body()?.let { result ->
                    emit(NetworkResult.Success(result.orders))
                }
            } else {
                emit(NetworkResult.Error("Failed to get orders: ${response.code()}"))
            }
        } catch (e: Exception) {
            emit(NetworkResult.Error("Order fetch error: ${e.message}"))
        }
    }.flowOn(Dispatchers.IO)
    
    suspend fun getOrderById(id: String): Flow<NetworkResult<Order>> = flow {
        emit(NetworkResult.Loading())
        try {
            val response = orderApi.getOrderById(id)
            if (response.isSuccessful) {
                response.body()?.let { result ->
                    emit(NetworkResult.Success(result))
                }
            } else {
                emit(NetworkResult.Error("Failed to get order: ${response.code()}"))
            }
        } catch (e: Exception) {
            emit(NetworkResult.Error("Order detail error: ${e.message}"))
        }
    }.flowOn(Dispatchers.IO)
    
    suspend fun createOrder(
        customerId: String,
        items: List<CreateOrderItem>,
        total: Double,
        shippingAddress: String,
        paymentMethod: String
    ): Flow<NetworkResult<Order>> = flow {
        emit(NetworkResult.Loading())
        try {
            val orderRequest = CreateOrderRequest(
                customer = customerId,
                items = items,
                total = total,
                shippingAddress = shippingAddress,
                paymentMethod = paymentMethod
            )
            val response = orderApi.createOrder(orderRequest)
            if (response.isSuccessful) {
                response.body()?.let { result ->
                    emit(NetworkResult.Success(result))
                }
            } else {
                emit(NetworkResult.Error("Failed to create order: ${response.code()}"))
            }
        } catch (e: Exception) {
            emit(NetworkResult.Error("Order creation error: ${e.message}"))
        }
    }.flowOn(Dispatchers.IO)
} 