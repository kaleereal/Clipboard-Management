package com.clipboard.management.data.repository

import com.clipboard.management.data.dao.ClipDao
import com.clipboard.management.data.dao.TagDao
import com.clipboard.management.data.dao.UsageEventDao
import com.clipboard.management.data.entity.UsageEvent
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

data class AppUsageStat(val packageName: String, val count: Int)
data class TagUsageStat(val tagId: String, val tagName: String, val count: Int)

class AnalyticsRepository(
    private val usageEventDao: UsageEventDao,
    private val clipDao: ClipDao,
    private val tagDao: TagDao
) {
    fun getEventsSince(startTime: Long): Flow<List<UsageEvent>> = usageEventDao.getEventsSince(startTime)

    suspend fun recordEvent(clipId: String?, eventType: String, sourceApp: String) {
        usageEventDao.insertEvent(
            UsageEvent(
                clipId = clipId,
                eventType = eventType,
                sourceApp = sourceApp
            )
        )
    }

    suspend fun clearStats() {
        usageEventDao.clearAllEvents()
    }

    fun getTopSourceApps(startTime: Long): Flow<List<AppUsageStat>> {
        return usageEventDao.getEventsSince(startTime).map { events ->
            events.groupBy { it.sourceApp }
                .map { (app, list) -> AppUsageStat(app, list.size) }
                .sortedByDescending { it.count }
                .take(10)
        }
    }
}
