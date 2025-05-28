package com.example.pcmarketx.data.model

data class Address(
    val _id: String,
    val title: String,
    val street: String,
    val city: String,
    val state: String,
    val postalCode: String,
    val country: String
)

data class AddressRequest(
    val title: String,
    val street: String,
    val city: String,
    val state: String,
    val postalCode: String,
    val country: String
) 