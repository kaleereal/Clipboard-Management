package com.clipboard.management.ui.search

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.clipboard.management.data.db.AppDatabase
import com.clipboard.management.data.entity.ClipItem
import com.clipboard.management.data.entity.FilterPreset
import com.clipboard.management.data.repository.AdvancedSearchFilter
import com.clipboard.management.data.repository.SearchRepository
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch

data class SearchUiState(
    val query: String = "",
    val isRegex: Boolean = false,
    val selectedTab: Int = 0, // 0: Hasil, 1: Filter Lanjut, 2: Preset, 3: Grafik Tag
    val contentType: String? = null,
    val minLength: Int? = null,
    val maxLength: Int? = null,
    val presetNameInput: String = "",
    val showSavePresetDialog: Boolean = false
)

class SearchViewModel(application: Application) : AndroidViewModel(application) {

    private val db = AppDatabase.getInstance(application)
    private val repo = SearchRepository(db.clipDao(), db.filterPresetDao())

    private val _uiState = MutableStateFlow(SearchUiState())
    val uiState: StateFlow<SearchUiState> = _uiState.asStateFlow()

    val presets: Flow<List<FilterPreset>> = repo.presets

    @OptIn(ExperimentalCoroutinesApi::class)
    val searchResults: Flow<List<ClipItem>> = _uiState.flatMapLatest { state ->
        val filter = AdvancedSearchFilter(
            query = state.query,
            isRegex = state.isRegex,
            contentType = state.contentType,
            minLength = state.minLength,
            maxLength = state.maxLength
        )
        repo.searchClips(filter)
    }

    fun updateQuery(newQuery: String) {
        _uiState.update { it.copy(query = newQuery) }
    }

    fun toggleRegex() {
        _uiState.update { it.copy(isRegex = !it.isRegex) }
    }

    fun setTab(index: Int) {
        _uiState.update { it.copy(selectedTab = index) }
    }

    fun setContentType(type: String?) {
        _uiState.update { it.copy(contentType = type) }
    }

    fun resetFilters() {
        _uiState.update {
            it.copy(
                query = "",
                isRegex = false,
                contentType = null,
                minLength = null,
                maxLength = null
            )
        }
    }

    fun savePreset(name: String) {
        if (name.isBlank()) return
        viewModelScope.launch {
            repo.savePreset(
                FilterPreset(
                    name = name,
                    queryText = _uiState.value.query,
                    isRegex = _uiState.value.isRegex,
                    filterJson = "{}"
                )
            )
            _uiState.update { it.copy(showSavePresetDialog = false) }
        }
    }

    fun applyPreset(preset: FilterPreset) {
        _uiState.update {
            it.copy(
                query = preset.queryText,
                isRegex = preset.isRegex,
                selectedTab = 0
            )
        }
    }

    fun deletePreset(id: String) {
        viewModelScope.launch { repo.deletePreset(id) }
    }

    fun toggleSavePresetDialog(show: Boolean) {
        _uiState.update { it.copy(showSavePresetDialog = show) }
    }
}
