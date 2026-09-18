package com.clipboard.management.ui.analytics

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.clipboard.management.data.db.AppDatabase
import com.clipboard.management.data.entity.ClipItem
import com.clipboard.management.data.pref.AppSettings
import com.clipboard.management.data.repository.AnalyticsRepository
import com.clipboard.management.data.repository.AppUsageStat
import com.clipboard.management.data.repository.ClipRepository
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch

data class AnalyticsUiState(
    val period: String = "7D", // 7D, 30D, YEAR, ALL
    val totalCopies: Int = 0,
    val avgDaily: Int = 0,
    val savedItemsCount: Int = 0,
    val pinnedItemsCount: Int = 0,
    val topApps: List<AppUsageStat> = emptyList(),
    val mostUsedClips: List<ClipItem> = emptyList(),
    val showResetDialog: Boolean = false
)

class AnalyticsViewModel(application: Application) : AndroidViewModel(application) {

    private val db = AppDatabase.getInstance(application)
    private val repo = AnalyticsRepository(db.usageEventDao(), db.clipDao(), db.tagDao())
    private val clipRepo = ClipRepository(db.clipDao(), db.tagDao(), db.autoTagRuleDao(), AppSettings(application))

    private val _uiState = MutableStateFlow(AnalyticsUiState())
    val uiState: StateFlow<AnalyticsUiState> = _uiState.asStateFlow()

    init {
        viewModelScope.launch {
            combine(
                clipRepo.allClips,
                clipRepo.pinnedClips,
                clipRepo.frequentClips
            ) { all, pinned, frequent ->
                _uiState.update {
                    it.copy(
                        savedItemsCount = all.size,
                        pinnedItemsCount = pinned.size,
                        mostUsedClips = frequent.take(10)
                    )
                }
            }.collect()
        }

        loadPeriodData("7D")
    }

    fun setPeriod(period: String) {
        _uiState.update { it.copy(period = period) }
        loadPeriodData(period)
    }

    private fun loadPeriodData(period: String) {
        val days = when (period) {
            "7D" -> 7
            "30D" -> 30
            "YEAR" -> 365
            else -> 10000
        }
        val startTime = System.currentTimeMillis() - (days * 86400 * 1000L)

        viewModelScope.launch {
            repo.getTopSourceApps(startTime).collect { apps ->
                val total = apps.sumOf { it.count }
                _uiState.update {
                    it.copy(
                        totalCopies = total,
                        avgDaily = if (days > 0 && days < 1000) total / days else total,
                        topApps = apps
                    )
                }
            }
        }
    }

    fun resetStats() {
        viewModelScope.launch {
            repo.clearStats()
            _uiState.update { it.copy(showResetDialog = false) }
            loadPeriodData(_uiState.value.period)
        }
    }

    fun toggleResetDialog(show: Boolean) {
        _uiState.update { it.copy(showResetDialog = show) }
    }
}
