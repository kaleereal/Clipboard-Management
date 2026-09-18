package com.clipboard.management.ui.editor

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.automirrored.filled.CallSplit
import androidx.compose.material.icons.automirrored.filled.Redo
import androidx.compose.material.icons.automirrored.filled.Undo
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.unit.dp
import com.clipboard.management.R

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun EditorScreen(
    clipId: String?,
    viewModel: EditorViewModel,
    onNavigateBack: () -> Unit
) {
    val context = LocalContext.current
    val uiState by viewModel.uiState.collectAsState()

    LaunchedEffect(clipId) {
        viewModel.loadClip(clipId)
    }

    var showMenu by remember { mutableStateOf(false) }
    var showVariableSheet by remember { mutableStateOf(false) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        if (uiState.clipId == null) stringResource(R.string.title_new_snippet)
                        else stringResource(R.string.title_edit_snippet)
                    )
                },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Kembali")
                    }
                },
                actions = {
                    IconButton(
                        onClick = { viewModel.saveSnippet(onSaved = onNavigateBack) },
                        enabled = uiState.content.isNotBlank() && uiState.isDirty
                    ) {
                        Icon(Icons.Default.Check, contentDescription = "Simpan")
                    }
                    IconButton(onClick = { showMenu = true }) {
                        Icon(Icons.Default.MoreVert, contentDescription = "Menu")
                    }
                    DropdownMenu(
                        expanded = showMenu,
                        onDismissRequest = { showMenu = false }
                    ) {
                        DropdownMenuItem(
                            text = { Text(stringResource(R.string.menu_diff)) },
                            leadingIcon = { Icon(Icons.Default.Difference, contentDescription = null) },
                            onClick = { showMenu = false; viewModel.toggleDiffDialog(true) }
                        )
                    }
                }
            )
        },
        bottomBar = {
            Surface(tonalElevation = 4.dp) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 8.dp, vertical = 4.dp),
                    horizontalArrangement = Arrangement.SpaceAround,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    IconButton(onClick = { viewModel.copyContent(context) }) {
                        Icon(Icons.Default.ContentCopy, contentDescription = "Salin")
                    }
                    IconButton(onClick = { viewModel.shareContent(context) }) {
                        Icon(Icons.Default.Share, contentDescription = "Bagikan")
                    }
                    IconButton(
                        onClick = { viewModel.toggleSplitDialog(true) },
                        enabled = uiState.clipId != null
                    ) {
                        Icon(Icons.AutoMirrored.Filled.CallSplit, contentDescription = "Bagi (Split)")
                    }
                    IconButton(
                        onClick = { viewModel.toggleVersionSheet(true) },
                        enabled = uiState.clipId != null
                    ) {
                        Icon(Icons.Default.History, contentDescription = "Riwayat Versi")
                    }
                }
            }
        }
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
        ) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 12.dp, vertical = 4.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                    listOf("TEXT", "MARKDOWN", "JSON", "XML", "SQL").forEach { lang ->
                        FilterChip(
                            selected = uiState.language == lang,
                            onClick = { viewModel.setLanguage(lang) },
                            label = { Text(lang) }
                        )
                    }
                }

                Row {
                    IconButton(onClick = { showVariableSheet = true }) {
                        Icon(Icons.Default.Code, contentDescription = "Variabel")
                    }
                    IconButton(onClick = { viewModel.undo() }) {
                        Icon(Icons.AutoMirrored.Filled.Undo, contentDescription = "Urungkan")
                    }
                    IconButton(onClick = { viewModel.redo() }) {
                        Icon(Icons.AutoMirrored.Filled.Redo, contentDescription = "Ulangi")
                    }
                }
            }

            HorizontalDivider()

            TextField(
                value = uiState.content,
                onValueChange = { viewModel.onContentChanged(it) },
                placeholder = { Text(stringResource(R.string.placeholder_editor)) },
                textStyle = LocalTextStyle.current.copy(
                    fontFamily = if (uiState.language != "TEXT") FontFamily.Monospace else FontFamily.Default
                ),
                colors = TextFieldDefaults.colors(
                    focusedContainerColor = MaterialTheme.colorScheme.surface,
                    unfocusedContainerColor = MaterialTheme.colorScheme.surface
                ),
                modifier = Modifier
                    .fillMaxWidth()
                    .weight(1f)
            )

            Surface(color = MaterialTheme.colorScheme.surfaceVariant) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp, vertical = 6.dp),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text(
                        text = stringResource(
                            R.string.stats_format,
                            uiState.charCount,
                            uiState.wordCount,
                            uiState.lineCount
                        ),
                        style = MaterialTheme.typography.labelMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }
        }

        if (showVariableSheet) {
            ModalBottomSheet(onDismissRequest = { showVariableSheet = false }) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text("Sisipkan Variabel Token", style = MaterialTheme.typography.titleMedium)
                    Spacer(modifier = Modifier.height(12.dp))
                    listOf("{date}", "{time}", "{datetime}", "{clipboard}").forEach { varName ->
                        TextButton(
                            onClick = {
                                viewModel.insertVariable(varName)
                                showVariableSheet = false
                            },
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Text(varName, style = MaterialTheme.typography.bodyLarge)
                        }
                    }
                }
            }
        }

        if (uiState.showVersionSheet) {
            ModalBottomSheet(onDismissRequest = { viewModel.toggleVersionSheet(false) }) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text("Riwayat Versi", style = MaterialTheme.typography.titleMedium)
                    Spacer(modifier = Modifier.height(8.dp))
                    if (uiState.versions.isEmpty()) {
                        Text(stringResource(R.string.empty_version_history))
                    } else {
                        LazyColumn {
                            items(uiState.versions) { version ->
                                Row(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .padding(vertical = 8.dp),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Column(modifier = Modifier.weight(1f)) {
                                        Text("Versi ${version.versionNumber}", style = MaterialTheme.typography.labelLarge)
                                        Text(version.content.take(40), style = MaterialTheme.typography.bodySmall)
                                    }
                                    TextButton(onClick = { viewModel.restoreVersion(version) }) {
                                        Text(stringResource(R.string.btn_restore))
                                    }
                                }
                                HorizontalDivider()
                            }
                        }
                    }
                }
            }
        }

        if (uiState.showSplitDialog) {
            var delimiter by remember { mutableStateOf("\n") }
            AlertDialog(
                onDismissRequest = { viewModel.toggleSplitDialog(false) },
                title = { Text(stringResource(R.string.dialog_split_title)) },
                text = {
                    Column {
                        Text("Pilih pemisah:")
                        Spacer(modifier = Modifier.height(8.dp))
                        Row {
                            FilterChip(
                                selected = delimiter == "\n",
                                onClick = { delimiter = "\n" },
                                label = { Text("Baris Baru") }
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            FilterChip(
                                selected = delimiter == ",",
                                onClick = { delimiter = "," },
                                label = { Text("Koma") }
                            )
                        }
                    }
                },
                confirmButton = {
                    TextButton(onClick = {
                        viewModel.splitSnippet(delimiter, onComplete = onNavigateBack)
                    }) {
                        Text(stringResource(R.string.btn_split))
                    }
                },
                dismissButton = {
                    TextButton(onClick = { viewModel.toggleSplitDialog(false) }) {
                        Text(stringResource(R.string.btn_cancel))
                    }
                }
            )
        }

        if (uiState.showDiffDialog) {
            AlertDialog(
                onDismissRequest = { viewModel.toggleDiffDialog(false) },
                title = { Text(stringResource(R.string.title_diff)) },
                text = {
                    Column {
                        Text(stringResource(R.string.diff_identical))
                    }
                },
                confirmButton = {
                    TextButton(onClick = { viewModel.toggleDiffDialog(false) }) {
                        Text("Tutup")
                    }
                }
            )
        }
    }
}
