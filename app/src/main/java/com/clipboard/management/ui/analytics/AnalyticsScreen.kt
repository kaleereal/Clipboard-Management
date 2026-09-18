package com.clipboard.management.ui.analytics

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.clipboard.management.R

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AnalyticsScreen(
    viewModel: AnalyticsViewModel
) {
    val uiState by viewModel.uiState.collectAsState()
    var showMenu by remember { mutableStateOf(false) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(stringResource(R.string.title_analytics)) },
                actions = {
                    IconButton(onClick = { showMenu = true }) {
                        Icon(Icons.Default.MoreVert, contentDescription = "Menu")
                    }
                    DropdownMenu(
                        expanded = showMenu,
                        onDismissRequest = { showMenu = false }
                    ) {
                        DropdownMenuItem(
                            text = { Text(stringResource(R.string.menu_reset_stats)) },
                            leadingIcon = { Icon(Icons.Default.RestartAlt, contentDescription = null) },
                            onClick = { showMenu = false; viewModel.toggleResetDialog(true) }
                        )
                    }
                }
            )
        }
    ) { innerPadding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    FilterChip(
                        selected = uiState.period == "7D",
                        onClick = { viewModel.setPeriod("7D") },
                        label = { Text(stringResource(R.string.period_7d)) }
                    )
                    FilterChip(
                        selected = uiState.period == "30D",
                        onClick = { viewModel.setPeriod("30D") },
                        label = { Text(stringResource(R.string.period_30d)) }
                    )
                    FilterChip(
                        selected = uiState.period == "YEAR",
                        onClick = { viewModel.setPeriod("YEAR") },
                        label = { Text(stringResource(R.string.period_year)) }
                    )
                    FilterChip(
                        selected = uiState.period == "ALL",
                        onClick = { viewModel.setPeriod("ALL") },
                        label = { Text(stringResource(R.string.period_all)) }
                    )
                }
            }

            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    Card(modifier = Modifier.weight(1f)) {
                        Column(modifier = Modifier.padding(16.dp)) {
                            Text(stringResource(R.string.card_total_copies), style = MaterialTheme.typography.labelMedium)
                            Spacer(modifier = Modifier.height(4.dp))
                            Text("${uiState.totalCopies}", style = MaterialTheme.typography.headlineMedium)
                        }
                    }
                    Card(modifier = Modifier.weight(1f)) {
                        Column(modifier = Modifier.padding(16.dp)) {
                            Text(stringResource(R.string.card_avg_daily), style = MaterialTheme.typography.labelMedium)
                            Spacer(modifier = Modifier.height(4.dp))
                            Text("${uiState.avgDaily}", style = MaterialTheme.typography.headlineMedium)
                        }
                    }
                }
            }

            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    Card(modifier = Modifier.weight(1f)) {
                        Column(modifier = Modifier.padding(16.dp)) {
                            Text(stringResource(R.string.card_saved_items), style = MaterialTheme.typography.labelMedium)
                            Spacer(modifier = Modifier.height(4.dp))
                            Text("${uiState.savedItemsCount}", style = MaterialTheme.typography.headlineMedium)
                        }
                    }
                    Card(modifier = Modifier.weight(1f)) {
                        Column(modifier = Modifier.padding(16.dp)) {
                            Text(stringResource(R.string.card_pinned_items), style = MaterialTheme.typography.labelMedium)
                            Spacer(modifier = Modifier.height(4.dp))
                            Text("${uiState.pinnedItemsCount}", style = MaterialTheme.typography.headlineMedium)
                        }
                    }
                }
            }

            item {
                Card(modifier = Modifier.fillMaxWidth()) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text(stringResource(R.string.card_activity), style = MaterialTheme.typography.titleMedium)
                        Spacer(modifier = Modifier.height(12.dp))
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(150.dp)
                        ) {
                            Canvas(modifier = Modifier.fillMaxSize()) {
                                val barWidth = size.width / 7f - 16f
                                val primaryColor = Color(0xFF6200EE)
                                for (i in 0..6) {
                                    val left = i * (barWidth + 16f) + 8f
                                    val height = (30 + i * 15).toFloat()
                                    drawRect(
                                        color = primaryColor,
                                        topLeft = Offset(left, size.height - height),
                                        size = Size(barWidth, height)
                                    )
                                }
                            }
                        }
                    }
                }
            }

            item {
                Text(stringResource(R.string.card_top_apps), style = MaterialTheme.typography.titleMedium)
            }

            items(uiState.topApps) { appStat ->
                ListItem(
                    headlineContent = { Text(appStat.packageName) },
                    trailingContent = { Text(stringResource(R.string.unit_times, appStat.count)) },
                    leadingContent = { Icon(Icons.Default.Android, contentDescription = null) }
                )
                HorizontalDivider()
            }
        }

        if (uiState.showResetDialog) {
            AlertDialog(
                onDismissRequest = { viewModel.toggleResetDialog(false) },
                title = { Text(stringResource(R.string.dialog_reset_stats_title)) },
                text = { Text(stringResource(R.string.dialog_reset_stats_desc)) },
                confirmButton = {
                    TextButton(onClick = { viewModel.resetStats() }) {
                        Text(stringResource(R.string.btn_reset_stats))
                    }
                },
                dismissButton = {
                    TextButton(onClick = { viewModel.toggleResetDialog(false) }) {
                        Text(stringResource(R.string.btn_cancel))
                    }
                }
            )
        }
    }
}
