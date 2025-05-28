package com.example.pcmarketx.ui.auth

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Email
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.Person
import androidx.compose.material3.Button
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
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
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import com.example.pcmarketx.ui.components.LoadingComponent
import com.example.pcmarketx.util.NetworkResult
import android.util.Patterns

@Composable
fun RegisterScreen(
    navigateToLogin: () -> Unit,
    navigateToHome: () -> Unit,
    authViewModel: AuthViewModel = hiltViewModel()
) {
    var username by remember { mutableStateOf("") }
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var confirmPassword by remember { mutableStateOf("") }
    var isFormValid by remember { mutableStateOf(false) }
    var usernameError by remember { mutableStateOf<String?>(null) }
    var emailError by remember { mutableStateOf<String?>(null) }
    var passwordError by remember { mutableStateOf<String?>(null) }
    var confirmPasswordError by remember { mutableStateOf<String?>(null) }
    var isLoading by remember { mutableStateOf(false) }
    
    // Ekran ilk açıldığında register state'i sıfırla
    LaunchedEffect(Unit) {
        authViewModel.resetRegisterState()
    }
    
    val registerState by authViewModel.registerState.collectAsState()
    val scrollState = rememberScrollState()
    
    // Loading durumunu izle
    LaunchedEffect(registerState) {
        isLoading = registerState is NetworkResult.Loading
        
        if (registerState is NetworkResult.Success && registerState.data != null) {
            navigateToHome()
        }
    }
    
    fun validateForm() {
        // Kullanıcı adı kontrolü
        usernameError = when {
            username.isEmpty() -> "Kullanıcı adı boş olamaz"
            username.length < 3 -> "Kullanıcı adı en az 3 karakter olmalıdır"
            else -> null
        }
        
        // Email kontrolü
        emailError = when {
            email.isEmpty() -> "Email boş olamaz"
            !Patterns.EMAIL_ADDRESS.matcher(email).matches() -> "Geçerli bir email adresi giriniz"
            else -> null
        }
        
        // Şifre kontrolü
        passwordError = when {
            password.isEmpty() -> "Şifre boş olamaz"
            password.length < 6 -> "Şifre en az 6 karakter olmalıdır"
            else -> null
        }
        
        // Şifre tekrar kontrolü
        confirmPasswordError = when {
            confirmPassword.isEmpty() -> "Şifre tekrarı boş olamaz"
            confirmPassword != password -> "Şifreler eşleşmiyor"
            else -> null
        }
        
        isFormValid = usernameError == null && emailError == null && 
                     passwordError == null && confirmPasswordError == null
    }
    
    // Ekrandan çıkıldığında state'i sıfırla
    DisposableEffect(Unit) {
        onDispose {
            authViewModel.resetRegisterState()
        }
    }
    
    LaunchedEffect(username, email, password, confirmPassword) {
        validateForm()
    }
    
    Box(modifier = Modifier.fillMaxSize()) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(16.dp)
                .verticalScroll(scrollState),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            Text(
                text = "PC Market X",
                style = MaterialTheme.typography.headlineLarge,
                color = MaterialTheme.colorScheme.primary
            )
            
            Spacer(modifier = Modifier.height(8.dp))
            
            Text(
                text = "Yeni Hesap Oluştur",
                style = MaterialTheme.typography.titleLarge,
                modifier = Modifier.padding(bottom = 24.dp)
            )
            
            OutlinedTextField(
                value = username,
                onValueChange = { username = it },
                label = { Text("Kullanıcı Adı") },
                leadingIcon = { Icon(Icons.Default.Person, contentDescription = "Kullanıcı Adı") },
                modifier = Modifier.fillMaxWidth(),
                isError = usernameError != null,
                supportingText = { usernameError?.let { Text(it) } },
                singleLine = true,
                enabled = !isLoading
            )
            
            Spacer(modifier = Modifier.height(16.dp))
            
            OutlinedTextField(
                value = email,
                onValueChange = { email = it },
                label = { Text("Email") },
                leadingIcon = { Icon(Icons.Default.Email, contentDescription = "Email") },
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email),
                modifier = Modifier.fillMaxWidth(),
                isError = emailError != null,
                supportingText = { emailError?.let { Text(it) } },
                singleLine = true,
                enabled = !isLoading
            )
            
            Spacer(modifier = Modifier.height(16.dp))
            
            OutlinedTextField(
                value = password,
                onValueChange = { password = it },
                label = { Text("Şifre") },
                leadingIcon = { Icon(Icons.Default.Lock, contentDescription = "Şifre") },
                visualTransformation = PasswordVisualTransformation(),
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password),
                modifier = Modifier.fillMaxWidth(),
                isError = passwordError != null,
                supportingText = { passwordError?.let { Text(it) } },
                singleLine = true,
                enabled = !isLoading
            )
            
            Spacer(modifier = Modifier.height(16.dp))
            
            OutlinedTextField(
                value = confirmPassword,
                onValueChange = { confirmPassword = it },
                label = { Text("Şifre Tekrarı") },
                leadingIcon = { Icon(Icons.Default.Lock, contentDescription = "Şifre Tekrarı") },
                visualTransformation = PasswordVisualTransformation(),
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password),
                modifier = Modifier.fillMaxWidth(),
                isError = confirmPasswordError != null,
                supportingText = { confirmPasswordError?.let { Text(it) } },
                singleLine = true,
                enabled = !isLoading
            )
            
            Spacer(modifier = Modifier.height(24.dp))
            
            Button(
                onClick = { 
                    validateForm()
                    if (isFormValid) {
                        authViewModel.register(username, email, password) 
                    }
                },
                enabled = isFormValid && !isLoading,
                modifier = Modifier.fillMaxWidth()
            ) {
                if (registerState is NetworkResult.Loading) {
                    CircularProgressIndicator(
                        modifier = Modifier.height(24.dp),
                        color = MaterialTheme.colorScheme.onPrimary
                    )
                } else {
                    Text("Kayıt Ol")
                }
            }
            
            Spacer(modifier = Modifier.height(16.dp))
            
            TextButton(
                onClick = navigateToLogin,
                enabled = !isLoading
            ) {
                Text("Zaten bir hesabınız var mı? Giriş yapın")
            }
            
            if (registerState is NetworkResult.Error) {
                Spacer(modifier = Modifier.height(16.dp))
                Text(
                    text = when {
                        (registerState as NetworkResult.Error).message?.contains("Bu kullanıcı adı veya e-posta") == true -> 
                            "Bu kullanıcı adı veya email zaten kullanılıyor"
                        (registerState as NetworkResult.Error).message?.contains("Şifre en az 6 karakter olmalıdır") == true -> 
                            "Şifre en az 6 karakter olmalıdır"
                        else -> (registerState as NetworkResult.Error).message ?: "Kayıt başarısız"
                    },
                    color = MaterialTheme.colorScheme.error,
                    textAlign = TextAlign.Center
                )
            }
        }
    }
} 