package com.clipboard.management

import android.app.Application
import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Context
import android.os.Build

class ClipboardApp : Application() {

    override fun onCreate() {
        super.onCreate()
        createNotificationChannels()
    }

    private fun createNotificationChannels() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val persistentChannel = NotificationChannel(
                CHANNEL_PERSISTENT,
                "Layanan Penangkapan Clipboard",
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "Notifikasi persisten untuk penangkapan clipboard dan riwayat cepat"
            }

            val eventsChannel = NotificationChannel(
                CHANNEL_EVENTS,
                "Kejadian Clipboard",
                NotificationManager.IMPORTANCE_DEFAULT
            ).apply {
                description = "Notifikasi kejadian seperti tag otomatis dan pembersihan data"
            }

            val maintenanceChannel = NotificationChannel(
                CHANNEL_MAINTENANCE,
                "Pemeliharaan & Cadangan",
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "Notifikasi pemeliharaan database dan cadangan otomatis"
            }

            val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            notificationManager.createNotificationChannels(
                listOf(persistentChannel, eventsChannel, maintenanceChannel)
            )
        }
    }

    companion object {
        const val CHANNEL_PERSISTENT = "capture_persistent"
        const val CHANNEL_EVENTS = "events"
        const val CHANNEL_MAINTENANCE = "maintenance"
    }
}
