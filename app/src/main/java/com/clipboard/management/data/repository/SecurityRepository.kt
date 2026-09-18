package com.clipboard.management.data.repository

import com.clipboard.management.data.pref.AppSettings
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.first

class SecurityRepository(
    private val appSettings: AppSettings
) {
    val isAppLockEnabled: Flow<Boolean> = appSettings.appLockEnabled
    val appPin: Flow<String> = appSettings.appPin
    val isBiometricEnabled: Flow<Boolean> = appSettings.biometricEnabled
    val autoLockDelayMinutes: Flow<Int> = appSettings.autoLockDelayMinutes
    val isStealthMode: Flow<Boolean> = appSettings.stealthMode
    val appWhitelist: Flow<Set<String>> = appSettings.appWhitelist
    val appBlacklist: Flow<Set<String>> = appSettings.appBlacklist

    suspend fun setAppLockEnabled(enabled: Boolean) {
        appSettings.setAppLockEnabled(enabled)
    }

    suspend fun setAppPin(pin: String) {
        appSettings.setAppPin(pin)
    }

    suspend fun setBiometricEnabled(enabled: Boolean) {
        appSettings.setBiometricEnabled(enabled)
    }

    suspend fun setAutoLockDelayMinutes(minutes: Int) {
        appSettings.setAutoLockDelayMinutes(minutes)
    }

    suspend fun verifyPin(enteredPin: String): Boolean {
        val storedPin = appSettings.appPin.first()
        return storedPin.isNotEmpty() && storedPin == enteredPin
    }

    suspend fun addToWhitelist(packageName: String) {
        val current = appSettings.appWhitelist.first().toMutableSet()
        current.add(packageName)
        appSettings.setAppWhitelist(current)
    }

    suspend fun removeFromWhitelist(packageName: String) {
        val current = appSettings.appWhitelist.first().toMutableSet()
        current.remove(packageName)
        appSettings.setAppWhitelist(current)
    }

    suspend fun addToBlacklist(packageName: String) {
        val current = appSettings.appBlacklist.first().toMutableSet()
        current.add(packageName)
        appSettings.setAppBlacklist(current)
    }

    suspend fun removeFromBlacklist(packageName: String) {
        val current = appSettings.appBlacklist.first().toMutableSet()
        current.remove(packageName)
        appSettings.setAppBlacklist(current)
    }
}
