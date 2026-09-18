# Clipboard Management Mobile (Offline Android)

Aplikasi Android Clipboard Manager offline modern yang dibangun menggunakan Jetpack Compose, Material 3, Room Database, DataStore Preferences, Services, dan WorkManager.

---

## 🚀 Panduan Build APK

### Opsi 1: Menggunakan Android Studio (Direkomendasikan)
1. Buka **Android Studio**.
2. Pilih **Open** dan pilih folder proyek ini (`/Clipboard-Management`).
3. Tunggu hingga Sync Gradle selesai.
4. Pilih menu **Build > Build Bundle(s) / APK(s) > Build APK(s)**.
5. File APK akan dihasilkan di folder `app/build/outputs/apk/debug/app-debug.apk`.

---

### Opsi 2: Menggunakan Terminal / Command Line (Gradle Wrapper)

**Di Linux / macOS:**
```bash
./gradlew assembleDebug
```

**Di Windows:**
```cmd
gradlew.bat assembleDebug
```

Hasil APK berada di: `app/build/outputs/apk/debug/app-debug.apk`.

---

### Opsi 3: Menggunakan NPM / Node.js
```bash
npm run build:apk
```

---

## 🛠️ Fitur Utama
1. **Beranda Riwayat:** Tampilan riwayat, filter tipe (Teks, URL, Kode, Angka), Mode Tampilan (Ringkas, Grid, Detail), Mode Incognito, Pause/Resume capture.
2. **Detail & Editor Snippet:** Syntax highlighting, statistik karakter/kata/baris, variabel token (`{date}`, `{time}`, `{datetime}`, `{clipboard}`), riwayat versi, split, merge, dan diff view.
3. **Folder & Tag:** Struktur folder & tag, Smart Folder, aturan Auto-Tagging otomatis, banner orphan items.
4. **Pencarian & Filter Dinamis:** Pencarian real-time, toggle Regex, preset filter, visualisasi Canvas Grafik Tag.
5. **Alat Teks:** Pembersihan teks, konversi huruf (`camelCase`, `snake_case`, dll.), prettify/minify JSON, ekstraksi data (email, nomor HP, URL, IP), generator Lorem Ipsum.
6. **Keamanan & Privasi:** Pengaturan PIN 4-digit, opsi biometrik, whitelist/blacklist aplikasi sumber.
7. **Analitik:** Grafik batang aktivitas, statistik total salinan & rata-rata harian, aplikasi sumber teratas.
8. **Pengaturan & Sistem:** Backup & Restore (.clipbak), optimasi database (`VACUUM`/`REINDEX`), pemeriksaan dan perbaikan database.
