package com.example.pcmarketx.data.repository

import com.example.pcmarketx.data.api.CustomerApi
import com.example.pcmarketx.data.model.Customer
import com.example.pcmarketx.data.model.CustomerResponse
import com.example.pcmarketx.util.NetworkResult
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import kotlinx.coroutines.flow.flowOn
import javax.inject.Inject

class CustomerRepository @Inject constructor(
    private val customerApi: CustomerApi
) {
    suspend fun addCustomer(
        name: String,
        email: String,
        phone: String,
        address: String
    ): Flow<NetworkResult<Customer>> = flow {
        emit(NetworkResult.Loading())
        try {
            val customer = Customer(
                id = "",  // Will be ignored by the API
                name = name,
                email = email,
                phone = phone,
                address = address,
                createdAt = "",  // Will be ignored by the API
                updatedAt = ""   // Will be ignored by the API
            )
            val response = customerApi.addCustomer(customer)
            if (response.isSuccessful) {
                response.body()?.let { result ->
                    emit(NetworkResult.Success(result))
                }
            } else {
                emit(NetworkResult.Error("Failed to add customer: ${response.code()}"))
            }
        } catch (e: Exception) {
            emit(NetworkResult.Error("Customer creation error: ${e.message}"))
        }
    }.flowOn(Dispatchers.IO)
    
    suspend fun getCustomerById(id: String): Flow<NetworkResult<CustomerResponse>> = flow {
        emit(NetworkResult.Loading())
        try {
            val response = customerApi.getCustomerById(id)
            if (response.isSuccessful) {
                response.body()?.let { result ->
                    emit(NetworkResult.Success(result))
                }
            } else {
                emit(NetworkResult.Error("Failed to get customer: ${response.code()}"))
            }
        } catch (e: Exception) {
            emit(NetworkResult.Error("Customer fetch error: ${e.message}"))
        }
    }.flowOn(Dispatchers.IO)
} 