package com.clipboard.management.data.dao

import androidx.room.*
import com.clipboard.management.data.entity.*
import kotlinx.coroutines.flow.Flow

@Dao
interface ClipDao {
    @Query("SELECT * FROM clip_items WHERE isDeleted = 0 ORDER BY isPinned DESC, createdAt DESC")
    fun getAllClips(): Flow<List<ClipItem>>

    @Query("SELECT * FROM clip_items WHERE isDeleted = 0 AND isPinned = 1 ORDER BY createdAt DESC")
    fun getPinnedClips(): Flow<List<ClipItem>>

    @Query("SELECT * FROM clip_items WHERE isDeleted = 0 AND useCount > 0 ORDER BY useCount DESC LIMIT 50")
    fun getFrequentClips(): Flow<List<ClipItem>>

    @Query("SELECT * FROM clip_items WHERE isDeleted = 1 ORDER BY deletedAt DESC")
    fun getTrashClips(): Flow<List<ClipItem>>

    @Query("SELECT * FROM clip_items WHERE id = :id")
    suspend fun getClipById(id: String): ClipItem?

    @Query("SELECT * FROM clip_items WHERE contentHash = :hash AND isDeleted = 0 LIMIT 1")
    suspend fun getClipByHash(hash: String): ClipItem?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertClip(clip: ClipItem)

    @Update
    suspend fun updateClip(clip: ClipItem)

    @Query("UPDATE clip_items SET isDeleted = 1, deletedAt = :timestamp WHERE id = :id")
    suspend fun softDeleteClip(id: String, timestamp: Long = System.currentTimeMillis())

    @Query("UPDATE clip_items SET isDeleted = 0, deletedAt = NULL WHERE id = :id")
    suspend fun restoreClip(id: String)

    @Query("DELETE FROM clip_items WHERE id = :id")
    suspend fun deletePermanently(id: String)

    @Query("DELETE FROM clip_items WHERE isDeleted = 1")
    suspend fun emptyTrash()

    @Query("SELECT * FROM clip_items WHERE isDeleted = 0 AND folderId = :folderId")
    fun getClipsByFolder(folderId: String): Flow<List<ClipItem>>

    @Query("""
        SELECT c.* FROM clip_items c
        INNER JOIN clip_tag_cross_ref ref ON c.id = ref.clipId
        WHERE c.isDeleted = 0 AND ref.tagId = :tagId
    """)
    fun getClipsByTag(tagId: String): Flow<List<ClipItem>>

    @Query("SELECT * FROM clip_items WHERE isDeleted = 0 AND (folderId IS NULL OR folderId = '')")
    fun getOrphanClips(): Flow<List<ClipItem>>

    @Query("SELECT COUNT(*) FROM clip_items WHERE isDeleted = 0 AND (folderId IS NULL OR folderId = '')")
    fun getOrphanCount(): Flow<Int>

    // Retention queries
    @Query("""
        SELECT * FROM clip_items
        WHERE isDeleted = 0 AND isPinned = 0 AND isLocked = 0
        AND createdAt < :cutoffTime
    """)
    suspend fun getClipsOlderThan(cutoffTime: Long): List<ClipItem>

    @Query("""
        SELECT * FROM clip_items
        WHERE isDeleted = 0 AND isPinned = 0 AND isLocked = 0
        ORDER BY createdAt ASC
        LIMIT :limit
    """)
    suspend fun getOldestUnpinnedClips(limit: Int): List<ClipItem>

    @Query("SELECT COUNT(*) FROM clip_items WHERE isDeleted = 0")
    suspend fun getActiveClipCount(): Int

    @Query("SELECT * FROM clip_versions WHERE clipId = :clipId ORDER BY versionNumber DESC")
    fun getVersionsForClip(clipId: String): Flow<List<ClipVersion>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertVersion(version: ClipVersion)

    @Query("DELETE FROM clip_versions WHERE clipId = :clipId AND id NOT IN (SELECT id FROM clip_versions WHERE clipId = :clipId ORDER BY versionNumber DESC LIMIT :keepLimit)")
    suspend fun pruneVersions(clipId: String, keepLimit: Int = 20)

    @Query("SELECT * FROM clip_items WHERE isDeleted = 1 AND deletedAt < :cutoffTime")
    suspend fun getTrashOlderThan(cutoffTime: Long): List<ClipItem>
}

@Dao
interface FolderDao {
    @Query("SELECT * FROM folders ORDER BY name ASC")
    fun getAllFolders(): Flow<List<Folder>>

    @Query("SELECT * FROM folders WHERE id = :id")
    suspend fun getFolderById(id: String): Folder?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertFolder(folder: Folder)

    @Update
    suspend fun updateFolder(folder: Folder)

    @Query("DELETE FROM folders WHERE id = :id")
    suspend fun deleteFolder(id: String)
}

@Dao
interface TagDao {
    @Query("SELECT * FROM tags ORDER BY name ASC")
    fun getAllTags(): Flow<List<Tag>>

    @Query("SELECT * FROM tags WHERE id = :id")
    suspend fun getTagById(id: String): Tag?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertTag(tag: Tag)

    @Update
    suspend fun updateTag(tag: Tag)

    @Query("DELETE FROM tags WHERE id = :id")
    suspend fun deleteTag(id: String)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun addClipTag(crossRef: ClipTagCrossRef)

    @Query("DELETE FROM clip_tag_cross_ref WHERE clipId = :clipId AND tagId = :tagId")
    suspend fun removeClipTag(clipId: String, tagId: String)

    @Query("SELECT tagId FROM clip_tag_cross_ref WHERE clipId = :clipId")
    fun getTagIdsForClip(clipId: String): Flow<List<String>>

    @Query("SELECT * FROM clip_tag_cross_ref")
    fun getAllClipTagCrossRefs(): Flow<List<ClipTagCrossRef>>
}

@Dao
interface SmartFolderDao {
    @Query("SELECT * FROM smart_folders ORDER BY name ASC")
    fun getAllSmartFolders(): Flow<List<SmartFolder>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertSmartFolder(smartFolder: SmartFolder)

    @Query("DELETE FROM smart_folders WHERE id = :id")
    suspend fun deleteSmartFolder(id: String)
}

@Dao
interface AutoTagRuleDao {
    @Query("SELECT * FROM auto_tag_rules ORDER BY name ASC")
    fun getAllRules(): Flow<List<AutoTagRule>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertRule(rule: AutoTagRule)

    @Query("DELETE FROM auto_tag_rules WHERE id = :id")
    suspend fun deleteRule(id: String)
}

@Dao
interface FilterPresetDao {
    @Query("SELECT * FROM filter_presets ORDER BY name ASC")
    fun getAllPresets(): Flow<List<FilterPreset>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertPreset(preset: FilterPreset)

    @Query("DELETE FROM filter_presets WHERE id = :id")
    suspend fun deletePreset(id: String)
}

@Dao
interface UsageEventDao {
    @Query("SELECT * FROM usage_events WHERE timestamp >= :startTime ORDER BY timestamp DESC")
    fun getEventsSince(startTime: Long): Flow<List<UsageEvent>>

    @Query("SELECT * FROM usage_events ORDER BY timestamp DESC")
    fun getAllEvents(): Flow<List<UsageEvent>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertEvent(event: UsageEvent)

    @Query("DELETE FROM usage_events")
    suspend fun clearAllEvents()
}

@Dao
interface UrlMetadataDao {
    @Query("SELECT * FROM url_metadata_cache WHERE url = :url")
    suspend fun getMetadata(url: String): UrlMetadataCache?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertMetadata(metadata: UrlMetadataCache)
}
