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
import com.example.pcmarketx.ui.components.LoadingComponent
import com.example.pcmarketx.util.NetworkResult

@Composable
fun RegisterScreen(
    navigateToLogin: () -> Unit,
    navigateToHome: () -> Unit,
    authViewModel: AuthViewModel = hiltViewModel()
) {
    var username by remember { mutableStateOf("") }
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var isFormValid by remember { mutableStateOf(false) }
    
    val registerState by authViewModel.registerState.collectAsState()
    
    LaunchedEffect(username, email, password) {
        isFormValid = username.isNotEmpty() && email.isNotEmpty() && password.isNotEmpty()
    }
    
    LaunchedEffect(registerState) {
        if (registerState is NetworkResult.Success) {
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
                text = "PC Market X'e Kaydol",
                style = MaterialTheme.typography.headlineMedium,
                color = MaterialTheme.colorScheme.primary
            )
            
            Spacer(modifier = Modifier.height(32.dp))
            
            OutlinedTextField(
                value = username,
                onValueChange = { username = it },
                label = { Text("Kullanıcı Adı") },
                modifier = Modifier.fillMaxWidth()
            )
            
            Spacer(modifier = Modifier.height(16.dp))
            
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
                onClick = { authViewModel.register(username, email, password) },
                enabled = isFormValid && registerState !is NetworkResult.Loading,
                modifier = Modifier.fillMaxWidth()
            ) {
                Text("Kaydol")
            }
            
            Spacer(modifier = Modifier.height(16.dp))
            
            TextButton(onClick = navigateToLogin) {
                Text("Zaten bir hesabınız var mı? Giriş yapın")
            }
            
            if (registerState is NetworkResult.Error) {
                Spacer(modifier = Modifier.height(16.dp))
                Text(
                    text = (registerState as NetworkResult.Error).message ?: "Kayıt başarısız",
                    color = MaterialTheme.colorScheme.error
                )
            }
        }
        
        if (registerState is NetworkResult.Loading) {
            LoadingComponent()
        }
    }
} 