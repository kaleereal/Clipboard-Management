package com.clipboard.management.data.entity

import androidx.room.Entity
import androidx.room.ForeignKey
import androidx.room.Index
import androidx.room.PrimaryKey
import java.util.UUID

@Entity(
    tableName = "clip_items",
    indices = [
        Index(value = ["contentHash"]),
        Index(value = ["createdAt"]),
        Index(value = ["isDeleted"]),
        Index(value = ["isPinned"]),
        Index(value = ["folderId"]),
        Index(value = ["sourceApp"]),
        Index(value = ["contentType"])
    ]
)
data class ClipItem(
    @PrimaryKey
    val id: String = UUID.randomUUID().toString(),
    val content: String,
    val plainContent: String,
    val richContent: String? = null,
    val contentType: String = "TEXT", // TEXT, URL, CODE, NUMBER
    val sourceApp: String = "com.clipboard.management",
    val createdAt: Long = System.currentTimeMillis(),
    val updatedAt: Long = System.currentTimeMillis(),
    val lastUsedAt: Long = System.currentTimeMillis(),
    val useCount: Int = 0,
    val isPinned: Boolean = false,
    val isLocked: Boolean = false,
    val isSensitive: Boolean = false,
    val isSelfDestruct: Boolean = false,
    val folderId: String? = null,
    val charCount: Int = content.length,
    val wordCount: Int = if (content.isBlank()) 0 else content.trim().split("\\s+".toRegex()).size,
    val lineCount: Int = if (content.isEmpty()) 0 else content.count { it == '\n' } + 1,
    val contentHash: String,
    val deletedAt: Long? = null,
    val isDeleted: Boolean = false
)

@Entity(
    tableName = "clip_versions",
    foreignKeys = [
        ForeignKey(
            entity = ClipItem::class,
            parentColumns = ["id"],
            childColumns = ["clipId"],
            onDelete = ForeignKey.CASCADE
        )
    ],
    indices = [Index(value = ["clipId"])]
)
data class ClipVersion(
    @PrimaryKey
    val id: String = UUID.randomUUID().toString(),
    val clipId: String,
    val content: String,
    val versionNumber: Int,
    val createdAt: Long = System.currentTimeMillis()
)

@Entity(tableName = "folders")
data class Folder(
    @PrimaryKey
    val id: String = UUID.randomUUID().toString(),
    val name: String,
    val parentId: String? = null,
    val icon: String = "folder",
    val color: String = "#6200EE",
    val isArchived: Boolean = false,
    val createdAt: Long = System.currentTimeMillis()
)

@Entity(tableName = "tags")
data class Tag(
    @PrimaryKey
    val id: String = UUID.randomUUID().toString(),
    val name: String,
    val parentId: String? = null,
    val color: String = "#03DAC6",
    val createdAt: Long = System.currentTimeMillis()
)

@Entity(
    tableName = "clip_tag_cross_ref",
    primaryKeys = ["clipId", "tagId"],
    indices = [Index(value = ["clipId"]), Index(value = ["tagId"])]
)
data class ClipTagCrossRef(
    val clipId: String,
    val tagId: String
)

@Entity(tableName = "smart_folders")
data class SmartFolder(
    @PrimaryKey
    val id: String = UUID.randomUUID().toString(),
    val name: String,
    val icon: String = "auto_awesome",
    val conditionsJson: String,
    val createdAt: Long = System.currentTimeMillis()
)

@Entity(tableName = "auto_tag_rules")
data class AutoTagRule(
    @PrimaryKey
    val id: String = UUID.randomUUID().toString(),
    val name: String,
    val pattern: String,
    val isRegex: Boolean = false,
    val targetTagId: String,
    val isEnabled: Boolean = true,
    val createdAt: Long = System.currentTimeMillis()
)

@Entity(tableName = "filter_presets")
data class FilterPreset(
    @PrimaryKey
    val id: String = UUID.randomUUID().toString(),
    val name: String,
    val queryText: String = "",
    val isRegex: Boolean = false,
    val filterJson: String,
    val createdAt: Long = System.currentTimeMillis()
)

@Entity(
    tableName = "usage_events",
    indices = [Index(value = ["timestamp"]), Index(value = ["sourceApp"])]
)
data class UsageEvent(
    @PrimaryKey
    val id: String = UUID.randomUUID().toString(),
    val clipId: String? = null,
    val eventType: String, // CAPTURE, COPY, PASTE
    val sourceApp: String,
    val timestamp: Long = System.currentTimeMillis()
)

@Entity(tableName = "url_metadata_cache")
data class UrlMetadataCache(
    @PrimaryKey
    val url: String,
    val title: String,
    val description: String,
    val fetchedAt: Long = System.currentTimeMillis()
)
