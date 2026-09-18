package com.clipboard.management.worker

import android.content.Context
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import com.clipboard.management.data.db.AppDatabase
import com.clipboard.management.data.repository.BackupRestoreRepository

class AutoMaintenanceWorker(
    appContext: Context,
    workerParams: WorkerParameters
) : CoroutineWorker(appContext, workerParams) {

    override suspend fun doWork(): Result {
        val db = AppDatabase.getInstance(applicationContext)
        val repo = BackupRestoreRepository(applicationContext, db)

        val success = repo.optimizeDatabase()
        return if (success) Result.success() else Result.failure()
    }
}
