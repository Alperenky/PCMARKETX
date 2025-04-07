package com.example.pcmarketx.ui.navigation

sealed class Routes(val route: String) {
    object Login : Routes("login")
    object Register : Routes("register")
    object Home : Routes("home")
    object Profile : Routes("profile")
    object Cart : Routes("cart")
    object Search : Routes("search")
    
    object ItemDetail : Routes("item/{itemId}") {
        const val ITEM_ID_ARG = "itemId"
        fun createRoute(itemId: String) = "item/$itemId"
    }
} 