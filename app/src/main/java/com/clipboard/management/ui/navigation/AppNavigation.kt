package com.clipboard.management.ui.navigation

import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.navigation.NavHostController
import androidx.navigation.NavType
import androidx.navigation.compose.*
import androidx.navigation.navArgument
import com.clipboard.management.R
import com.clipboard.management.ui.analytics.AnalyticsScreen
import com.clipboard.management.ui.analytics.AnalyticsViewModel
import com.clipboard.management.ui.editor.EditorScreen
import com.clipboard.management.ui.editor.EditorViewModel
import com.clipboard.management.ui.folder.FolderTagScreen
import com.clipboard.management.ui.folder.FolderTagViewModel
import com.clipboard.management.ui.home.HomeScreen
import com.clipboard.management.ui.home.HomeViewModel
import com.clipboard.management.ui.search.SearchScreen
import com.clipboard.management.ui.search.SearchViewModel
import com.clipboard.management.ui.security.SecurityScreen
import com.clipboard.management.ui.security.SecurityViewModel
import com.clipboard.management.ui.settings.SettingsScreen
import com.clipboard.management.ui.settings.SettingsViewModel
import com.clipboard.management.ui.tools.TextToolsScreen
import com.clipboard.management.ui.tools.TextToolsViewModel

@Composable
fun AppNavigation(
    navController: NavHostController = rememberNavController(),
    homeViewModel: HomeViewModel,
    editorViewModel: EditorViewModel,
    folderTagViewModel: FolderTagViewModel,
    searchViewModel: SearchViewModel,
    textToolsViewModel: TextToolsViewModel,
    securityViewModel: SecurityViewModel,
    analyticsViewModel: AnalyticsViewModel,
    settingsViewModel: SettingsViewModel
) {
    val navBackStackEntry by navController.currentBackStackEntryAsState()
    val currentRoute = navBackStackEntry?.destination?.route

    val bottomNavItems = listOf(
        Screen.Home,
        Screen.FoldersTags,
        Screen.Tools,
        Screen.Analytics,
        Screen.Settings
    )

    Scaffold(
        bottomBar = {
            if (currentRoute in bottomNavItems.map { it.route }) {
                NavigationBar {
                    bottomNavItems.forEach { screen ->
                        val selected = currentRoute == screen.route
                        NavigationBarItem(
                            icon = {
                                Icon(
                                    imageVector = when (screen) {
                                        Screen.Home -> Icons.Default.ContentPaste
                                        Screen.FoldersTags -> Icons.Default.Folder
                                        Screen.Tools -> Icons.Default.Build
                                        Screen.Analytics -> Icons.Default.BarChart
                                        Screen.Settings -> Icons.Default.Settings
                                        else -> Icons.Default.Home
                                    },
                                    contentDescription = stringResource(screen.titleResId)
                                )
                            },
                            label = { Text(stringResource(screen.titleResId)) },
                            selected = selected,
                            onClick = {
                                navController.navigate(screen.route) {
                                    popUpTo(navController.graph.findStartDestination().id) {
                                        saveState = true
                                    }
                                    launchSingleTop = true
                                    restoreState = true
                                }
                            }
                        )
                    }
                }
            }
        }
    ) { innerPadding ->
        NavHost(
            navController = navController,
            startDestination = Screen.Home.route,
            modifier = Modifier.padding(innerPadding)
        ) {
            composable(Screen.Home.route) {
                HomeScreen(
                    viewModel = homeViewModel,
                    onNavigateToEditor = { clipId ->
                        navController.navigate(Screen.Editor.createRoute(clipId))
                    },
                    onNavigateToSearch = {
                        navController.navigate(Screen.Search.createRoute())
                    },
                    onNavigateToSecurity = {
                        navController.navigate(Screen.Security.route)
                    },
                    onNavigateToSettings = {
                        navController.navigate(Screen.Settings.route)
                    }
                )
            }

            composable(
                route = Screen.Editor.route,
                arguments = listOf(navArgument("clipId") {
                    type = NavType.StringType
                    nullable = true
                    defaultValue = null
                })
            ) { backStackEntry ->
                val clipId = backStackEntry.arguments?.getString("clipId")
                EditorScreen(
                    clipId = clipId,
                    viewModel = editorViewModel,
                    onNavigateBack = { navController.popBackStack() }
                )
            }

            composable(Screen.FoldersTags.route) {
                FolderTagScreen(
                    viewModel = folderTagViewModel,
                    onNavigateToSearch = { folderId, tagId ->
                        navController.navigate(Screen.Search.createRoute(folderId, tagId))
                    }
                )
            }

            composable(
                route = Screen.Search.route,
                arguments = listOf(
                    navArgument("folderId") { type = NavType.StringType; nullable = true; defaultValue = null },
                    navArgument("tagId") { type = NavType.StringType; nullable = true; defaultValue = null }
                )
            ) { _ ->
                SearchScreen(
                    viewModel = searchViewModel,
                    onNavigateToEditor = { clipId ->
                        navController.navigate(Screen.Editor.createRoute(clipId))
                    },
                    onNavigateBack = { navController.popBackStack() }
                )
            }

            composable(Screen.Tools.route) {
                TextToolsScreen(
                    viewModel = textToolsViewModel,
                    onNavigateToEditor = { clipId ->
                        navController.navigate(Screen.Editor.createRoute(clipId))
                    }
                )
            }

            composable(Screen.Security.route) {
                SecurityScreen(
                    viewModel = securityViewModel,
                    onNavigateBack = { navController.popBackStack() }
                )
            }

            composable(Screen.Analytics.route) {
                AnalyticsScreen(
                    viewModel = analyticsViewModel
                )
            }

            composable(Screen.Settings.route) {
                SettingsScreen(
                    viewModel = settingsViewModel,
                    onNavigateToSecurity = { navController.navigate(Screen.Security.route) }
                )
            }
        }
    }
}
