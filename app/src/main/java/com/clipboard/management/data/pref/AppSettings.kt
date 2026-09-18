package com.clipboard.management.data.pref

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.*
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

val Context.dataStore: DataStore<Preferences> by preferencesDataStore(name = "settings")

class AppSettings(private val context: Context) {

    companion object {
        val CAPTURE_ENABLED = booleanPreferencesKey("captureEnabled")
        val INCOGNITO_MODE = booleanPreferencesKey("incognitoMode")
        val DEDUP_MODE = stringPreferencesKey("dedupMode") // UPDATE_TIME, IGNORE
        val KEEP_FORMAT = booleanPreferencesKey("keepFormat")
        val AUTO_PURGE_HOURS = intPreferencesKey("autoPurgeHours") // 0, 24, 168, 720
        val MAX_ITEMS = intPreferencesKey("maxItems") // 0 (unlimited), 100, 500, 1000, 5000
        val TRASH_DAYS = intPreferencesKey("trashDays") // 0, 7, 30
        val DISPLAY_MODE = stringPreferencesKey("displayMode") // COMPACT, GRID, DETAILED
        val THEME = stringPreferencesKey("theme") // SYSTEM, LIGHT, DARK
        val OVERLAY_ENABLED = booleanPreferencesKey("overlayEnabled")
        val PERSISTENT_NOTIF = booleanPreferencesKey("persistentNotif")
        val NOTIF_ITEM_COUNT = intPreferencesKey("notifItemCount") // 5, 10
        val HAPTIC = booleanPreferencesKey("haptic")
        val SOUND = booleanPreferencesKey("sound")
        val EVENT_NOTIF = booleanPreferencesKey("eventNotif")
        val BACKUP_SCHEDULE = stringPreferencesKey("backupSchedule") // OFF, DAILY, WEEKLY
        val ONLINE_UNFURL = booleanPreferencesKey("onlineUnfurl")

        // Security & Security Preferences
        val APP_LOCK_ENABLED = booleanPreferencesKey("appLockEnabled")
        val APP_PIN = stringPreferencesKey("appPin")
        val BIOMETRIC_ENABLED = booleanPreferencesKey("biometricEnabled")
        val AUTO_LOCK_DELAY_MINUTES = intPreferencesKey("autoLockDelayMinutes")
        val STEALTH_MODE = booleanPreferencesKey("stealthMode")
        val APP_WHITELIST = stringSetPreferencesKey("appWhitelist")
        val APP_BLACKLIST = stringSetPreferencesKey("appBlacklist")
    }

    val captureEnabled: Flow<Boolean> = context.dataStore.data.map { it[CAPTURE_ENABLED] ?: true }
    val incognitoMode: Flow<Boolean> = context.dataStore.data.map { it[INCOGNITO_MODE] ?: false }
    val dedupMode: Flow<String> = context.dataStore.data.map { it[DEDUP_MODE] ?: "UPDATE_TIME" }
    val keepFormat: Flow<Boolean> = context.dataStore.data.map { it[KEEP_FORMAT] ?: false }
    val autoPurgeHours: Flow<Int> = context.dataStore.data.map { it[AUTO_PURGE_HOURS] ?: 0 }
    val maxItems: Flow<Int> = context.dataStore.data.map { it[MAX_ITEMS] ?: 0 }
    val trashDays: Flow<Int> = context.dataStore.data.map { it[TRASH_DAYS] ?: 30 }
    val displayMode: Flow<String> = context.dataStore.data.map { it[DISPLAY_MODE] ?: "COMPACT" }
    val theme: Flow<String> = context.dataStore.data.map { it[THEME] ?: "SYSTEM" }
    val overlayEnabled: Flow<Boolean> = context.dataStore.data.map { it[OVERLAY_ENABLED] ?: false }
    val persistentNotif: Flow<Boolean> = context.dataStore.data.map { it[PERSISTENT_NOTIF] ?: true }
    val notifItemCount: Flow<Int> = context.dataStore.data.map { it[NOTIF_ITEM_COUNT] ?: 5 }
    val haptic: Flow<Boolean> = context.dataStore.data.map { it[HAPTIC] ?: true }
    val sound: Flow<Boolean> = context.dataStore.data.map { it[SOUND] ?: true }
    val eventNotif: Flow<Boolean> = context.dataStore.data.map { it[EVENT_NOTIF] ?: true }
    val backupSchedule: Flow<String> = context.dataStore.data.map { it[BACKUP_SCHEDULE] ?: "OFF" }
    val onlineUnfurl: Flow<Boolean> = context.dataStore.data.map { it[ONLINE_UNFURL] ?: false }

