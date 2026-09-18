package com.clipboard.management.ui.tools

import android.app.Application
import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.clipboard.management.data.db.AppDatabase
import com.clipboard.management.data.pref.AppSettings
import com.clipboard.management.data.repository.ClipRepository
import com.clipboard.management.data.repository.TextToolsRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

data class TextToolsUiState(
    val input: String = "",
    val activeTab: Int = 0, // 0: Bersihkan, 1: Huruf, 2: Kode, 3: Ekstrak, 4: Tumpuk & Antrean, 5: Lorem Ipsum
    val result: String = "",
    val removeExcessLines: Boolean = true,
    val trimSpaces: Boolean = true,
    val removeTabs: Boolean = true,
    val removeDoubleSpaces: Boolean = true,
    val extractPhone: Boolean = true,
    val extractEmail: Boolean = true,
    val extractUrl: Boolean = true,
    val extractIp: Boolean = true,
    val extractedItems: List<String> = emptyList(),
    val loremCount: Int = 3,
    val loremUnit: String = "PARAGRAF",
    val queueIndex: Int = 0,
    val queueItems: List<String> = emptyList(),
    val snackbarMessage: String? = null
)

class TextToolsViewModel(application: Application) : AndroidViewModel(application) {

    private val db = AppDatabase.getInstance(application)
    private val repo = TextToolsRepository(db.urlMetadataDao())
    private val clipRepo = ClipRepository(db.clipDao(), db.tagDao(), db.autoTagRuleDao(), AppSettings(application))

    private val _uiState = MutableStateFlow(TextToolsUiState())
    val uiState: StateFlow<TextToolsUiState> = _uiState.asStateFlow()

    fun setInput(text: String) {
        _uiState.update { it.copy(input = text) }
        recalculate()
    }

    fun setTab(index: Int) {
        _uiState.update { it.copy(activeTab = index) }
        recalculate()
    }

    fun toggleCleanOption(option: String) {
        _uiState.update { state ->
            when (option) {
                "EXCESS_LINES" -> state.copy(removeExcessLines = !state.removeExcessLines)
                "TRIM" -> state.copy(trimSpaces = !state.trimSpaces)
                "TABS" -> state.copy(removeTabs = !state.removeTabs)
                "DOUBLE_SPACES" -> state.copy(removeDoubleSpaces = !state.removeDoubleSpaces)
                else -> state
            }
        }
        recalculate()
    }

    fun applyCase(targetCase: String) {
        val converted = repo.convertCase(_uiState.value.input, targetCase)
        _uiState.update { it.copy(result = converted) }
    }

    fun applyCodeFormat(lang: String, mode: String) {
        val formatted = repo.formatCode(_uiState.value.input, lang, mode)
        _uiState.update { it.copy(result = formatted) }
    }

    fun generateLorem() {
        val state = _uiState.value
        val lorem = repo.generateLorem(state.loremCount, state.loremUnit)
        _uiState.update { it.copy(result = lorem) }
    }

    fun updateLoremCount(count: Int) {
        _uiState.update { it.copy(loremCount = count.coerceAtLeast(1)) }
    }

    fun updateLoremUnit(unit: String) {
        _uiState.update { it.copy(loremUnit = unit) }
    }

    private fun recalculate() {
        val state = _uiState.value
        when (state.activeTab) {
            0 -> {
                val cleaned = repo.cleanText(
                    state.input,
                    state.removeExcessLines,
                    state.trimSpaces,
                    state.removeTabs,
                    state.removeDoubleSpaces
                )
                _uiState.update { it.copy(result = cleaned) }
            }
            3 -> {
                val extracted = repo.extractData(
                    state.input,
                    state.extractPhone,
                    state.extractEmail,
                    state.extractUrl,
                    state.extractIp
                )
                _uiState.update { it.copy(extractedItems = extracted, result = extracted.joinToString("\n")) }
            }
        }
    }

    fun pasteFromClipboard(context: Context) {
        val cm = context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
        val text = cm.primaryClip?.getItemAt(0)?.text?.toString() ?: ""
        setInput(text)
    }

    fun copyResult(context: Context) {
        val cm = context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
        cm.setPrimaryClip(ClipData.newPlainText("tools_result", _uiState.value.result))
        _uiState.update { it.copy(snackbarMessage = "Hasil disalin") }
    }

    fun saveAsSnippet(onSaved: (String) -> Unit) {
        val res = _uiState.value.result
        if (res.isBlank()) return
        viewModelScope.launch {
            val saved = clipRepo.saveManualSnippet(null, res)
            onSaved(saved.id)
        }
    }

    fun replaceInputWithResult() {
        setInput(_uiState.value.result)
    }

    fun clearSnackbar() {
        _uiState.update { it.copy(snackbarMessage = null) }
    }
}
