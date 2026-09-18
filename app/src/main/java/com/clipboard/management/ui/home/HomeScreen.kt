package com.clipboard.management.ui.home

import androidx.compose.foundation.ExperimentalFoundationApi
import androidx.compose.foundation.combinedClickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.staggeredgrid.LazyVerticalStaggeredGrid
import androidx.compose.foundation.lazy.staggeredgrid.StaggeredGridCells
import androidx.compose.foundation.lazy.staggeredgrid.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.MergeType
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.PushPin
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import com.clipboard.management.R
import com.clipboard.management.data.entity.ClipItem

@OptIn(ExperimentalMaterial3Api::class, ExperimentalFoundationApi::class)
@Composable
fun HomeScreen(
    viewModel: HomeViewModel,
    onNavigateToEditor: (String?) -> Unit,
    onNavigateToSearch: () -> Unit,
    onNavigateToSecurity: () -> Unit,
    onNavigateToSettings: () -> Unit
) {
    val context = LocalContext.current
    val uiState by viewModel.uiState.collectAsState()
    val clips by viewModel.clipsFlow.collectAsState(initial = emptyList())

    var showMenu by remember { mutableStateOf(false) }
    var showMergeDialog by remember { mutableStateOf(false) }

    Scaffold(
        topBar = {
            if (uiState.selectionMode) {
                TopAppBar(
                    title = { Text("${uiState.selectedIds.size} dipilih") },
                    navigationIcon = {
                        IconButton(onClick = { viewModel.clearSelection() }) {
                            Icon(Icons.Default.Close, contentDescription = "Tutup")
                        }
                    },
                    actions = {
                        if (uiState.selectedIds.size >= 2) {
                            IconButton(onClick = { showMergeDialog = true }) {
                                Icon(Icons.AutoMirrored.Filled.MergeType, contentDescription = "Gabungkan")
                            }
                        }
                        IconButton(onClick = {
                            uiState.selectedIds.forEach { viewModel.softDelete(it) }
                            viewModel.clearSelection()
                        }) {
                            Icon(Icons.Default.Delete, contentDescription = "Hapus")
                        }
                    }
                )
            } else {
                TopAppBar(
                    title = { Text(stringResource(R.string.title_clipboard)) },
                    actions = {
                        IconButton(onClick = onNavigateToSearch) {
                            Icon(Icons.Default.Search, contentDescription = "Cari")
                        }
                        IconButton(onClick = { viewModel.toggleCapture() }) {
                            Icon(
                                if (uiState.captureEnabled) Icons.Default.Pause else Icons.Default.PlayArrow,
                                contentDescription = if (uiState.captureEnabled) "Jeda" else "Lanjutkan"
                            )
                        }
                        IconButton(onClick = { showMenu = true }) {
                            Icon(Icons.Default.MoreVert, contentDescription = "Menu")
                        }
                        DropdownMenu(
                            expanded = showMenu,
                            onDismissRequest = { showMenu = false }
                        ) {
                            DropdownMenuItem(
                                text = { Text(stringResource(R.string.menu_incognito)) },
                                trailingIcon = {
                                    Switch(
                                        checked = uiState.incognitoMode,
                                        onCheckedChange = { viewModel.toggleIncognito() }
                                    )
                                },
                                onClick = { viewModel.toggleIncognito() }
                            )
                            HorizontalDivider()
                            DropdownMenuItem(
                                text = { Text(stringResource(R.string.menu_security)) },
                                leadingIcon = { Icon(Icons.Default.Security, contentDescription = null) },
                                onClick = { showMenu = false; onNavigateToSecurity() }
                            )
                            DropdownMenuItem(
                                text = { Text(stringResource(R.string.menu_settings)) },
                                leadingIcon = { Icon(Icons.Default.Settings, contentDescription = null) },
                                onClick = { showMenu = false; onNavigateToSettings() }
                            )
                        }
                    }
                )
            }
        },
        floatingActionButton = {
            FloatingActionButton(onClick = { onNavigateToEditor(null) }) {
                Icon(Icons.Default.Add, contentDescription = "Snippet Baru")
            }
        }
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
        ) {
            if (!uiState.captureEnabled) {
                Surface(
                    color = MaterialTheme.colorScheme.errorContainer,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Row(
                        modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text(
                            text = stringResource(R.string.banner_paused),
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.onErrorContainer
                        )
                        TextButton(onClick = { viewModel.toggleCapture() }) {
                            Text(stringResource(R.string.btn_resume))
                        }
                    }
                }
            }

            if (uiState.incognitoMode) {
                Surface(
                    color = MaterialTheme.colorScheme.secondaryContainer,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Row(
                        modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text(
                            text = stringResource(R.string.banner_incognito),
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.onSecondaryContainer
                        )
                        TextButton(onClick = { viewModel.toggleIncognito() }) {
                            Text(stringResource(R.string.btn_disable))
                        }
                    }
                }
            }

            TabRow(selectedTabIndex = uiState.selectedTab) {
                Tab(
                    selected = uiState.selectedTab == 0,
                    onClick = { viewModel.setTab(0) },
                    text = { Text(stringResource(R.string.tab_all)) }
                )
                Tab(
                    selected = uiState.selectedTab == 1,
                    onClick = { viewModel.setTab(1) },
                    text = { Text(stringResource(R.string.tab_pinned)) }
                )
                Tab(
                    selected = uiState.selectedTab == 2,
                    onClick = { viewModel.setTab(2) },
                    text = { Text(stringResource(R.string.tab_frequent)) }
                )
                Tab(
                    selected = uiState.selectedTab == 3,
                    onClick = { viewModel.setTab(3) },
                    text = { Text(stringResource(R.string.tab_trash)) }
                )
            }

            if (uiState.selectedTab == 0) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 12.dp, vertical = 4.dp),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    FilterChip(
                        selected = uiState.selectedTypeChip == "ALL",
                        onClick = { viewModel.setTypeChip("ALL") },
                        label = { Text(stringResource(R.string.chip_all_types)) }
                    )
                    FilterChip(
                        selected = uiState.selectedTypeChip == "TEXT",
                        onClick = { viewModel.setTypeChip("TEXT") },
                        label = { Text(stringResource(R.string.chip_text)) }
                    )
                    FilterChip(
                        selected = uiState.selectedTypeChip == "URL",
                        onClick = { viewModel.setTypeChip("URL") },
                        label = { Text(stringResource(R.string.chip_url)) }
                    )
                    FilterChip(
                        selected = uiState.selectedTypeChip == "CODE",
                        onClick = { viewModel.setTypeChip("CODE") },
                        label = { Text(stringResource(R.string.chip_code)) }
                    )
                    FilterChip(
                        selected = uiState.selectedTypeChip == "NUMBER",
                        onClick = { viewModel.setTypeChip("NUMBER") },
                        label = { Text(stringResource(R.string.chip_number)) }
                    )
                }
            }

            if (clips.isEmpty()) {
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(32.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Icon(
                            imageVector = Icons.Default.ContentPaste,
                            contentDescription = null,
                            modifier = Modifier.size(64.dp),
                            tint = MaterialTheme.colorScheme.outline
                        )
                        Spacer(modifier = Modifier.height(16.dp))
                        Text(
                            text = when (uiState.selectedTab) {
                                1 -> stringResource(R.string.empty_pinned_title)
                                2 -> stringResource(R.string.empty_frequent_title)
                                3 -> stringResource(R.string.empty_trash_title)
                                else -> stringResource(R.string.empty_all_title)
                            },
                            style = MaterialTheme.typography.titleMedium
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(
                            text = when (uiState.selectedTab) {
                                1 -> stringResource(R.string.empty_pinned_desc)
                                2 -> stringResource(R.string.empty_frequent_desc)
                                3 -> stringResource(R.string.empty_trash_desc)
                                else -> stringResource(R.string.empty_all_desc)
                            },
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }
            } else {
                if (uiState.displayMode == "GRID") {
                    LazyVerticalStaggeredGrid(
                        columns = StaggeredGridCells.Fixed(2),
                        contentPadding = PaddingValues(8.dp),
                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                        verticalItemSpacing = 8.dp,
                        modifier = Modifier.fillMaxSize()
                    ) {
                        items(clips, key = { it.id }) { item ->
                            ClipCardItem(
                                item = item,
                                isSelected = uiState.selectedIds.contains(item.id),
                                isTrashTab = uiState.selectedTab == 3,
                                onCopy = { viewModel.copyToClipboard(context, item) },
                                onEdit = { onNavigateToEditor(item.id) },
                                onPin = { viewModel.togglePin(item.id) },
                                onDelete = { viewModel.softDelete(item.id) },
                                onRestore = { viewModel.restoreClip(item.id) },
                                onDeletePermanently = { viewModel.deletePermanently(item.id) },
                                onClick = {
                                    if (uiState.selectionMode) {
                                        viewModel.toggleSelectId(item.id)
                                    } else {
                                        onNavigateToEditor(item.id)
                                    }
                                },
                                onLongClick = { viewModel.toggleSelectId(item.id) }
                            )
                        }
                    }
                } else {
                    LazyColumn(
                        contentPadding = PaddingValues(8.dp),
                        verticalArrangement = Arrangement.spacedBy(8.dp),
                        modifier = Modifier.fillMaxSize()
                    ) {
                        items(clips, key = { it.id }) { item ->
                            ClipCardItem(
                                item = item,
                                isSelected = uiState.selectedIds.contains(item.id),
                                isTrashTab = uiState.selectedTab == 3,
                                onCopy = { viewModel.copyToClipboard(context, item) },
                                onEdit = { onNavigateToEditor(item.id) },
                                onPin = { viewModel.togglePin(item.id) },
                                onDelete = { viewModel.softDelete(item.id) },
                                onRestore = { viewModel.restoreClip(item.id) },
                                onDeletePermanently = { viewModel.deletePermanently(item.id) },
                                onClick = {
                                    if (uiState.selectionMode) {
                                        viewModel.toggleSelectId(item.id)
                                    } else {
                                        onNavigateToEditor(item.id)
                                    }
                                },
                                onLongClick = { viewModel.toggleSelectId(item.id) }
                            )
                        }
                    }
                }
            }
        }

        if (showMergeDialog) {
            AlertDialog(
                onDismissRequest = { showMergeDialog = false },
                title = { Text(stringResource(R.string.dialog_merge_title)) },
                text = { Text("Pilih pemisah untuk menggabungkan snippet terpilih.") },
                confirmButton = {
                    TextButton(onClick = {
                        showMergeDialog = false
                        viewModel.mergeSelected("BARIS_BARU")
                    }) {
                        Text(stringResource(R.string.btn_merge))
                    }
                },
                dismissButton = {
                    TextButton(onClick = { showMergeDialog = false }) {
                        Text(stringResource(R.string.btn_cancel))
                    }
                }
            )
        }
    }
}

