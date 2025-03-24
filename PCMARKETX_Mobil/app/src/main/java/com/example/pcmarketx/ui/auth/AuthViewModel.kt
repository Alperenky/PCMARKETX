package com.example.pcmarketx.ui.auth

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.pcmarketx.data.model.AuthResponse
import com.example.pcmarketx.data.model.User
import com.example.pcmarketx.data.repository.AuthRepository
import com.example.pcmarketx.util.NetworkResult
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class AuthViewModel @Inject constructor(
    private val authRepository: AuthRepository
) : ViewModel() {
    
    private val _loginState = MutableStateFlow<NetworkResult<AuthResponse>>(NetworkResult.Loading())
    val loginState: StateFlow<NetworkResult<AuthResponse>> = _loginState.asStateFlow()
    
    private val _registerState = MutableStateFlow<NetworkResult<AuthResponse>>(NetworkResult.Loading())
    val registerState: StateFlow<NetworkResult<AuthResponse>> = _registerState.asStateFlow()
    
    private val _userProfile = MutableStateFlow<NetworkResult<User>>(NetworkResult.Loading())
    val userProfile: StateFlow<NetworkResult<User>> = _userProfile.asStateFlow()
    
    init {
        getUserProfile()
    }
    
    fun login(email: String, password: String) {
        viewModelScope.launch {
            authRepository.login(email, password).collect { result ->
                _loginState.value = result
                if (result is NetworkResult.Success) {
                    getUserProfile()
                }
            }
        }
    }
    
    fun register(username: String, email: String, password: String) {
        viewModelScope.launch {
            authRepository.register(username, email, password).collect { result ->
                _registerState.value = result
                if (result is NetworkResult.Success) {
                    getUserProfile()
                }
            }
        }
    }
    
    fun getUserProfile() {
        viewModelScope.launch {
            authRepository.getUserProfile().collect { result ->
                _userProfile.value = result
            }
        }
    }
    
    fun logout() {
        viewModelScope.launch {
            authRepository.logout()
            _userProfile.value = NetworkResult.Error("Logged out")
        }
    }
} 