package com.example.pcmarketx.data.remote

import com.example.pcmarketx.data.model.Address
import com.example.pcmarketx.data.model.AddressRequest
import com.example.pcmarketx.data.model.User
import retrofit2.Response
import retrofit2.http.*

interface UserService {
    @GET("api/users/profile")
    suspend fun getProfile(): Response<User>

    @PUT("api/users/profile")
    suspend fun updateProfile(
        @Body profileUpdateRequest: ProfileUpdateRequest
    ): Response<ProfileUpdateResponse>

    @GET("api/users/addresses")
    suspend fun getAddresses(): Response<List<Address>>

    @POST("api/users/addresses")
    suspend fun addAddress(
        @Body address: AddressRequest
    ): Response<List<Address>>

    @PUT("api/users/addresses/{addressId}")
    suspend fun updateAddress(
        @Path("addressId") addressId: String,
        @Body address: AddressRequest
    ): Response<List<Address>>

    @DELETE("api/users/addresses/{addressId}")
    suspend fun deleteAddress(
        @Path("addressId") addressId: String
    ): Response<List<Address>>
}

data class ProfileUpdateRequest(
    val username: String,
    val email: String,
    val firstName: String,
    val lastName: String,
    val phone: String?
)

data class ProfileUpdateResponse(
    val _id: String,
    val username: String,
    val email: String,
    val firstName: String,
    val lastName: String,
    val phone: String?,
    val role: String,
    val token: String
) 