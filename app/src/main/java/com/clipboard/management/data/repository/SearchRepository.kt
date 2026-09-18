package com.clipboard.management.data.repository

import com.clipboard.management.data.dao.ClipDao
import com.clipboard.management.data.dao.FilterPresetDao
import com.clipboard.management.data.entity.ClipItem
import com.clipboard.management.data.entity.FilterPreset
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

data class AdvancedSearchFilter(
    val query: String = "",
    val isRegex: Boolean = false,
    val contentType: String? = null,
    val sourceApp: String? = null,
    val folderId: String? = null,
    val tagIds: List<String> = emptyList(),
    val tagLogic: String = "AND",
    val minLength: Int? = null,
    val maxLength: Int? = null,
    val includeArchived: Boolean = false
)

class SearchRepository(
    private val clipDao: ClipDao,
    private val filterPresetDao: FilterPresetDao
) {
    val presets: Flow<List<FilterPreset>> = filterPresetDao.getAllPresets()

    fun searchClips(filter: AdvancedSearchFilter): Flow<List<ClipItem>> {
        return clipDao.getAllClips().map { list ->
            list.filter { item ->
                val textMatch = if (filter.query.isBlank()) {
                    true
                } else if (filter.isRegex) {
                    runCatching { Regex(filter.query).containsMatchIn(item.content) }.getOrDefault(false)
                } else {
                    item.content.contains(filter.query, ignoreCase = true)
                }

                if (!textMatch) return@filter false

                if (filter.contentType != null && filter.contentType != "ALL" && item.contentType != filter.contentType) {
                    return@filter false
                }

                if (filter.sourceApp != null && item.sourceApp != filter.sourceApp) {
                    return@filter false
                }

                if (filter.folderId != null && item.folderId != filter.folderId) {
                    return@filter false
                }

                if (filter.minLength != null && item.charCount < filter.minLength) return@filter false
                if (filter.maxLength != null && item.charCount > filter.maxLength) return@filter false

                true
            }
        }
    }

    suspend fun savePreset(preset: FilterPreset) = filterPresetDao.insertPreset(preset)
    suspend fun deletePreset(id: String) = filterPresetDao.deletePreset(id)
}
