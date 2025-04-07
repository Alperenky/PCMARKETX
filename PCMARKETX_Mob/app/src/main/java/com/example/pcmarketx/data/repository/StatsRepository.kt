package com.example.pcmarketx.data.repository

import com.example.pcmarketx.data.api.StatsApi
import com.example.pcmarketx.data.model.StatsResponse
import com.example.pcmarketx.util.NetworkResult
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import kotlinx.coroutines.flow.flowOn
import javax.inject.Inject

class StatsRepository @Inject constructor(
    private val statsApi: StatsApi
) {
    suspend fun getStats(): Flow<NetworkResult<StatsResponse>> = flow {
        emit(NetworkResult.Loading())
        try {
            val response = statsApi.getStats()
            if (response.isSuccessful) {
                response.body()?.let { result ->
                    emit(NetworkResult.Success(result))
                }
            } else {
                emit(NetworkResult.Error("Failed to get stats: ${response.code()}"))
            }
        } catch (e: Exception) {
            emit(NetworkResult.Error("Stats fetch error: ${e.message}"))
        }
    }.flowOn(Dispatchers.IO)
} 