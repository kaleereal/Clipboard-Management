package com.clipboard.management.ui.folder

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.Label
import androidx.compose.material.icons.automirrored.filled.Rule
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
fun FolderTagScreen(
    viewModel: FolderTagViewModel,
    onNavigateToSearch: (folderId: String?, tagId: String?) -> Unit
) {
    val uiState by viewModel.uiState.collectAsState()
    val folders by viewModel.folders.collectAsState(initial = emptyList())
    val tags by viewModel.tags.collectAsState(initial = emptyList())
    val smartFolders by viewModel.smartFolders.collectAsState(initial = emptyList())
    val rules by viewModel.rules.collectAsState(initial = emptyList())

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(stringResource(R.string.title_folders_tags)) },
                actions = {
                    IconButton(onClick = { onNavigateToSearch(null, null) }) {
                        Icon(Icons.Default.Search, contentDescription = "Cari")
                    }
                }
            )
        },
        floatingActionButton = {
            FloatingActionButton(onClick = { viewModel.toggleAddDialog(true) }) {
                Icon(Icons.Default.Add, contentDescription = "Tambah")
            }
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
                    text = { Text(stringResource(R.string.tab_folder)) }
                )
                Tab(
                    selected = uiState.selectedTab == 1,
                    onClick = { viewModel.setTab(1) },
                    text = { Text(stringResource(R.string.tab_tag)) }
                )
                Tab(
                    selected = uiState.selectedTab == 2,
                    onClick = { viewModel.setTab(2) },
                    text = { Text(stringResource(R.string.tab_smart)) }
                )
                Tab(
                    selected = uiState.selectedTab == 3,
                    onClick = { viewModel.setTab(3) },
                    text = { Text(stringResource(R.string.tab_rules)) }
                )
            }

            if (uiState.selectedTab == 0 && uiState.orphanCount > 0) {
                Surface(
                    color = MaterialTheme.colorScheme.surfaceVariant,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Row(
                        modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text(
                            text = stringResource(R.string.orphan_banner_text, uiState.orphanCount),
                            style = MaterialTheme.typography.bodyMedium
                        )
                        TextButton(onClick = { onNavigateToSearch(null, null) }) {
                            Text(stringResource(R.string.btn_view))
                        }
                    }
                }
            }

            when (uiState.selectedTab) {
                0 -> {
                    LazyColumn(modifier = Modifier.fillMaxSize().padding(16.dp)) {
                        items(folders, key = { it.id }) { folder ->
                            ListItem(
                                headlineContent = { Text(folder.name) },
                                leadingContent = { Icon(Icons.Default.Folder, contentDescription = null, tint = MaterialTheme.colorScheme.primary) },
                                trailingContent = {
                                    IconButton(onClick = { viewModel.deleteFolder(folder.id) }) {
                                        Icon(Icons.Default.Delete, contentDescription = "Hapus")
                                    }
                                },
                                modifier = Modifier.fillMaxWidth()
                            )
                            HorizontalDivider()
                        }
                    }
                }
                1 -> {
                    LazyColumn(modifier = Modifier.fillMaxSize().padding(16.dp)) {
                        items(tags, key = { it.id }) { tag ->
                            ListItem(
                                headlineContent = { Text(tag.name) },
                                leadingContent = { Icon(Icons.AutoMirrored.Filled.Label, contentDescription = null, tint = MaterialTheme.colorScheme.secondary) },
                                trailingContent = {
                                    IconButton(onClick = { viewModel.deleteTag(tag.id) }) {
                                        Icon(Icons.Default.Delete, contentDescription = "Hapus")
                                    }
                                },
                                modifier = Modifier.fillMaxWidth()
                            )
                            HorizontalDivider()
                        }
                    }
                }
                2 -> {
                    LazyColumn(modifier = Modifier.fillMaxSize().padding(16.dp)) {
                        items(smartFolders, key = { it.id }) { sf ->
                            ListItem(
                                headlineContent = { Text(sf.name) },
                                leadingContent = { Icon(Icons.Default.AutoAwesome, contentDescription = null) },
                                trailingContent = {
                                    IconButton(onClick = { viewModel.deleteSmartFolder(sf.id) }) {
                                        Icon(Icons.Default.Delete, contentDescription = "Hapus")
                                    }
                                },
                                modifier = Modifier.fillMaxWidth()
                            )
                            HorizontalDivider()
                        }
                    }
                }
                else -> {
                    LazyColumn(modifier = Modifier.fillMaxSize().padding(16.dp)) {
                        items(rules, key = { it.id }) { rule ->
                            ListItem(
                                headlineContent = { Text(rule.name) },
                                supportingContent = { Text("Pola: ${rule.pattern}") },
                                leadingContent = { Icon(Icons.AutoMirrored.Filled.Rule, contentDescription = null) },
                                trailingContent = {
                                    IconButton(onClick = { viewModel.deleteRule(rule.id) }) {
                                        Icon(Icons.Default.Delete, contentDescription = "Hapus")
                                    }
                                },
                                modifier = Modifier.fillMaxWidth()
                            )
                            HorizontalDivider()
                        }
                    }
                }
            }
        }

        if (uiState.showAddFolderDialog) {
            var name by remember { mutableStateOf("") }
            AlertDialog(
                onDismissRequest = { viewModel.toggleAddDialog(false) },
                title = { Text(stringResource(R.string.fab_new_folder)) },
                text = {
                    OutlinedTextField(
                        value = name,
                        onValueChange = { name = it },
                        label = { Text("Nama Folder") }
                    )
                },
                confirmButton = {
                    TextButton(onClick = {
                        if (name.isNotBlank()) {
                            viewModel.addFolder(name)
                            viewModel.toggleAddDialog(false)
                        }
                    }) {
                        Text(stringResource(R.string.btn_save))
                    }
                },
                dismissButton = {
                    TextButton(onClick = { viewModel.toggleAddDialog(false) }) {
                        Text(stringResource(R.string.btn_cancel))
                    }
                }
            )
        }

        if (uiState.showAddTagDialog) {
            var name by remember { mutableStateOf("") }
            AlertDialog(
                onDismissRequest = { viewModel.toggleAddDialog(false) },
                title = { Text(stringResource(R.string.fab_new_tag)) },
                text = {
                    OutlinedTextField(
                        value = name,
                        onValueChange = { name = it },
                        label = { Text("Nama Tag") }
                    )
                },
                confirmButton = {
                    TextButton(onClick = {
                        if (name.isNotBlank()) {
                            viewModel.addTag(name)
                            viewModel.toggleAddDialog(false)
                        }
                    }) {
                        Text(stringResource(R.string.btn_save))
                    }
                },
                dismissButton = {
                    TextButton(onClick = { viewModel.toggleAddDialog(false) }) {
                        Text(stringResource(R.string.btn_cancel))
                    }
                }
            )
        }

        if (uiState.showAddSmartFolderDialog) {
            var name by remember { mutableStateOf("") }
            AlertDialog(
                onDismissRequest = { viewModel.toggleAddDialog(false) },
                title = { Text(stringResource(R.string.fab_new_smart_folder)) },
                text = {
                    OutlinedTextField(
                        value = name,
                        onValueChange = { name = it },
                        label = { Text("Nama Smart Folder") }
                    )
                },
                confirmButton = {
                    TextButton(onClick = {
                        if (name.isNotBlank()) {
                            viewModel.addSmartFolder(name)
                            viewModel.toggleAddDialog(false)
                        }
                    }) {
                        Text(stringResource(R.string.btn_save))
                    }
                },
                dismissButton = {
                    TextButton(onClick = { viewModel.toggleAddDialog(false) }) {
                        Text(stringResource(R.string.btn_cancel))
                    }
                }
            )
        }

        if (uiState.showAddRuleDialog) {
            var name by remember { mutableStateOf("") }
            var pattern by remember { mutableStateOf("") }
            var targetTagId by remember { mutableStateOf(tags.firstOrNull()?.id ?: "") }

            AlertDialog(
                onDismissRequest = { viewModel.toggleAddDialog(false) },
                title = { Text(stringResource(R.string.fab_new_rule)) },
                text = {
                    Column {
                        OutlinedTextField(
                            value = name,
                            onValueChange = { name = it },
                            label = { Text("Nama Aturan") }
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                        OutlinedTextField(
                            value = pattern,
                            onValueChange = { pattern = it },
                            label = { Text("Pola (Kata Kunci / Regex)") }
                        )
                    }
                },
                confirmButton = {
                    TextButton(onClick = {
                        if (name.isNotBlank() && pattern.isNotBlank()) {
                            viewModel.addRule(name, pattern, false, targetTagId)
                            viewModel.toggleAddDialog(false)
                        }
                    }) {
                        Text(stringResource(R.string.btn_save))
                    }
                },
                dismissButton = {
                    TextButton(onClick = { viewModel.toggleAddDialog(false) }) {
                        Text(stringResource(R.string.btn_cancel))
                    }
                }
            )
        }
    }
}
