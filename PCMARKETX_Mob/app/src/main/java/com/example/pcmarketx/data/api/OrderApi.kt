package com.example.pcmarketx.data.api

import com.example.pcmarketx.data.model.CreateOrderRequest
import com.example.pcmarketx.data.model.Order
import com.example.pcmarketx.data.model.OrderDetailResponse
import com.example.pcmarketx.data.model.OrdersResponse
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.Path
import retrofit2.http.Query

interface OrderApi {
    @GET("api/orders")
    suspend fun getOrders(
        @Query("page") page: Int? = null,
        @Query("limit") limit: Int? = null,
        @Query("status") status: String? = null,
        @Query("customerId") customerId: String? = null,
        @Query("sort") sort: String? = null
    ): Response<OrdersResponse>
    
    @GET("api/orders/{id}")
    suspend fun getOrderById(@Path("id") id: String): Response<Order>
    
    @POST("api/orders")
    suspend fun createOrder(@Body createOrderRequest: CreateOrderRequest): Response<Order>
} 