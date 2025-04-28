package com.example.pcmarketx.di

import android.content.Context
import com.example.pcmarketx.data.api.AuthApi
import com.example.pcmarketx.data.api.CustomerApi
import com.example.pcmarketx.data.api.ItemApi
import com.example.pcmarketx.data.api.OrderApi
import com.example.pcmarketx.data.api.StatsApi
import com.example.pcmarketx.data.repository.PreferencesRepository
import com.example.pcmarketx.util.AuthInterceptor
import com.example.pcmarketx.util.Constants.BASE_URL
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
    fun provideConverterFactory(): GsonConverterFactory {
        val gson = com.google.gson.GsonBuilder()
            .setLenient()
            .setDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'")
            .create()
        return GsonConverterFactory.create(gson)
    }
    
    @Singleton
    @Provides
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
    fun provideAuthApi(retrofit: Retrofit): AuthApi {
        return retrofit.create(AuthApi::class.java)
    }
    
    @Singleton
    @Provides
    fun provideItemApi(retrofit: Retrofit): ItemApi {
        return retrofit.create(ItemApi::class.java)
    }
    
    @Singleton
    @Provides
    fun provideOrderApi(retrofit: Retrofit): OrderApi {
        return retrofit.create(OrderApi::class.java)
    }
    
    @Singleton
    @Provides
    fun provideCustomerApi(retrofit: Retrofit): CustomerApi {
        return retrofit.create(CustomerApi::class.java)
    }
    
    @Singleton
    @Provides
    fun provideStatsApi(retrofit: Retrofit): StatsApi {
        return retrofit.create(StatsApi::class.java)
    }
} 