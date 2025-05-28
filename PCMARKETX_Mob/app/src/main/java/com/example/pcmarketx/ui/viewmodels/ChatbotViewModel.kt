package com.example.pcmarketx.ui.viewmodels

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.pcmarketx.data.model.ChatMessage
import com.example.pcmarketx.data.repository.ChatbotRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class ChatbotViewModel @Inject constructor(
    private val chatbotRepository: ChatbotRepository
) : ViewModel() {

    private val _messages = MutableStateFlow<List<ChatMessage>>(emptyList())
    val messages: StateFlow<List<ChatMessage>> = _messages.asStateFlow()

    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()

    private val _error = MutableStateFlow<String?>(null)
    val error: StateFlow<String?> = _error.asStateFlow()

    private val _isChatVisible = MutableStateFlow(false)
    val isChatVisible: StateFlow<Boolean> = _isChatVisible.asStateFlow()

    fun toggleChatVisibility() {
        _isChatVisible.value = !_isChatVisible.value
    }

    fun sendMessage(message: String) {
        if (message.isBlank()) return

        val userMessage = ChatMessage("user", message)
        _messages.value = _messages.value + userMessage
        _isLoading.value = true
        _error.value = null

        viewModelScope.launch {
            chatbotRepository.sendMessage(message)
                .onSuccess { response ->
                    val botMessage = response.choices.firstOrNull()?.message
                    if (botMessage != null) {
                        _messages.value = _messages.value + botMessage
                    }
                    _isLoading.value = false
                }
                .onFailure { e ->
                    _error.value = e.message ?: "Bilinmeyen hata"
                    _isLoading.value = false
                }
        }
    }

    fun clearChat() {
        chatbotRepository.clearChatHistory()
        _messages.value = emptyList()
        _error.value = null
    }
} 