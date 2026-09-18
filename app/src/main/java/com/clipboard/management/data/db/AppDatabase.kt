package com.clipboard.management.data.db

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import com.clipboard.management.data.dao.*
import com.clipboard.management.data.entity.*

@Database(
    entities = [
        ClipItem::class,
        ClipVersion::class,
        Folder::class,
        Tag::class,
        ClipTagCrossRef::class,
        SmartFolder::class,
        AutoTagRule::class,
        FilterPreset::class,
        UsageEvent::class,
        UrlMetadataCache::class
    ],
    version = 1,
    exportSchema = false
)
abstract class AppDatabase : RoomDatabase() {

    abstract fun clipDao(): ClipDao
    abstract fun folderDao(): FolderDao
    abstract fun tagDao(): TagDao
    abstract fun smartFolderDao(): SmartFolderDao
    abstract fun autoTagRuleDao(): AutoTagRuleDao
    abstract fun filterPresetDao(): FilterPresetDao
    abstract fun usageEventDao(): UsageEventDao
    abstract fun urlMetadataDao(): UrlMetadataDao

    companion object {
        @Volatile
        private var INSTANCE: AppDatabase? = null

        fun getInstance(context: Context): AppDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    AppDatabase::class.java,
                    "clipboard_database.db"
                )
                .fallbackToDestructiveMigration()
                .build()
                INSTANCE = instance
                instance
            }
        }
    }
}
