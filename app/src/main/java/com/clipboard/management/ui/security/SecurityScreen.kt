package com.clipboard.management.ui.security

import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import com.clipboard.management.R

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SecurityScreen(
    viewModel: SecurityViewModel,
    onNavigateBack: () -> Unit
) {
    val uiState by viewModel.uiState.collectAsState()

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(stringResource(R.string.title_security_privacy)) },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Kembali")
                    }
                }
            )
        }
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            Text(stringResource(R.string.sec_app_lock), style = MaterialTheme.typography.titleMedium)

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(stringResource(R.string.switch_app_lock), style = MaterialTheme.typography.bodyLarge)
                    Text(
                        if (uiState.appPin.isEmpty()) "PIN belum diatur" else "PIN aktif",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
                Switch(
                    checked = uiState.isAppLockEnabled,
                    onCheckedChange = { viewModel.toggleAppLock(it) }
                )
            }

            OutlinedButton(
                onClick = { viewModel.togglePinSetupDialog(true) },
                modifier = Modifier.fillMaxWidth()
            ) {
                Icon(Icons.Default.Lock, contentDescription = null)
                Spacer(modifier = Modifier.width(8.dp))
                Text(stringResource(R.string.title_pin_setup))
            }

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(stringResource(R.string.switch_biometric), style = MaterialTheme.typography.bodyLarge)
                Switch(
                    checked = uiState.isBiometricEnabled,
                    onCheckedChange = { viewModel.setBiometricEnabled(it) }
                )
            }
        }

        if (uiState.showPinSetupDialog) {
            var pinInput by remember { mutableStateOf("") }
            var pinConfirm by remember { mutableStateOf("") }
            var error by remember { mutableStateOf(false) }

            AlertDialog(
                onDismissRequest = { viewModel.togglePinSetupDialog(false) },
                title = { Text(stringResource(R.string.title_pin_setup)) },
                text = {
                    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        Text(stringResource(R.string.desc_pin_setup))
                        OutlinedTextField(
                            value = pinInput,
                            onValueChange = { if (it.length <= 4) pinInput = it },
                            label = { Text("PIN 4 Digit") },
                            visualTransformation = PasswordVisualTransformation(),
                            singleLine = true
                        )
                        OutlinedTextField(
                            value = pinConfirm,
                            onValueChange = { if (it.length <= 4) pinConfirm = it },
                            label = { Text("Konfirmasi PIN") },
                            visualTransformation = PasswordVisualTransformation(),
                            singleLine = true
                        )
                        if (error) {
                            Text(
                                stringResource(R.string.pin_mismatch),
                                color = MaterialTheme.colorScheme.error,
                                style = MaterialTheme.typography.bodySmall
                            )
                        }
                    }
                },
                confirmButton = {
                    TextButton(onClick = {
                        if (pinInput.length == 4 && pinInput == pinConfirm) {
                            viewModel.setPin(pinInput)
                        } else {
                            error = true
                        }
                    }) {
                        Text(stringResource(R.string.btn_save))
                    }
                },
                dismissButton = {
                    TextButton(onClick = { viewModel.togglePinSetupDialog(false) }) {
                        Text(stringResource(R.string.btn_cancel))
                    }
                }
            )
        }
    }
}
