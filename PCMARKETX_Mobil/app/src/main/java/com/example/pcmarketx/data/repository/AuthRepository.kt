package com.example.pcmarketx.data.repository

import com.example.pcmarketx.data.api.AuthApi
import com.example.pcmarketx.data.model.AuthResponse
import com.example.pcmarketx.data.model.BaseResponse
import com.example.pcmarketx.data.model.LoginRequest
import com.example.pcmarketx.data.model.RegisterRequest
import com.example.pcmarketx.data.model.User
import com.example.pcmarketx.util.NetworkResult
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import kotlinx.coroutines.flow.flowOn
import retrofit2.Response
import javax.inject.Inject

class AuthRepository @Inject constructor(
    private val authApi: AuthApi,
    private val preferencesRepository: PreferencesRepository
) {
    suspend fun login(email: String, password: String): Flow<NetworkResult<AuthResponse>> = flow {
        emit(NetworkResult.Loading())
        try {
            val response = authApi.login(LoginRequest(email, password))
            if (response.isSuccessful) {
                response.body()?.let { authResponse ->
                    preferencesRepository.saveToken(authResponse.token)
                    emit(NetworkResult.Success(authResponse))
                }
            } else {
                emit(NetworkResult.Error("Login failed"))
            }
        } catch (e: Exception) {
            emit(NetworkResult.Error("Login error: ${e.message}"))
        }
    }.flowOn(Dispatchers.IO)
    
    suspend fun register(username: String, email: String, password: String): Flow<NetworkResult<AuthResponse>> = flow {
        emit(NetworkResult.Loading())
        try {
            val response = authApi.register(RegisterRequest(username, email, password))
            if (response.isSuccessful) {
                response.body()?.let { authResponse ->
                    preferencesRepository.saveToken(authResponse.token)
                    emit(NetworkResult.Success(authResponse))
                }
            } else {
                emit(NetworkResult.Error("Registration failed"))
            }
        } catch (e: Exception) {
            emit(NetworkResult.Error("Registration error: ${e.message}"))
        }
    }.flowOn(Dispatchers.IO)
    
    suspend fun getUserProfile(): Flow<NetworkResult<User>> = flow {
        emit(NetworkResult.Loading())
        try {
            val response = authApi.getProfile()
            if (response.isSuccessful && response.body()?.success == true) {
                response.body()?.let { baseResponse ->
                    baseResponse.data?.let { user ->
                        emit(NetworkResult.Success(user))
                    } ?: emit(NetworkResult.Error("User data is null"))
                }
            } else {
                val errorMsg = response.body()?.message ?: "Failed to get profile"
                emit(NetworkResult.Error(errorMsg))
            }
        } catch (e: Exception) {
            emit(NetworkResult.Error("Profile error: ${e.message}"))
        }
    }.flowOn(Dispatchers.IO)
    
    suspend fun logout() {
        preferencesRepository.clearToken()
    }
} 