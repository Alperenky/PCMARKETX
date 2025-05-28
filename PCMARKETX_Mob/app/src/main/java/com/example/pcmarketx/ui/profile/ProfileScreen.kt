package com.example.pcmarketx.ui.profile

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.automirrored.filled.KeyboardArrowRight
import androidx.compose.material.icons.filled.Email
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Phone
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Divider
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.input.TextFieldValue
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import com.example.pcmarketx.data.model.User
import com.example.pcmarketx.data.model.Address
import com.example.pcmarketx.ui.auth.AuthViewModel
import com.example.pcmarketx.util.NetworkResult

data class MenuItem(
    val title: String,
    val onClick: () -> Unit
)

@Composable
fun MenuCard(
    title: String,
    items: List<MenuItem>,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier
            .fillMaxWidth()
            .padding(bottom = 16.dp),
        elevation = CardDefaults.cardElevation(4.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp)
        ) {
            Text(
                text = title,
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold
            )
            
            Divider(modifier = Modifier.padding(vertical = 8.dp))
            
            items.forEach { item ->
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 8.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = item.title,
                        style = MaterialTheme.typography.bodyLarge
                    )
                    IconButton(onClick = item.onClick) {
                        Icon(
                            imageVector = Icons.AutoMirrored.Filled.KeyboardArrowRight,
                            contentDescription = "Git",
                            tint = MaterialTheme.colorScheme.primary
                        )
                    }
                }
                if (item != items.last()) {
                    Divider()
                }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ProfileScreen(
    navigateUp: () -> Unit,
    navigateToLogin: () -> Unit,
    navigateToEditProfile: () -> Unit,
    navigateToActiveOrders: () -> Unit,
    navigateToSettings: () -> Unit,
    viewModel: AuthViewModel = hiltViewModel()
) {
    val isLoggedIn by viewModel.userState.collectAsState()
    val profileState by viewModel.profileState.collectAsState()
    val scrollState = rememberScrollState()

    LaunchedEffect(isLoggedIn) {
        if (isLoggedIn) {
            viewModel.getProfile()
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Profil") },
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
            if (isLoggedIn) {
                when (profileState) {
                    is NetworkResult.Loading -> {
                        CircularProgressIndicator(
                            modifier = Modifier
                                .size(50.dp)
                                .padding(8.dp)
                        )
                    }
                    is NetworkResult.Success -> {
                        val user = (profileState as NetworkResult.Success<User>).data!!
                        
                        // Profil başlığı
                        Icon(
                            imageVector = Icons.Default.Person,
                            contentDescription = "Profil",
                            modifier = Modifier
                                .size(100.dp)
                                .clip(CircleShape)
                                .padding(8.dp),
                            tint = MaterialTheme.colorScheme.primary
                        )
                        
                        Spacer(modifier = Modifier.height(16.dp))
                        
                        Text(
                            text = "${user.firstName} ${user.lastName}",
                            style = MaterialTheme.typography.headlineMedium,
                            fontWeight = FontWeight.Bold
                        )
                        
                        Text(
                            text = "@${user.username}",
                            style = MaterialTheme.typography.titleMedium,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                        
                        Spacer(modifier = Modifier.height(32.dp))
                        
                        // Hesabım Kartı
                        MenuCard(
                            title = "Hesabım",
                            items = listOf(
                                MenuItem("Profil Bilgilerini Düzenle") { navigateToEditProfile() }
                            )
                        )

                        // Siparişlerim Kartı
                        MenuCard(
                            title = "Siparişlerim",
                            items = listOf(
                                MenuItem("Siparişlerim") { navigateToActiveOrders() }
                            )
                        )

                        // Uygulama Ayarları Kartı
                        Button(
                            onClick = { navigateToSettings() },
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(vertical = 8.dp)
                        ) {
                            Text("Uygulama Ayarları")
                        }

                        // Adres kartı
                        if (user.addresses.isNotEmpty()) {
                            Card(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(bottom = 16.dp),
                                elevation = CardDefaults.cardElevation(4.dp)
                            ) {
                                Column(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .padding(16.dp)
                                ) {
                                    Text(
                                        text = "Kayıtlı Adresler",
                                        style = MaterialTheme.typography.titleMedium,
                                        fontWeight = FontWeight.Bold
                                    )
                                    
                                    Divider(modifier = Modifier.padding(vertical = 8.dp))
                                    
                                    user.addresses.forEach { address ->
                                        Row(
                                            modifier = Modifier
                                                .fillMaxWidth()
                                                .padding(vertical = 8.dp),
                                            verticalAlignment = Alignment.Top
                                        ) {
                                            Icon(
                                                Icons.Default.LocationOn,
                                                contentDescription = "Adres",
                                                tint = MaterialTheme.colorScheme.primary
                                            )
                                            Column(
                                                modifier = Modifier
                                                    .padding(start = 8.dp)
                                                    .weight(1f)
                                            ) {
                                                Text(
                                                    text = address.title,
                                                    style = MaterialTheme.typography.titleSmall,
                                                    fontWeight = FontWeight.Bold
                                                )
                                                Text(
                                                    text = "${address.street}\n${address.state}, ${address.city}\n${address.postalCode}, ${address.country}",
                                                    style = MaterialTheme.typography.bodyMedium
                                                )
                                            }
                                        }
                                        if (address != user.addresses.last()) {
                                            Divider(modifier = Modifier.padding(vertical = 8.dp))
                                        }
                                    }
                                }
                            }
                        }
                        
                        Spacer(modifier = Modifier.weight(1f))
                        
                        Button(
                            onClick = {
                                viewModel.logout()
                                navigateToLogin()
                            },
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Text("Çıkış Yap")
                        }
                    }
                    is NetworkResult.Error -> {
                        Column(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalAlignment = Alignment.CenterHorizontally
                        ) {
                            Text(
                                text = (profileState as NetworkResult.Error).message ?: "Profil bilgileri alınamadı",
                                color = MaterialTheme.colorScheme.error,
                                textAlign = TextAlign.Center
                            )
                            
                            Spacer(modifier = Modifier.height(16.dp))
                            
                            Button(
                                onClick = { viewModel.getProfile() },
                                modifier = Modifier.fillMaxWidth(0.7f)
                            ) {
                                Text("Tekrar Dene")
                            }
                        }
                    }
                    else -> {
                        // Idle state
                    }
                }
            } else {
                // Giriş yapmamış kullanıcı bölümü
                Column(
                    modifier = Modifier.fillMaxSize(),
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.Center
                ) {
                    Icon(
                        imageVector = Icons.Default.Person,
                        contentDescription = "Profil",
                        modifier = Modifier
                            .size(100.dp)
                            .padding(8.dp),
                        tint = MaterialTheme.colorScheme.primary
                    )
                    
                    Spacer(modifier = Modifier.height(16.dp))
                    
                    Text(
                        text = "Giriş Yapmadınız",
                        style = MaterialTheme.typography.headlineSmall,
                        fontWeight = FontWeight.Bold
                    )
                    
                    Spacer(modifier = Modifier.height(8.dp))
                    
                    Text(
                        text = "Profilinizi görüntülemek için lütfen giriş yapın.",
                        style = MaterialTheme.typography.bodyLarge,
                        textAlign = TextAlign.Center,
                        modifier = Modifier.padding(horizontal = 32.dp)
                    )
                    
                    Spacer(modifier = Modifier.height(32.dp))
                    
                    Button(
                        onClick = navigateToLogin,
                        modifier = Modifier.fillMaxWidth(0.7f)
                    ) {
                        Text("Giriş Yap")
                    }
                }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun EditProfileScreen(
    navigateUp: () -> Unit,
    viewModel: AuthViewModel = hiltViewModel()
) {
    val profileState by viewModel.profileState.collectAsState()
    val updateProfileState by viewModel.updateProfileState.collectAsState()
    var username by remember { mutableStateOf("") }
    var email by remember { mutableStateOf("") }
    var firstName by remember { mutableStateOf("") }
    var lastName by remember { mutableStateOf("") }
    var phone by remember { mutableStateOf("") }
    var isInitialized by remember { mutableStateOf(false) }

    // Profil bilgileri yüklendiğinde alanları doldur
    LaunchedEffect(profileState) {
        if (profileState is NetworkResult.Success && !isInitialized) {
            val user = (profileState as NetworkResult.Success<User>).data
            username = user?.username ?: ""
            email = user?.email ?: ""
            firstName = user?.firstName ?: ""
            lastName = user?.lastName ?: ""
            phone = user?.phone ?: ""
            isInitialized = true
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Profil Bilgilerini Düzenle") },
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
                .padding(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            OutlinedTextField(
                value = username,
                onValueChange = { username = it },
                label = { Text("Kullanıcı Adı") },
                modifier = Modifier.fillMaxWidth()
            )
            Spacer(modifier = Modifier.height(12.dp))
            OutlinedTextField(
                value = email,
                onValueChange = { email = it },
                label = { Text("E-posta") },
                modifier = Modifier.fillMaxWidth()
            )
            Spacer(modifier = Modifier.height(12.dp))
            OutlinedTextField(
                value = firstName,
                onValueChange = { firstName = it },
                label = { Text("Ad") },
                modifier = Modifier.fillMaxWidth()
            )
            Spacer(modifier = Modifier.height(12.dp))
            OutlinedTextField(
                value = lastName,
                onValueChange = { lastName = it },
                label = { Text("Soyad") },
                modifier = Modifier.fillMaxWidth()
            )
            Spacer(modifier = Modifier.height(12.dp))
            OutlinedTextField(
                value = phone,
                onValueChange = { phone = it },
                label = { Text("Telefon") },
                modifier = Modifier.fillMaxWidth()
            )
            Spacer(modifier = Modifier.height(24.dp))
            Button(
                onClick = {
                    viewModel.updateProfile(
                        username = username,
                        email = email,
                        firstName = firstName,
                        lastName = lastName,
                        phone = phone
                    )
                },
                modifier = Modifier.fillMaxWidth(),
                enabled = updateProfileState !is NetworkResult.Loading
            ) {
                Text("Kaydet")
            }
            if (updateProfileState is NetworkResult.Loading) {
                Spacer(modifier = Modifier.height(16.dp))
                CircularProgressIndicator()
            }
            if (updateProfileState is NetworkResult.Success) {
                Spacer(modifier = Modifier.height(16.dp))
                Text("Profil başarıyla güncellendi", color = MaterialTheme.colorScheme.primary)
            }
            if (updateProfileState is NetworkResult.Error) {
                Spacer(modifier = Modifier.height(16.dp))
                Text((updateProfileState as NetworkResult.Error).message ?: "Hata oluştu", color = MaterialTheme.colorScheme.error)
            }
        }
    }
} 