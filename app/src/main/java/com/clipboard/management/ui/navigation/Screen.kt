package com.clipboard.management.ui.navigation

sealed class Screen(val route: String, val titleResId: Int) {
    object Home : Screen("home", com.clipboard.management.R.string.nav_home)
    object Editor : Screen("editor?clipId={clipId}", com.clipboard.management.R.string.title_edit_snippet) {
        fun createRoute(clipId: String? = null) = if (clipId != null) "editor?clipId=$clipId" else "editor"
    }
    object FoldersTags : Screen("folders_tags", com.clipboard.management.R.string.nav_folders_tags)
    object Search : Screen("search?folderId={folderId}&tagId={tagId}", com.clipboard.management.R.string.title_search_filter) {
        fun createRoute(folderId: String? = null, tagId: String? = null): String {
            return when {
                folderId != null -> "search?folderId=$folderId"
                tagId != null -> "search?tagId=$tagId"
                else -> "search"
            }
        }
    }
    object Tools : Screen("tools", com.clipboard.management.R.string.nav_tools)
    object Security : Screen("security", com.clipboard.management.R.string.menu_security)
    object Analytics : Screen("analytics", com.clipboard.management.R.string.nav_analytics)
    object Settings : Screen("settings", com.clipboard.management.R.string.nav_settings)
}
