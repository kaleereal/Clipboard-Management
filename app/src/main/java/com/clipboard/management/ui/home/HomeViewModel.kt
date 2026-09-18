package com.clipboard.management.ui.home

import android.app.Application
import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.clipboard.management.data.db.AppDatabase
import com.clipboard.management.data.entity.ClipItem
import com.clipboard.management.data.pref.AppSettings
import com.clipboard.management.data.repository.AnalyticsRepository
import com.clipboard.management.data.repository.ClipRepository
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch

data class HomeUiState(
    val selectedTab: Int = 0, // 0: Semua, 1: Disematkan, 2: Sering Dipakai, 3: Sampah
    val selectedTypeChip: String = "ALL", // ALL, TEXT, URL, CODE, NUMBER
    val displayMode: String = "COMPACT", // COMPACT, GRID, DETAILED
    val sortOrder: String = "NEWEST", // NEWEST, OLDEST, MOST_USED, SIZE
    val captureEnabled: Boolean = true,
    val incognitoMode: Boolean = false,
    val selectionMode: Boolean = false,
    val selectedIds: Set<String> = emptySet(),
    val showDeleteConfirmDialog: Boolean = false,
    val showEmptyTrashConfirmDialog: Boolean = false,
    val showMergeDialog: Boolean = false
)

class HomeViewModel(application: Application) : AndroidViewModel(application) {

    private val db = AppDatabase.getInstance(application)
    val appSettings = AppSettings(application)
    private val clipRepository = ClipRepository(db.clipDao(), db.tagDao(), db.autoTagRuleDao(), appSettings)
    private val analyticsRepository = AnalyticsRepository(db.usageEventDao(), db.clipDao(), db.tagDao())

    private val _uiState = MutableStateFlow(HomeUiState())
    val uiState: StateFlow<HomeUiState> = _uiState.asStateFlow()

    init {
        viewModelScope.launch {
            combine(
                appSettings.captureEnabled,
                appSettings.incognitoMode,
                appSettings.displayMode
            ) { capture, incognito, display ->
                _uiState.update {
                    it.copy(
                        captureEnabled = capture,
                        incognitoMode = incognito,
                        displayMode = display
                    )
                }
            }.collect()
        }
    }

    @OptIn(ExperimentalCoroutinesApi::class)
    val clipsFlow: Flow<List<ClipItem>> = _uiState.flatMapLatest { state ->
        val sourceFlow = when (state.selectedTab) {
            1 -> clipRepository.pinnedClips
            2 -> clipRepository.frequentClips
            3 -> clipRepository.trashClips
            else -> clipRepository.allClips
        }

        sourceFlow.map { list ->
            var filtered = list

            if (state.selectedTab == 0 && state.selectedTypeChip != "ALL") {
                filtered = filtered.filter { it.contentType == state.selectedTypeChip }
            }

            when (state.sortOrder) {
                "OLDEST" -> filtered.sortedBy { it.createdAt }
                "MOST_USED" -> filtered.sortedByDescending { it.useCount }
                "SIZE" -> filtered.sortedByDescending { it.charCount }
                else -> filtered.sortedWith(compareByDescending<ClipItem> { it.isPinned }.thenByDescending { it.createdAt })
            }
        }
    }

    fun setTab(index: Int) {
        _uiState.update { it.copy(selectedTab = index, selectionMode = false, selectedIds = emptySet()) }
    }

    fun setTypeChip(chip: String) {
        _uiState.update { it.copy(selectedTypeChip = chip) }
    }

    fun setDisplayMode(mode: String) {
        viewModelScope.launch { appSettings.setDisplayMode(mode) }
    }

    fun setSortOrder(order: String) {
        _uiState.update { it.copy(sortOrder = order) }
    }

    fun toggleCapture() {
        viewModelScope.launch {
            appSettings.setCaptureEnabled(!_uiState.value.captureEnabled)
        }
    }

    fun toggleIncognito() {
        viewModelScope.launch {
            appSettings.setIncognitoMode(!_uiState.value.incognitoMode)
        }
    }

    fun toggleSelectId(id: String) {
        _uiState.update { state ->
            val newSet = state.selectedIds.toMutableSet()
            if (newSet.contains(id)) newSet.remove(id) else newSet.add(id)
            state.copy(
                selectedIds = newSet,
                selectionMode = newSet.isNotEmpty()
            )
        }
    }

    fun clearSelection() {
        _uiState.update { it.copy(selectionMode = false, selectedIds = emptySet()) }
    }

    fun copyToClipboard(context: Context, item: ClipItem) {
        val cm = context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
        val clip = ClipData.newPlainText("clipboard", item.content)
        cm.setPrimaryClip(clip)

        viewModelScope.launch {
            clipRepository.recordCopy(item)
            analyticsRepository.recordEvent(item.id, "COPY", item.sourceApp)
        }
    }

    fun togglePin(clipId: String) {
        viewModelScope.launch { clipRepository.togglePin(clipId) }
    }

    fun softDelete(clipId: String) {
        viewModelScope.launch { clipRepository.softDelete(clipId) }
    }

    fun restoreClip(clipId: String) {
        viewModelScope.launch { clipRepository.restoreClip(clipId) }
    }

    fun deletePermanently(clipId: String) {
        viewModelScope.launch { clipRepository.deletePermanently(clipId) }
    }

    fun emptyTrash() {
        viewModelScope.launch { clipRepository.emptyTrash() }
    }

    fun mergeSelected(separator: String) {
        val selected = _uiState.value.selectedIds.toList()
        if (selected.size >= 2) {
            viewModelScope.launch {
                clipRepository.mergeSnippets(selected, separator)
                clearSelection()
            }
        }
    }
}