@OptIn(ExperimentalFoundationApi::class)
@Composable
fun ClipCardItem(
    item: ClipItem,
    isSelected: Boolean,
    isTrashTab: Boolean,
    onCopy: () -> Unit,
    onEdit: () -> Unit,
    onPin: () -> Unit,
    onDelete: () -> Unit,
    onRestore: () -> Unit,
    onDeletePermanently: () -> Unit,
    onClick: () -> Unit,
    onLongClick: () -> Unit
) {
    Card(
        colors = CardDefaults.cardColors(
            containerColor = if (isSelected) MaterialTheme.colorScheme.primaryContainer else MaterialTheme.colorScheme.surfaceVariant
        ),
        modifier = Modifier
            .fillMaxWidth()
            .combinedClickable(
                onClick = onClick,
                onLongClick = onLongClick
            )
    ) {
        Column(modifier = Modifier.padding(12.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = item.contentType,
                    style = MaterialTheme.typography.labelSmall,
                    color = MaterialTheme.colorScheme.primary
                )
                if (item.isPinned) {
                    Icon(
                        Icons.Default.PushPin,
                        contentDescription = "Disematkan",
                        modifier = Modifier.size(16.dp),
                        tint = MaterialTheme.colorScheme.primary
                    )
                }
            }

            Spacer(modifier = Modifier.height(6.dp))

            Text(
                text = if (item.isSensitive) "••••••••" else item.content,
                maxLines = 4,
                overflow = TextOverflow.Ellipsis,
                style = MaterialTheme.typography.bodyMedium
            )

            Spacer(modifier = Modifier.height(8.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.End,
                verticalAlignment = Alignment.CenterVertically
            ) {
                if (isTrashTab) {
                    IconButton(onClick = onRestore) {
                        Icon(Icons.Default.Restore, contentDescription = "Pulihkan")
                    }
                    IconButton(onClick = onDeletePermanently) {
                        Icon(Icons.Default.DeleteForever, contentDescription = "Hapus Permanen")
                    }
                } else {
                    IconButton(onClick = onCopy) {
                        Icon(Icons.Default.ContentCopy, contentDescription = "Salin")
                    }
                    IconButton(onClick = onEdit) {
                        Icon(Icons.Default.Edit, contentDescription = "Edit")
                    }
                    IconButton(onClick = onPin) {
                        Icon(
                            if (item.isPinned) Icons.Default.PushPin else Icons.Outlined.PushPin,
                            contentDescription = "Pin"
                        )
                    }
                    IconButton(onClick = onDelete) {
                        Icon(Icons.Default.Delete, contentDescription = "Hapus")
                    }
                }
            }
        }
    }
}
