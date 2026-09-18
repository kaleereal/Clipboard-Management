package com.clipboard.management.service

import android.app.Notification
import android.app.PendingIntent
import android.app.Service
import android.content.ClipboardManager
import android.content.Context
import android.content.Intent
import android.os.Build
import android.os.IBinder
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager
import androidx.core.app.NotificationCompat
import com.clipboard.management.ClipboardApp
import com.clipboard.management.MainActivity
import com.clipboard.management.data.db.AppDatabase
import com.clipboard.management.data.pref.AppSettings
import com.clipboard.management.data.repository.ClipRepository
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.first

class ClipboardCaptureService : Service() {

    private val serviceScope = CoroutineScope(Dispatchers.IO + SupervisorJob())
    private lateinit var clipboardManager: ClipboardManager
    private lateinit var clipRepository: ClipRepository
    private lateinit var appSettings: AppSettings

    private val clipListener = ClipboardManager.OnPrimaryClipChangedListener {
        onClipboardChanged()
    }

    override fun onCreate() {
        super.onCreate()
        clipboardManager = getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
        val db = AppDatabase.getInstance(applicationContext)
        appSettings = AppSettings(applicationContext)
        clipRepository = ClipRepository(db.clipDao(), db.tagDao(), db.autoTagRuleDao(), appSettings)

        clipboardManager.addPrimaryClipChangedListener(clipListener)

        startForeground(NOTIFICATION_ID, createNotification("Penangkapan clipboard aktif"))
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        if (intent?.action == ACTION_TOGGLE_CAPTURE) {
            serviceScope.launch {
                val current = appSettings.captureEnabled.first()
                appSettings.setCaptureEnabled(!current)
            }
        }
        return START_STICKY
    }

    private fun onClipboardChanged() {
        serviceScope.launch {
            val isEnabled = appSettings.captureEnabled.first()
            if (!isEnabled) return@launch

            val isIncognito = appSettings.incognitoMode.first()
            if (isIncognito) return@launch

            val clipData = clipboardManager.primaryClip
            if (clipData != null && clipData.itemCount > 0) {
                val text = clipData.getItemAt(0).text?.toString() ?: ""
                if (text.isNotBlank()) {
                    val saved = clipRepository.saveCapturedText(text)
                    if (saved != null) {
                        triggerFeedback()
                        updateNotification("Item baru ditangkap: ${text.take(30)}...")
                    }
                }
            }
        }
    }

    private suspend fun triggerFeedback() {
        val haptic = appSettings.haptic.first()
        if (haptic) {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                val vibratorManager = getSystemService(Context.VIBRATOR_MANAGER_SERVICE) as VibratorManager
                vibratorManager.defaultVibrator.vibrate(VibrationEffect.createOneShot(50, VibrationEffect.DEFAULT_AMPLITUDE))
            } else {
                @Suppress("DEPRECATION")
                val vibrator = getSystemService(Context.VIBRATOR_SERVICE) as Vibrator
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    vibrator.vibrate(VibrationEffect.createOneShot(50, VibrationEffect.DEFAULT_AMPLITUDE))
                } else {
                    @Suppress("DEPRECATION")
                    vibrator.vibrate(50)
                }
            }
        }
    }

    private fun updateNotification(text: String) {
        val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as android.app.NotificationManager
        notificationManager.notify(NOTIFICATION_ID, createNotification(text))
    }

    private fun createNotification(contentText: String): Notification {
        val pendingIntent = PendingIntent.getActivity(
            this,
            0,
            Intent(this, MainActivity::class.java),
            PendingIntent.FLAG_IMMUTABLE
        )

        return NotificationCompat.Builder(this, ClipboardApp.CHANNEL_PERSISTENT)
            .setContentTitle("Clipboard Manager")
            .setContentText(contentText)
            .setSmallIcon(android.R.drawable.ic_menu_edit)
            .setContentIntent(pendingIntent)
            .setOngoing(true)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .build()
    }

    override fun onDestroy() {
        super.onDestroy()
        clipboardManager.removePrimaryClipChangedListener(clipListener)
        serviceScope.cancel()
    }

    override fun onBind(intent: Intent?): IBinder? = null

    companion object {
        const val NOTIFICATION_ID = 1001
        const val ACTION_TOGGLE_CAPTURE = "com.clipboard.management.TOGGLE_CAPTURE"
    }
}
