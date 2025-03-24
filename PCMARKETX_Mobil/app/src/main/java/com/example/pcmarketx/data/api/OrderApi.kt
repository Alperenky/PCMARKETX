package com.example.pcmarketx.data.api

import com.example.pcmarketx.data.model.CreateOrderRequest
import com.example.pcmarketx.data.model.Order
import com.example.pcmarketx.data.model.OrderDetailResponse
import com.example.pcmarketx.data.model.OrderListResponse
import com.example.pcmarketx.data.model.UpdateOrderStatusRequest
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.PUT
import retrofit2.http.Path

interface OrderApi {
    @GET("api/orders")
    suspend fun getOrders(): Response<OrderListResponse>
    
    @GET("api/orders/{id}")
    suspend fun getOrderById(@Path("id") id: String): Response<OrderDetailResponse>
    
    @POST("api/orders")
    suspend fun createOrder(@Body createOrderRequest: CreateOrderRequest): Response<OrderDetailResponse>
    
    @PUT("api/orders/{id}")
    suspend fun updateOrderStatus(
        @Path("id") id: String,
        @Body updateOrderStatusRequest: UpdateOrderStatusRequest
    ): Response<OrderDetailResponse>
} 