package com.example.pcmarketx.data.repository

import com.example.pcmarketx.data.api.AuthApi
import com.example.pcmarketx.data.model.ErrorResponse
import com.example.pcmarketx.data.model.LoginRequest
import com.example.pcmarketx.data.model.MessageResponse
import com.example.pcmarketx.data.model.PasswordUpdateRequest
import com.example.pcmarketx.data.model.RegisterRequest
import com.example.pcmarketx.data.model.User
import com.example.pcmarketx.data.repository.PreferencesRepository
import com.example.pcmarketx.util.Constants
import com.example.pcmarketx.util.NetworkResult
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import kotlinx.coroutines.flow.flowOn
import okhttp3.ResponseBody
import org.json.JSONObject
import retrofit2.Response
import javax.inject.Inject
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken
import com.example.pcmarketx.data.model.Address
import com.example.pcmarketx.data.model.AddressRequest
import com.example.pcmarketx.data.remote.UserService

class AuthRepository @Inject constructor(
    private val authApi: AuthApi,
    private val userService: com.example.pcmarketx.data.remote.UserService,
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
                        firstName = it.firstName ?: "",
                        lastName = it.lastName ?: "",
                        phone = it.phone,
                        role = it.role,
                        token = it.token
                    )
                    
                    // Save token to preferences
                    preferencesRepository.saveAuthToken(it.token)
                    
                    emit(NetworkResult.Success(user))
                } ?: emit(NetworkResult.Error("Sunucu yanıtı boş"))
            } else {
                val errorMsg = parseErrorResponse(response.errorBody())
                emit(NetworkResult.Error(errorMsg ?: "Geçersiz e-posta veya şifre"))
            }
        } catch (e: Exception) {
            emit(NetworkResult.Error("Giriş hatası: ${e.message}"))
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
                        firstName = it.firstName ?: "",
                        lastName = it.lastName ?: "",
                        phone = it.phone,
                        role = it.role,
                        token = it.token
                    )
                    
                    // Save token to preferences
                    preferencesRepository.saveAuthToken(it.token)
                    
                    emit(NetworkResult.Success(user))
                } ?: emit(NetworkResult.Error("Sunucu yanıtı boş"))
            } else {
                val errorMsg = parseErrorResponse(response.errorBody())
                if (response.code() == 400) {
                    emit(NetworkResult.Error(errorMsg ?: "Kayıt işlemi başarısız"))
                } else {
                    emit(NetworkResult.Error(errorMsg ?: "Bu kullanıcı adı veya e-posta adresi zaten kullanılıyor"))
                }
            }
        } catch (e: Exception) {
            emit(NetworkResult.Error("Kayıt hatası: ${e.message}"))
        }
    }.flowOn(Dispatchers.IO)
    
    suspend fun getProfile(): Flow<NetworkResult<User>> = flow {
        emit(NetworkResult.Loading())
        try {
            val response = authApi.getProfile()
            if (response.isSuccessful) {
                val user = response.body()
                user?.let {
                    emit(NetworkResult.Success(it))
                } ?: emit(NetworkResult.Error("Profil bilgileri alınamadı"))
            } else {
                val errorMsg = parseErrorResponse(response.errorBody())
                emit(NetworkResult.Error(errorMsg ?: "Profil bilgileri alınamadı"))
            }
        } catch (e: Exception) {
            emit(NetworkResult.Error("Profil bilgileri alınamadı: ${e.message}"))
        }
    }.flowOn(Dispatchers.IO)
    
    suspend fun updateProfile(
        username: String,
        email: String,
        firstName: String,
        lastName: String,
        phone: String?
    ): Flow<NetworkResult<com.example.pcmarketx.data.remote.ProfileUpdateResponse>> = flow {
        emit(NetworkResult.Loading())
        try {
            val request = com.example.pcmarketx.data.remote.ProfileUpdateRequest(
                username = username,
                email = email,
                firstName = firstName,
                lastName = lastName,
                phone = phone
            )
            val response = authApi.updateProfile(request)
            if (response.isSuccessful) {
                val body = response.body()
                body?.let {
                    emit(NetworkResult.Success(it))
                } ?: emit(NetworkResult.Error("Profil güncelleme yanıtı boş"))
            } else {
                val errorMsg = parseErrorResponse(response.errorBody())
                emit(NetworkResult.Error(errorMsg ?: "Profil güncellenemedi"))
            }
        } catch (e: Exception) {
            emit(NetworkResult.Error("Profil güncellenemedi: ${e.message}"))
        }
    }.flowOn(Dispatchers.IO)
    
    suspend fun updatePassword(currentPassword: String, newPassword: String): Flow<NetworkResult<MessageResponse>> = flow {
        emit(NetworkResult.Loading())
        try {
            val request = PasswordUpdateRequest(currentPassword, newPassword)
            val response = authApi.updatePassword(request)
            if (response.isSuccessful) {
                val body = response.body()
                body?.let {
                    emit(NetworkResult.Success(it))
                } ?: emit(NetworkResult.Error("Şifre güncelleme yanıtı boş"))
            } else {
                val errorMsg = parseErrorResponse(response.errorBody())
                emit(NetworkResult.Error(errorMsg ?: "Şifre güncellenemedi"))
            }
        } catch (e: Exception) {
            emit(NetworkResult.Error("Şifre güncellenemedi: ${e.message}"))
        }
    }.flowOn(Dispatchers.IO)
    
    fun getAddresses(): Flow<NetworkResult<List<Address>>> = flow {
        emit(NetworkResult.Loading())
        try {
            val response = userService.getAddresses()
            if (response.isSuccessful) {
                response.body()?.let {
                    emit(NetworkResult.Success(it))
                } ?: emit(NetworkResult.Error("Adresler alınamadı"))
            } else {
                emit(NetworkResult.Error(response.errorBody()?.string() ?: "Adresler alınamadı"))
            }
        } catch (e: Exception) {
            emit(NetworkResult.Error(e.message ?: "Bir hata oluştu"))
        }
    }.flowOn(Dispatchers.IO)

    fun addAddress(addressRequest: AddressRequest): Flow<NetworkResult<List<Address>>> = flow {
        emit(NetworkResult.Loading())
        try {
            val response = userService.addAddress(addressRequest)
            if (response.isSuccessful) {
                response.body()?.let {
                    emit(NetworkResult.Success(it))
                } ?: emit(NetworkResult.Error("Adres eklenemedi"))
            } else {
                emit(NetworkResult.Error(response.errorBody()?.string() ?: "Adres eklenemedi"))
            }
        } catch (e: Exception) {
            emit(NetworkResult.Error(e.message ?: "Bir hata oluştu"))
        }
    }.flowOn(Dispatchers.IO)

    fun updateAddress(addressId: String, addressRequest: AddressRequest): Flow<NetworkResult<List<Address>>> = flow {
        emit(NetworkResult.Loading())
        try {
            val response = userService.updateAddress(addressId, addressRequest)
            if (response.isSuccessful) {
                response.body()?.let {
                    emit(NetworkResult.Success(it))
                } ?: emit(NetworkResult.Error("Adres güncellenemedi"))
            } else {
                emit(NetworkResult.Error(response.errorBody()?.string() ?: "Adres güncellenemedi"))
            }
        } catch (e: Exception) {
            emit(NetworkResult.Error(e.message ?: "Bir hata oluştu"))
        }
    }.flowOn(Dispatchers.IO)

    fun deleteAddress(addressId: String): Flow<NetworkResult<List<Address>>> = flow {
        emit(NetworkResult.Loading())
        try {
            val response = userService.deleteAddress(addressId)
            if (response.isSuccessful) {
                response.body()?.let {
                    emit(NetworkResult.Success(it))
                } ?: emit(NetworkResult.Error("Adres silinemedi"))
            } else {
                emit(NetworkResult.Error(response.errorBody()?.string() ?: "Adres silinemedi"))
            }
        } catch (e: Exception) {
            emit(NetworkResult.Error(e.message ?: "Bir hata oluştu"))
        }
    }.flowOn(Dispatchers.IO)
    
    private fun parseErrorResponse(errorBody: ResponseBody?): String? {
        return try {
            val gson = Gson()
            val type = object : TypeToken<ErrorResponse>() {}.type
            val errorResponse: ErrorResponse? = gson.fromJson(errorBody?.charStream(), type)
            errorResponse?.message
        } catch (e: Exception) {
            null
        }
    }
    
    fun logout() {
        preferencesRepository.clearAuthToken()
    }
    
    fun getAuthToken(): String? {
        return preferencesRepository.getAuthToken()
    }
    
    fun isLoggedIn(): Boolean {
        val token = preferencesRepository.getAuthToken()
        return token != null && token.isNotEmpty()
    }
} 