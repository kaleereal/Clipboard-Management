package com.clipboard.management.data.repository

import com.clipboard.management.data.dao.*
import com.clipboard.management.data.entity.*
import com.clipboard.management.data.pref.AppSettings
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.first
import java.security.MessageDigest

class ClipRepository(
    private val clipDao: ClipDao,
    private val tagDao: TagDao,
    private val autoTagRuleDao: AutoTagRuleDao,
    private val appSettings: AppSettings
) {
    val allClips: Flow<List<ClipItem>> = clipDao.getAllClips()
    val pinnedClips: Flow<List<ClipItem>> = clipDao.getPinnedClips()
    val frequentClips: Flow<List<ClipItem>> = clipDao.getFrequentClips()
    val trashClips: Flow<List<ClipItem>> = clipDao.getTrashClips()
    val orphanClips: Flow<List<ClipItem>> = clipDao.getOrphanClips()
    val orphanCount: Flow<Int> = clipDao.getOrphanCount()

    suspend fun getClipById(id: String): ClipItem? = clipDao.getClipById(id)

    suspend fun saveCapturedText(
        text: String,
        sourceApp: String = "com.clipboard.management",
        richText: String? = null
    ): ClipItem? {
        if (text.isBlank()) return null
        if (appSettings.incognitoMode.first()) return null

        val isCaptureEnabled = appSettings.captureEnabled.first()
        if (!isCaptureEnabled) return null

        val whitelist = appSettings.appWhitelist.first()
        val blacklist = appSettings.appBlacklist.first()

        if (whitelist.isNotEmpty() && !whitelist.contains(sourceApp)) return null
        if (blacklist.contains(sourceApp)) return null

        val plain = text.trim()
        val hash = hashString(plain)

        val existing = clipDao.getClipByHash(hash)
        val dedupMode = appSettings.dedupMode.first()

        if (existing != null) {
            if (dedupMode == "IGNORE") {
                return existing
            } else {
                val updated = existing.copy(
                    updatedAt = System.currentTimeMillis(),
                    createdAt = System.currentTimeMillis()
                )
                clipDao.updateClip(updated)
                return updated
            }
        }

        val contentType = detectContentType(plain)
        val isSensitive = detectSensitive(plain)

        val newItem = ClipItem(
            content = text,
            plainContent = plain,
            richContent = richText,
            contentType = contentType,
            sourceApp = sourceApp,
            isSensitive = isSensitive,
            contentHash = hash
        )

        clipDao.insertClip(newItem)

        applyAutoTagging(newItem)

        val maxItems = appSettings.maxItems.first()
        if (maxItems > 0) {
            val count = clipDao.getActiveClipCount()
            if (count > maxItems) {
                val oldestToPurge = clipDao.getOldestUnpinnedClips(count - maxItems)
                for (item in oldestToPurge) {
                    clipDao.softDeleteClip(item.id)
                }
            }
        }

        return newItem
    }

    suspend fun saveManualSnippet(
        id: String?,
        content: String,
        folderId: String? = null,
        isPinned: Boolean = false,
        isLocked: Boolean = false,
        isSelfDestruct: Boolean = false
    ): ClipItem {
        val plain = content.trim()
        val hash = hashString(plain)
        val contentType = detectContentType(plain)
        val isSensitive = detectSensitive(plain)

        if (id.isNullOrBlank()) {
            val newItem = ClipItem(
                content = content,
                plainContent = plain,
                contentType = contentType,
                folderId = folderId,
                isPinned = isPinned,
                isLocked = isLocked,
                isSensitive = isSensitive,
                isSelfDestruct = isSelfDestruct,
                contentHash = hash
            )
            clipDao.insertClip(newItem)
            applyAutoTagging(newItem)
            return newItem
        } else {
            val existing = clipDao.getClipById(id)
            val versionNum = (existing?.useCount ?: 0) + 1
            if (existing != null) {
                val version = ClipVersion(
                    clipId = existing.id,
                    content = existing.content,
                    versionNumber = versionNum
                )
                clipDao.insertVersion(version)
                clipDao.pruneVersions(existing.id)

                val updated = existing.copy(
                    content = content,
                    plainContent = plain,
                    contentType = contentType,
                    folderId = folderId,
                    isPinned = isPinned,
                    isLocked = isLocked,
                    isSensitive = isSensitive,
                    isSelfDestruct = isSelfDestruct,
                    contentHash = hash,
                    updatedAt = System.currentTimeMillis()
                )
                clipDao.updateClip(updated)
                return updated
            } else {
                val newItem = ClipItem(
                    id = id,
                    content = content,
                    plainContent = plain,
                    contentType = contentType,
                    folderId = folderId,
                    isPinned = isPinned,
                    isLocked = isLocked,
                    isSensitive = isSensitive,
                    isSelfDestruct = isSelfDestruct,
                    contentHash = hash
                )
                clipDao.insertClip(newItem)
                return newItem
            }
        }
    }

    suspend fun recordCopy(clip: ClipItem) {
        val updated = clip.copy(
            useCount = clip.useCount + 1,
            lastUsedAt = System.currentTimeMillis()
        )
        clipDao.updateClip(updated)

        if (clip.isSelfDestruct) {
            clipDao.softDeleteClip(clip.id)
        }
    }

    suspend fun togglePin(clipId: String) {
        val clip = clipDao.getClipById(clipId) ?: return
        clipDao.updateClip(clip.copy(isPinned = !clip.isPinned))
    }

    suspend fun moveClipToFolder(clipId: String, folderId: String?) {
        val clip = clipDao.getClipById(clipId) ?: return
        clipDao.updateClip(clip.copy(folderId = folderId))
    }

    suspend fun softDelete(clipId: String) {
        clipDao.softDeleteClip(clipId)
    }

    suspend fun restoreClip(clipId: String) {
        clipDao.restoreClip(clipId)
    }

    suspend fun deletePermanently(clipId: String) {
        clipDao.deletePermanently(clipId)
    }

    suspend fun emptyTrash() {
        clipDao.emptyTrash()
    }

    suspend fun splitSnippet(clipId: String, delimiter: String): List<ClipItem> {
        val original = clipDao.getClipById(clipId) ?: return emptyList()
        val parts = if (delimiter == "\n\n") {
            original.content.split("\n\n")
        } else if (delimiter == "\n") {
            original.content.split("\n")
        } else if (delimiter == ",") {
            original.content.split(",")
        } else {
            original.content.split(delimiter)
        }.map { it.trim() }.filter { it.isNotEmpty() }

        if (parts.size <= 1) return emptyList()

        val createdItems = mutableListOf<ClipItem>()
        for (part in parts) {
            val item = saveManualSnippet(null, part, folderId = original.folderId)
            createdItems.add(item)
        }

        softDelete(clipId)
        return createdItems
    }

    suspend fun mergeSnippets(clipIds: List<String>, delimiter: String): ClipItem? {
        val items = clipIds.mapNotNull { clipDao.getClipById(it) }
        if (items.isEmpty()) return null

        val sep = when (delimiter) {
            "BARIS_BARU" -> "\n"
            "SPASI" -> " "
            "KOMA" -> ", "
            else -> delimiter
        }

        val mergedContent = items.joinToString(sep) { it.content }
        return saveManualSnippet(null, mergedContent, folderId = items.first().folderId)
    }

    private suspend fun applyAutoTagging(item: ClipItem) {
        val rules = autoTagRuleDao.getAllRules().first()
        for (rule in rules) {
            if (!rule.isEnabled) continue
            val matches = if (rule.isRegex) {
                runCatching { Regex(rule.pattern).containsMatchIn(item.plainContent) }.getOrDefault(false)
            } else {
                item.plainContent.contains(rule.pattern, ignoreCase = true)
            }
            if (matches) {
                tagDao.addClipTag(ClipTagCrossRef(item.id, rule.targetTagId))
            }
        }
    }

    fun getVersionsForClip(clipId: String): Flow<List<ClipVersion>> = clipDao.getVersionsForClip(clipId)

    suspend fun restoreVersion(clipId: String, versionContent: String) {
        saveManualSnippet(clipId, versionContent)
    }

    companion object {
        fun hashString(input: String): String {
            val bytes = MessageDigest.getInstance("SHA-256").digest(input.toByteArray())
            return bytes.joinToString("") { "%02x".format(it) }
        }

        fun detectContentType(text: String): String {
            val trimmed = text.trim()
            if (trimmed.startsWith("http://", ignoreCase = true) || trimmed.startsWith("https://", ignoreCase = true)) {
                return "URL"
            }
            if (trimmed.matches("^-?\\d+(\\.\\d+)?$".toRegex())) {
                return "NUMBER"
            }
            if (trimmed.contains("{") && trimmed.contains("}") ||
                trimmed.contains("<") && trimmed.contains(">") ||
                trimmed.contains("function") || trimmed.contains("const ") ||
                trimmed.contains("val ") || trimmed.contains("var ") ||
                trimmed.contains("SELECT ") || trimmed.contains("class ")
            ) {
                return "CODE"
            }
            return "TEXT"
        }

        fun detectSensitive(text: String): Boolean {
            if (text.matches(".*\\b(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13})\\b.*".toRegex())) {
                return true
            }
            if (text.contains("bearer ", ignoreCase = true) || text.contains("api_key", ignoreCase = true) || text.contains("secret", ignoreCase = true)) {
                return true
            }
            return false
        }
    }
}
