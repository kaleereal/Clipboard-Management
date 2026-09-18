package com.clipboard.management.service

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.os.Build
import com.clipboard.management.data.pref.AppSettings
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch

class BootReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action == Intent.ACTION_BOOT_COMPLETED) {
            val pendingResult = goAsync()
            CoroutineScope(Dispatchers.IO).launch {
                try {
                    val settings = AppSettings(context.applicationContext)
                    val isEnabled = settings.captureEnabled.first()
                    if (isEnabled) {
                        val serviceIntent = Intent(context, ClipboardCaptureService::class.java)
                        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                            context.startForegroundService(serviceIntent)
                        } else {
                            context.startService(serviceIntent)
                        }
                    }
                } finally {
                    pendingResult.finish()
                }
            }
        }
    }
}
