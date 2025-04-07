package com.example.pcmarketx.data.api

import com.example.pcmarketx.data.model.BaseResponse
import com.example.pcmarketx.data.model.CategoryDetail
import com.example.pcmarketx.data.model.CreateItemRequest
import com.example.pcmarketx.data.model.Item
import com.example.pcmarketx.data.model.ItemDetailResponse
import com.example.pcmarketx.data.model.ProductsResponse
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
    @GET("api/products")
    suspend fun getProducts(
        @Query("page") page: Int? = null,
        @Query("limit") limit: Int? = null,
        @Query("category") category: String? = null,
        @Query("search") search: String? = null,
        @Query("priceMin") priceMin: Double? = null,
        @Query("priceMax") priceMax: Double? = null,
        @Query("sort") sort: String? = null,
        @Query("status") status: String? = null
    ): Response<ProductsResponse>
    
    @GET("api/products/{id}")
    suspend fun getProductById(@Path("id") id: String): Response<ItemDetailResponse>
    
    @GET("api/products/by-category/{slug}")
    suspend fun getProductsByCategory(@Path("slug") slug: String): Response<List<Item>>
    
    @GET("api/categories")
    suspend fun getCategories(): Response<List<CategoryDetail>>
    
    @GET("api/categories/slug/{slug}")
    suspend fun getCategoryBySlug(@Path("slug") slug: String): Response<CategoryDetail>
    
    @POST("api/products")
    suspend fun createProduct(@Body createItemRequest: CreateItemRequest): Response<ItemDetailResponse>
    
    @PUT("api/products/{id}")
    suspend fun updateProduct(
        @Path("id") id: String,
        @Body updateItemRequest: UpdateItemRequest
    ): Response<ItemDetailResponse>
    
    @DELETE("api/products/{id}")
    suspend fun deleteProduct(@Path("id") id: String): Response<BaseResponse<Map<String, Boolean>>>
} 