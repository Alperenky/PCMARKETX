package com.example.pcmarketx.ui.profile

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import com.example.pcmarketx.data.model.Address
import com.example.pcmarketx.ui.auth.AuthViewModel
import com.example.pcmarketx.util.NetworkResult

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AddressesScreen(
    navigateUp: () -> Unit,
    viewModel: AuthViewModel = hiltViewModel()
) {
    val profileState by viewModel.profileState.collectAsState()
    val addAddressState by viewModel.addAddressState.collectAsState()
    val updateAddressState by viewModel.updateAddressState.collectAsState()
    val deleteAddressState by viewModel.deleteAddressState.collectAsState()
    var showAddAddressDialog by remember { mutableStateOf(false) }
    var selectedAddress by remember { mutableStateOf<Address?>(null) }
    var showDeleteConfirmation by remember { mutableStateOf<Address?>(null) }
    var snackbarHostState = remember { SnackbarHostState() }
    var errorMessage by remember { mutableStateOf<String?>(null) }

    LaunchedEffect(Unit) {
        viewModel.getProfile()
    }

    // Adres ekleme durumu
    LaunchedEffect(addAddressState) {
        when (addAddressState) {
            is NetworkResult.Success -> {
                viewModel.resetAddAddressState()
            }
            is NetworkResult.Error -> {
                // Hata durumunda kullanıcıya bilgi ver
                viewModel.resetAddAddressState()
            }
            else -> {}
        }
    }

    // Adres güncelleme durumu
    LaunchedEffect(updateAddressState) {
        when (updateAddressState) {
            is NetworkResult.Success -> {
                viewModel.resetUpdateAddressState()
            }
            is NetworkResult.Error -> {
                // Hata durumunda kullanıcıya bilgi ver
                viewModel.resetUpdateAddressState()
            }
            else -> {}
        }
    }

    // Adres silme durumu
    LaunchedEffect(deleteAddressState) {
        when (deleteAddressState) {
            is NetworkResult.Success -> {
                viewModel.resetDeleteAddressState()
                showDeleteConfirmation = null
            }
            is NetworkResult.Error -> {
                // Hata durumunda kullanıcıya bilgi ver
                viewModel.resetDeleteAddressState()
                showDeleteConfirmation = null
            }
            else -> {}
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Adreslerim") },
                navigationIcon = {
                    IconButton(onClick = navigateUp) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Geri")
                    }
                },
                actions = {
                    IconButton(onClick = { showAddAddressDialog = true }) {
                        Icon(Icons.Default.Add, contentDescription = "Yeni Adres Ekle")
                    }
                }
            )
        },
        snackbarHost = {
            SnackbarHost(hostState = snackbarHostState)
        }
    ) { paddingValues ->
        when (profileState) {
            is NetworkResult.Loading -> {
                Box(
                    modifier = Modifier.fillMaxSize(),
                    contentAlignment = Alignment.Center
                ) {
                    CircularProgressIndicator()
                }
            }
            is NetworkResult.Success -> {
                val user = profileState.data
                if (user?.addresses.isNullOrEmpty()) {
                    Box(
                        modifier = Modifier.fillMaxSize(),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = "Henüz kayıtlı adresiniz bulunmamaktadır.",
                            style = MaterialTheme.typography.bodyLarge
                        )
                    }
                } else {
                    LazyColumn(
                        modifier = Modifier.fillMaxSize(),
                        contentPadding = PaddingValues(16.dp)
                    ) {
                        items(user?.addresses ?: emptyList()) { address ->
                            AddressCard(
                                address = address,
                                onEditClick = { selectedAddress = address },
                                onDeleteClick = {
                                    showDeleteConfirmation = address
                                }
                            )
                            Spacer(modifier = Modifier.height(8.dp))
                        }
                    }
                }
            }
            is NetworkResult.Error -> {
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(paddingValues)
                        .padding(16.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Column(
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Text(
                            text = (profileState as NetworkResult.Error).message ?: "Adresler yüklenemedi",
                            color = MaterialTheme.colorScheme.error,
                            textAlign = TextAlign.Center
                        )
                        Spacer(modifier = Modifier.height(16.dp))
                        Button(onClick = { viewModel.getProfile() }) {
                            Text("Tekrar Dene")
                        }
                    }
                }
            }
            else -> {
                // Idle state
            }
        }
    }

    if (showAddAddressDialog) {
        AddAddressDialog(
            onDismiss = { showAddAddressDialog = false },
            onConfirm = { title, street, city, state, postalCode, country ->
                viewModel.addAddress(
                    title = title,
                    street = street,
                    city = city,
                    state = state,
                    postalCode = postalCode,
                    country = country
                )
                showAddAddressDialog = false
            }
        )
    }

    selectedAddress?.let { address ->
        EditAddressDialog(
            address = address,
            onDismiss = { selectedAddress = null },
            onConfirm = { title, street, city, state, postalCode, country ->
                viewModel.updateAddress(
                    addressId = address._id,
                    title = title,
                    street = street,
                    city = city,
                    state = state,
                    postalCode = postalCode,
                    country = country
                )
                selectedAddress = null
            }
        )
    }

    showDeleteConfirmation?.let { address ->
        AlertDialog(
            onDismissRequest = { showDeleteConfirmation = null },
            title = { Text("Adresi Sil") },
            text = { Text("${address.title} adresini silmek istediğinizden emin misiniz?") },
            confirmButton = {
                Button(
                    onClick = {
                        viewModel.deleteAddress(address._id)
                    },
                    colors = ButtonDefaults.buttonColors(
                        containerColor = MaterialTheme.colorScheme.error
                    )
                ) {
                    Text("Sil")
                }
            },
            dismissButton = {
                TextButton(onClick = { showDeleteConfirmation = null }) {
                    Text("İptal")
                }
            }
        )
    }

    // Yükleme durumları
    if (addAddressState is NetworkResult.Loading ||
        updateAddressState is NetworkResult.Loading ||
        deleteAddressState is NetworkResult.Loading
    ) {
        Box(
            modifier = Modifier.fillMaxSize(),
            contentAlignment = Alignment.Center
        ) {
            CircularProgressIndicator()
        }
    }

    // Hata durumları
    LaunchedEffect(addAddressState) {
        if (addAddressState is NetworkResult.Error) {
            val error = (addAddressState as NetworkResult.Error).message
            error?.let {
                snackbarHostState.showSnackbar(
                    message = it,
                    duration = SnackbarDuration.Short
                )
            }
            viewModel.resetAddAddressState()
        }
    }

    LaunchedEffect(updateAddressState) {
        if (updateAddressState is NetworkResult.Error) {
            val error = (updateAddressState as NetworkResult.Error).message
            error?.let {
                snackbarHostState.showSnackbar(
                    message = it,
                    duration = SnackbarDuration.Short
                )
            }
            viewModel.resetUpdateAddressState()
        }
    }

    LaunchedEffect(deleteAddressState) {
        if (deleteAddressState is NetworkResult.Error) {
            val error = (deleteAddressState as NetworkResult.Error).message
            error?.let {
                snackbarHostState.showSnackbar(
                    message = it,
                    duration = SnackbarDuration.Short
                )
            }
            viewModel.resetDeleteAddressState()
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AddressCard(
    address: Address,
    onEditClick: () -> Unit,
    onDeleteClick: () -> Unit
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        elevation = CardDefaults.cardElevation(4.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = address.title,
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = MaterialTheme.typography.titleMedium.fontWeight
                )
                Row {
                    IconButton(onClick = onEditClick) {
                        Icon(
                            Icons.Default.Edit,
                            contentDescription = "Düzenle",
                            tint = MaterialTheme.colorScheme.primary
                        )
                    }
                    IconButton(onClick = onDeleteClick) {
                        Icon(
                            Icons.Default.Delete,
                            contentDescription = "Sil",
                            tint = MaterialTheme.colorScheme.error
                        )
                    }
                }
            }
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = address.street,
                style = MaterialTheme.typography.bodyMedium
            )
            Text(
                text = "${address.state}, ${address.city}",
                style = MaterialTheme.typography.bodyMedium
            )
            Text(
                text = "${address.postalCode}, ${address.country}",
                style = MaterialTheme.typography.bodyMedium
            )
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AddAddressDialog(
    onDismiss: () -> Unit,
    onConfirm: (String, String, String, String, String, String) -> Unit
) {
    var title by remember { mutableStateOf("") }
    var street by remember { mutableStateOf("") }
    var city by remember { mutableStateOf("") }
    var state by remember { mutableStateOf("") }
    var postalCode by remember { mutableStateOf("") }
    var country by remember { mutableStateOf("Türkiye") }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Yeni Adres Ekle") },
        text = {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .verticalScroll(rememberScrollState())
            ) {
                OutlinedTextField(
                    value = title,
                    onValueChange = { title = it },
                    label = { Text("Adres Başlığı") },
                    modifier = Modifier.fillMaxWidth()
                )
                Spacer(modifier = Modifier.height(8.dp))
                OutlinedTextField(
                    value = street,
                    onValueChange = { street = it },
                    label = { Text("Sokak/Cadde") },
                    modifier = Modifier.fillMaxWidth()
                )
                Spacer(modifier = Modifier.height(8.dp))
                OutlinedTextField(
                    value = city,
                    onValueChange = { city = it },
                    label = { Text("Şehir") },
                    modifier = Modifier.fillMaxWidth()
                )
                Spacer(modifier = Modifier.height(8.dp))
                OutlinedTextField(
                    value = state,
                    onValueChange = { state = it },
                    label = { Text("İlçe") },
                    modifier = Modifier.fillMaxWidth()
                )
                Spacer(modifier = Modifier.height(8.dp))
                OutlinedTextField(
                    value = postalCode,
                    onValueChange = { postalCode = it },
                    label = { Text("Posta Kodu") },
                    modifier = Modifier.fillMaxWidth()
                )
                Spacer(modifier = Modifier.height(8.dp))
                OutlinedTextField(
                    value = country,
                    onValueChange = { country = it },
                    label = { Text("Ülke") },
                    modifier = Modifier.fillMaxWidth()
                )
            }
        },
        confirmButton = {
            Button(
                onClick = {
                    if (title.isNotBlank() && street.isNotBlank() && city.isNotBlank() &&
                        state.isNotBlank() && postalCode.isNotBlank() && country.isNotBlank()
                    ) {
                        onConfirm(title, street, city, state, postalCode, country)
                    }
                },
                enabled = title.isNotBlank() && street.isNotBlank() && city.isNotBlank() &&
                        state.isNotBlank() && postalCode.isNotBlank() && country.isNotBlank()
            ) {
                Text("Kaydet")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("İptal")
            }
        }
    )
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun EditAddressDialog(
    address: Address,
    onDismiss: () -> Unit,
    onConfirm: (String, String, String, String, String, String) -> Unit
) {
    var title by remember { mutableStateOf(address.title) }
    var street by remember { mutableStateOf(address.street) }
    var city by remember { mutableStateOf(address.city) }
    var state by remember { mutableStateOf(address.state) }
    var postalCode by remember { mutableStateOf(address.postalCode) }
    var country by remember { mutableStateOf(address.country) }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Adresi Düzenle") },
        text = {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .verticalScroll(rememberScrollState())
            ) {
                OutlinedTextField(
                    value = title,
                    onValueChange = { title = it },
                    label = { Text("Adres Başlığı") },
                    modifier = Modifier.fillMaxWidth()
                )
                Spacer(modifier = Modifier.height(8.dp))
                OutlinedTextField(
                    value = street,
                    onValueChange = { street = it },
                    label = { Text("Sokak/Cadde") },
                    modifier = Modifier.fillMaxWidth()
                )
                Spacer(modifier = Modifier.height(8.dp))
                OutlinedTextField(
                    value = city,
                    onValueChange = { city = it },
                    label = { Text("Şehir") },
                    modifier = Modifier.fillMaxWidth()
                )
                Spacer(modifier = Modifier.height(8.dp))
                OutlinedTextField(
                    value = state,
                    onValueChange = { state = it },
                    label = { Text("İlçe") },
                    modifier = Modifier.fillMaxWidth()
                )
                Spacer(modifier = Modifier.height(8.dp))
                OutlinedTextField(
                    value = postalCode,
                    onValueChange = { postalCode = it },
                    label = { Text("Posta Kodu") },
                    modifier = Modifier.fillMaxWidth()
                )
                Spacer(modifier = Modifier.height(8.dp))
                OutlinedTextField(
                    value = country,
                    onValueChange = { country = it },
                    label = { Text("Ülke") },
                    modifier = Modifier.fillMaxWidth()
                )
            }
        },
        confirmButton = {
            Button(
                onClick = {
                    if (title.isNotBlank() && street.isNotBlank() && city.isNotBlank() &&
                        state.isNotBlank() && postalCode.isNotBlank() && country.isNotBlank()
                    ) {
                        onConfirm(title, street, city, state, postalCode, country)
                    }
                },
                enabled = title.isNotBlank() && street.isNotBlank() && city.isNotBlank() &&
                        state.isNotBlank() && postalCode.isNotBlank() && country.isNotBlank()
            ) {
                Text("Kaydet")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("İptal")
            }
        }
    )
} 