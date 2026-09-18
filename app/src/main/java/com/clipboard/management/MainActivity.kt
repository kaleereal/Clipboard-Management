package com.clipboard.management

import android.content.Intent
import android.os.Build
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.viewModels
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import com.clipboard.management.service.ClipboardCaptureService
import com.clipboard.management.ui.analytics.AnalyticsViewModel
import com.clipboard.management.ui.editor.EditorViewModel
import com.clipboard.management.ui.folder.FolderTagViewModel
import com.clipboard.management.ui.home.HomeViewModel
import com.clipboard.management.ui.navigation.AppNavigation
import com.clipboard.management.ui.search.SearchViewModel
import com.clipboard.management.ui.security.SecurityViewModel
import com.clipboard.management.ui.settings.SettingsViewModel
import com.clipboard.management.ui.theme.ClipboardTheme
import com.clipboard.management.ui.tools.TextToolsViewModel

class MainActivity : ComponentActivity() {

    private val homeViewModel: HomeViewModel by viewModels()
    private val editorViewModel: EditorViewModel by viewModels()
    private val folderTagViewModel: FolderTagViewModel by viewModels()
    private val searchViewModel: SearchViewModel by viewModels()
    private val textToolsViewModel: TextToolsViewModel by viewModels()
    private val securityViewModel: SecurityViewModel by viewModels()
    private val analyticsViewModel: AnalyticsViewModel by viewModels()
    private val settingsViewModel: SettingsViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        startCaptureService()

        setContent {
            val settingsState by settingsViewModel.uiState.collectAsState()

            ClipboardTheme(themeSetting = settingsState.theme) {
                AppNavigation(
                    homeViewModel = homeViewModel,
                    editorViewModel = editorViewModel,
                    folderTagViewModel = folderTagViewModel,
                    searchViewModel = searchViewModel,
                    textToolsViewModel = textToolsViewModel,
                    securityViewModel = securityViewModel,
                    analyticsViewModel = analyticsViewModel,
                    settingsViewModel = settingsViewModel
                )
            }
        }
    }

    private fun startCaptureService() {
        val intent = Intent(this, ClipboardCaptureService::class.java)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            startForegroundService(intent)
        } else {
            startService(intent)
        }
    }
}
