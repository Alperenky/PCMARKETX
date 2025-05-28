package com.example.pcmarketx.di

import com.example.pcmarketx.data.api.AuthApi
import com.example.pcmarketx.data.api.ChatbotApi
import com.example.pcmarketx.data.api.CustomerApi
import com.example.pcmarketx.data.api.ItemApi
import com.example.pcmarketx.data.api.OrderApi
import com.example.pcmarketx.data.api.StatsApi
import com.example.pcmarketx.data.repository.AuthRepository
import com.example.pcmarketx.data.repository.CartRepository
import com.example.pcmarketx.data.repository.ChatbotRepository
import com.example.pcmarketx.data.repository.CustomerRepository
import com.example.pcmarketx.data.repository.ItemRepository
import com.example.pcmarketx.data.repository.OrderRepository
import com.example.pcmarketx.data.repository.PreferencesRepository
import com.example.pcmarketx.data.repository.StatsRepository
import com.example.pcmarketx.data.remote.UserService
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
        userService: UserService,
        preferencesRepository: PreferencesRepository
    ): AuthRepository {
        return AuthRepository(authApi, userService, preferencesRepository)
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
    
    @Singleton
    @Provides
    fun provideChatbotRepository(
        chatbotApi: ChatbotApi
    ): ChatbotRepository {
        return ChatbotRepository(chatbotApi)
    }
} 