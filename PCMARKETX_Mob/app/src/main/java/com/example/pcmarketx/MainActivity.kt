package com.example.pcmarketx

import android.content.Context
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Scaffold
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.navigation.compose.rememberNavController
import com.example.pcmarketx.ui.chatbot.ChatbotFloatingButton
import com.example.pcmarketx.ui.components.BottomNavBar
import com.example.pcmarketx.ui.navigation.AppNavigation
import com.example.pcmarketx.ui.theme.PCMARKETXTheme
import dagger.hilt.android.AndroidEntryPoint
import androidx.compose.runtime.getValue
import androidx.compose.runtime.setValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.DisposableEffect
import android.content.SharedPreferences

@AndroidEntryPoint
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            val context = this
            val prefs = context.getSharedPreferences("settings", Context.MODE_PRIVATE)
            var darkTheme by remember { mutableStateOf(prefs.getBoolean("darkTheme", false)) }

            DisposableEffect(prefs) {
                val listener = SharedPreferences.OnSharedPreferenceChangeListener { _, key ->
                    if (key == "darkTheme") {
                        darkTheme = prefs.getBoolean("darkTheme", false)
                    }
                }
                prefs.registerOnSharedPreferenceChangeListener(listener)
                onDispose {
                    prefs.unregisterOnSharedPreferenceChangeListener(listener)
                }
            }

            PCMARKETXTheme(darkTheme = darkTheme) {
                PCMarketXApp()
            }
        }
    }
}

@Composable
fun PCMarketXApp() {
    val navController = rememberNavController()
    
    Box(modifier = Modifier.fillMaxSize()) {
        Scaffold(
            modifier = Modifier.fillMaxSize(),
            bottomBar = {
                BottomNavBar(navController = navController)
            }
        ) { innerPadding ->
            AppNavigation(
                navController = navController,
                modifier = Modifier.padding(innerPadding)
            )
        }
        
        // Chatbot Floating Button
        ChatbotFloatingButton()
    }
}