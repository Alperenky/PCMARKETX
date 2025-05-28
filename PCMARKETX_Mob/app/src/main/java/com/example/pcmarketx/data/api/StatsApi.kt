package com.example.pcmarketx.data.api

import com.example.pcmarketx.data.model.StatsResponse
import retrofit2.Response
import retrofit2.http.GET
 
interface StatsApi {
    @GET("api/stats")
    suspend fun getStats(): Response<StatsResponse>
} 