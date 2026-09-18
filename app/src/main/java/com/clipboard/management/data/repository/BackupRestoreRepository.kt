package com.clipboard.management.data.repository

import android.content.Context
import com.clipboard.management.data.db.AppDatabase
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.json.JSONObject
import java.io.File
import java.io.FileInputStream
import java.io.FileOutputStream
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import java.util.zip.ZipEntry
import java.util.zip.ZipInputStream
import java.util.zip.ZipOutputStream

class BackupRestoreRepository(
    private val context: Context,
    private val database: AppDatabase
) {
    suspend fun createBackupFile(targetDir: File): File = withContext(Dispatchers.IO) {
        val timeStamp = SimpleDateFormat("yyyyMMdd-HHmm", Locale.getDefault()).format(Date())
        val backupName = "clipboard-backup-$timeStamp.clipbak"
        val outputFile = File(targetDir, backupName)

        val dbFile = context.getDatabasePath("clipboard_database.db")
        if (!dbFile.exists()) {
            throw IllegalStateException("Database file not found")
        }

        database.openHelper.writableDatabase.execSQL("PRAGMA wal_checkpoint(FULL);")

        ZipOutputStream(FileOutputStream(outputFile)).use { zos ->
            val metaJson = JSONObject().apply {
                put("version", 1)
                put("createdAt", System.currentTimeMillis())
                put("app", "com.clipboard.management")
            }.toString()

            zos.putNextEntry(ZipEntry("metadata.json"))
            zos.write(metaJson.toByteArray())
            zos.closeEntry()

            zos.putNextEntry(ZipEntry("clipboard.db"))
            FileInputStream(dbFile).use { fis -> fis.copyTo(zos) }
            zos.closeEntry()
        }

        outputFile
    }

    suspend fun restoreBackupFile(backupFile: File): Boolean = withContext(Dispatchers.IO) {
        if (!backupFile.exists()) return@withContext false

        var dbExtractedFile: File? = null

        ZipInputStream(FileInputStream(backupFile)).use { zis ->
            var entry = zis.nextEntry
            while (entry != null) {
                if (entry.name == "clipboard.db") {
                    val tempDb = File(context.cacheDir, "temp_restore.db")
                    FileOutputStream(tempDb).use { fos -> zis.copyTo(fos) }
                    dbExtractedFile = tempDb
                }
                entry = zis.nextEntry
            }
        }

        val tempDb = dbExtractedFile ?: return@withContext false

        database.close()

        val destDb = context.getDatabasePath("clipboard_database.db")
        tempDb.copyTo(destDb, overwrite = true)
        tempDb.delete()

        true
    }

    suspend fun optimizeDatabase(): Boolean = withContext(Dispatchers.IO) {
        try {
            val db = database.openHelper.writableDatabase
            db.execSQL("VACUUM;")
            db.execSQL("REINDEX;")
            true
        } catch (e: Exception) {
            false
        }
    }

    suspend fun checkAndRepairDatabase(): String = withContext(Dispatchers.IO) {
        try {
            val db = database.openHelper.writableDatabase
            val cursor = db.query("PRAGMA integrity_check;")
            var result = "ok"
            if (cursor.moveToFirst()) {
                result = cursor.getString(0)
            }
            cursor.close()

            if (result.equals("ok", ignoreCase = true)) {
                "Database sehat"
            } else {
                db.execSQL("PRAGMA wal_checkpoint(FULL);")
                "Database diperbaiki"
            }
        } catch (e: Exception) {
            "Gagal memperbaiki database"
        }
    }
}
