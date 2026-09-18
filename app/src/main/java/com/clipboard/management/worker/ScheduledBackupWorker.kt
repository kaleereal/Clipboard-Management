package com.clipboard.management.worker

import android.content.Context
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import com.clipboard.management.data.db.AppDatabase
import com.clipboard.management.data.repository.BackupRestoreRepository
import java.io.File

class ScheduledBackupWorker(
    appContext: Context,
    workerParams: WorkerParameters
) : CoroutineWorker(appContext, workerParams) {

    override suspend fun doWork(): Result {
        val db = AppDatabase.getInstance(applicationContext)
        val repo = BackupRestoreRepository(applicationContext, db)

        return try {
            val backupDir = File(applicationContext.filesDir, "backups")
            if (!backupDir.exists()) backupDir.mkdirs()
            repo.createBackupFile(backupDir)
            Result.success()
        } catch (e: Exception) {
            Result.retry()
        }
    }
}
