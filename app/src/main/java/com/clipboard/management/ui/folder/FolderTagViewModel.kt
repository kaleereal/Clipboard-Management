package com.clipboard.management.ui.folder

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.clipboard.management.data.db.AppDatabase
import com.clipboard.management.data.entity.*
import com.clipboard.management.data.pref.AppSettings
import com.clipboard.management.data.repository.ClipRepository
import com.clipboard.management.data.repository.FolderTagRepository
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch

data class FolderTagUiState(
    val selectedTab: Int = 0, // 0: Folder, 1: Tag, 2: Smart, 3: Aturan
    val orphanCount: Int = 0,
    val showAddFolderDialog: Boolean = false,
    val showAddTagDialog: Boolean = false,
    val showAddSmartFolderDialog: Boolean = false,
    val showAddRuleDialog: Boolean = false
)

class FolderTagViewModel(application: Application) : AndroidViewModel(application) {

    private val db = AppDatabase.getInstance(application)
    private val repo = FolderTagRepository(db.folderDao(), db.tagDao(), db.smartFolderDao(), db.autoTagRuleDao())
    private val clipRepo = ClipRepository(db.clipDao(), db.tagDao(), db.autoTagRuleDao(), AppSettings(application))

    private val _uiState = MutableStateFlow(FolderTagUiState())
    val uiState: StateFlow<FolderTagUiState> = _uiState.asStateFlow()

    val folders: Flow<List<Folder>> = repo.allFolders
    val tags: Flow<List<Tag>> = repo.allTags
    val smartFolders: Flow<List<SmartFolder>> = repo.allSmartFolders
    val rules: Flow<List<AutoTagRule>> = repo.allRules

    init {
        viewModelScope.launch {
            clipRepo.orphanCount.collect { count ->
                _uiState.update { it.copy(orphanCount = count) }
            }
        }
    }

    fun setTab(index: Int) {
        _uiState.update { it.copy(selectedTab = index) }
    }

    fun addFolder(name: String, color: String = "#6200EE") {
        viewModelScope.launch {
            repo.insertFolder(Folder(name = name, color = color))
        }
    }

    fun deleteFolder(id: String) {
        viewModelScope.launch { repo.deleteFolder(id) }
    }

    fun addTag(name: String, color: String = "#03DAC6") {
        viewModelScope.launch {
            repo.insertTag(Tag(name = name, color = color))
        }
    }

    fun deleteTag(id: String) {
        viewModelScope.launch { repo.deleteTag(id) }
    }

    fun addSmartFolder(name: String, conditionsJson: String = "{}") {
        viewModelScope.launch {
            repo.insertSmartFolder(SmartFolder(name = name, conditionsJson = conditionsJson))
        }
    }

    fun deleteSmartFolder(id: String) {
        viewModelScope.launch { repo.deleteSmartFolder(id) }
    }

    fun addRule(name: String, pattern: String, isRegex: Boolean, targetTagId: String) {
        viewModelScope.launch {
            repo.insertRule(AutoTagRule(name = name, pattern = pattern, isRegex = isRegex, targetTagId = targetTagId))
        }
    }

    fun deleteRule(id: String) {
        viewModelScope.launch { repo.deleteRule(id) }
    }

    fun toggleAddDialog(show: Boolean) {
        _uiState.update { state ->
            when (state.selectedTab) {
                0 -> state.copy(showAddFolderDialog = show)
                1 -> state.copy(showAddTagDialog = show)
                2 -> state.copy(showAddSmartFolderDialog = show)
                else -> state.copy(showAddRuleDialog = show)
            }
        }
    }
}
