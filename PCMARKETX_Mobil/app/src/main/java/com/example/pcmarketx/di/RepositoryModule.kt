package com.example.pcmarketx.di

import com.example.pcmarketx.data.api.AuthApi
import com.example.pcmarketx.data.api.ItemApi
import com.example.pcmarketx.data.api.OrderApi
import com.example.pcmarketx.data.repository.AuthRepository
import com.example.pcmarketx.data.repository.CartRepository
import com.example.pcmarketx.data.repository.ItemRepository
import com.example.pcmarketx.data.repository.OrderRepository
import com.example.pcmarketx.data.repository.PreferencesRepository
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object RepositoryModule {

    @Singleton
    @Provides
    fun provideAuthRepository(
        authApi: AuthApi,
        preferencesRepository: PreferencesRepository
    ): AuthRepository {
        return AuthRepository(authApi, preferencesRepository)
    }
    
    @Singleton
    @Provides
    fun provideItemRepository(
        itemApi: ItemApi
    ): ItemRepository {
        return ItemRepository(itemApi)
    }
    
    @Singleton
    @Provides
    fun provideOrderRepository(
        orderApi: OrderApi
    ): OrderRepository {
        return OrderRepository(orderApi)
    }
    
    @Singleton
    @Provides
    fun provideCartRepository(): CartRepository {
        return CartRepository()
    }
} 