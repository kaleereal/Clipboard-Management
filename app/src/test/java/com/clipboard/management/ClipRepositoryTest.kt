package com.clipboard.management

import com.clipboard.management.data.repository.ClipRepository
import org.junit.Assert.*
import org.junit.Test

class ClipRepositoryTest {

    @Test
    fun testDetectContentType_URL() {
        val type = ClipRepository.detectContentType("https://example.com/page")
        assertEquals("URL", type)
    }

    @Test
    fun testDetectContentType_NUMBER() {
        val type = ClipRepository.detectContentType("123456.789")
        assertEquals("NUMBER", type)
    }

    @Test
    fun testDetectContentType_CODE() {
        val type = ClipRepository.detectContentType("function test() { return 42; }")
        assertEquals("CODE", type)
    }

    @Test
    fun testDetectContentType_TEXT() {
        val type = ClipRepository.detectContentType("Selamat pagi dunia")
        assertEquals("TEXT", type)
    }

    @Test
    fun testDetectSensitive_CreditCard() {
        val sensitive = ClipRepository.detectSensitive("4532015012345678")
        assertTrue(sensitive)
    }

    @Test
    fun testHashString() {
        val hash1 = ClipRepository.hashString("test")
        val hash2 = ClipRepository.hashString("test")
        assertEquals(hash1, hash2)
        assertFalse(hash1.isBlank())
    }
}
