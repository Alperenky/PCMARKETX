package com.example.pcmarketx.ui.auth

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
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
    
    private val _loginState = MutableStateFlow<NetworkResult<User>>(NetworkResult.Loading())
    val loginState: StateFlow<NetworkResult<User>> = _loginState.asStateFlow()
    
    private val _registerState = MutableStateFlow<NetworkResult<User>>(NetworkResult.Loading())
    val registerState: StateFlow<NetworkResult<User>> = _registerState.asStateFlow()
    
    private val _userState = MutableStateFlow<Boolean>(authRepository.isLoggedIn())
    val userState: StateFlow<Boolean> = _userState.asStateFlow()
    
    fun login(email: String, password: String) {
        viewModelScope.launch {
            authRepository.login(email, password).collect { result ->
                _loginState.value = result
                if (result is NetworkResult.Success) {
                    _userState.value = true
                }
            }
        }
    }
    
    fun register(username: String, email: String, password: String) {
        viewModelScope.launch {
            authRepository.register(username, email, password).collect { result ->
                _registerState.value = result
                if (result is NetworkResult.Success) {
                    _userState.value = true
                }
            }
        }
    }
    
    fun logout() {
        authRepository.logout()
        _userState.value = false
    }
    
    fun isLoggedIn(): Boolean {
        return authRepository.isLoggedIn()
    }
} 