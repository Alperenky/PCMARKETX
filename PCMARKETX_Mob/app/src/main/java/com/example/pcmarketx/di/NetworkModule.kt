package com.example.pcmarketx.di

import android.content.Context
import com.example.pcmarketx.data.api.AuthApi
import com.example.pcmarketx.data.api.ChatbotApi
import com.example.pcmarketx.data.api.CustomerApi
import com.example.pcmarketx.data.api.ItemApi
import com.example.pcmarketx.data.api.OrderApi
import com.example.pcmarketx.data.api.StatsApi
import com.example.pcmarketx.data.repository.PreferencesRepository
import com.example.pcmarketx.util.AuthInterceptor
import com.example.pcmarketx.util.Constants.BASE_URL
import com.example.pcmarketx.data.remote.UserService
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.util.concurrent.TimeUnit
import javax.inject.Named
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object NetworkModule {

    @Singleton
    @Provides
    fun providePreferencesRepository(@ApplicationContext context: Context): PreferencesRepository {
        return PreferencesRepository(context)
    }
    
    @Singleton
    @Provides
    fun provideAuthInterceptor(preferencesRepository: PreferencesRepository): AuthInterceptor {
        return AuthInterceptor(preferencesRepository)
    }
    
    @Singleton
    @Provides
    fun provideHttpClient(
        authInterceptor: AuthInterceptor
    ): OkHttpClient {
        val loggingInterceptor = HttpLoggingInterceptor().apply {
            level = HttpLoggingInterceptor.Level.BODY
        }
        
        return OkHttpClient.Builder()
            .readTimeout(15, TimeUnit.SECONDS)
            .connectTimeout(15, TimeUnit.SECONDS)
            .addInterceptor(authInterceptor)
            .addInterceptor(loggingInterceptor)
            .build()
    }

    @Singleton
    @Provides
    @Named("chatbotHttpClient")
    fun provideChatbotHttpClient(): OkHttpClient {
        val loggingInterceptor = HttpLoggingInterceptor().apply {
            level = HttpLoggingInterceptor.Level.BODY
        }
        
        return OkHttpClient.Builder()
            .readTimeout(15, TimeUnit.SECONDS)
            .connectTimeout(15, TimeUnit.SECONDS)
            .addInterceptor(loggingInterceptor)
            .build()
    }
    
    @Singleton
    @Provides
    fun provideConverterFactory(): GsonConverterFactory {
        val gson = com.google.gson.GsonBuilder()
            .setLenient()
            .setDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'")
            .registerTypeAdapter(com.example.pcmarketx.data.model.Item::class.java, com.example.pcmarketx.data.model.ItemDeserializer())
            .create()
        return GsonConverterFactory.create(gson)
    }
    
    @Singleton
    @Provides
    @Named("baseRetrofit")
    fun provideRetrofit(
        okHttpClient: OkHttpClient,
        gsonConverterFactory: GsonConverterFactory
    ): Retrofit {
        return Retrofit.Builder()
            .baseUrl(BASE_URL)
            .client(okHttpClient)
            .addConverterFactory(gsonConverterFactory)
            .build()
    }
    
    @Singleton
    @Provides
    @Named("chatbotRetrofit")
    fun provideChatbotRetrofit(
        @Named("chatbotHttpClient") okHttpClient: OkHttpClient,
        gsonConverterFactory: GsonConverterFactory
    ): Retrofit {
        return Retrofit.Builder()
            .baseUrl("https://openrouter.ai/api/v1/")
            .client(okHttpClient)
            .addConverterFactory(gsonConverterFactory)
            .build()
    }
    
    @Singleton
    @Provides
    fun provideAuthApi(@Named("baseRetrofit") retrofit: Retrofit): AuthApi {
        return retrofit.create(AuthApi::class.java)
    }
    
    @Singleton
    @Provides
    fun provideItemApi(@Named("baseRetrofit") retrofit: Retrofit): ItemApi {
        return retrofit.create(ItemApi::class.java)
    }
    
    @Singleton
    @Provides
    fun provideOrderApi(@Named("baseRetrofit") retrofit: Retrofit): OrderApi {
        return retrofit.create(OrderApi::class.java)
    }
    
    @Singleton
    @Provides
    fun provideCustomerApi(@Named("baseRetrofit") retrofit: Retrofit): CustomerApi {
        return retrofit.create(CustomerApi::class.java)
    }
    
    @Singleton
    @Provides
    fun provideStatsApi(@Named("baseRetrofit") retrofit: Retrofit): StatsApi {
        return retrofit.create(StatsApi::class.java)
    }

    @Singleton
    @Provides
    fun provideUserService(@Named("baseRetrofit") retrofit: Retrofit): UserService {
        return retrofit.create(UserService::class.java)
    }
    
    @Singleton
    @Provides
    fun provideChatbotApi(@Named("chatbotRetrofit") retrofit: Retrofit): ChatbotApi {
        return retrofit.create(ChatbotApi::class.java)
    }
} 