    val appLockEnabled: Flow<Boolean> = context.dataStore.data.map { it[APP_LOCK_ENABLED] ?: false }
    val appPin: Flow<String> = context.dataStore.data.map { it[APP_PIN] ?: "" }
    val biometricEnabled: Flow<Boolean> = context.dataStore.data.map { it[BIOMETRIC_ENABLED] ?: false }
    val autoLockDelayMinutes: Flow<Int> = context.dataStore.data.map { it[AUTO_LOCK_DELAY_MINUTES] ?: 0 }
    val stealthMode: Flow<Boolean> = context.dataStore.data.map { it[STEALTH_MODE] ?: false }
    val appWhitelist: Flow<Set<String>> = context.dataStore.data.map { it[APP_WHITELIST] ?: emptySet() }
    val appBlacklist: Flow<Set<String>> = context.dataStore.data.map { it[APP_BLACKLIST] ?: emptySet() }

    suspend fun setCaptureEnabled(value: Boolean) { context.dataStore.edit { it[CAPTURE_ENABLED] = value } }
    suspend fun setIncognitoMode(value: Boolean) { context.dataStore.edit { it[INCOGNITO_MODE] = value } }
    suspend fun setDedupMode(value: String) { context.dataStore.edit { it[DEDUP_MODE] = value } }
    suspend fun setKeepFormat(value: Boolean) { context.dataStore.edit { it[KEEP_FORMAT] = value } }
    suspend fun setAutoPurgeHours(value: Int) { context.dataStore.edit { it[AUTO_PURGE_HOURS] = value } }
    suspend fun setMaxItems(value: Int) { context.dataStore.edit { it[MAX_ITEMS] = value } }
    suspend fun setTrashDays(value: Int) { context.dataStore.edit { it[TRASH_DAYS] = value } }
    suspend fun setDisplayMode(value: String) { context.dataStore.edit { it[DISPLAY_MODE] = value } }
    suspend fun setTheme(value: String) { context.dataStore.edit { it[THEME] = value } }
    suspend fun setOverlayEnabled(value: Boolean) { context.dataStore.edit { it[OVERLAY_ENABLED] = value } }
    suspend fun setPersistentNotif(value: Boolean) { context.dataStore.edit { it[PERSISTENT_NOTIF] = value } }
    suspend fun setNotifItemCount(value: Int) { context.dataStore.edit { it[NOTIF_ITEM_COUNT] = value } }
    suspend fun setHaptic(value: Boolean) { context.dataStore.edit { it[HAPTIC] = value } }
    suspend fun setSound(value: Boolean) { context.dataStore.edit { it[SOUND] = value } }
    suspend fun setEventNotif(value: Boolean) { context.dataStore.edit { it[EVENT_NOTIF] = value } }
    suspend fun setBackupSchedule(value: String) { context.dataStore.edit { it[BACKUP_SCHEDULE] = value } }
    suspend fun setOnlineUnfurl(value: Boolean) { context.dataStore.edit { it[ONLINE_UNFURL] = value } }

    suspend fun setAppLockEnabled(value: Boolean) { context.dataStore.edit { it[APP_LOCK_ENABLED] = value } }
    suspend fun setAppPin(value: String) { context.dataStore.edit { it[APP_PIN] = value } }
    suspend fun setBiometricEnabled(value: Boolean) { context.dataStore.edit { it[BIOMETRIC_ENABLED] = value } }
    suspend fun setAutoLockDelayMinutes(value: Int) { context.dataStore.edit { it[AUTO_LOCK_DELAY_MINUTES] = value } }
    suspend fun setStealthMode(value: Boolean) { context.dataStore.edit { it[STEALTH_MODE] = value } }
    suspend fun setAppWhitelist(value: Set<String>) { context.dataStore.edit { it[APP_WHITELIST] = value } }
    suspend fun setAppBlacklist(value: Set<String>) { context.dataStore.edit { it[APP_BLACKLIST] = value } }
}
