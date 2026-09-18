package com.clipboard.management.data.repository

import com.clipboard.management.data.pref.AppSettings
import kotlinx.coroutines.flow.Flow

class SettingsRepository(
    val settings: AppSettings
) {
    val captureEnabled: Flow<Boolean> = settings.captureEnabled
    val incognitoMode: Flow<Boolean> = settings.incognitoMode
    val dedupMode: Flow<String> = settings.dedupMode
    val keepFormat: Flow<Boolean> = settings.keepFormat
    val autoPurgeHours: Flow<Int> = settings.autoPurgeHours
    val maxItems: Flow<Int> = settings.maxItems
    val trashDays: Flow<Int> = settings.trashDays
    val displayMode: Flow<String> = settings.displayMode
    val theme: Flow<String> = settings.theme
    val overlayEnabled: Flow<Boolean> = settings.overlayEnabled
    val persistentNotif: Flow<Boolean> = settings.persistentNotif
    val notifItemCount: Flow<Int> = settings.notifItemCount
    val haptic: Flow<Boolean> = settings.haptic
    val sound: Flow<Boolean> = settings.sound
    val eventNotif: Flow<Boolean> = settings.eventNotif
    val backupSchedule: Flow<String> = settings.backupSchedule
    val onlineUnfurl: Flow<Boolean> = settings.onlineUnfurl

    suspend fun setCaptureEnabled(v: Boolean) = settings.setCaptureEnabled(v)
    suspend fun setIncognitoMode(v: Boolean) = settings.setIncognitoMode(v)
    suspend fun setDedupMode(v: String) = settings.setDedupMode(v)
    suspend fun setKeepFormat(v: Boolean) = settings.setKeepFormat(v)
    suspend fun setAutoPurgeHours(v: Int) = settings.setAutoPurgeHours(v)
    suspend fun setMaxItems(v: Int) = settings.setMaxItems(v)
    suspend fun setTrashDays(v: Int) = settings.setTrashDays(v)
    suspend fun setDisplayMode(v: String) = settings.setDisplayMode(v)
    suspend fun setTheme(v: String) = settings.setTheme(v)
    suspend fun setOverlayEnabled(v: Boolean) = settings.setOverlayEnabled(v)
    suspend fun setPersistentNotif(v: Boolean) = settings.setPersistentNotif(v)
    suspend fun setNotifItemCount(v: Int) = settings.setNotifItemCount(v)
    suspend fun setHaptic(v: Boolean) = settings.setHaptic(v)
    suspend fun setSound(v: Boolean) = settings.setSound(v)
    suspend fun setEventNotif(v: Boolean) = settings.setEventNotif(v)
    suspend fun setBackupSchedule(v: String) = settings.setBackupSchedule(v)
    suspend fun setOnlineUnfurl(v: Boolean) = settings.setOnlineUnfurl(v)
}
