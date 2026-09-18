package com.clipboard.management.service

import android.os.Build
import android.service.quicksettings.Tile
import android.service.quicksettings.TileService
import androidx.annotation.RequiresApi
import com.clipboard.management.data.pref.AppSettings
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.first

@RequiresApi(Build.VERSION_CODES.N)
class QuickSettingsTileService : TileService() {

    private val serviceScope = CoroutineScope(Dispatchers.IO + SupervisorJob())

    override fun onTileAdded() {
        super.onTileAdded()
        updateTileState()
    }

    override fun onStartListening() {
        super.onStartListening()
        updateTileState()
    }

    override fun onClick() {
        super.onClick()
        serviceScope.launch {
            val settings = AppSettings(applicationContext)
            val isEnabled = settings.captureEnabled.first()
            settings.setCaptureEnabled(!isEnabled)

            withContext(Dispatchers.Main) {
                updateTileState()
            }
        }
    }

    private fun updateTileState() {
        val tile = qsTile ?: return
        serviceScope.launch {
            val settings = AppSettings(applicationContext)
            val isEnabled = settings.captureEnabled.first()

            withContext(Dispatchers.Main) {
                tile.state = if (isEnabled) Tile.STATE_ACTIVE else Tile.STATE_INACTIVE
                tile.label = "Clipboard"
                tile.updateTile()
            }
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        serviceScope.cancel()
    }
}
