package com.clipboard.management.ui.settings

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.clipboard.management.R

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SettingsScreen(
    viewModel: SettingsViewModel,
    onNavigateToSecurity: () -> Unit
) {
    val uiState by viewModel.uiState.collectAsState()

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(stringResource(R.string.title_settings)) }
            )
        }
    ) { innerPadding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
        ) {
            item {
                Surface(
                    color = MaterialTheme.colorScheme.primaryContainer,
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable { onNavigateToSecurity() }
                ) {
                    Row(
                        modifier = Modifier.padding(16.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(
                                Icons.Default.Security,
                                contentDescription = null,
                                tint = MaterialTheme.colorScheme.onPrimaryContainer
                            )
                            Spacer(modifier = Modifier.width(12.dp))
                            Text(
                                stringResource(R.string.menu_security),
                                style = MaterialTheme.typography.titleMedium,
                                color = MaterialTheme.colorScheme.onPrimaryContainer
                            )
                        }
                        Icon(
                            Icons.Default.ChevronRight,
                            contentDescription = null,
                            tint = MaterialTheme.colorScheme.onPrimaryContainer
                        )
                    }
                }
                HorizontalDivider()
            }

            item {
                SettingsHeader(stringResource(R.string.sec_capture))
            }
            item {
                SettingsSwitchRow(
                    title = stringResource(R.string.row_auto_capture),
                    subtitle = stringResource(R.string.desc_auto_capture),
                    checked = uiState.captureEnabled,
                    onCheckedChange = { viewModel.setCaptureEnabled(it) }
                )
            }

            item {
                SettingsHeader(stringResource(R.string.sec_storage))
            }
            item {
                SettingsClickRow(
                    title = stringResource(R.string.row_auto_purge),
                    subtitle = if (uiState.autoPurgeHours == 0) "Nonaktif" else "${uiState.autoPurgeHours} jam",
                    onClick = {}
                )
            }
            item {
                SettingsClickRow(
                    title = stringResource(R.string.row_max_items),
                    subtitle = if (uiState.maxItems == 0) "Tanpa batas" else "${uiState.maxItems} item",
                    onClick = {}
                )
            }

            item {
                SettingsHeader(stringResource(R.string.sec_display))
            }
            item {
                SettingsClickRow(
                    title = stringResource(R.string.row_theme),
                    subtitle = when (uiState.theme) {
                        "LIGHT" -> stringResource(R.string.opt_theme_light)
                        "DARK" -> stringResource(R.string.opt_theme_dark)
                        else -> stringResource(R.string.opt_theme_system)
                    },
                    onClick = {}
                )
            }

            item {
                SettingsHeader(stringResource(R.string.sec_backup))
            }
            item {
                SettingsClickRow(
                    title = stringResource(R.string.row_backup_now),
                    subtitle = "Buat cadangan database lokal",
                    onClick = { viewModel.backupNow() }
                )
            }

            item {
                SettingsHeader(stringResource(R.string.sec_maintenance))
            }
            item {
                SettingsClickRow(
                    title = stringResource(R.string.row_optimize_db),
                    subtitle = "Jalankan VACUUM dan REINDEX",
                    onClick = { viewModel.optimizeDb() }
                )
            }
            item {
                SettingsClickRow(
                    title = stringResource(R.string.row_repair_db),
                    subtitle = "Jalankan integrity check",
                    onClick = { viewModel.toggleRepairDialog(true) }
                )
            }

            item {
                SettingsHeader(stringResource(R.string.sec_about))
            }
            item {
                SettingsClickRow(
                    title = stringResource(R.string.row_about_app),
                    subtitle = "Versi 1.0.0 (Offline)",
                    onClick = {}
                )
            }
        }

        if (uiState.showRepairDialog) {
            AlertDialog(
                onDismissRequest = { viewModel.toggleRepairDialog(false) },
                title = { Text(stringResource(R.string.dialog_repair_title)) },
                text = { Text(stringResource(R.string.dialog_repair_desc)) },
                confirmButton = {
                    TextButton(onClick = { viewModel.repairDb() }) {
                        Text(stringResource(R.string.btn_repair))
                    }
                },
                dismissButton = {
                    TextButton(onClick = { viewModel.toggleRepairDialog(false) }) {
                        Text(stringResource(R.string.btn_cancel))
                    }
                }
            )
        }
    }
}

@Composable
fun SettingsHeader(title: String) {
    Surface(color = MaterialTheme.colorScheme.surfaceVariant) {
        Text(
            text = title,
            style = MaterialTheme.typography.labelLarge,
            color = MaterialTheme.colorScheme.primary,
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp, vertical = 8.dp)
        )
    }
}

@Composable
fun SettingsSwitchRow(
    title: String,
    subtitle: String,
    checked: Boolean,
    onCheckedChange: (Boolean) -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onCheckedChange(!checked) }
            .padding(16.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Column(modifier = Modifier.weight(1f)) {
            Text(title, style = MaterialTheme.typography.bodyLarge)
            Text(subtitle, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
        }
        Switch(checked = checked, onCheckedChange = onCheckedChange)
    }
    HorizontalDivider()
}

@Composable
fun SettingsClickRow(
    title: String,
    subtitle: String,
    onClick: () -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onClick() }
            .padding(16.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Column(modifier = Modifier.weight(1f)) {
            Text(title, style = MaterialTheme.typography.bodyLarge)
            Text(subtitle, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
        }
    }
    HorizontalDivider()
}
