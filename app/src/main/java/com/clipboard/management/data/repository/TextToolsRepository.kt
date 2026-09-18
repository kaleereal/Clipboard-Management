package com.clipboard.management.data.repository

import com.clipboard.management.data.dao.UrlMetadataDao
import com.clipboard.management.data.entity.UrlMetadataCache
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL
import java.util.regex.Pattern

class TextToolsRepository(
    private val urlMetadataDao: UrlMetadataDao
) {
    fun cleanText(
        text: String,
        removeExcessLines: Boolean,
        trimSpaces: Boolean,
        removeTabs: Boolean,
        removeDoubleSpaces: Boolean
    ): String {
        var result = text
        if (trimSpaces) {
            result = result.lines().joinToString("\n") { it.trim() }
        }
        if (removeTabs) {
            result = result.replace("\t", " ")
        }
        if (removeDoubleSpaces) {
            result = result.replace(" {2,}".toRegex(), " ")
        }
        if (removeExcessLines) {
            result = result.replace("\n{3,}".toRegex(), "\n\n")
        }
        return result
    }

    fun convertCase(text: String, targetCase: String): String {
        val words = text.split("\\s+|_|-|(?<=[a-z])(?=[A-Z])".toRegex()).filter { it.isNotEmpty() }
        if (words.isEmpty()) return text

        return when (targetCase) {
            "camelCase" -> words.first().lowercase() + words.drop(1).joinToString("") { it.lowercase().replaceFirstChar { c -> c.uppercase() } }
            "snake_case" -> words.joinToString("_") { it.lowercase() }
            "kebab-case" -> words.joinToString("-") { it.lowercase() }
            "UPPERCASE" -> text.uppercase()
            "lowercase" -> text.lowercase()
            "Title Case" -> words.joinToString(" ") { it.lowercase().replaceFirstChar { c -> c.uppercase() } }
            else -> text
        }
    }

    fun formatCode(code: String, lang: String, mode: String): String {
        val trimmed = code.trim()
        if (trimmed.isEmpty()) return code

        return try {
            when (lang.uppercase()) {
                "JSON" -> {
                    if (mode == "PRETTIFY") {
                        JSONObject(trimmed).toString(2)
                    } else {
                        JSONObject(trimmed).toString()
                    }
                }
                else -> code
            }
        } catch (e: Exception) {
            code
        }
    }

    fun extractData(text: String, extractPhone: Boolean, extractEmail: Boolean, extractUrl: Boolean, extractIp: Boolean): List<String> {
        val results = mutableListOf<String>()

        if (extractPhone) {
            val phonePattern = Pattern.compile("\\+?[0-9]{1,4}?[-.\\s]?\\(?\\d{1,3}?\\)?[-.\\s]?\\d{1,4}[-.\\s]?\\d{1,4}[-.\\s]?\\d{1,9}")
            val matcher = phonePattern.matcher(text)
            while (matcher.find()) {
                val match = matcher.group()
                if (match.length >= 7) results.add(match)
            }
        }

        if (extractEmail) {
            val emailPattern = Pattern.compile("[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,6}")
            val matcher = emailPattern.matcher(text)
            while (matcher.find()) {
                results.add(matcher.group())
            }
        }

        if (extractUrl) {
            val urlPattern = Pattern.compile("https?://[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}(?:/[^\\s]*)?")
            val matcher = urlPattern.matcher(text)
            while (matcher.find()) {
                results.add(matcher.group())
            }
        }

        if (extractIp) {
            val ipPattern = Pattern.compile("\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b")
            val matcher = ipPattern.matcher(text)
            while (matcher.find()) {
                results.add(matcher.group())
            }
        }

        return results.distinct()
    }

    suspend fun fetchUrlMetadata(urlStr: String): UrlMetadataCache = withContext(Dispatchers.IO) {
        val cached = urlMetadataDao.getMetadata(urlStr)
        if (cached != null) return@withContext cached

        return@withContext try {
            val conn = URL(urlStr).openConnection() as HttpURLConnection
            conn.connectTimeout = 3000
            conn.readTimeout = 3000
            conn.requestMethod = "GET"
            conn.setRequestProperty("User-Agent", "Mozilla/5.0")

            val html = conn.inputStream.bufferedReader().use { it.readText() }
            val titleMatcher = Pattern.compile("<title>(.*?)</title>", Pattern.CASE_INSENSITIVE).matcher(html)
            val title = if (titleMatcher.find()) titleMatcher.group(1) ?: urlStr else urlStr

            val meta = UrlMetadataCache(url = urlStr, title = title, description = "")
            urlMetadataDao.insertMetadata(meta)
            meta
        } catch (e: Exception) {
            UrlMetadataCache(url = urlStr, title = urlStr, description = "Gagal mengambil metadata")
        }
    }

    fun generateLorem(count: Int, unit: String): String {
        val wordsCorpus = listOf(
            "lorem", "ipsum", "dolor", "sit", "amet", "consectetur", "adipiscing", "elit",
            "sed", "do", "eiusmod", "tempor", "incididunt", "ut", "labore", "et", "dolore",
            "magna", "aliqua", "ut", "enim", "ad", "minim", "veniam", "quis", "nostrud",
            "exercitation", "ullamco", "laboris", "nisi", "ut", "aliquip", "ex", "ea",
            "commodo", "consequat"
        )

        return when (unit.uppercase()) {
            "KATA", "WORDS" -> (1..count).joinToString(" ") { wordsCorpus.random() }
            "KALIMAT", "SENTENCES" -> (1..count).joinToString(" ") {
                val len = (5..12).random()
                val sentence = (1..len).joinToString(" ") { wordsCorpus.random() }
                sentence.replaceFirstChar { it.uppercase() } + "."
            }
            "PARAGRAF", "PARAGRAPHS" -> (1..count).joinToString("\n\n") {
                (1..4).joinToString(" ") {
                    val len = (6..14).random()
                    val sentence = (1..len).joinToString(" ") { wordsCorpus.random() }
                    sentence.replaceFirstChar { it.uppercase() } + "."
                }
            }
            else -> "Lorem ipsum dolor sit amet."
        }
    }
}
