package com.example.pcmarketx.ui.navigation

sealed class Routes(val route: String) {
    object Login : Routes("login")
    object Register : Routes("register")
    object Home : Routes("home")
    object Profile : Routes("profile")
    object Cart : Routes("cart")
    object Search : Routes("search")
    object EditProfile : Routes("edit_profile")
    object ChangePassword : Routes("change_password")
    object Addresses : Routes("addresses")
    object ActiveOrders : Routes("active_orders")
    object Settings : Routes("settings")
    
    object ItemDetail : Routes("item/{itemId}") {
        const val ITEM_ID_ARG = "itemId"
        fun createRoute(itemId: String) = "item/$itemId"
    }
} 