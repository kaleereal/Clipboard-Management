package com.clipboard.management.worker

import android.content.Context
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import com.clipboard.management.data.db.AppDatabase
import com.clipboard.management.data.pref.AppSettings
import kotlinx.coroutines.flow.first

class PurgeWorker(
    appContext: Context,
    workerParams: WorkerParameters
) : CoroutineWorker(appContext, workerParams) {

    override suspend fun doWork(): Result {
        val db = AppDatabase.getInstance(applicationContext)
        val clipDao = db.clipDao()
        val settings = AppSettings(applicationContext)

        val autoPurgeHours = settings.autoPurgeHours.first()
        if (autoPurgeHours > 0) {
            val cutoff = System.currentTimeMillis() - (autoPurgeHours * 3600 * 1000L)
            val oldClips = clipDao.getClipsOlderThan(cutoff)
            for (clip in oldClips) {
                clipDao.softDeleteClip(clip.id)
            }
        }

        val trashDays = settings.trashDays.first()
        if (trashDays > 0) {
            val trashCutoff = System.currentTimeMillis() - (trashDays * 86400 * 1000L)
            val expiredTrash = clipDao.getTrashOlderThan(trashCutoff)
            for (clip in expiredTrash) {
                clipDao.deletePermanently(clip.id)
            }
        }

        return Result.success()
    }
}
