package com.example.pcmarketx.ui.home

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.rememberLazyGridState
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.ShoppingCart
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.derivedStateOf
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.input.nestedscroll.nestedScroll
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.NavType
import com.example.pcmarketx.data.model.Item
import com.example.pcmarketx.ui.components.ErrorComponent
import com.example.pcmarketx.ui.components.GridItemCard
import com.example.pcmarketx.ui.components.LoadingComponent
import com.example.pcmarketx.ui.components.PopularProductSlider
import com.example.pcmarketx.util.NetworkResult
import com.google.accompanist.swiperefresh.SwipeRefresh
import com.google.accompanist.swiperefresh.rememberSwipeRefreshState

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HomeScreen(
    navigateToItemDetail: (String) -> Unit,
    navigateToCart: () -> Unit,
    navigateToSearch: () -> Unit,
    navigateToProfile: () -> Unit,
    navigateToEditProfile: () -> Unit,
    navigateToActiveOrders: () -> Unit,
    viewModel: HomeViewModel = hiltViewModel()
) {
    val itemsState by viewModel.items.collectAsState()
    val popularProductsState by viewModel.popularProducts.collectAsState()
    val gridState = rememberLazyGridState()
    val snackbarHostState = remember { SnackbarHostState() }
    val message by viewModel.message.collectAsState()
    
    // Snackbar gösterme
    LaunchedEffect(message) {
        message?.let {
            snackbarHostState.showSnackbar(it)
        }
    }
    
    // Swipe refresh state
    val isRefreshing by remember { derivedStateOf { itemsState is NetworkResult.Loading } }
    val swipeRefreshState = rememberSwipeRefreshState(isRefreshing = isRefreshing)
    
    val scrollBehavior = TopAppBarDefaults.pinnedScrollBehavior()
    
    // When scrolled to bottom, load more items
    val shouldLoadMore by remember {
        derivedStateOf {
            val lastVisibleItem = gridState.layoutInfo.visibleItemsInfo.lastOrNull()
            lastVisibleItem?.index != 0 && lastVisibleItem?.index == gridState.layoutInfo.totalItemsCount - 1
        }
    }
    
    // Load more items when scrolled to bottom
    LaunchedEffect(shouldLoadMore) {
        if (shouldLoadMore) {
            viewModel.loadNextPage()
        }
    }
    
    Scaffold(
        modifier = Modifier.nestedScroll(scrollBehavior.nestedScrollConnection),
        topBar = {
            TopAppBar(
                title = { Text("PC Market X") },
                scrollBehavior = scrollBehavior,
                actions = {
                    IconButton(onClick = navigateToCart) {
                        Icon(Icons.Default.ShoppingCart, contentDescription = "Sepet")
                    }
                    IconButton(onClick = navigateToProfile) {
                        Icon(Icons.Default.Person, contentDescription = "Profil")
                    }
                }
            )
        },
        snackbarHost = { SnackbarHost(hostState = snackbarHostState) }
    ) { innerPadding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
        ) {
            // Content with SwipeRefresh
            SwipeRefresh(
                state = swipeRefreshState,
                onRefresh = { viewModel.refresh() },
                modifier = Modifier.fillMaxSize()
            ) {
                LazyColumn(
                    modifier = Modifier.fillMaxSize()
                ) {
                    // Popüler ürünler slider'ı - her zaman göster
                    item {
                        // Debug için her zaman bir şey göster
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(16.dp)
                        ) {
                            when (popularProductsState) {
                                is NetworkResult.Success -> {
                                    val popularProducts = popularProductsState.data
                                    if (!popularProducts.isNullOrEmpty()) {
                                        PopularProductSlider(
                                            products = popularProducts,
                                            onProductClick = navigateToItemDetail,
                                            onAddToCartClick = { item ->
                                                viewModel.addToCart(item, 1)
                                            },
                                            modifier = Modifier
                                        )
                                    } else {
                                        Text(
                                            text = "Popüler ürün bulunamadı",
                                            style = MaterialTheme.typography.bodyMedium,
                                            modifier = Modifier.padding(16.dp)
                                        )
                                    }
                                }
                                is NetworkResult.Loading -> {
                                    Text(
                                        text = "🌟 Popüler ürünler yükleniyor...",
                                        style = MaterialTheme.typography.bodyMedium,
                                        modifier = Modifier.padding(16.dp)
                                    )
                                }
                                is NetworkResult.Error -> {
                                    Text(
                                        text = "Popüler ürünler yüklenemedi: ${popularProductsState.message}",
                                        style = MaterialTheme.typography.bodyMedium,
                                        color = MaterialTheme.colorScheme.error,
                                        modifier = Modifier.padding(16.dp)
                                    )
                                }
                                else -> {
                                    Text(
                                        text = "Popüler ürünler hazırlanıyor...",
                                        style = MaterialTheme.typography.bodyMedium,
                                        modifier = Modifier.padding(16.dp)
                                    )
                                }
                            }
                        }
                    }
                    
                    // Ana ürünler bölümü
                    when (itemsState) {
                        is NetworkResult.Loading -> {
                            item {
                                LoadingComponent()
                            }
                        }
                        is NetworkResult.Success -> {
                            val items = (itemsState as NetworkResult.Success<List<Item>>).data
                            
                            if (items.isNullOrEmpty()) {
                                item {
                                    Box(
                                        modifier = Modifier
                                            .fillMaxWidth()
                                            .padding(32.dp),
                                        contentAlignment = Alignment.Center
                                    ) {
                                        Text("Ürün bulunamadı")
                                    }
                                }
                            } else {
                                // Ürünleri 2'li gruplar halinde böl
                                val chunkedItems = items.chunked(2)
                                items(chunkedItems) { pair ->
                                    Row(
                                        modifier = Modifier
                                            .fillMaxWidth()
                                            .padding(horizontal = 8.dp, vertical = 4.dp),
                                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                                    ) {
                                        pair.forEach { item ->
                                            Box(modifier = Modifier.weight(1f)) {
                                                GridItemCard(
                                                    item = item,
                                                    onClick = { navigateToItemDetail(item.id) },
                                                    onAddToCartClick = { 
                                                        viewModel.addToCart(it, 1)
                                                    }
                                                )
                                            }
                                        }
                                        // Tek ürün kaldıysa boş alan ekle
                                        if (pair.size == 1) {
                                            Box(modifier = Modifier.weight(1f))
                                        }
                                    }
                                }
                            }
                        }
                        is NetworkResult.Error -> {
                            item {
                                ErrorComponent(
                                    message = (itemsState as NetworkResult.Error).message ?: "Ürünler yüklenirken bir hata oluştu",
                                    onRetry = { viewModel.refresh() }
                                )
                            }
                        }
                        is NetworkResult.Idle -> {
                            item {
                                Box(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .padding(32.dp),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Text("Yükleniyor...")
                                }
                            }
                        }
                    }
                }
            }
        }
    }
} 