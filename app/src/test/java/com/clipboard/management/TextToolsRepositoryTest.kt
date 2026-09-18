package com.clipboard.management

import com.clipboard.management.data.dao.UrlMetadataDao
import com.clipboard.management.data.entity.UrlMetadataCache
import com.clipboard.management.data.repository.TextToolsRepository
import org.junit.Assert.*
import org.junit.Test

class TextToolsRepositoryTest {

    private val fakeUrlDao = object : UrlMetadataDao {
        override suspend fun getMetadata(url: String): UrlMetadataCache? = null
        override suspend fun insertMetadata(metadata: UrlMetadataCache) {}
    }

    private val repo = TextToolsRepository(fakeUrlDao)

    @Test
    fun testCleanText_removesExcessLinesAndTrims() {
        val raw = "  hello world  \n\n\n\n  foo bar  "
        val cleaned = repo.cleanText(
            text = raw,
            removeExcessLines = true,
            trimSpaces = true,
            removeTabs = false,
            removeDoubleSpaces = false
        )
        assertEquals("hello world\n\nfoo bar", cleaned)
    }

    @Test
    fun testConvertCase_camelCase() {
        val input = "hello world_test"
        val result = repo.convertCase(input, "camelCase")
        assertEquals("helloWorldTest", result)
    }

    @Test
    fun testConvertCase_snakeCase() {
        val input = "helloWorld Test"
        val result = repo.convertCase(input, "snake_case")
        assertEquals("hello_world_test", result)
    }

    @Test
    fun testExtractData_findsEmailsAndPhones() {
        val text = "Contact me at user@example.com or +1234567890"
        val extracted = repo.extractData(
            text = text,
            extractPhone = true,
            extractEmail = true,
            extractUrl = false,
            extractIp = false
        )
        assertTrue(extracted.contains("user@example.com"))
        assertTrue(extracted.contains("+1234567890"))
    }

    @Test
    fun testGenerateLorem() {
        val lorem = repo.generateLorem(5, "WORDS")
        val words = lorem.split(" ")
        assertEquals(5, words.size)
    }
}
