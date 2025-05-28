package com.example.pcmarketx.ui.auth

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.pcmarketx.data.model.Address
import com.example.pcmarketx.data.model.AddressRequest
import com.example.pcmarketx.data.model.MessageResponse
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
    
    // Bir dummy user oluştur (NetworkResult.Success<User> için null kullanamayız)
    private val dummyUser = User(
        id = "",
        username = "",
        email = "",
        firstName = "",
        lastName = "",
        phone = "",
        role = "",
        token = ""
    )
    
    // Idle durumu olarak başlangıç state'i
    private val initialLoginState = NetworkResult.Idle<User>()
    private val initialRegisterState = NetworkResult.Idle<User>()
    private val initialProfileState = NetworkResult.Idle<User>()
    
    private val _loginState = MutableStateFlow<NetworkResult<User>>(initialLoginState)
    val loginState: StateFlow<NetworkResult<User>> = _loginState.asStateFlow()
    
    private val _registerState = MutableStateFlow<NetworkResult<User>>(initialRegisterState)
    val registerState: StateFlow<NetworkResult<User>> = _registerState.asStateFlow()
    
    private val _profileState = MutableStateFlow<NetworkResult<User>>(initialProfileState)
    val profileState: StateFlow<NetworkResult<User>> = _profileState.asStateFlow()
    
    private val _userState = MutableStateFlow<Boolean>(authRepository.isLoggedIn())
    val userState: StateFlow<Boolean> = _userState.asStateFlow()
    
    private val _updateProfileState = MutableStateFlow<NetworkResult<com.example.pcmarketx.data.remote.ProfileUpdateResponse>>(NetworkResult.Idle())
    val updateProfileState: StateFlow<NetworkResult<com.example.pcmarketx.data.remote.ProfileUpdateResponse>> = _updateProfileState.asStateFlow()
    
    private val _updatePasswordState = MutableStateFlow<NetworkResult<MessageResponse>>(NetworkResult.Idle())
    val updatePasswordState: StateFlow<NetworkResult<MessageResponse>> = _updatePasswordState.asStateFlow()

    private val _addressState = MutableStateFlow<NetworkResult<List<Address>>>(NetworkResult.Idle())
    val addressState: StateFlow<NetworkResult<List<Address>>> = _addressState.asStateFlow()

    private val _addAddressState = MutableStateFlow<NetworkResult<List<Address>>>(NetworkResult.Idle())
    val addAddressState: StateFlow<NetworkResult<List<Address>>> = _addAddressState.asStateFlow()

    private val _updateAddressState = MutableStateFlow<NetworkResult<List<Address>>>(NetworkResult.Idle())
    val updateAddressState: StateFlow<NetworkResult<List<Address>>> = _updateAddressState.asStateFlow()

    private val _deleteAddressState = MutableStateFlow<NetworkResult<List<Address>>>(NetworkResult.Idle())
    val deleteAddressState: StateFlow<NetworkResult<List<Address>>> = _deleteAddressState.asStateFlow()
    
    init {
        // Başlangıçta kullanıcının giriş yapıp yapmadığını kontrol et
        _userState.value = authRepository.isLoggedIn()
        if (_userState.value) {
            getProfile()
        }
    }
    
    fun login(email: String, password: String) {
        viewModelScope.launch {
            authRepository.login(email, password).collect { result ->
                _loginState.value = result
                if (result is NetworkResult.Success) {
                    _userState.value = true
                    getProfile()
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
                    getProfile()
                }
            }
        }
    }
    
    fun getProfile() {
        viewModelScope.launch {
            authRepository.getProfile().collect { result ->
                _profileState.value = result
            }
        }
    }
    
    fun logout() {
        authRepository.logout()
        _userState.value = false
        _profileState.value = initialProfileState
        _loginState.value = initialLoginState
        _registerState.value = initialRegisterState
    }
    
    fun resetLoginState() {
        _loginState.value = initialLoginState
    }
    
    fun resetRegisterState() {
        _registerState.value = initialRegisterState
    }
    
    fun resetProfileState() {
        _profileState.value = initialProfileState
    }
    
    fun updateProfile(username: String, email: String, firstName: String, lastName: String, phone: String?) {
        viewModelScope.launch {
            authRepository.updateProfile(username, email, firstName, lastName, phone).collect { result ->
                _updateProfileState.value = result
                if (result is NetworkResult.Success) {
                    // Profil güncellendiyse tekrar profili çek
                    getProfile()
                }
            }
        }
    }
    
    fun resetUpdateProfileState() {
        _updateProfileState.value = NetworkResult.Idle()
    }
    
    fun updatePassword(currentPassword: String, newPassword: String) {
        viewModelScope.launch {
            authRepository.updatePassword(currentPassword, newPassword).collect { result ->
                _updatePasswordState.value = result
            }
        }
    }
    
    fun resetUpdatePasswordState() {
        _updatePasswordState.value = NetworkResult.Idle()
    }

    fun getAddresses() {
        viewModelScope.launch {
            authRepository.getAddresses().collect { result ->
                _addressState.value = result
            }
        }
    }

    fun addAddress(
        title: String,
        street: String,
        city: String,
        state: String,
        postalCode: String,
        country: String
    ) {
        viewModelScope.launch {
            val request = AddressRequest(title, street, city, state, postalCode, country)
            authRepository.addAddress(request).collect { result ->
                _addAddressState.value = result
                if (result is NetworkResult.Success) {
                    getProfile()
                }
            }
        }
    }

    fun updateAddress(
        addressId: String,
        title: String,
        street: String,
        city: String,
        state: String,
        postalCode: String,
        country: String
    ) {
        viewModelScope.launch {
            val request = AddressRequest(title, street, city, state, postalCode, country)
            authRepository.updateAddress(addressId, request).collect { result ->
                _updateAddressState.value = result
                if (result is NetworkResult.Success) {
                    getProfile()
                }
            }
        }
    }

    fun deleteAddress(addressId: String) {
        viewModelScope.launch {
            authRepository.deleteAddress(addressId).collect { result ->
                _deleteAddressState.value = result
                if (result is NetworkResult.Success) {
                    getProfile()
                }
            }
        }
    }

    fun resetAddressState() {
        _addressState.value = NetworkResult.Idle()
    }

    fun resetAddAddressState() {
        _addAddressState.value = NetworkResult.Idle()
    }

    fun resetUpdateAddressState() {
        _updateAddressState.value = NetworkResult.Idle()
    }

    fun resetDeleteAddressState() {
        _deleteAddressState.value = NetworkResult.Idle()
    }
} 