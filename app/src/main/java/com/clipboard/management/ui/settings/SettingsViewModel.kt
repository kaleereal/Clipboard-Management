package com.clipboard.management.ui.settings

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.clipboard.management.data.db.AppDatabase
import com.clipboard.management.data.pref.AppSettings
import com.clipboard.management.data.repository.BackupRestoreRepository
import com.clipboard.management.data.repository.SettingsRepository
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import java.io.File

data class SettingsUiState(
    val captureEnabled: Boolean = true,
    val dedupMode: String = "UPDATE_TIME",
    val autoPurgeHours: Int = 0,
    val maxItems: Int = 0,
    val trashDays: Int = 30,
    val displayMode: String = "COMPACT",
    val theme: String = "SYSTEM",
    val overlayEnabled: Boolean = false,
    val persistentNotif: Boolean = true,
    val haptic: Boolean = true,
    val sound: Boolean = true,
    val eventNotif: Boolean = true,
    val backupSchedule: String = "OFF",
    val showRestoreDialog: Boolean = false,
    val showRepairDialog: Boolean = false,
    val snackbarMessage: String? = null
)

class SettingsViewModel(application: Application) : AndroidViewModel(application) {

    private val db = AppDatabase.getInstance(application)
    private val settingsRepo = SettingsRepository(AppSettings(application))
    private val backupRepo = BackupRestoreRepository(application, db)

    private val _uiState = MutableStateFlow(SettingsUiState())
    val uiState: StateFlow<SettingsUiState> = _uiState.asStateFlow()

    init {
        viewModelScope.launch {
            combine(
                settingsRepo.captureEnabled,
                settingsRepo.dedupMode,
                settingsRepo.autoPurgeHours,
                settingsRepo.maxItems,
                settingsRepo.trashDays
            ) { capture, dedup, purge, max, trash ->
                _uiState.update {
                    it.copy(
                        captureEnabled = capture,
                        dedupMode = dedup,
                        autoPurgeHours = purge,
                        maxItems = max,
                        trashDays = trash
                    )
                }
            }.collect()
        }

        viewModelScope.launch {
            combine(
                settingsRepo.displayMode,
                settingsRepo.theme
            ) { display, theme ->
                _uiState.update {
                    it.copy(
                        displayMode = display,
                        theme = theme
                    )
                }
            }.collect()
        }
    }

    fun setCaptureEnabled(v: Boolean) = viewModelScope.launch { settingsRepo.setCaptureEnabled(v) }
    fun setDedupMode(v: String) = viewModelScope.launch { settingsRepo.setDedupMode(v) }
    fun setAutoPurgeHours(v: Int) = viewModelScope.launch { settingsRepo.setAutoPurgeHours(v) }
    fun setMaxItems(v: Int) = viewModelScope.launch { settingsRepo.setMaxItems(v) }
    fun setTrashDays(v: Int) = viewModelScope.launch { settingsRepo.setTrashDays(v) }
    fun setDisplayMode(v: String) = viewModelScope.launch { settingsRepo.setDisplayMode(v) }
    fun setTheme(v: String) = viewModelScope.launch { settingsRepo.setTheme(v) }

    fun backupNow() {
        viewModelScope.launch {
            val dir = File(getApplication<Application>().filesDir, "backups").apply { if (!exists()) mkdirs() }
            backupRepo.createBackupFile(dir)
            _uiState.update { it.copy(snackbarMessage = "Cadangan dibuat") }
        }
    }

    fun optimizeDb() {
        viewModelScope.launch {
            val ok = backupRepo.optimizeDatabase()
            _uiState.update { it.copy(snackbarMessage = if (ok) "Database dioptimalkan" else "Gagal mengoptimalkan database") }
        }
    }

    fun repairDb() {
        viewModelScope.launch {
            val msg = backupRepo.checkAndRepairDatabase()
            _uiState.update { it.copy(snackbarMessage = msg, showRepairDialog = false) }
        }
    }

    fun toggleRepairDialog(show: Boolean) {
        _uiState.update { it.copy(showRepairDialog = show) }
    }

    fun clearSnackbar() {
        _uiState.update { it.copy(snackbarMessage = null) }
    }
}
