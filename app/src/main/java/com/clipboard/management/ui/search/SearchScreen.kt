package com.clipboard.management.ui.search

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.clipboard.management.R
import com.clipboard.management.ui.home.ClipCardItem

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SearchScreen(
    viewModel: SearchViewModel,
    onNavigateToEditor: (String?) -> Unit,
    onNavigateBack: () -> Unit
) {
    val uiState by viewModel.uiState.collectAsState()
    val results by viewModel.searchResults.collectAsState(initial = emptyList())
    val presets by viewModel.presets.collectAsState(initial = emptyList())

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    OutlinedTextField(
                        value = uiState.query,
                        onValueChange = { viewModel.updateQuery(it) },
                        placeholder = { Text(stringResource(R.string.placeholder_search)) },
                        singleLine = true,
                        trailingIcon = {
                            if (uiState.query.isNotEmpty()) {
                                IconButton(onClick = { viewModel.updateQuery("") }) {
                                    Icon(Icons.Default.Clear, contentDescription = "Bersihkan")
                                }
                            }
                        },
                        modifier = Modifier.fillMaxWidth()
                    )
                },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Kembali")
                    }
                },
                actions = {
                    FilterChip(
                        selected = uiState.isRegex,
                        onClick = { viewModel.toggleRegex() },
                        label = { Text(stringResource(R.string.toggle_regex)) }
                    )
                }
            )
        }
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
        ) {
            TabRow(selectedTabIndex = uiState.selectedTab) {
                Tab(
                    selected = uiState.selectedTab == 0,
                    onClick = { viewModel.setTab(0) },
                    text = { Text(stringResource(R.string.tab_results)) }
                )
                Tab(
                    selected = uiState.selectedTab == 1,
                    onClick = { viewModel.setTab(1) },
                    text = { Text(stringResource(R.string.tab_advanced_filter)) }
                )
                Tab(
                    selected = uiState.selectedTab == 2,
                    onClick = { viewModel.setTab(2) },
                    text = { Text(stringResource(R.string.tab_presets)) }
                )
                Tab(
                    selected = uiState.selectedTab == 3,
                    onClick = { viewModel.setTab(3) },
                    text = { Text(stringResource(R.string.tab_tag_graph)) }
                )
            }

            when (uiState.selectedTab) {
                0 -> {
                    if (results.isEmpty()) {
                        Box(
                            modifier = Modifier.fillMaxSize(),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(stringResource(R.string.no_results), style = MaterialTheme.typography.bodyLarge)
                        }
                    } else {
                        LazyColumn(
                            contentPadding = PaddingValues(12.dp),
                            verticalArrangement = Arrangement.spacedBy(8.dp),
                            modifier = Modifier.fillMaxSize()
                        ) {
                            items(results, key = { it.id }) { item ->
                                ClipCardItem(
                                    item = item,
                                    isSelected = false,
                                    isTrashTab = false,
                                    onCopy = {},
                                    onEdit = { onNavigateToEditor(item.id) },
                                    onPin = {},
                                    onDelete = {},
                                    onRestore = {},
                                    onDeletePermanently = {},
                                    onClick = { onNavigateToEditor(item.id) },
                                    onLongClick = {}
                                )
                            }
                        }
                    }
                }
                1 -> {
                    Column(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(16.dp),
                        verticalArrangement = Arrangement.spacedBy(16.dp)
                    ) {
                        Text("Filter Tipe Konten", style = MaterialTheme.typography.titleMedium)
                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            listOf("TEXT", "URL", "CODE", "NUMBER").forEach { type ->
                                FilterChip(
                                    selected = uiState.contentType == type,
                                    onClick = {
                                        viewModel.setContentType(if (uiState.contentType == type) null else type)
                                    },
                                    label = { Text(type) }
                                )
                            }
                        }

                        Spacer(modifier = Modifier.weight(1f))

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            OutlinedButton(onClick = { viewModel.resetFilters() }) {
                                Text(stringResource(R.string.btn_reset_filter))
                            }
                            Button(onClick = { viewModel.toggleSavePresetDialog(true) }) {
                                Text(stringResource(R.string.btn_save_preset))
                            }
                        }
                    }
                }
                2 -> {
                    LazyColumn(
                        contentPadding = PaddingValues(16.dp),
                        verticalArrangement = Arrangement.spacedBy(8.dp),
                        modifier = Modifier.fillMaxSize()
                    ) {
                        items(presets, key = { it.id }) { preset ->
                            ListItem(
                                headlineContent = { Text(preset.name) },
                                supportingContent = { Text("Query: ${preset.queryText}") },
                                leadingContent = { Icon(Icons.Default.Bookmark, contentDescription = null) },
                                trailingContent = {
                                    Row {
                                        IconButton(onClick = { viewModel.applyPreset(preset) }) {
                                            Icon(Icons.Default.PlayArrow, contentDescription = "Terapkan")
                                        }
                                        IconButton(onClick = { viewModel.deletePreset(preset.id) }) {
                                            Icon(Icons.Default.Delete, contentDescription = "Hapus")
                                        }
                                    }
                                },
                                modifier = Modifier.fillMaxWidth()
                            )
                            HorizontalDivider()
                        }
                    }
                }
                else -> {
                    Box(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(16.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Canvas(modifier = Modifier.fillMaxSize()) {
                            val center = Offset(size.width / 2, size.height / 2)
                            drawCircle(color = Color(0xFF6200EE), radius = 40f, center = center)
                            drawCircle(color = Color(0xFF03DAC6), radius = 30f, center = Offset(center.x - 120, center.y - 100))
                            drawCircle(color = Color(0xFF03DAC6), radius = 30f, center = Offset(center.x + 140, center.y + 80))
                            drawLine(color = Color.Gray, start = center, end = Offset(center.x - 120, center.y - 100), strokeWidth = 4f)
                            drawLine(color = Color.Gray, start = center, end = Offset(center.x + 140, center.y + 80), strokeWidth = 4f)
                        }
                        Text("Visualisasi Grafik Tag", style = MaterialTheme.typography.labelLarge)
                    }
                }
            }
        }

        if (uiState.showSavePresetDialog) {
            var presetName by remember { mutableStateOf("") }
            AlertDialog(
                onDismissRequest = { viewModel.toggleSavePresetDialog(false) },
                title = { Text(stringResource(R.string.btn_save_preset)) },
                text = {
                    OutlinedTextField(
                        value = presetName,
                        onValueChange = { presetName = it },
                        label = { Text("Nama Preset") }
                    )
                },
                confirmButton = {
                    TextButton(onClick = {
                        viewModel.savePreset(presetName)
                    }) {
                        Text(stringResource(R.string.btn_save))
                    }
                },
                dismissButton = {
                    TextButton(onClick = { viewModel.toggleSavePresetDialog(false) }) {
                        Text(stringResource(R.string.btn_cancel))
                    }
                }
            )
        }
    }
}
