package com.clipboard.management.ui.security

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.clipboard.management.data.pref.AppSettings
import com.clipboard.management.data.repository.SecurityRepository
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch

data class SecurityUiState(
    val isAppLockEnabled: Boolean = false,
    val appPin: String = "",
    val isBiometricEnabled: Boolean = false,
    val autoLockDelayMinutes: Int = 0,
    val isStealthMode: Boolean = false,
    val appWhitelist: Set<String> = emptySet(),
    val appBlacklist: Set<String> = emptySet(),
    val showPinSetupDialog: Boolean = false,
    val enteredPinInput: String = "",
    val pinConfirmInput: String = "",
    val pinErrorMessage: String? = null
)

class SecurityViewModel(application: Application) : AndroidViewModel(application) {

    private val appSettings = AppSettings(application)
    private val securityRepository = SecurityRepository(appSettings)

    private val _uiState = MutableStateFlow(SecurityUiState())
    val uiState: StateFlow<SecurityUiState> = _uiState.asStateFlow()

    init {
        viewModelScope.launch {
            combine(
                securityRepository.isAppLockEnabled,
                securityRepository.appPin,
                securityRepository.isBiometricEnabled,
                securityRepository.autoLockDelayMinutes,
                securityRepository.isStealthMode
            ) { lock, pin, bio, delay, stealth ->
                _uiState.update {
                    it.copy(
                        isAppLockEnabled = lock && pin.isNotEmpty(),
                        appPin = pin,
                        isBiometricEnabled = bio,
                        autoLockDelayMinutes = delay,
                        isStealthMode = stealth
                    )
                }
            }.collect()
        }
    }

    fun toggleAppLock(enable: Boolean) {
        viewModelScope.launch {
            if (enable && _uiState.value.appPin.isEmpty()) {
                _uiState.update { it.copy(showPinSetupDialog = true) }
            } else {
                securityRepository.setAppLockEnabled(enable)
            }
        }
    }

    fun setPin(pin: String) {
        viewModelScope.launch {
            securityRepository.setAppPin(pin)
            securityRepository.setAppLockEnabled(pin.isNotEmpty())
            _uiState.update { it.copy(showPinSetupDialog = false) }
        }
    }

    fun setBiometricEnabled(enabled: Boolean) {
        viewModelScope.launch {
            securityRepository.setBiometricEnabled(enabled)
        }
    }

    fun togglePinSetupDialog(show: Boolean) {
        _uiState.update { it.copy(showPinSetupDialog = show) }
    }
}
