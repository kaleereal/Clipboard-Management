package com.clipboard.management.ui.tools

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.clipboard.management.R

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun TextToolsScreen(
    viewModel: TextToolsViewModel,
    onNavigateToEditor: (String) -> Unit
) {
    val context = LocalContext.current
    val uiState by viewModel.uiState.collectAsState()

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(stringResource(R.string.title_text_tools)) }
            )
        }
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
        ) {
            ScrollableTabRow(selectedTabIndex = uiState.activeTab) {
                Tab(
                    selected = uiState.activeTab == 0,
                    onClick = { viewModel.setTab(0) },
                    text = { Text(stringResource(R.string.tab_clean)) }
                )
                Tab(
                    selected = uiState.activeTab == 1,
                    onClick = { viewModel.setTab(1) },
                    text = { Text(stringResource(R.string.tab_case)) }
                )
                Tab(
                    selected = uiState.activeTab == 2,
                    onClick = { viewModel.setTab(2) },
                    text = { Text(stringResource(R.string.tab_code_format)) }
                )
                Tab(
                    selected = uiState.activeTab == 3,
                    onClick = { viewModel.setTab(3) },
                    text = { Text(stringResource(R.string.tab_extract)) }
                )
                Tab(
                    selected = uiState.activeTab == 4,
                    onClick = { viewModel.setTab(4) },
                    text = { Text(stringResource(R.string.tab_stack_queue)) }
                )
                Tab(
                    selected = uiState.activeTab == 5,
                    onClick = { viewModel.setTab(5) },
                    text = { Text(stringResource(R.string.tab_lorem)) }
                )
            }

            Column(modifier = Modifier.padding(12.dp)) {
                OutlinedTextField(
                    value = uiState.input,
                    onValueChange = { viewModel.setInput(it) },
                    placeholder = { Text(stringResource(R.string.placeholder_input)) },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(120.dp)
                )

                Spacer(modifier = Modifier.height(4.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    TextButton(onClick = { viewModel.pasteFromClipboard(context) }) {
                        Icon(Icons.Default.ContentPaste, contentDescription = null)
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(stringResource(R.string.btn_paste_clipboard))
                    }
                }
            }

            HorizontalDivider()

            Box(
                modifier = Modifier
                    .weight(1f)
                    .fillMaxWidth()
                    .padding(12.dp)
            ) {
                when (uiState.activeTab) {
                    0 -> {
                        Column {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Checkbox(
                                    checked = uiState.removeExcessLines,
                                    onCheckedChange = { viewModel.toggleCleanOption("EXCESS_LINES") }
                                )
                                Text(stringResource(R.string.opt_remove_blank_lines))
                            }
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Checkbox(
                                    checked = uiState.trimSpaces,
                                    onCheckedChange = { viewModel.toggleCleanOption("TRIM") }
                                )
                                Text(stringResource(R.string.opt_trim_spaces))
                            }
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Checkbox(
                                    checked = uiState.removeTabs,
                                    onCheckedChange = { viewModel.toggleCleanOption("TABS") }
                                )
                                Text(stringResource(R.string.opt_remove_tabs))
                            }
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Checkbox(
                                    checked = uiState.removeDoubleSpaces,
                                    onCheckedChange = { viewModel.toggleCleanOption("DOUBLE_SPACES") }
                                )
                                Text(stringResource(R.string.opt_remove_double_spaces))
                            }
                        }
                    }
                    1 -> {
                        Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                            listOf("camelCase", "snake_case", "kebab-case", "UPPERCASE", "lowercase", "Title Case").forEach { c ->
                                Button(
                                    onClick = { viewModel.applyCase(c) },
                                    modifier = Modifier.fillMaxWidth()
                                ) {
                                    Text(c)
                                }
                            }
                        }
                    }
                    2 -> {
                        Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                Button(onClick = { viewModel.applyCodeFormat("JSON", "PRETTIFY") }) {
                                    Text("Prettify JSON")
                                }
                                Button(onClick = { viewModel.applyCodeFormat("JSON", "MINIFY") }) {
                                    Text("Minify JSON")
                                }
                            }
                        }
                    }
                    3 -> {
                        LazyColumn {
                            items(uiState.extractedItems) { item ->
                                ListItem(
                                    headlineContent = { Text(item) },
                                    leadingContent = { Icon(Icons.Default.FindInPage, contentDescription = null) }
                                )
                                HorizontalDivider()
                            }
                        }
                    }
                    4 -> {
                        Text("Sequential Pasting Queue & Stacking")
                    }
                    else -> {
                        Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Text("Jumlah: ")
                                IconButton(onClick = { viewModel.updateLoremCount(uiState.loremCount - 1) }) {
                                    Icon(Icons.Default.Remove, contentDescription = "Kurang")
                                }
                                Text("${uiState.loremCount}")
                                IconButton(onClick = { viewModel.updateLoremCount(uiState.loremCount + 1) }) {
                                    Icon(Icons.Default.Add, contentDescription = "Tambah")
                                }
                            }
                            Button(onClick = { viewModel.generateLorem() }) {
                                Text(stringResource(R.string.btn_generate))
                            }
                        }
                    }
                }
            }

            HorizontalDivider()

            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(12.dp)
            ) {
                Text(stringResource(R.string.label_result), style = MaterialTheme.typography.labelLarge)
                Spacer(modifier = Modifier.height(4.dp))
                OutlinedTextField(
                    value = uiState.result,
                    onValueChange = {},
                    readOnly = true,
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(100.dp)
                )
                Spacer(modifier = Modifier.height(8.dp))
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Button(onClick = { viewModel.copyResult(context) }) {
                        Icon(Icons.Default.ContentCopy, contentDescription = null)
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(stringResource(R.string.action_copy))
                    }
                    Button(onClick = {
                        viewModel.saveAsSnippet { clipId -> onNavigateToEditor(clipId) }
                    }) {
                        Text(stringResource(R.string.btn_save_as_snippet))
                    }
                    OutlinedButton(onClick = { viewModel.replaceInputWithResult() }) {
                        Text(stringResource(R.string.btn_replace_input))
                    }
                }
            }
        }
    }
}
