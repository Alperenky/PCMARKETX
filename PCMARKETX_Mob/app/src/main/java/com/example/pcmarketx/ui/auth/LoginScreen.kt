package com.example.pcmarketx.ui.auth

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.Button
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import com.example.pcmarketx.ui.components.ErrorComponent
import com.example.pcmarketx.ui.components.LoadingComponent
import com.example.pcmarketx.util.NetworkResult

@Composable
fun LoginScreen(
    navigateToRegister: () -> Unit,
    navigateToHome: () -> Unit,
    authViewModel: AuthViewModel = hiltViewModel()
) {
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var isFormValid by remember { mutableStateOf(false) }
    
    val loginState by authViewModel.loginState.collectAsState()
    
    LaunchedEffect(email, password) {
        isFormValid = email.isNotEmpty() && password.isNotEmpty()
    }
    
    LaunchedEffect(loginState) {
        if (loginState is NetworkResult.Success) {
            navigateToHome()
        }
    }
    
    Box(modifier = Modifier.fillMaxSize()) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            Text(
                text = "PC Market X",
                style = MaterialTheme.typography.headlineLarge,
                color = MaterialTheme.colorScheme.primary
            )
            
            Spacer(modifier = Modifier.height(32.dp))
            
            OutlinedTextField(
                value = email,
                onValueChange = { email = it },
                label = { Text("Email") },
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email),
                modifier = Modifier.fillMaxWidth()
            )
            
            Spacer(modifier = Modifier.height(16.dp))
            
            OutlinedTextField(
                value = password,
                onValueChange = { password = it },
                label = { Text("Şifre") },
                visualTransformation = PasswordVisualTransformation(),
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password),
                modifier = Modifier.fillMaxWidth()
            )
            
            Spacer(modifier = Modifier.height(24.dp))
            
            Button(
                onClick = { authViewModel.login(email, password) },
                enabled = isFormValid && loginState !is NetworkResult.Loading,
                modifier = Modifier.fillMaxWidth()
            ) {
                Text("Giriş Yap")
            }
            
            Spacer(modifier = Modifier.height(16.dp))
            
            TextButton(onClick = navigateToRegister) {
                Text("Hesabınız yok mu? Kayıt olun")
            }
            
            if (loginState is NetworkResult.Error) {
                Spacer(modifier = Modifier.height(16.dp))
                Text(
                    text = (loginState as NetworkResult.Error).message ?: "Giriş başarısız",
                    color = MaterialTheme.colorScheme.error
                )
            }
        }
        
        if (loginState is NetworkResult.Loading) {
            LoadingComponent()
        }
    }
} 