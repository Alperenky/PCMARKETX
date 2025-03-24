package com.example.pcmarketx.data.repository

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import com.example.pcmarketx.util.Constants.AUTH_TOKEN_KEY
import com.example.pcmarketx.util.Constants.PREFERENCES_NAME
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

val Context.dataStore: DataStore<Preferences> by preferencesDataStore(name = PREFERENCES_NAME)

class PreferencesRepository(private val context: Context) {
    
    private val tokenKey = stringPreferencesKey(AUTH_TOKEN_KEY)
    
    val readToken: Flow<String> = context.dataStore.data
        .map { preferences ->
            preferences[tokenKey] ?: ""
        }
    
    suspend fun saveToken(token: String) {
        context.dataStore.edit { preferences ->
            preferences[tokenKey] = token
        }
    }
    
    suspend fun clearToken() {
        context.dataStore.edit { preferences ->
            preferences.remove(tokenKey)
        }
    }
} 