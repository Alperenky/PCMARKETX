package com.example.pcmarketx.data.repository

import com.example.pcmarketx.data.api.AuthApi
import com.example.pcmarketx.data.model.AuthResponse
import com.example.pcmarketx.data.model.LoginRequest
import com.example.pcmarketx.data.model.RegisterRequest
import com.example.pcmarketx.data.model.User
import com.example.pcmarketx.data.repository.PreferencesRepository
import com.example.pcmarketx.util.Constants
import com.example.pcmarketx.util.NetworkResult
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import kotlinx.coroutines.flow.flowOn
import javax.inject.Inject

class AuthRepository @Inject constructor(
    private val authApi: AuthApi,
    private val preferencesRepository: PreferencesRepository
) {
    suspend fun login(email: String, password: String): Flow<NetworkResult<User>> = flow {
        emit(NetworkResult.Loading())
        try {
            val loginRequest = LoginRequest(email, password)
            val response = authApi.login(loginRequest)
            
            if (response.isSuccessful) {
                val authResponse = response.body()
                authResponse?.let {
                    // Convert AuthResponse to User
                    val user = User(
                        id = it._id,
                        username = it.username,
                        email = it.email,
                        firstName = it.firstName,
                        lastName = it.lastName,
                        phone = it.phone,
                        role = it.role,
                        token = it.token
                    )
                    
                    // Save token to preferences
                    preferencesRepository.saveAuthToken(it.token)
                    
                    emit(NetworkResult.Success(user))
                }
            } else {
                emit(NetworkResult.Error("Login failed: ${response.code()}"))
            }
        } catch (e: Exception) {
            emit(NetworkResult.Error("Login error: ${e.message}"))
        }
    }.flowOn(Dispatchers.IO)
    
    suspend fun register(username: String, email: String, password: String): Flow<NetworkResult<User>> = flow {
        emit(NetworkResult.Loading())
        try {
            val registerRequest = RegisterRequest(username, email, password)
            val response = authApi.register(registerRequest)
            
            if (response.isSuccessful) {
                val authResponse = response.body()
                authResponse?.let {
                    // Convert AuthResponse to User
                    val user = User(
                        id = it._id,
                        username = it.username,
                        email = it.email,
                        firstName = it.firstName,
                        lastName = it.lastName,
                        phone = it.phone,
                        role = it.role,
                        token = it.token
                    )
                    
                    // Save token to preferences
                    preferencesRepository.saveAuthToken(it.token)
                    
                    emit(NetworkResult.Success(user))
                }
            } else {
                emit(NetworkResult.Error("Registration failed: ${response.code()}"))
            }
        } catch (e: Exception) {
            emit(NetworkResult.Error("Registration error: ${e.message}"))
        }
    }.flowOn(Dispatchers.IO)
    
    fun logout() {
        preferencesRepository.clearAuthToken()
    }
    
    fun getAuthToken(): String? {
        return preferencesRepository.getAuthToken()
    }
    
    fun isLoggedIn(): Boolean {
        return !getAuthToken().isNullOrEmpty()
    }
} 