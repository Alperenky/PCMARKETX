package com.example.pcmarketx.ui.profile

import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.compose.material3.ExperimentalMaterial3Api

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ActiveOrdersScreen(navigateUp: () -> Unit) {
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Siparişlerim") },
                navigationIcon = {
                    Button(onClick = navigateUp) {
                        Text("Geri")
                    }
                }
            )
        }
    ) { paddingValues ->
        Text(
            text = "Burada siparişlerim listelenecek.",
            modifier = Modifier.padding(paddingValues)
        )
    }
} 