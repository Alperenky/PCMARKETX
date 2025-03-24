package com.example.pcmarketx.data.api

import com.example.pcmarketx.data.model.BaseResponse
import com.example.pcmarketx.data.model.CreateItemRequest
import com.example.pcmarketx.data.model.Item
import com.example.pcmarketx.data.model.ItemDetailResponse
import com.example.pcmarketx.data.model.ItemListResponse
import com.example.pcmarketx.data.model.UpdateItemRequest
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.DELETE
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.PUT
import retrofit2.http.Path
import retrofit2.http.Query

interface ItemApi {
    @GET("api/items")
    suspend fun getItems(
        @Query("category") category: String? = null,
        @Query("search") search: String? = null,
        @Query("page") page: Int? = null,
        @Query("limit") limit: Int? = null
    ): Response<ItemListResponse>
    
    @GET("api/items/{id}")
    suspend fun getItemById(@Path("id") id: String): Response<ItemDetailResponse>
    
    @POST("api/items")
    suspend fun createItem(@Body createItemRequest: CreateItemRequest): Response<ItemDetailResponse>
    
    @PUT("api/items/{id}")
    suspend fun updateItem(
        @Path("id") id: String,
        @Body updateItemRequest: UpdateItemRequest
    ): Response<ItemDetailResponse>
    
    @DELETE("api/items/{id}")
    suspend fun deleteItem(@Path("id") id: String): Response<BaseResponse<Map<String, Boolean>>>
} 