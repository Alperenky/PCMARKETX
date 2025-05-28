package com.example.pcmarketx.data.api

import com.example.pcmarketx.data.model.Customer
import com.example.pcmarketx.data.model.CustomerResponse
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.Path

interface CustomerApi {
    @POST("api/customers")
    suspend fun addCustomer(@Body customer: Customer): Response<Customer>
    
    @GET("api/customers/{id}")
    suspend fun getCustomerById(@Path("id") id: String): Response<CustomerResponse>
} 