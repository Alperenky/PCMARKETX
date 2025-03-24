package com.example.pcmarketx.ui.navigation

import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.NavHostController
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.navArgument
import com.example.pcmarketx.ui.auth.AuthViewModel
import com.example.pcmarketx.ui.auth.LoginScreen
import com.example.pcmarketx.ui.auth.RegisterScreen
import com.example.pcmarketx.ui.cart.CartScreen
import com.example.pcmarketx.ui.home.HomeScreen
import com.example.pcmarketx.ui.itemdetail.ItemDetailScreen
import com.example.pcmarketx.ui.profile.ProfileScreen
import com.example.pcmarketx.ui.search.SearchScreen
import com.example.pcmarketx.util.NetworkResult

@Composable
fun AppNavigation(
    navController: NavHostController,
    authViewModel: AuthViewModel = hiltViewModel(),
    modifier: Modifier = Modifier
) {
    // Her durumda ana sayfadan başlayacak şekilde değiştirildi
    val startDestination = Routes.Home.route
    
    NavHost(
        navController = navController,
        startDestination = startDestination,
        modifier = modifier
    ) {
        composable(Routes.Login.route) {
            LoginScreen(
                navigateToRegister = {
                    navController.navigate(Routes.Register.route)
                },
                navigateToHome = {
                    navController.navigate(Routes.Home.route) {
                        popUpTo(Routes.Login.route) { inclusive = true }
                    }
                }
            )
        }
        
        composable(Routes.Register.route) {
            RegisterScreen(
                navigateToLogin = {
                    navController.navigateUp()
                },
                navigateToHome = {
                    navController.navigate(Routes.Home.route) {
                        popUpTo(Routes.Login.route) { inclusive = true }
                    }
                }
            )
        }
        
        composable(Routes.Home.route) {
            HomeScreen(
                navigateToItemDetail = { itemId ->
                    navController.navigate(Routes.ItemDetail.createRoute(itemId))
                },
                navigateToCart = {
                    navController.navigate(Routes.Cart.route)
                },
                navigateToSearch = {
                    navController.navigate(Routes.Search.route)
                },
                navigateToProfile = {
                    navController.navigate(Routes.Profile.route)
                }
            )
        }
        
        composable(
            route = Routes.ItemDetail.route,
            arguments = listOf(
                navArgument(Routes.ItemDetail.ITEM_ID_ARG) {
                    type = NavType.StringType
                }
            )
        ) {
            val itemId = it.arguments?.getString(Routes.ItemDetail.ITEM_ID_ARG) ?: ""
            ItemDetailScreen(
                itemId = itemId,
                navigateUp = {
                    navController.navigateUp()
                },
                navigateToCart = {
                    navController.navigate(Routes.Cart.route)
                }
            )
        }
        
        composable(Routes.Cart.route) {
            CartScreen(
                navigateUp = {
                    navController.navigateUp()
                },
                navigateToHome = {
                    navController.navigate(Routes.Home.route) {
                        popUpTo(Routes.Cart.route) { inclusive = true }
                    }
                }
            )
        }
        
        composable(Routes.Search.route) {
            SearchScreen(
                navigateUp = {
                    navController.navigateUp()
                },
                navigateToItemDetail = { itemId ->
                    navController.navigate(Routes.ItemDetail.createRoute(itemId))
                }
            )
        }
        
        composable(Routes.Profile.route) {
            ProfileScreen(
                navigateUp = {
                    navController.navigateUp()
                },
                navigateToLogin = {
                    navController.navigate(Routes.Login.route) {
                        popUpTo(Routes.Home.route) { inclusive = true }
                    }
                }
            )
        }
    }
} 