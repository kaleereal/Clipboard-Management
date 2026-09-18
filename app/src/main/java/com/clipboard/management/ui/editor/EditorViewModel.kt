package com.clipboard.management.ui.editor

import android.app.Application
import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.content.Intent
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.clipboard.management.data.db.AppDatabase
import com.clipboard.management.data.entity.ClipItem
import com.clipboard.management.data.entity.ClipVersion
import com.clipboard.management.data.pref.AppSettings
import com.clipboard.management.data.repository.ClipRepository
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

data class EditorUiState(
    val clipId: String? = null,
    val content: String = "",
    val language: String = "TEXT", // TEXT, MARKDOWN, JSON, XML, HTML, SQL
    val isPinned: Boolean = false,
    val isLocked: Boolean = false,
    val isSelfDestruct: Boolean = false,
    val folderId: String? = null,
    val charCount: Int = 0,
    val wordCount: Int = 0,
    val lineCount: Int = 0,
    val isDirty: Boolean = false,
    val versions: List<ClipVersion> = emptyList(),
    val showVersionSheet: Boolean = false,
    val showSplitDialog: Boolean = false,
    val showDiffDialog: Boolean = false,
    val selectedVersionForDiff: ClipVersion? = null,
    val snackbarMessage: String? = null
)

class EditorViewModel(application: Application) : AndroidViewModel(application) {

    private val db = AppDatabase.getInstance(application)
    private val appSettings = AppSettings(application)
    private val clipRepository = ClipRepository(db.clipDao(), db.tagDao(), db.autoTagRuleDao(), appSettings)

    private val _uiState = MutableStateFlow(EditorUiState())
    val uiState: StateFlow<EditorUiState> = _uiState.asStateFlow()

    private val undoStack = mutableListOf<String>()
    private val redoStack = mutableListOf<String>()

    fun loadClip(clipId: String?) {
        if (clipId.isNullOrBlank()) {
            _uiState.update { EditorUiState() }
            return
        }

        viewModelScope.launch {
            val clip = clipRepository.getClipById(clipId)
            if (clip != null) {
                _uiState.update {
                    it.copy(
                        clipId = clip.id,
                        content = clip.content,
                        language = ClipRepository.detectContentType(clip.content),
                        isPinned = clip.isPinned,
                        isLocked = clip.isLocked,
                        isSelfDestruct = clip.isSelfDestruct,
                        folderId = clip.folderId,
                        charCount = clip.charCount,
                        wordCount = clip.wordCount,
                        lineCount = clip.lineCount,
                        isDirty = false
                    )
                }

                clipRepository.getVersionsForClip(clip.id).collect { versions ->
                    _uiState.update { state -> state.copy(versions = versions) }
                }
            }
        }
    }

    fun onContentChanged(newContent: String) {
        val current = _uiState.value.content
        if (current != newContent) {
            undoStack.add(current)
            if (undoStack.size > 100) undoStack.removeAt(0)
            redoStack.clear()
        }

        val chars = newContent.length
        val words = if (newContent.isBlank()) 0 else newContent.trim().split("\\s+".toRegex()).size
        val lines = if (newContent.isEmpty()) 0 else newContent.count { it == '\n' } + 1

        _uiState.update {
            it.copy(
                content = newContent,
                charCount = chars,
                wordCount = words,
                lineCount = lines,
                isDirty = true
            )
        }
    }

    fun undo() {
        if (undoStack.isNotEmpty()) {
            val prev = undoStack.removeAt(undoStack.size - 1)
            redoStack.add(_uiState.value.content)
            onContentChanged(prev)
        }
    }

    fun redo() {
        if (redoStack.isNotEmpty()) {
            val next = redoStack.removeAt(redoStack.size - 1)
            undoStack.add(_uiState.value.content)
            onContentChanged(next)
        }
    }

    fun setLanguage(lang: String) {
        _uiState.update { it.copy(language = lang) }
    }

    fun insertVariable(variableToken: String) {
        val now = Date()
        val value = when (variableToken) {
            "{date}" -> SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).format(now)
            "{time}" -> SimpleDateFormat("HH:mm:ss", Locale.getDefault()).format(now)
            "{datetime}" -> SimpleDateFormat("yyyy-MM-dd HH:mm:ss", Locale.getDefault()).format(now)
            "{clipboard}" -> {
                val cm = getApplication<Application>().getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
                cm.primaryClip?.getItemAt(0)?.text?.toString() ?: ""
            }
            "{cursor_position}" -> ""
            else -> variableToken
        }
        onContentChanged(_uiState.value.content + value)
    }

    fun saveSnippet(onSaved: () -> Unit) {
        val content = _uiState.value.content
        if (content.isBlank()) return

        viewModelScope.launch {
            clipRepository.saveManualSnippet(
                id = _uiState.value.clipId,
                content = content,
                folderId = _uiState.value.folderId,
                isPinned = _uiState.value.isPinned,
                isLocked = _uiState.value.isLocked,
                isSelfDestruct = _uiState.value.isSelfDestruct
            )
            _uiState.update { it.copy(isDirty = false) }
            onSaved()
        }
    }

    fun copyContent(context: Context) {
        val cm = context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
        cm.setPrimaryClip(ClipData.newPlainText("snippet", _uiState.value.content))
        _uiState.update { it.copy(snackbarMessage = "Teks disalin") }
    }

    fun shareContent(context: Context) {
        val intent = Intent(Intent.ACTION_SEND).apply {
            type = "text/plain"
            putExtra(Intent.EXTRA_TEXT, _uiState.value.content)
        }
        context.startActivity(Intent.createChooser(intent, "Bagikan via"))
    }

    fun toggleVersionSheet(show: Boolean) {
        _uiState.update { it.copy(showVersionSheet = show) }
    }

    fun toggleSplitDialog(show: Boolean) {
        _uiState.update { it.copy(showSplitDialog = show) }
    }

    fun toggleDiffDialog(show: Boolean, version: ClipVersion? = null) {
        _uiState.update { it.copy(showDiffDialog = show, selectedVersionForDiff = version) }
    }

    fun restoreVersion(version: ClipVersion) {
        onContentChanged(version.content)
        _uiState.update { it.copy(showVersionSheet = false, snackbarMessage = "Versi dipulihkan") }
    }

    fun splitSnippet(delimiter: String, onComplete: () -> Unit) {
        val clipId = _uiState.value.clipId ?: return
        viewModelScope.launch {
            clipRepository.splitSnippet(clipId, delimiter)
            _uiState.update { it.copy(showSplitDialog = false) }
            onComplete()
        }
    }

    fun clearSnackbar() {
        _uiState.update { it.copy(snackbarMessage = null) }
    }
}
