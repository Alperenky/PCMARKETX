package com.example.pcmarketx.ui.profile

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.Visibility
import androidx.compose.material.icons.filled.VisibilityOff
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import com.example.pcmarketx.ui.auth.AuthViewModel
import com.example.pcmarketx.util.NetworkResult

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ChangePasswordScreen(
    navigateUp: () -> Unit,
    viewModel: AuthViewModel = hiltViewModel()
) {
    var currentPassword by remember { mutableStateOf("") }
    var newPassword by remember { mutableStateOf("") }
    var confirmNewPassword by remember { mutableStateOf("") }
    var isFormValid by remember { mutableStateOf(false) }
    var currentPasswordError by remember { mutableStateOf<String?>(null) }
    var newPasswordError by remember { mutableStateOf<String?>(null) }
    var confirmPasswordError by remember { mutableStateOf<String?>(null) }
    var showPassword by remember { mutableStateOf(false) }
    var showNewPassword by remember { mutableStateOf(false) }
    var showConfirmPassword by remember { mutableStateOf(false) }

    val updatePasswordState by viewModel.updatePasswordState.collectAsState()
    val scrollState = rememberScrollState()

    // Ekran ilk açıldığında state'i sıfırla
    LaunchedEffect(Unit) {
        viewModel.resetUpdatePasswordState()
    }

    fun validateForm() {
        // Mevcut şifre kontrolü
        currentPasswordError = when {
            currentPassword.isEmpty() -> "Mevcut şifre boş olamaz"
            currentPassword.length < 6 -> "Şifre en az 6 karakter olmalıdır"
            else -> null
        }

        // Yeni şifre kontrolü
        newPasswordError = when {
            newPassword.isEmpty() -> "Yeni şifre boş olamaz"
            newPassword.length < 6 -> "Şifre en az 6 karakter olmalıdır"
            newPassword == currentPassword -> "Yeni şifre mevcut şifre ile aynı olamaz"
            else -> null
        }

        // Şifre tekrar kontrolü
        confirmPasswordError = when {
            confirmNewPassword.isEmpty() -> "Şifre tekrarı boş olamaz"
            confirmNewPassword != newPassword -> "Şifreler eşleşmiyor"
            else -> null
        }

        isFormValid = currentPasswordError == null && newPasswordError == null && confirmPasswordError == null
    }

    LaunchedEffect(currentPassword, newPassword, confirmNewPassword) {
        validateForm()
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Şifre Değiştir") },
                navigationIcon = {
                    IconButton(onClick = navigateUp) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Geri")
                    }
                }
            )
        }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .padding(16.dp)
                .verticalScroll(scrollState),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            OutlinedTextField(
                value = currentPassword,
                onValueChange = { currentPassword = it },
                label = { Text("Mevcut Şifre") },
                leadingIcon = { Icon(Icons.Filled.Lock, contentDescription = "Mevcut Şifre") },
                trailingIcon = {
                    IconButton(onClick = { showPassword = !showPassword }) {
                        Icon(
                            if (showPassword) Icons.Filled.Visibility else Icons.Filled.VisibilityOff,
                            contentDescription = if (showPassword) "Şifreyi Gizle" else "Şifreyi Göster"
                        )
                    }
                },
                visualTransformation = if (showPassword) VisualTransformation.None else PasswordVisualTransformation(),
                keyboardOptions = KeyboardOptions(
                    keyboardType = KeyboardType.Password,
                    imeAction = ImeAction.Next
                ),
                isError = currentPasswordError != null,
                supportingText = { currentPasswordError?.let { Text(it) } },
                modifier = Modifier.fillMaxWidth()
            )

            Spacer(modifier = Modifier.height(16.dp))

            OutlinedTextField(
                value = newPassword,
                onValueChange = { newPassword = it },
                label = { Text("Yeni Şifre") },
                leadingIcon = { Icon(Icons.Filled.Lock, contentDescription = "Yeni Şifre") },
                trailingIcon = {
                    IconButton(onClick = { showNewPassword = !showNewPassword }) {
                        Icon(
                            if (showNewPassword) Icons.Filled.Visibility else Icons.Filled.VisibilityOff,
                            contentDescription = if (showNewPassword) "Şifreyi Gizle" else "Şifreyi Göster"
                        )
                    }
                },
                visualTransformation = if (showNewPassword) VisualTransformation.None else PasswordVisualTransformation(),
                keyboardOptions = KeyboardOptions(
                    keyboardType = KeyboardType.Password,
                    imeAction = ImeAction.Next
                ),
                isError = newPasswordError != null,
                supportingText = { newPasswordError?.let { Text(it) } },
                modifier = Modifier.fillMaxWidth()
            )

            Spacer(modifier = Modifier.height(16.dp))

            OutlinedTextField(
                value = confirmNewPassword,
                onValueChange = { confirmNewPassword = it },
                label = { Text("Yeni Şifre Tekrar") },
                leadingIcon = { Icon(Icons.Filled.Lock, contentDescription = "Yeni Şifre Tekrar") },
                trailingIcon = {
                    IconButton(onClick = { showConfirmPassword = !showConfirmPassword }) {
                        Icon(
                            if (showConfirmPassword) Icons.Filled.Visibility else Icons.Filled.VisibilityOff,
                            contentDescription = if (showConfirmPassword) "Şifreyi Gizle" else "Şifreyi Göster"
                        )
                    }
                },
                visualTransformation = if (showConfirmPassword) VisualTransformation.None else PasswordVisualTransformation(),
                keyboardOptions = KeyboardOptions(
                    keyboardType = KeyboardType.Password,
                    imeAction = ImeAction.Done
                ),
                isError = confirmPasswordError != null,
                supportingText = { confirmPasswordError?.let { Text(it) } },
                modifier = Modifier.fillMaxWidth()
            )

            Spacer(modifier = Modifier.height(24.dp))

            Button(
                onClick = {
                    viewModel.updatePassword(currentPassword, newPassword)
                },
                modifier = Modifier.fillMaxWidth(),
                enabled = isFormValid && updatePasswordState !is NetworkResult.Loading
            ) {
                Text("Şifreyi Güncelle")
            }

            when (updatePasswordState) {
                is NetworkResult.Loading -> {
                    Spacer(modifier = Modifier.height(16.dp))
                    CircularProgressIndicator()
                }
                is NetworkResult.Success -> {
                    Spacer(modifier = Modifier.height(16.dp))
                    Text(
                        text = "Şifreniz başarıyla güncellendi",
                        color = MaterialTheme.colorScheme.primary,
                        textAlign = TextAlign.Center
                    )
                    LaunchedEffect(Unit) {
                        kotlinx.coroutines.delay(2000)
                        navigateUp()
                    }
                }
                is NetworkResult.Error -> {
                    Spacer(modifier = Modifier.height(16.dp))
                    Text(
                        text = (updatePasswordState as NetworkResult.Error).message ?: "Şifre güncellenirken bir hata oluştu",
                        color = MaterialTheme.colorScheme.error,
                        textAlign = TextAlign.Center
                    )
                }
                else -> {}
            }
        }
    }
} 