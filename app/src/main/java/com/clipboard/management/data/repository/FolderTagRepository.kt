package com.clipboard.management.data.repository

import com.clipboard.management.data.dao.*
import com.clipboard.management.data.entity.*
import kotlinx.coroutines.flow.Flow

class FolderTagRepository(
    private val folderDao: FolderDao,
    private val tagDao: TagDao,
    private val smartFolderDao: SmartFolderDao,
    private val autoTagRuleDao: AutoTagRuleDao
) {
    val allFolders: Flow<List<Folder>> = folderDao.getAllFolders()
    val allTags: Flow<List<Tag>> = tagDao.getAllTags()
    val allSmartFolders: Flow<List<SmartFolder>> = smartFolderDao.getAllSmartFolders()
    val allRules: Flow<List<AutoTagRule>> = autoTagRuleDao.getAllRules()
    val allClipTagCrossRefs: Flow<List<ClipTagCrossRef>> = tagDao.getAllClipTagCrossRefs()

    suspend fun insertFolder(folder: Folder) = folderDao.insertFolder(folder)
    suspend fun updateFolder(folder: Folder) = folderDao.updateFolder(folder)
    suspend fun deleteFolder(id: String) = folderDao.deleteFolder(id)

    suspend fun insertTag(tag: Tag) = tagDao.insertTag(tag)
    suspend fun updateTag(tag: Tag) = tagDao.updateTag(tag)
    suspend fun deleteTag(id: String) = tagDao.deleteTag(id)

    suspend fun addClipTag(clipId: String, tagId: String) = tagDao.addClipTag(ClipTagCrossRef(clipId, tagId))
    suspend fun removeClipTag(clipId: String, tagId: String) = tagDao.removeClipTag(clipId, tagId)
    fun getTagIdsForClip(clipId: String): Flow<List<String>> = tagDao.getTagIdsForClip(clipId)

    suspend fun mergeTags(targetTagId: String, sourceTagIds: List<String>) {
        for (sourceId in sourceTagIds) {
            tagDao.deleteTag(sourceId)
        }
    }

    suspend fun insertSmartFolder(smartFolder: SmartFolder) = smartFolderDao.insertSmartFolder(smartFolder)
    suspend fun deleteSmartFolder(id: String) = smartFolderDao.deleteSmartFolder(id)

    suspend fun insertRule(rule: AutoTagRule) = autoTagRuleDao.insertRule(rule)
    suspend fun deleteRule(id: String) = autoTagRuleDao.deleteRule(id)
}
