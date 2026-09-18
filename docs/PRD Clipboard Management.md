
# PAGE 1 — Beranda Riwayat

## Tujuan

Halaman utama (start destination) yang menampilkan seluruh riwayat clipboard hasil capture. Pengguna bisa mencari, menyalin ulang, menyematkan, menghapus, dan mengelola item secara cepat. Halaman ini juga mengatur status capture (Pause, Incognito) serta menampung tab Frequently Used dan Trash.

## Layout & Tampilan

Struktur vertikal dari atas ke bawah (Scaffold Material 3):

1. **Top App Bar**: judul "Clipboard", ikon Search (kiri dari ikon Pause), ikon Pause/Resume, menu overflow (⋮).
2. **Status Banner** (kondisional, di bawah App Bar): muncul jika capture dijeda, mode Incognito aktif, atau izin belum diberikan.
3. **Tab Row** (scrollable): `Semua` | `Disematkan` | `Sering Dipakai` | `Sampah`.
4. **Chip Row** (horizontal scroll, hanya di tab Semua): filter cepat `Semua tipe`, `Teks`, `URL`, `Kode`, `Angka`, dan chip filter aktif dari halaman Pencarian & Filter.
5. **Daftar Item**: `LazyColumn` (Compact/Detailed) atau `LazyVerticalStaggeredGrid` (Grid), sesuai Display Mode.
6. **Floating Action Button (FAB)**: ikon "+" untuk membuat snippet manual, di kanan bawah.
7. **Contextual Action Bar** (muncul saat mode seleksi): menggantikan Top App Bar.
8. **Bottom Navigation Bar**: `Beranda`, `Folder & Tag`, `Alat`, `Analitik`, `Pengaturan`. Halaman Keamanan & Privasi dan Pencarian & Filter dibuka dari Beranda (ikon Search, menu ⋮) dan Pengaturan.

## UI Components

| Komponen | Fungsi & Perilaku |
|---|---|
| Top App Bar | Judul, tombol Search (membuka Pencarian & Filter), tombol Pause/Resume, menu ⋮ |
| Tombol Pause/Resume | Toggle `captureEnabled`. Ikon berubah antara Pause dan Play; menampilkan Snackbar konfirmasi |
| Menu ⋮ | Item: `Mode Incognito`, `Mode Tampilan`, `Urutkan`, `Pilih Semua`, `Keamanan & Privasi`, `Pengaturan` |
| Status Banner | Satu baris berwarna dengan teks status dan tombol aksi (Lanjutkan / Nonaktifkan / Beri Izin) |
| Tab Row | Empat tab, masing-masing memfilter sumber data |
| Chip Row | `FilterChip` cepat, single-select untuk tipe konten |
| Item Card | Menampilkan pratinjau teks (maks 3 baris di Compact, 8 di Detailed), ikon aplikasi sumber, timestamp relatif, ikon pin, chip tag (maks 2 + "+N"), badge terkunci/masking |
| Quick Action Toolbar | Baris ikon di tiap kartu: Copy, Edit, Pin, Move, Delete. Di Compact tampil saat item di-tap sekali (expand); di Detailed selalu tampil |
| Contextual Action Bar | Jumlah terpilih, aksi: Pin, Pindahkan, Beri Tag, Gabungkan (Merge), Hapus, Pilih Semua |
| FAB "+" | Membuka Detail & Editor Snippet dalam mode buat baru |
| Empty State | Ilustrasi + teks + tombol aksi |
| Snackbar | Umpan balik aksi dengan tombol `Urungkan` |

## UI Text

**Teks yang tampil ke pengguna:**

- Judul: `Clipboard`
- Tab: `Semua`, `Disematkan`, `Sering Dipakai`, `Sampah`
- Chip: `Semua tipe`, `Teks`, `URL`, `Kode`, `Angka`
- Menu ⋮: `Mode Incognito`, `Mode Tampilan`, `Urutkan`, `Pilih Semua`, `Keamanan & Privasi`, `Pengaturan`
- Pilihan Mode Tampilan: `Daftar Ringkas`, `Kartu Grid`, `Tampilan Detail`
- Pilihan Urutkan: `Terbaru`, `Terlama`, `Paling sering dipakai`, `Ukuran teks`
- Quick Action: `Salin`, `Edit`, `Sematkan` / `Lepas Sematan`, `Pindahkan`, `Hapus`
- Banner jeda: `Penangkapan dijeda` + tombol `Lanjutkan`
- Banner Incognito: `Mode Incognito aktif. Salinan tidak disimpan.` + tombol `Nonaktifkan`
- Banner izin: `Izin diperlukan untuk menangkap clipboard.` + tombol `Beri Izin`
- Snackbar: `Teks disalin`, `Item dipindahkan ke Sampah`, `Penangkapan dilanjutkan`, `Penangkapan dijeda`, `Item disematkan`, tombol `Urungkan`
- Empty state Semua: `Belum ada riwayat` / `Salin teks dari aplikasi lain, atau buat snippet baru dengan tombol +.`
- Empty state Disematkan: `Belum ada item disematkan` / `Sematkan item penting agar tidak terhapus otomatis.`
- Empty state Sering Dipakai: `Belum ada data` / `Item yang sering kamu tempel akan muncul di sini.`
- Empty state Sampah: `Sampah kosong` / `Item yang dihapus disimpan di sini selama 30 hari.`
- Dialog Hapus permanen: judul `Hapus permanen?`, isi `Item ini tidak dapat dikembalikan.`, tombol `Batal` / `Hapus`
- Dialog Kosongkan Sampah: judul `Kosongkan Sampah?`, isi `Semua item di Sampah akan dihapus permanen.`, tombol `Batal` / `Kosongkan`
- Dialog Merge: judul `Gabungkan item`, field `Pemisah`, pilihan `Baris baru`, `Spasi`, `Koma`, `Kustom`, tombol `Batal` / `Gabungkan`
- Pesan error: `Gagal menyalin teks`, `Gagal memindahkan item`, `Penyimpanan penuh, item terlama dihapus`

**Catatan developer (tidak tampil ke pengguna):** semua string disimpan di `strings.xml`, dengan lokalisasi Indonesia sebagai default.

## Interaction & Behavior

- **Tap kartu (Compact):** expand kartu dan tampilkan Quick Action Toolbar; tap lagi untuk collapse.
- **Tap kartu (Grid/Detailed):** membuka Detail & Editor Snippet.
- **Tap ikon Salin:** teks masuk ke clipboard OS, haptic ringan, Snackbar `Teks disalin`, `useCount` +1 dan `lastUsedAt` diperbarui. Self-Destruct item dijadwalkan hapus setelah salin/tempel pertama.
- **Long press kartu:** masuk mode seleksi, kartu tersebut terpilih; tap kartu lain untuk menambah/mengurangi pilihan.
- **Swipe kanan:** Sematkan/Lepas Sematan. **Swipe kiri:** Hapus (pindah ke Sampah) dengan Snackbar `Urungkan`.
- **Tap Pause/Resume:** mengubah `captureEnabled`, banner muncul/hilang, notifikasi persisten ikut diperbarui.
- **Mode Incognito:** toggle dari menu ⋮. Selama aktif, listener tetap hidup tetapi tidak menyimpan apa pun; tidak mengubah preferensi utama; otomatis nonaktif saat aplikasi ditutup jika opsi diatur di Pengaturan.
- **Tap Search:** navigasi ke Pencarian & Filter.
- **Tap chip:** menerapkan filter tipe, daftar diperbarui seketika.
- **Tap FAB:** navigasi ke Detail & Editor Snippet (mode baru).
- **Pull-to-refresh:** memuat ulang query (untuk kasus sinkronisasi data dari service).
- **Seleksi Merge:** minimal 2 item terpilih; membuka dialog Merge, hasil disimpan sebagai entri baru, item asal tetap ada.
- **Tab Sampah:** tap kartu membuka opsi `Pulihkan` / `Hapus Permanen`; menu ⋮ khusus tab ini memunculkan `Kosongkan Sampah`.
- **Item terkunci:** tap memicu autentikasi PIN/Biometrik sebelum isi ditampilkan.
- **Item bermasking:** isi ditampilkan sebagai `••••••`; tap ikon mata untuk menampilkan sementara (5 detik) setelah autentikasi.

## Data & Logic

**Sumber data:** tabel `ClipItem` (Room), dibaca via `Flow` dari DAO dan diubah menjadi `PagingData` agar mendukung ribuan item.

**Entity `ClipItem` (field utama):**
`id`, `content`, `plainContent`, `richContent` (nullable), `contentType` (TEXT/URL/CODE/NUMBER), `sourceApp` (package name), `createdAt`, `updatedAt`, `lastUsedAt`, `useCount`, `isPinned`, `isLocked`, `isSensitive`, `isSelfDestruct`, `folderId` (nullable), `charCount`, `wordCount`, `lineCount`, `contentHash`, `deletedAt` (nullable), `isDeleted`.

**Query per tab:**
- Semua: `isDeleted = 0` diurutkan sesuai opsi urut, pinned selalu di atas.
- Disematkan: `isPinned = 1 AND isDeleted = 0`.
- Sering Dipakai: `useCount > 0 AND isDeleted = 0` diurutkan `useCount DESC`, batas 50 item.
- Sampah: `isDeleted = 1`, diurutkan `deletedAt DESC`.

**Logic:**
- **Deduplication:** saat item baru masuk, hitung `contentHash` (SHA-256 dari `plainContent`); jika sudah ada, ikuti pengaturan (perbarui `updatedAt` dan naikkan item ke atas, atau abaikan).
- **Pinned/Locked** dikecualikan dari auto-purge dan FIFO.
- **Two-stage delete:** hapus menandai `isDeleted = 1` dan mengisi `deletedAt`; worker menghapus permanen setelah 30 hari.
- **Deteksi tipe:** regex URL, angka, dan heuristik kode (karakter `{}`, `;`, `=>`, kata kunci umum).
- **Deteksi sensitif:** regex kartu kredit (Luhn), token API, pola password; hasilnya mengisi `isSensitive`.
- **Frequently Used** dihitung dari `useCount` yang bertambah setiap kali Salin ditekan.

## Technical Implementation

- **UI:** Jetpack Compose + Material 3, single-Activity, Navigation Compose.
- **State management:** `HomeViewModel` dengan `StateFlow<HomeUiState>` (`isLoading`, `items`, `selectedIds`, `captureEnabled`, `incognito`, `displayMode`, `sortOrder`, `activeTab`, `error`). Aksi dikirim via `HomeEvent` sealed class.
- **Database:** Room + SQLCipher (enkripsi AES-256), `ClipItemDao` dengan query `PagingSource`.
- **Repository:** `ClipRepository` sebagai satu-satunya akses data (insert, dedupe, pin, soft-delete, restore, merge).
- **Capture:** `ClipboardCaptureService` (Foreground Service, type `dataSync`/`specialUse`) dengan `ClipboardManager.OnPrimaryClipChangedListener`. Pada Android 10+, akses clipboard latar belakang dibatasi; solusi: `AccessibilityService` opsional atau `Activity` transparan berfokus singkat yang dipanggil dari notifikasi/tile. Pengguna diberi tahu pilihan ini saat onboarding izin.
- **Notifikasi persisten:** `NotificationCompat` dengan aksi `Jeda`, `Buka`, dan daftar 5 item terakhir (`InboxStyle`); Quick Settings Tile via `TileService`.
- **Background processing:** `WorkManager` untuk purge harian, pembersihan Sampah 30 hari, dan FIFO cap.
- **Haptic:** `VibrationEffect.createPredefined(EFFECT_CLICK)`.
- **Caching:** cache ikon aplikasi sumber di `LruCache`.
- **Dependency injection:** Hilt.
- **Validation:** `content` tidak boleh kosong setelah trim; batas ukuran item 1 MB, jika lebih dipotong dan ditandai.
- **Error handling:** semua operasi DAO dibungkus `runCatching`, kegagalan dimunculkan lewat Snackbar dan dicatat di log lokal.

## States & Edge Cases

| State | Perilaku |
|---|---|
| Initial | Skeleton placeholder 6 kartu |
| Loading | `CircularProgressIndicator` kecil saat refresh; paging menampilkan footer loading |
| Empty | Empty state sesuai tab |
| Content | Daftar item normal |
| Selected | Contextual Action Bar aktif, kartu terpilih diberi highlight dan centang |
| Disabled | Aksi Merge nonaktif jika terpilih < 2; aksi Salin nonaktif pada item terkunci sampai autentikasi |
| Error | Snackbar berisi pesan error dan tombol `Coba Lagi` |
| Paused | Banner kuning, tidak ada item baru tersimpan |
| Incognito | Banner ungu, item baru tidak tersimpan |
| Izin ditolak | Banner `Izin diperlukan...`; daftar lama tetap bisa dilihat |

**Edge case:**
- Duplikat: mengikuti aturan Deduplication (naikkan atau abaikan).
- Item sangat panjang (> 1 MB): dipotong, ditandai `Terpotong`.
- Clipboard berisi non-teks (gambar): diabaikan pada versi ini, tidak ada crash.
- Android 10+ latar belakang: capture bergantung pada mekanisme Accessibility/fokus; jika keduanya tidak aktif, banner izin ditampilkan.
- Penyimpanan penuh: FIFO menghapus item terlama yang tidak disematkan, Snackbar memberi tahu.
- Database rusak: dialihkan ke alur Auto-Repair (Pengaturan & Sistem, halaman 8).
- Rotasi layar dan process death: `SavedStateHandle` menyimpan tab, urutan, dan seleksi.
- Aplikasi sumber sudah di-uninstall: ikon fallback generik, nama paket tetap disimpan.

---

# PAGE 2 — Detail & Editor Snippet

## Tujuan

Halaman untuk melihat, mengedit, dan membuat snippet secara manual. Mencakup editor teks dengan syntax highlighting, statistik teks, Template Variables, riwayat versi, perbandingan dua item (Diff View), serta Merge dan Split.

## Layout & Tampilan

1. **Top App Bar**: tombol Kembali, judul (`Snippet Baru` atau `Edit Snippet`), tombol `Simpan`, menu ⋮.
2. **Meta Row**: chip folder, chip tag (maks 3 + "+N"), ikon Pin, ikon Kunci.
3. **Editor Area**: `TextField` multi-baris, scrollable, memakai monospace jika mode Kode/Markdown.
4. **Format Bar** (di atas keyboard): `Format Teks` (plain/rich), pilihan bahasa (`Teks`, `Markdown`, `JSON`, `XML`, `HTML`, `SQL`), tombol `Variabel`, Undo, Redo.
5. **Stats Bar** (bawah editor): `Karakter · Kata · Baris`.
6. **Bottom Action Bar**: `Salin`, `Bagikan`, `Bagi (Split)`, `Riwayat Versi`.

## UI Components

| Komponen | Fungsi & Perilaku |
|---|---|
| Judul dinamis | `Snippet Baru` jika `id` kosong, `Edit Snippet` jika ada |
| Tombol Simpan | Aktif hanya jika ada perubahan dan konten valid |
| Menu ⋮ | `Bandingkan (Diff)`, `Gabungkan dengan...`, `Ekspor sebagai .txt`, `Ekspor sebagai .md`, `Hapus` |
| Meta chips | Tap chip folder atau tag membuka bottom sheet pemilih |
| Editor | Teks dengan syntax highlighting, auto-indent, deteksi bahasa otomatis |
| Tombol Variabel | Membuka bottom sheet daftar variabel untuk disisipkan |
| Stats Bar | Diperbarui real-time (debounce 200 ms) |
| Diff View | Layar/dialog penuh, dua kolom (portrait: vertikal atas-bawah), baris berbeda diberi warna |
| Riwayat Versi | Bottom sheet daftar versi dengan timestamp; tap untuk pratinjau, tombol `Pulihkan` |
| Dialog Split | Field pemisah, pratinjau jumlah hasil |
| Dialog Merge | Pilih item lain, pemisah, urutan |

## UI Text

**Tampil ke pengguna:**

- Judul: `Snippet Baru`, `Edit Snippet`
- Tombol: `Simpan`, `Salin`, `Bagikan`, `Bagi`, `Riwayat Versi`, `Variabel`, `Pulihkan`, `Batal`
- Menu ⋮: `Bandingkan (Diff)`, `Gabungkan dengan...`, `Ekspor sebagai .txt`, `Ekspor sebagai .md`, `Hapus`
- Placeholder editor: `Tulis atau tempel teks di sini...`
- Stats: `{n} karakter · {n} kata · {n} baris`
- Pilihan bahasa: `Teks`, `Markdown`, `JSON`, `XML`, `HTML`, `SQL`
- Daftar Variabel: `{date}`, `{time}`, `{datetime}`, `{clipboard}`, `{cursor_position}`
- Label: `Format`, `Folder`, `Tag`
- Dialog Simpan perubahan: judul `Simpan perubahan?`, isi `Ada perubahan yang belum disimpan.`, tombol `Buang` / `Simpan`
- Dialog Split: judul `Bagi Snippet`, field `Pemisah`, pilihan `Baris baru`, `Baris kosong`, `Koma`, `Kustom`, teks `Akan dihasilkan {n} snippet`
- Riwayat Versi kosong: `Belum ada riwayat perubahan`
- Snackbar: `Snippet disimpan`, `Snippet dibagi menjadi {n} item`, `Versi dipulihkan`, `Snippet digabung`
- Error: `Isi snippet tidak boleh kosong`, `Gagal menyimpan snippet`, `Format {bahasa} tidak valid`
- Diff View: judul `Bandingkan`, label kolom `Sebelum` / `Sesudah`, legenda `Ditambah`, `Dihapus`

**Catatan developer:** nama variabel di editor (`{date}`) adalah literal, bukan string yang diterjemahkan.

## Interaction & Behavior

- **Buka dari Beranda** (tap kartu Grid/Detailed atau tombol Edit): memuat `ClipItem` ke editor.
- **Buka dari FAB:** editor kosong, mode buat baru.
- **Mengetik:** Stats Bar diperbarui, tombol Simpan aktif; auto-save draft ke `SavedStateHandle` agar tidak hilang saat process death.
- **Tap Simpan:** validasi → simpan → jika edit manual, buat entri di `ClipVersion` → kembali ke halaman sebelumnya dengan Snackbar.
- **Tap Kembali dengan perubahan:** dialog `Simpan perubahan?`.
- **Tap Variabel:** sisipkan token pada posisi kursor. Saat snippet disalin/ditempel, token diganti nilai aktual (`{date}` menjadi tanggal hari ini; `{cursor_position}` menempatkan kursor pada posisi tersebut jika aplikasi target mendukung, jika tidak dihapus).
- **Tap Salin:** teks (dengan variabel sudah diproses) masuk ke clipboard, `useCount` bertambah.
- **Tap Bagi (Split):** buka dialog, konfirmasi menghasilkan beberapa `ClipItem` baru; item asal dipindah ke Sampah.
- **Bandingkan (Diff):** pilih item kedua dari daftar riwayat, tampilkan Diff View.
- **Gabungkan dengan...:** pilih item lain, hasil disimpan sebagai entri baru.
- **Riwayat Versi:** tap versi menampilkan pratinjau dan tombol `Pulihkan`; memulihkan membuat versi baru, tidak menimpa histori.
- **Bagikan/Ekspor:** memakai `Intent.ACTION_SEND` atau Storage Access Framework (`ACTION_CREATE_DOCUMENT`) untuk `.txt`/`.md`.

## Data & Logic

- **Entity `ClipVersion`:** `id`, `clipId`, `content`, `createdAt`, `versionNumber`. Dibuat hanya saat edit manual, bukan saat capture otomatis.
- **Batas versi:** simpan maksimal 20 versi per item, yang terlama dihapus.
- **Perhitungan statistik:** karakter (panjang string), kata (split whitespace), baris (hitung `\n` + 1).
- **Deteksi bahasa:** heuristik otomatis (JSON valid, tag XML/HTML, kata kunci SQL, sintaks Markdown), bisa di-override manual.
- **Pemrosesan variabel:** parser sederhana yang mengganti token `{...}` saat `resolveTemplate(content)` dipanggil.
- **Split:** `content.split(delimiter)` dengan trim, buang hasil kosong.
- **Diff:** algoritma Myers per baris (pustaka `java-diff-utils`), keluaran daftar `DiffLine(type, text)`.
- **Validasi:** konten tidak boleh kosong setelah trim; untuk JSON/XML, validasi sintaks hanya menampilkan peringatan, tidak memblokir simpan.

## Technical Implementation

- **UI:** Compose, `BasicTextField` dengan `VisualTransformation` untuk syntax highlighting (tokenizer ringan berbasis regex).
- **State:** `EditorViewModel` dengan `StateFlow<EditorUiState>` (`content`, `language`, `isDirty`, `stats`, `versions`, `error`).
- **Navigation:** route `editor/{clipId?}` dengan argumen opsional.
- **Repository:** `ClipRepository.saveEdit()`, `createVersion()`, `split()`, `merge()`, `restoreVersion()`.
- **DAO:** `ClipVersionDao` dengan relasi `ForeignKey` cascade delete ke `ClipItem`.
- **Threading:** statistik dan diff dihitung di `Dispatchers.Default`.
- **Undo/Redo:** stack lokal di ViewModel, batas 100 langkah.
- **Error handling:** `Result<T>` di repository, kegagalan ditampilkan lewat Snackbar.

## States & Edge Cases

| State | Perilaku |
|---|---|
| Initial | Memuat item; editor dinonaktifkan sesaat |
| Loading | Indikator progres kecil di App Bar |
| Empty (mode baru) | Editor kosong dengan placeholder, tombol Simpan nonaktif |
| Content | Editor terisi, Stats Bar tampil |
| Dirty | Tombol Simpan aktif, dialog konfirmasi saat keluar |
| Error | Snackbar dengan pesan error |
| Item tidak ditemukan | Tampil `Snippet tidak ditemukan` dan tombol `Kembali` |

**Edge case:**
- Snippet sangat besar (> 500 KB): syntax highlighting dimatikan otomatis agar UI tidak lag.
- Split menghasilkan 0 atau 1 item: tombol konfirmasi nonaktif dengan pesan `Pemisah tidak ditemukan`.
- Diff dua teks identik: tampilkan `Kedua teks identik`.
- Variabel tidak dikenal: dibiarkan apa adanya.
- Item terkunci: wajib autentikasi sebelum editor terbuka.
- Rotasi layar: konten dan posisi kursor dipulihkan dari `SavedStateHandle`.

---

# PAGE 3 — Folder & Tag

## Tujuan

Halaman pengelolaan struktur organisasi: folder bertingkat, tag hirarki, Smart Folders, Archived Folders, aturan Auto-Tagging, dan detektor item tanpa folder/tag. Semua perubahan struktur (rename, merge, re-parent, drag-and-drop) dilakukan di sini.

## Layout & Tampilan

1. **Top App Bar**: judul `Folder & Tag`, ikon Search (cari folder/tag), menu ⋮.
2. **Segmented Tab**: `Folder` | `Tag` | `Smart` | `Aturan`.
3. **Breadcrumb Bar** (di bawah tab, tab Folder saja): jalur folder aktif, misalnya `Semua > Kerja > Proyek A`.
4. **Konten tab** (`LazyColumn` tree dengan indentasi per level, ikon expand/collapse).
5. **Banner Orphan** (tab Folder): `{n} item belum memiliki folder atau tag` dengan tombol `Lihat`.
6. **FAB**: `+` menambah folder / tag / smart folder / aturan sesuai tab aktif.
7. **Bottom Navigation Bar** (sama seperti Beranda).

## UI Components

| Komponen | Fungsi & Perilaku |
|---|---|
| Segmented Tab | Empat tab, masing-masing memuat struktur berbeda |
| Tree Row Folder | Ikon folder (warna/ikon kustom), nama, jumlah item, panah expand, drag handle |
| Tree Row Tag | Ikon `#`, nama segmen, jumlah item, panah expand, drag handle |
| Breadcrumb Bar | Setiap segmen bisa di-tap untuk naik ke level tersebut |
| Bottom Sheet Aksi | `Ganti Nama`, `Gaya Folder`, `Tambah Subfolder`, `Pindahkan`, `Arsipkan`, `Ekspor`, `Hapus` |
| Dialog Gaya Folder | Grid ikon dan palet warna |
| Panel Manajemen Tag | Mode pilih ganda untuk `Gabungkan`, `Ganti Nama`, `Pindahkan Induk` |
| Smart Folder Editor | Form aturan (properti, operator, nilai) dengan logika AND/OR |
| Tab Aturan | Daftar aturan Auto-Tagging dengan saklar aktif/nonaktif |
| Rule Editor | Field `Nama Aturan`, `Pola (Regex/Kata Kunci)`, `Tag Hasil`, uji pola |
| Section Diarsipkan | Bagian collapsible di bawah tab Folder |
| Banner Orphan | Menampilkan jumlah item tanpa folder/tag |
| Tombol Ekspor/Impor | Di menu ⋮ |

## UI Text

**Tampil ke pengguna:**

- Judul: `Folder & Tag`
- Tab: `Folder`, `Tag`, `Smart`, `Aturan`
- Breadcrumb root: `Semua`
- FAB (per tab): `Folder Baru`, `Tag Baru`, `Smart Folder Baru`, `Aturan Baru`
- Menu ⋮: `Ekspor Struktur`, `Impor Struktur`, `Tampilkan Diarsipkan`
- Aksi Bottom Sheet: `Ganti Nama`, `Gaya Folder`, `Tambah Subfolder`, `Pindahkan`, `Arsipkan`, `Ekspor`, `Hapus`
- Aksi Tag: `Ganti Nama`, `Gabungkan`, `Pindahkan Induk`, `Hapus`
- Field: `Nama folder`, `Nama tag`, `Nama aturan`, `Pola`, `Tag hasil`, `Pemisah tag: /`
- Placeholder: `Contoh: Kerja/ProyekA/Draft`, `Contoh: \d{4}-\d{4}-\d{4}-\d{4}`
- Section: `Diarsipkan`
- Banner Orphan: `{n} item belum memiliki folder atau tag` + tombol `Lihat`
- Empty Folder: `Belum ada folder` / `Buat folder untuk mengelompokkan snippet.`
- Empty Tag: `Belum ada tag` / `Tambahkan tag agar snippet mudah dicari.`
- Empty Smart: `Belum ada Smart Folder` / `Smart Folder mengumpulkan item otomatis berdasarkan aturan.`
- Empty Aturan: `Belum ada aturan` / `Buat aturan agar tag ditambahkan otomatis.`
- Dialog Hapus Folder: judul `Hapus folder?`, isi `Isi folder akan dipindahkan ke Semua.`, tombol `Batal` / `Hapus`
- Dialog Gabung Tag: judul `Gabungkan tag`, isi `{A} akan digabung ke {B}.`, tombol `Batal` / `Gabungkan`
- Snackbar: `Folder dibuat`, `Folder diarsipkan`, `Tag digabungkan`, `Struktur diekspor`, `Struktur diimpor`, `Aturan disimpan`
- Error: `Nama sudah digunakan`, `Nama tidak boleh kosong`, `Pola regex tidak valid`, `Tidak dapat memindahkan folder ke dalam dirinya sendiri`, `Gagal mengimpor: format berkas tidak valid`

## Interaction & Behavior

- **Tap panah expand:** buka/tutup cabang tree; tap baris folder membuka daftar item folder tersebut di Beranda dengan filter folder aktif.
- **Long press baris:** memunculkan drag handle dan mode drag-and-drop; item bisa dipindah ke folder/tag lain atau diubah urutannya.
- **Drag folder ke folder lain:** re-parent, dengan validasi tidak boleh ke turunannya sendiri.
- **Drag item dari Beranda ke folder:** dilakukan dari Beranda via aksi `Pindahkan`; di halaman ini drag berlaku pada struktur.
- **Tap ikon ⋮ baris:** buka Bottom Sheet aksi.
- **Tap FAB:** dialog buat baru sesuai tab.
- **Gaya Folder:** pilih ikon dan warna, tersimpan pada folder.
- **Arsipkan:** folder pindah ke section `Diarsipkan`, item di dalamnya tidak tampil di daftar umum tetapi tetap bisa dicari jika opsi diaktifkan.
- **Tab Tag → pilih ganda:** memilih dua atau lebih tag mengaktifkan `Gabungkan`; item dari tag sumber berpindah ke tag tujuan.
- **Tab Smart:** tap membuka daftar item hasil aturan; ikon pensil mengedit aturan.
- **Tab Aturan:** saklar mengaktifkan/menonaktifkan; tombol `Uji` menjalankan pola pada 20 item terbaru sebagai pratinjau.
- **Tap Banner Orphan → Lihat:** membuka Beranda dengan filter `Tanpa folder/tag`.
- **Ekspor Struktur:** memilih format (JSON/CSV/TXT) via Storage Access Framework; **Impor** membaca file dan menampilkan ringkasan sebelum konfirmasi.
- **Hapus folder:** item di dalamnya tidak ikut terhapus, dipindah ke root `Semua`.
- **Hapus tag:** tag dicabut dari semua item, item tidak terhapus.

## Data & Logic

**Entity:**
- `Folder`: `id`, `name`, `parentId` (nullable), `iconName`, `colorHex`, `isArchived`, `sortOrder`, `createdAt`.
- `Tag`: `id`, `name` (segmen), `parentId` (nullable), `fullPath`, `createdAt`.
- `ClipTagCrossRef`: `clipId`, `tagId`.
- `SmartFolder`: `id`, `name`, `rulesJson`, `matchMode` (ALL/ANY), `iconName`, `colorHex`.
- `AutoTagRule`: `id`, `name`, `patternType` (KEYWORD/REGEX), `pattern`, `tagId`, `isEnabled`, `priority`.

**Logic:**
- **Hirarki tanpa batas kedalaman:** `parentId` self-reference; query rekursif memakai `WITH RECURSIVE` (CTE) di SQLite.
- **Tag hirarki:** input `Kerja/ProyekA/Draft` dipecah menjadi tiga level; segmen yang belum ada dibuat otomatis.
- **`fullPath`** dihitung ulang untuk semua turunan saat rename atau re-parent.
- **Unik:** nama folder unik per induk; nama tag unik per induk (case-insensitive).
- **Smart Folder:** query dinamis dibentuk dari `rulesJson` (properti: tanggal, ukuran, tag, folder, sumber aplikasi, tipe); hasilnya tidak disimpan, dihitung setiap dibuka.
- **Auto-Tagging:** dijalankan saat item baru masuk (di `ClipRepository.insert`); aturan diurutkan `priority`; regex dievaluasi dengan batas waktu 100 ms per aturan untuk mencegah catastrophic backtracking.
- **Orphan Detector:** item dengan `folderId IS NULL` dan tanpa baris di `ClipTagCrossRef`.
- **Merge tag:** pindahkan semua `ClipTagCrossRef` sumber ke target, gabungkan anak, hapus sumber, dalam satu transaksi.
- **Ekspor/Impor:** serialisasi JSON berisi folder, tag, dan (opsional) item; CSV/TXT untuk daftar teks datar. Impor melakukan mapping ulang `id` agar tidak bentrok.

## Technical Implementation

- **UI:** Compose, tree dirender sebagai daftar datar (flattened list) dengan `indent = depth`, state expand disimpan dalam `Set<Long>`.
- **Drag-and-drop:** `Modifier.pointerInput` + `detectDragGesturesAfterLongPress`, atau library `reorderable`; validasi sebelum commit.
- **State:** `FolderTagViewModel` dengan `StateFlow<FolderTagUiState>` (`activeTab`, `folderTree`, `tagTree`, `smartFolders`, `rules`, `orphanCount`, `expandedIds`, `error`).
- **Navigation:** tab ini adalah destinasi Bottom Navigation; editor Smart Folder dan Rule Editor sebagai layar/bottom sheet turunan.
- **Repository:** `FolderRepository`, `TagRepository`, `SmartFolderRepository`, `AutoTagRepository`.
- **Database:** Room dengan `@Transaction` untuk merge, re-parent, dan delete berantai; indeks pada `parentId`, `fullPath`, dan `ClipTagCrossRef(clipId, tagId)`.
- **Ekspor/Impor:** `ActivityResultContracts.CreateDocument` / `OpenDocument`, serialisasi `kotlinx.serialization`.
- **Background:** penerapan ulang Auto-Tagging pada item lama dijalankan lewat `WorkManager` (opsi `Terapkan ke item lama`).
- **Validation & error handling:** validasi nama, deteksi siklus, kompilasi regex dalam `try/catch` dengan pesan error di field.

## States & Edge Cases

| State | Perilaku |
|---|---|
| Initial | Skeleton tree |
| Loading | Indikator progres saat merge/impor besar |
| Empty | Empty state per tab |
| Content | Tree terisi |
| Selected | Mode pilih ganda pada tab Tag dengan action bar |
| Disabled | `Gabungkan` nonaktif jika < 2 tag; `Pindahkan` nonaktif ke turunan sendiri |
| Error | Pesan error di dialog atau Snackbar |

**Edge case:**
- Kedalaman sangat besar (> 50 level): tree tetap dirender, indentasi dibatasi visual dengan garis panduan.
- Nama duplikat pada induk sama: ditolak dengan `Nama sudah digunakan`.
- Regex berbahaya atau lambat: dihentikan oleh timeout, aturan diberi peringatan `Pola terlalu lambat`.
- Menghapus folder yang dipakai Smart Folder: aturan yang merujuknya ditandai `Folder tidak ditemukan` dan diabaikan.
- Impor dengan nama bentrok: pilihan `Gabungkan` atau `Ganti nama otomatis`.
- Folder terkunci: autentikasi PIN/Biometrik sebelum isi dibuka, dan konten tidak tampil di hasil pencarian selama terkunci.
- Item di folder terarsip: disembunyikan dari Beranda, tampil jika filter `Sertakan diarsipkan` aktif.
- Process death saat drag: operasi dibatalkan, struktur kembali ke kondisi terakhir yang tersimpan.
# PAGE 4 — Pencarian & Filter

## Tujuan

Halaman untuk menemukan item clipboard dengan pencarian cepat (fuzzy, regex) dan filter dinamis berjenjang. Kombinasi filter yang kompleks bisa disimpan sebagai preset sekali tap. Halaman ini juga menampilkan peta relasi tag dan tampilan dua pohon filter berdampingan.

## Layout & Tampilan

1. **Search Bar** (di atas, fokus otomatis saat halaman dibuka): field input, ikon toggle `Regex`, tombol Kembali dan Hapus teks.
2. **Breadcrumb Bar**: jalur filter/folder aktif, misalnya `Semua > Kerja > Proyek A`.
3. **Active Filter Chips** (horizontal scroll): chip filter yang sedang berlaku, masing-masing dengan tanda `×`.
4. **Tab Row**: `Hasil` | `Filter` | `Preset` | `Grafik Tag`.
5. **Konten tab**:
   - `Hasil`: daftar item hasil pencarian (memakai Item Card yang sama dengan Beranda Riwayat).
   - `Filter`: panel filter multi-properti dan pohon filter.
   - `Preset`: daftar Saved Filter Presets.
   - `Grafik Tag`: peta node interaktif.
6. **Bottom Bar** (tab Filter): tombol `Reset` dan `Terapkan (n hasil)`.

## UI Components

| Komponen | Fungsi & Perilaku |
|---|---|
| Search Bar | Input teks dengan debounce 250 ms, ikon toggle `Regex` |
| Toggle Regex | Beralih antara Fuzzy Search dan Regex Pattern Search |
| Breadcrumb Bar | Tiap segmen bisa di-tap untuk naik level filter |
| Active Filter Chips | `InputChip` dengan tombol hapus |
| Panel Filter Properti | Kontrol: rentang tanggal (`DateRangePicker`), slider ukuran teks, pilih folder, pilih tag, pilih sumber aplikasi, pilih tipe konten |
| Pohon Filter (Parent-Child) | Node tag bertingkat; memilih induk memperbarui daftar sub-filter di bawahnya |
| Boolean Selector | Setiap tag terpilih punya mode `DAN` / `ATAU` / `TIDAK` |
| Exclusion Nodes | Bagian `Sembunyikan` untuk tag/folder yang dikecualikan |
| Split Tree View | Dua panel pohon filter berdampingan (landscape/tablet) atau dua sub-tab (ponsel portrait) |
| Preset Card | Nama preset, ringkasan aturan, tombol `Terapkan`, menu ⋮ (Ganti Nama, Hapus) |
| Grafik Tag | Canvas interaktif: node = tag, garis = keterkaitan (sering muncul bersama), ukuran node = jumlah item |
| Tombol `Simpan sebagai Preset` | Di panel Filter, membuka dialog nama |

## UI Text

**Tampil ke pengguna:**

- Placeholder pencarian: `Cari di riwayat...`, saat Regex aktif: `Pola regex...`
- Tab: `Hasil`, `Filter`, `Preset`, `Grafik Tag`
- Label filter: `Tanggal`, `Ukuran teks`, `Folder`, `Tag`, `Sumber aplikasi`, `Tipe`, `Sembunyikan`
- Boolean: `DAN`, `ATAU`, `TIDAK`
- Tombol: `Reset`, `Terapkan ({n} hasil)`, `Simpan sebagai Preset`, `Terapkan`, `Ganti Nama`, `Hapus`
- Split view: `Panel Kiri`, `Panel Kanan`
- Breadcrumb root: `Semua`
- Empty hasil: `Tidak ada hasil` / `Coba kata kunci lain atau ubah filter.`
- Empty preset: `Belum ada preset` / `Simpan kombinasi filter agar bisa dipakai sekali tap.`
- Empty grafik: `Belum ada data tag` / `Tambahkan tag ke snippet untuk melihat keterkaitannya.`
- Dialog Simpan Preset: judul `Simpan Preset`, field `Nama preset`, tombol `Batal` / `Simpan`
- Dialog Hapus Preset: judul `Hapus preset?`, tombol `Batal` / `Hapus`
- Snackbar: `Preset disimpan`, `Preset dihapus`, `Filter direset`
- Error: `Pola regex tidak valid`, `Nama preset sudah digunakan`, `Pencarian gagal`
- Hint: `Maksimal 5.000 item diperiksa untuk pencarian regex`

## Interaction & Behavior

- **Mengetik di Search Bar:** hasil diperbarui otomatis setelah debounce. Fuzzy mentolerir typo; Regex memakai pola persis.
- **Toggle Regex:** mengganti mode, query dievaluasi ulang; jika pola tidak valid, tampil pesan error di bawah field tanpa menghentikan aplikasi.
- **Tap item hasil:** membuka Detail & Editor Snippet. Long press masuk mode seleksi (aksi sama dengan Beranda Riwayat).
- **Memilih tag induk di pohon filter:** daftar sub-tag di bawahnya dimuat otomatis; chip aktif diperbarui.
- **Mengubah Boolean:** tap label `DAN/ATAU/TIDAK` pada tag untuk berganti mode; hasil dihitung ulang.
- **Menambah ke Exclusion Nodes:** tag/folder ditandai `Sembunyikan`; item yang memilikinya dikeluarkan dari hasil.
- **Tap `Terapkan`:** kembali ke tab Hasil dengan filter berlaku.
- **Tap `Reset`:** semua filter dan query dikosongkan.
- **Simpan Preset:** menyimpan query, mode regex, filter properti, pohon Boolean, dan exclusion.
- **Tap preset `Terapkan`:** memuat konfigurasi dan berpindah ke tab Hasil.
- **Split Tree View:** pengguna memilih dua cabang (kiri/kanan); tiap panel memuat daftar itemnya sendiri; di mode portrait dipisah dalam dua sub-tab.
- **Grafik Tag:** cubit untuk zoom, geser untuk pan, tap node memfilter berdasarkan tag itu, long press node menampilkan tag terkait.
- **Tap segmen Breadcrumb:** kembali ke level tersebut dan menghapus filter di bawahnya.

## Data & Logic

- **Fuzzy Search:** kombinasi FTS4/FTS5 (tabel `ClipItemFts` pada `plainContent`) untuk pencocokan awal, lalu skor kemiripan Levenshtein/Jaro-Winkler pada kandidat teratas agar typo tertangani.
- **Regex Search:** dijalankan di memori pada hingga 5.000 item terbaru yang lolos filter lain, dengan timeout 100 ms per item.
- **Filter properti:** kondisi SQL dinamis (dibentuk `SupportSQLiteQuery`) untuk tanggal (`createdAt`), ukuran (`charCount`), folder (`folderId` + turunannya via CTE), tag, `sourceApp`, `contentType`.
- **Boolean Tag:** `DAN` = `EXISTS` untuk setiap tag; `ATAU` = `IN`; `TIDAK` = `NOT EXISTS`. Tag induk menyertakan seluruh turunannya (opsi `Sertakan sub-tag`, bawaan aktif).
- **Exclusion Nodes:** kondisi `NOT EXISTS` tambahan; berlaku terakhir dan menang atas kondisi lain.
- **Entity `FilterPreset`:** `id`, `name`, `queryText`, `isRegex`, `filterJson`, `createdAt`.
- **Grafik Tag:** relasi dihitung dari kemunculan bersama dua tag pada item yang sama (`COUNT`), simpul dibatasi 200 tag teratas untuk performa.
- **Item terkunci/arsip:** folder terkunci tidak muncul di hasil sebelum autentikasi; item di folder arsip muncul hanya jika `Sertakan diarsipkan` aktif.
- **Sorting hasil:** urut relevansi (fuzzy) atau `createdAt DESC` (regex/filter).

## Technical Implementation

- **UI:** Compose; Search Bar memakai `SearchBar`/`TextField` dengan `FocusRequester`; grafik digambar di `Canvas` dengan force-directed layout sederhana (dihitung di `Dispatchers.Default`).
- **State:** `SearchViewModel` dengan `StateFlow<SearchUiState>` (`query`, `isRegex`, `filters`, `results: PagingData`, `presets`, `graph`, `error`). Query memakai `flatMapLatest` agar permintaan lama dibatalkan.
- **Navigation:** route `search?folderId=&tagId=` sehingga bisa dibuka dari Beranda dan Folder & Tag dengan filter awal.
- **Database:** Room dengan FTS (`@Fts4`), `RawQuery` untuk filter dinamis, indeks pada `createdAt`, `sourceApp`, `contentType`.
- **Repository:** `SearchRepository`, `PresetRepository`.
- **Split Tree View:** `TwoPane` layout memakai `WindowSizeClass`; pada layar sempit jadi `TabRow`.
- **Validation:** `Regex(pattern)` dalam `try/catch (PatternSyntaxException)`.
- **Caching:** hasil grafik dan daftar sumber aplikasi disimpan di memori selama sesi.

## States & Edge Cases

| State | Perilaku |
|---|---|
| Initial | Search Bar fokus, tab Hasil kosong dengan hint |
| Loading | Indikator linear di bawah Search Bar |
| Empty | `Tidak ada hasil` |
| Content | Daftar hasil |
| Selected | Contextual Action Bar seperti Beranda |
| Disabled | `Terapkan` nonaktif jika belum ada perubahan; `Simpan sebagai Preset` nonaktif jika tidak ada filter |
| Error | Pesan di bawah Search Bar |

**Edge case:**
- Query kosong dengan filter aktif: hanya filter yang berlaku.
- Regex catastrophic backtracking: dihentikan timeout, tampil `Pola terlalu lambat`.
- Ribuan hasil: paging, tidak dimuat sekaligus.
- Tag/folder pada preset sudah dihapus: bagian itu diabaikan dan preset ditandai `Sebagian filter tidak valid`.
- Grafik sangat padat: tampil 200 node teratas dengan catatan `Menampilkan 200 tag teratas`.
- Layar sempit untuk Split Tree View: berganti ke sub-tab.
- Process death: query dan filter dipulihkan dari `SavedStateHandle`.

---

# PAGE 5 — Alat Teks

## Tujuan

Halaman kumpulan utilitas transformasi teks: sanitasi, konversi huruf, format kode, ekstraksi data, generator Lorem Ipsum, penggabungan (Clipboard Stacking), dan penempelan berurutan (Sequential Pasting Queue). Input bisa berasal dari riwayat, clipboard saat ini, atau ketikan langsung.

## Layout & Tampilan

1. **Top App Bar**: judul `Alat Teks`, menu ⋮.
2. **Tab Row (scrollable)**: `Bersihkan` | `Huruf` | `Kode` | `Ekstrak` | `Tumpuk & Antrean` | `Lorem Ipsum`.
3. **Area Input** (atas): `TextField` multi-baris, tombol `Tempel dari Clipboard` dan `Pilih dari Riwayat`.
4. **Area Opsi** (tengah): kontrol khusus per tab.
5. **Area Hasil** (bawah): pratinjau hasil (read-only), tombol `Salin`, `Simpan sebagai Snippet`, `Ganti Input`.
6. **Bottom Navigation Bar**.

## UI Components

| Komponen | Fungsi & Perilaku |
|---|---|
| Area Input | Menerima teks; menampilkan counter karakter |
| Tombol `Tempel dari Clipboard` | Mengisi input dari clipboard saat ini |
| Tombol `Pilih dari Riwayat` | Membuka pemilih item dari Beranda |
| Opsi Bersihkan | Checkbox: `Hapus baris kosong berlebih`, `Trim spasi`, `Hapus tab`, `Hapus spasi ganda` |
| Opsi Huruf | Pilihan: `camelCase`, `snake_case`, `kebab-case`, `UPPERCASE`, `lowercase`, `Title Case` |
| Opsi Kode | Segmented: `JSON`, `XML`, `HTML`, `SQL`; tombol `Format (Prettify)` dan `Padatkan (Minify)` |
| Opsi Ekstrak | Checkbox: `Nomor telepon`, `Email`, `URL`, `Alamat IP`; hasil dalam daftar dengan jumlah temuan |
| URL Unfurler | Di tab Ekstrak, tombol `Ambil Info Tautan` pada tiap URL (memerlukan koneksi) |
| Tab Tumpuk & Antrean | Dua seksi: `Tumpukan (Stacking)` dan `Antrean Tempel` |
| Daftar Tumpukan | Item terpilih dengan urutan, drag handle, ikon hapus |
| Field Pemisah | Pilihan `Baris baru`, `Spasi`, `Koma`, `Kustom` |
| Antrean Tempel | Daftar item dalam urutan tempel, tombol `Mulai`, `Berikutnya`, `Reset` |
| Tab Lorem Ipsum | Stepper `Jumlah` dan pilihan `Paragraf` / `Kalimat` / `Kata` |
| Area Hasil | Teks hasil dengan tombol aksi |

## UI Text

**Tampil ke pengguna:**

- Judul: `Alat Teks`
- Tab: `Bersihkan`, `Huruf`, `Kode`, `Ekstrak`, `Tumpuk & Antrean`, `Lorem Ipsum`
- Tombol: `Tempel dari Clipboard`, `Pilih dari Riwayat`, `Salin`, `Simpan sebagai Snippet`, `Ganti Input`, `Format`, `Padatkan`, `Ambil Info Tautan`, `Mulai`, `Berikutnya`, `Reset`, `Buat`
- Placeholder input: `Tempel atau ketik teks di sini...`
- Opsi Bersihkan: `Hapus baris kosong berlebih`, `Trim spasi`, `Hapus tab`, `Hapus spasi ganda`
- Opsi Ekstrak: `Nomor telepon`, `Email`, `URL`, `Alamat IP`
- Label: `Pemisah`, `Jumlah`, `Hasil`
- Seksi: `Tumpukan`, `Antrean Tempel`
- Status antrean: `Item {n} dari {total}`
- Snackbar: `Hasil disalin`, `Disimpan sebagai snippet`, `Antrean selesai`, `Antrean direset`
- Hasil ekstraksi: `{n} ditemukan`; kosong: `Tidak ada data yang cocok`
- Empty input: `Masukkan teks untuk memulai`
- Error: `Format tidak valid`, `Tidak ada koneksi. Info tautan tidak dapat diambil.`, `Gagal memproses teks`
- Metadata URL: `Judul: {title}` dan `Deskripsi: {description}`

## Interaction & Behavior

- **Mengisi input:** ketik, tempel, atau pilih dari riwayat; hasil dihitung otomatis (debounce 300 ms) sesuai opsi.
- **Tab Bersihkan:** mengubah checkbox langsung memperbarui pratinjau.
- **Tab Huruf:** tap pilihan mengubah hasil seketika; hanya satu pilihan aktif.
- **Tab Kode:** tap `Format` atau `Padatkan`; jika sintaks tidak valid, tampil `Format tidak valid` dan input tidak berubah.
- **Tab Ekstrak:** memilih jenis data menampilkan daftar temuan; tap temuan menyalinnya, tombol `Salin Semua` menyalin seluruhnya dipisah baris baru.
- **URL Unfurler:** tap `Ambil Info Tautan` mengunduh judul dan deskripsi (jika online dan diizinkan di Pengaturan); hasil di-cache; tanpa koneksi, tombol nonaktif dan tampil pesan.
- **Tumpuk (Stacking):** pilih beberapa item dari riwayat, atur urutan dengan drag, pilih pemisah; hasil gabungan disalin sekali tap atau disimpan sebagai snippet.
- **Antrean Tempel (Sequential Pasting):** tap `Mulai` mengaktifkan mode antrean: notifikasi persisten menampilkan `Item 1 dari N`; setiap kali pengguna menempel, item berikutnya otomatis dimasukkan ke clipboard (lewat tombol `Berikutnya` di notifikasi atau deteksi tempel via Accessibility Service jika diaktifkan); `Reset` mengembalikan ke item pertama.
- **Lorem Ipsum:** atur jumlah dan unit, tap `Buat`, hasil bisa disalin atau disimpan.
- **Simpan sebagai Snippet:** membuat `ClipItem` baru dari hasil (tipe TEXT, tanpa sumber aplikasi).
- **Ganti Input:** mengosongkan input dan hasil.

## Data & Logic

- **Sanitasi:** regex `\n{3,}` → `\n\n`, `^[ \t]+|[ \t]+$` per baris, `\t` → spasi, `[ ]{2,}` → satu spasi.
- **Case Converter:** tokenisasi kata (pisah pada spasi, `_`, `-`, dan batas huruf besar-kecil), lalu gabung sesuai gaya.
- **Prettify/Minify:**
  - JSON: `JSONObject`/`kotlinx.serialization` dengan indentasi 2 spasi atau tanpa spasi.
  - XML/HTML: parser dan serializer dengan indentasi.
  - SQL: formatter berbasis token (kata kunci huruf besar, baris baru sebelum `FROM`, `WHERE`, dll.).
- **Ekstraksi:** pola regex bawaan untuk telepon (format internasional dan lokal), email (RFC ringan), URL, IPv4/IPv6; duplikat dihapus.
- **URL Metadata:** `HttpURLConnection`/OkHttp dengan timeout 5 detik, parse `<title>` dan `<meta name="description">`; hasil disimpan di tabel `UrlMetadataCache` (`url`, `title`, `description`, `fetchedAt`).
- **Stacking:** `items.joinToString(delimiter)`.
- **Antrean:** state `QueueSession` (`itemIds`, `currentIndex`) disimpan di service; dihapus saat selesai atau `Reset`.
- **Lorem Ipsum:** korpus bawaan di aset aplikasi, generator deterministik per jumlah.
- Semua transformasi bersifat lokal dan tidak mengubah item asal kecuali pengguna memilih `Simpan sebagai Snippet`.

## Technical Implementation

- **UI:** Compose, satu layar dengan `HorizontalPager` untuk tab.
- **State:** `TextToolsViewModel` dengan `StateFlow<TextToolsUiState>` (`input`, `activeTool`, `options`, `output`, `extracted`, `queue`, `error`).
- **Domain layer:** kelas murni Kotlin (`TextSanitizer`, `CaseConverter`, `CodeFormatter`, `DataExtractor`, `LoremGenerator`) agar mudah diuji unit.
- **Network:** hanya untuk URL Unfurler, dibungkus pemeriksaan `ConnectivityManager` dan saklar izin di Pengaturan; fitur lain 100% offline.
- **Antrean:** `QueuePasteService` (Foreground Service) + notifikasi dengan aksi `Berikutnya`; opsional `AccessibilityService` untuk mendeteksi tempel.
- **Threading:** transformasi teks besar di `Dispatchers.Default`.
- **Validation & error handling:** batas input 1 MB; kegagalan parser dikembalikan sebagai `Result.failure` dan ditampilkan sebagai Snackbar.

## States & Edge Cases

| State | Perilaku |
|---|---|
| Initial | Input kosong, hasil kosong, teks `Masukkan teks untuk memulai` |
| Loading | Indikator progres saat memproses teks besar atau mengambil metadata |
| Empty | Ekstraksi tanpa temuan: `Tidak ada data yang cocok` |
| Content | Hasil tampil |
| Selected | Item terpilih di Tumpukan tampil bernomor |
| Disabled | `Padatkan`/`Format` nonaktif jika input kosong; `Ambil Info Tautan` nonaktif tanpa koneksi |
| Error | Snackbar atau teks error di bawah input |

**Edge case:**
- Input > 1 MB: ditolak dengan pesan `Teks terlalu besar`.
- JSON dengan angka sangat besar atau nesting dalam: diproses dengan batas kedalaman.
- Antrean dengan satu item: langsung selesai.
- Item riwayat dihapus saat antrean berjalan: dilewati.
- Android 10+ tanpa Accessibility: penempelan berurutan memakai tombol `Berikutnya` manual di notifikasi.
- URL tidak merespons atau bukan HTML: tampil `Info tidak tersedia`.
- Teks dengan emoji/karakter Unicode: hitungan memakai code point, bukan panjang byte.
- Rotasi layar: input dan tab aktif dipulihkan dari `SavedStateHandle`.

---

# PAGE 6 — Keamanan & Privasi

## Tujuan

Halaman pengaturan keamanan aplikasi: daftar aplikasi yang diizinkan/dilarang (Whitelist/Blacklist), deteksi dan masking data sensitif, snippet Self-Destruct, penguncian folder dan aplikasi (PIN/Biometrik), Auto-Lock saat idle, enkripsi database, dan pembersihan clipboard saat layar terkunci.

## Layout & Tampilan

1. **Top App Bar**: tombol Kembali, judul `Keamanan & Privasi`.
2. **Kartu Ringkasan Keamanan** di atas: status enkripsi, kunci aplikasi, mode Incognito.
3. **Daftar Bagian** (`LazyColumn` dengan header seksi):
   - `Kunci Aplikasi`
   - `Data Sensitif`
   - `Aplikasi yang Dikecualikan`
   - `Snippet Sekali Pakai`
   - `Pembersihan Otomatis`
   - `Enkripsi`
4. Setiap bagian berisi baris pengaturan: judul, deskripsi, kontrol (Switch/Chip/Dropdown).
5. Halaman ini dibuka dari menu ⋮ Beranda dan dari Pengaturan; tidak ada di Bottom Navigation.

## UI Components

| Komponen | Fungsi & Perilaku |
|---|---|
| Kartu Ringkasan | Tiga indikator status (ikon + teks) |
| Switch `Kunci Aplikasi` | Mengaktifkan penguncian aplikasi |
| Baris `Metode Kunci` | Pilihan: `PIN`, `Biometrik`, `PIN + Biometrik` |
| Baris `Kunci Otomatis saat Idle` | Dropdown: `Segera`, `30 detik`, `1 menit`, `5 menit`, `15 menit`, `Nonaktif` |
| Baris `Ubah PIN` | Membuka alur pembuatan PIN baru |
| Switch `Deteksi Data Sensitif` | Mengaktifkan masking otomatis |
| Baris `Jenis Data Sensitif` | Checkbox: `Kartu kredit`, `Token/API key`, `Kata sandi`, `Nomor identitas` |
| Baris `Mode Masking` | Pilihan: `Sembunyikan di daftar` / `Sembunyikan & jangan simpan` |
| Baris `Mode Aplikasi` | Segmented: `Blacklist` / `Whitelist` |
| Daftar Aplikasi | Daftar aplikasi terpasang dengan Switch per aplikasi, kolom pencarian |
| Switch `Snippet Sekali Pakai` | Mengizinkan penandaan Self-Destruct |
| Baris `Bersihkan Clipboard saat Layar Terkunci` | Switch |
| Baris `Bersihkan Clipboard Otomatis` | Dropdown: `Nonaktif`, `30 detik`, `1 menit`, `5 menit` |
| Baris `Enkripsi Database` | Status `AES-256 aktif` (tidak dapat dimatikan) |
| Baris `Folder Terkunci` | Menu ke daftar folder terkunci |
| Dialog PIN | Keypad numerik 4-8 digit |

## UI Text

**Tampil ke pengguna:**

- Judul: `Keamanan & Privasi`
- Seksi: `Kunci Aplikasi`, `Data Sensitif`, `Aplikasi yang Dikecualikan`, `Snippet Sekali Pakai`, `Pembersihan Otomatis`, `Enkripsi`
- Label dan deskripsi:
  - `Kunci Aplikasi` / `Minta PIN atau biometrik saat membuka aplikasi.`
  - `Metode Kunci` (opsi: `PIN`, `Biometrik`, `PIN + Biometrik`)
  - `Kunci Otomatis saat Idle` / `Kunci aplikasi jika tidak ada aktivitas.`
  - `Ubah PIN`
  - `Deteksi Data Sensitif` / `Sembunyikan kartu kredit, token, dan kata sandi di daftar.`
  - `Mode Masking` (opsi: `Sembunyikan di daftar`, `Sembunyikan & jangan simpan`)
  - `Mode Aplikasi` (opsi: `Blacklist`, `Whitelist`)
  - `Cari aplikasi...`
  - `Snippet Sekali Pakai` / `Hapus item otomatis setelah ditempel satu kali.`
  - `Bersihkan Clipboard saat Layar Terkunci`
  - `Bersihkan Clipboard Otomatis`
  - `Enkripsi Database` / `AES-256 aktif`
  - `Folder Terkunci`
- Ringkasan: `Enkripsi aktif`, `Kunci aplikasi aktif` / `Kunci aplikasi mati`, `Incognito aktif` / `Incognito mati`
- Dialog PIN: judul `Buat PIN`, `Masukkan PIN`, `Konfirmasi PIN`, tombol `Batal`, `Lanjut`, `Simpan`
- Prompt biometrik: `Buka Clipboard`, `Gunakan sidik jari atau wajah`, `Batal`
- Dialog konfirmasi nonaktif kunci: judul `Nonaktifkan kunci?`, isi `Aplikasi dapat dibuka tanpa autentikasi.`, tombol `Batal` / `Nonaktifkan`
- Dialog Whitelist: judul `Mode Whitelist`, isi `Hanya aplikasi yang diizinkan yang akan ditangkap.`, tombol `Batal` / `Lanjut`
- Snackbar: `PIN disimpan`, `Kunci aplikasi diaktifkan`, `Pengaturan disimpan`
- Error: `PIN tidak cocok`, `PIN minimal 4 digit`, `Biometrik tidak tersedia di perangkat ini`, `Terlalu banyak percobaan. Coba lagi dalam {n} detik`, `Gagal menyimpan pengaturan`

## Interaction & Behavior

- **Mengaktifkan Kunci Aplikasi:** jika PIN belum ada, buka alur `Buat PIN` (masukkan → konfirmasi → simpan); jika Biometrik dipilih, uji dengan `BiometricPrompt` sebelum menyimpan.
- **Membuka aplikasi:** jika kunci aktif, layar kunci ditampilkan sampai autentikasi berhasil.
- **Auto-Lock:** setelah aplikasi ke latar belakang atau idle melewati batas waktu, sesi berikutnya menampilkan layar kunci.
- **Mengubah PIN:** verifikasi PIN lama dulu.
- **Deteksi Sensitif:** saat item baru sesuai pola, ditandai `isSensitive`; di daftar tampil `••••••` dengan ikon perisai; tap ikon mata butuh autentikasi lalu menampilkan isi 5 detik.
- **Mode `Sembunyikan & jangan simpan`:** item sensitif tidak ditulis ke database sama sekali.
- **Blacklist/Whitelist:** memilih aplikasi menentukan sumber yang diabaikan (blacklist) atau satu-satunya yang ditangkap (whitelist); perubahan berlaku seketika untuk capture berikutnya.
- **Snippet Sekali Pakai:** setelah aktif, opsi `Hapus setelah ditempel` muncul di Quick Action Toolbar dan Detail & Editor Snippet.
- **Bersihkan saat layar terkunci:** ketika `ACTION_SCREEN_OFF` diterima, clipboard OS dikosongkan.
- **Bersihkan Clipboard Otomatis:** setelah teks disalin dari aplikasi ini, clipboard dikosongkan setelah jeda pilihan.
- **Folder Terkunci:** membuka daftar folder terkunci dengan aksi `Buka Kunci` (autentikasi diperlukan) dan `Hapus Kunci`.

## Data & Logic

- **Penyimpanan kredensial:** hash PIN (PBKDF2 dengan salt) dalam `EncryptedSharedPreferences` (Jetpack Security), bukan di Room.
- **Kunci enkripsi database:** kunci acak 256-bit dibuat sekali, dibungkus (wrap) dengan kunci Android Keystore (hardware-backed jika tersedia), dipakai SQLCipher.
- **Pola sensitif:**
  - Kartu kredit: `\b(?:\d[ -]?){13,19}\b` + validasi Luhn.
  - Token/API key: pola umum (`sk-`, `ghp_`, `AKIA`, string acak berentropi tinggi ≥ 32 karakter).
  - Kata sandi: heuristik (panjang 8-64, campuran huruf/angka/simbol, tanpa spasi) dan sumber dari aplikasi pengelola sandi.
- **Entity `AppRule`:** `packageName`, `appName`, `isAllowed`; disimpan bersama `captureMode` (BLACKLIST/WHITELIST) di DataStore.
- **Rate limit PIN:** setelah 5 percobaan gagal, penguncian 30 detik dan berlipat tiap kegagalan berikutnya.
- **Self-Destruct:** field `isSelfDestruct`; setelah aksi Salin/tempel pertama, item dipindah ke penghapusan permanen (tanpa Sampah).
- **Clear on screen off:** `BroadcastReceiver` untuk `ACTION_SCREEN_OFF`, memanggil `ClipboardManager.clearPrimaryClip()` (API 28+; di bawahnya menyalin string kosong).
- Pengaturan disimpan di `DataStore Preferences`.

## Technical Implementation

- **UI:** Compose, `LazyColumn` dengan komponen `SettingsRow`.
- **State:** `SecurityViewModel` dengan `StateFlow<SecurityUiState>`.
- **Biometrik:** `androidx.biometric.BiometricPrompt` dengan `BIOMETRIC_STRONG`, fallback ke PIN.
- **Layar kunci:** `LockScreen` composable yang ditampilkan di atas `NavHost` selama `isLocked = true`; `FLAG_SECURE` pada window mencegah screenshot dan pratinjau di Recent Apps.
- **Lifecycle:** `ProcessLifecycleOwner` untuk mendeteksi masuk latar belakang dan menghitung idle timer.
- **Daftar aplikasi:** `PackageManager.getInstalledApplications()` (perlu deklarasi `QUERY_ALL_PACKAGES` atau `<queries>`), dimuat asinkron dan di-cache.
- **Receiver:** didaftarkan dinamis di `ClipboardCaptureService`.
- **Enkripsi:** SQLCipher `SupportFactory` untuk Room; migrasi database tidak terenkripsi ke terenkripsi saat pertama kali dijalankan.
- **Error handling:** kegagalan Keystore (`KeyPermanentlyInvalidatedException`) memicu alur pemulihan (PIN ulang).

## States & Edge Cases

| State | Perilaku |
|---|---|
| Initial | Nilai pengaturan dibaca dari DataStore |
| Loading | Daftar aplikasi menampilkan indikator saat dimuat |
| Empty | Daftar aplikasi kosong: `Tidak ada aplikasi ditemukan` |
| Content | Pengaturan tampil normal |
| Disabled | `Metode Kunci` dan `Kunci Otomatis` nonaktif jika `Kunci Aplikasi` mati; `Biometrik` nonaktif jika perangkat tidak mendukung |
| Error | Snackbar atau teks error pada dialog PIN |

**Edge case:**
- Biometrik berubah (sidik jari baru ditambahkan): kunci Keystore bisa tidak valid, pengguna diminta PIN dan kunci dibuat ulang.
- Lupa PIN: tidak ada pemulihan jarak jauh; tersedia opsi `Reset Aplikasi` yang menghapus seluruh data setelah konfirmasi ganda.
- Whitelist kosong: peringatan `Belum ada aplikasi yang diizinkan, tidak ada yang akan ditangkap`.
- Perangkat tanpa layar kunci sistem: biometrik tidak ditawarkan.
- Screenshot: diblokir oleh `FLAG_SECURE`, bisa dimatikan di Pengaturan bila pengguna mau.
- Pola sensitif salah deteksi: pengguna bisa `Tandai Bukan Sensitif` pada item.
- Android < 9: `clearPrimaryClip()` tidak ada, pakai fallback menyalin string kosong.
- Rotasi layar saat memasukkan PIN: digit yang sudah diketik dipertahankan.

---

# PAGE 7 — Analitik

## Tujuan

Halaman dashboard statistik penggunaan clipboard: jumlah salinan per hari/bulan, aplikasi sumber terbanyak, tag populer, dan daftar teks yang paling sering ditempel. Semua dihitung lokal dari database.

## Layout & Tampilan

1. **Top App Bar**: judul `Analitik`, menu ⋮.
2. **Filter Periode** (`SegmentedButton`): `7 Hari` | `30 Hari` | `Tahun Ini` | `Semua`.
3. **Kartu Ringkasan** (grid 2×2): `Total Salinan`, `Rata-rata per Hari`, `Item Tersimpan`, `Item Disematkan`.
4. **Kartu Grafik Aktivitas**: grafik batang jumlah salinan per hari (7/30 hari) atau per bulan (Tahun Ini/Semua).
5. **Kartu Aplikasi Sumber Teratas**: daftar peringkat dengan bilah horizontal.
6. **Kartu Tag Populer**: daftar tag dengan jumlah item.
7. **Kartu Paling Sering Dipakai**: daftar 10 item teratas.
8. **Bottom Navigation Bar**.

## UI Components

| Komponen | Fungsi & Perilaku |
|---|---|
| Filter Periode | Mengubah rentang data seluruh kartu |
| Kartu Ringkasan | Angka besar, label, dan perbandingan dengan periode sebelumnya (`▲ 12%`) |
| Grafik Batang | Sumbu X tanggal/bulan, Y jumlah; tap batang menampilkan tooltip |
| Daftar Aplikasi Teratas | Ikon aplikasi, nama, jumlah, bilah proporsi |
| Daftar Tag Populer | Chip tag dengan jumlah; tap membuka Pencarian & Filter dengan tag tersebut |
| Daftar Paling Sering Dipakai | Pratinjau 1 baris, jumlah tempel; tap membuka Detail & Editor Snippet |
| Menu ⋮ | `Ekspor Statistik (CSV)`, `Setel Ulang Statistik` |

## UI Text

**Tampil ke pengguna:**

- Judul: `Analitik`
- Periode: `7 Hari`, `30 Hari`, `Tahun Ini`, `Semua`
- Kartu: `Total Salinan`, `Rata-rata per Hari`, `Item Tersimpan`, `Item Disematkan`
- Judul kartu: `Aktivitas`, `Aplikasi Sumber Teratas`, `Tag Populer`, `Paling Sering Dipakai`
- Satuan: `{n} salinan`, `{n} kali`, `{n} item`
- Menu ⋮: `Ekspor Statistik (CSV)`, `Setel Ulang Statistik`
- Empty state: `Belum ada data` / `Statistik muncul setelah kamu mulai menyalin teks.`
- Empty per kartu: `Tidak ada data untuk periode ini`
- Dialog Setel Ulang: judul `Setel ulang statistik?`, isi `Data statistik akan dihapus. Riwayat clipboard tidak terpengaruh.`, tombol `Batal` / `Setel Ulang`
- Snackbar: `Statistik diekspor`, `Statistik disetel ulang`
- Error: `Gagal memuat statistik`, `Gagal mengekspor statistik`
- Tooltip grafik: `{tanggal}: {n} salinan`

## Interaction & Behavior

- **Ganti periode:** semua kartu dan grafik dimuat ulang dengan animasi ringan.
- **Tap batang grafik:** menampilkan tooltip tanggal dan jumlah.
- **Tap aplikasi teratas:** membuka Pencarian & Filter dengan filter `Sumber aplikasi` tersebut.
- **Tap tag populer:** membuka Pencarian & Filter dengan filter tag.
- **Tap item Paling Sering Dipakai:** membuka Detail & Editor Snippet; long press menyalin langsung.
- **Ekspor Statistik:** menyimpan CSV via Storage Access Framework.
- **Setel Ulang Statistik:** dialog konfirmasi, menghapus data `UsageEvent` tetapi tidak menyentuh `ClipItem`.
- **Pull-to-refresh:** menghitung ulang semua angka.

## Data & Logic

- **Entity `UsageEvent`:** `id`, `clipId` (nullable), `eventType` (CAPTURE/COPY/PASTE), `sourceApp`, `timestamp`. Dicatat setiap capture dan setiap aksi Salin.
- **Perhitungan:**
  - `Total Salinan` = jumlah `UsageEvent` bertipe CAPTURE pada periode.
  - `Rata-rata per Hari` = total ÷ jumlah hari periode.
  - `Item Tersimpan` = `COUNT(ClipItem WHERE isDeleted = 0)`.
  - `Item Disematkan` = `COUNT(isPinned = 1)`.
  - Perbandingan periode sebelumnya = selisih persentase terhadap rentang setara sebelumnya.
- **Aplikasi teratas:** `GROUP BY sourceApp ORDER BY COUNT DESC LIMIT 10`.
- **Tag populer:** `COUNT` pada `ClipTagCrossRef` untuk item pada periode, 10 teratas.
- **Paling sering dipakai:** `ClipItem` diurutkan `useCount DESC`, 10 teratas (sama dengan tab `Sering Dipakai` di Beranda Riwayat).
- **Agregasi harian:** tabel ringkasan opsional `DailyStat` yang diperbarui `WorkManager` agar query tahunan tetap cepat.
- Data anonim, lokal, tidak dikirim ke luar perangkat.
- Saat Incognito aktif, tidak ada `UsageEvent` yang dicatat.

## Technical Implementation

- **UI:** Compose; grafik dengan `Canvas` kustom atau library ringan (Vico/MPAndroidChart).
- **State:** `AnalyticsViewModel` dengan `StateFlow<AnalyticsUiState>` (`period`, `summary`, `activity`, `topApps`, `topTags`, `topItems`, `isLoading`, `error`).
- **Repository:** `AnalyticsRepository` dengan query agregat di `UsageEventDao`.
- **Database:** indeks pada `UsageEvent(timestamp)` dan `UsageEvent(sourceApp)`.
- **Background:** `WorkManager` harian untuk merangkum `UsageEvent` lama menjadi `DailyStat` dan memangkas event > 12 bulan.
- **Caching:** hasil per periode disimpan di memori selama layar terbuka.
- **Ekspor:** CSV ditulis lewat `ContentResolver.openOutputStream`.
- **Error handling:** kegagalan query menampilkan state Error dengan tombol `Coba Lagi`.

## States & Edge Cases

| State | Perilaku |
|---|---|
| Initial | Skeleton kartu dan grafik |
| Loading | Indikator progres; data lama tetap terlihat samar |
| Empty | Empty state utama; kartu individual `Tidak ada data untuk periode ini` |
| Content | Semua kartu terisi |
| Disabled | `Ekspor Statistik` nonaktif jika belum ada data |
| Error | Kartu error dengan tombol `Coba Lagi` |

**Edge case:**
- Periode `Semua` dengan data bertahun-tahun: grafik dikelompokkan per bulan.
- Hari tanpa aktivitas: batang bernilai 0, tetap tampil.
- Aplikasi sumber sudah di-uninstall: tampil nama paket dengan ikon generik.
- Zona waktu berubah: pengelompokan hari memakai zona waktu perangkat saat ini.
- `Setel Ulang Statistik` tidak mengubah `useCount` pada `ClipItem`, jadi `Paling Sering Dipakai` tetap ada.
- Perbandingan periode sebelumnya tidak tersedia pada `Semua` dan disembunyikan.

---

# PAGE 8 — Pengaturan & Sistem

## Tujuan

Pusat konfigurasi seluruh perilaku aplikasi: kebijakan penyimpanan (Retention), Deduplication, format teks, tampilan dan tema, umpan balik, notifikasi, overlay/shortcut, Backup & Restore, Config Export/Import, dan pemeliharaan database (Auto-Maintenance dan Auto-Repair).

## Layout & Tampilan

1. **Top App Bar**: judul `Pengaturan`.
2. **Daftar Bagian** (`LazyColumn` dengan header seksi):
   - `Penangkapan`
   - `Penyimpanan`
   - `Tampilan`
   - `Akses Cepat`
   - `Notifikasi & Umpan Balik`
   - `Cadangan & Data`
   - `Pemeliharaan`
   - `Tentang`
3. Baris `Keamanan & Privasi` di paling atas sebagai jalan pintas ke halaman 6.
4. **Bottom Navigation Bar**.

## UI Components

| Komponen | Fungsi & Perilaku |
|---|---|
| Switch `Tangkap Otomatis` | Menyalakan/mematikan Foreground Service capture |
| Baris `Penanganan Duplikat` | Pilihan: `Perbarui waktu`, `Abaikan` |
| Baris `Format Teks` | Pilihan: `Teks polos`, `Simpan format asli` |
| Dropdown `Hapus Otomatis` | `Nonaktif`, `24 jam`, `7 hari`, `30 hari` |
| Dropdown `Batas Penyimpanan` | `100`, `500`, `1.000`, `5.000` item, atau `Tanpa batas` |
| Baris `Masa Simpan Sampah` | `7 hari`, `30 hari`, `Tanpa batas` |
| Baris `Mode Tampilan Bawaan` | `Daftar Ringkas`, `Kartu Grid`, `Tampilan Detail` |
| Baris `Tema` | `Ikuti Sistem`, `Terang`, `Gelap` |
| Switch `Overlay Melayang` | Mengaktifkan floating bubble (perlu izin) |
| Baris `Pintasan Snippet` | Kelola shortcut launcher/widget per snippet |
| Switch `Notifikasi Persisten` | Notifikasi dengan 5-10 item terakhir |
| Baris `Jumlah Item di Notifikasi` | `5` atau `10` |
| Switch `Getaran` dan `Suara` | Umpan balik saat salin/tempel |
| Switch `Notifikasi Kejadian` | Tag otomatis, pembersihan, dan pembaruan |
| Baris `Cadangan Sekarang` | Membuat backup manual |
| Baris `Cadangan Terjadwal` | `Nonaktif`, `Harian`, `Mingguan` |
| Baris `Pulihkan dari Cadangan` | Memilih file backup |
| Baris `Ekspor Konfigurasi` / `Impor Konfigurasi` | Mengelola pengaturan, aturan Auto-Tagging, dan pohon filter |
| Baris `Optimalkan Database` | Menjalankan vacuum manual |
| Baris `Periksa & Perbaiki Database` | Menjalankan integrity check dan repair |
| Baris `Tentang` | Versi, lisensi, kebijakan privasi |

## UI Text

**Tampil ke pengguna:**

- Judul: `Pengaturan`
- Seksi: `Penangkapan`, `Penyimpanan`, `Tampilan`, `Akses Cepat`, `Notifikasi & Umpan Balik`, `Cadangan & Data`, `Pemeliharaan`, `Tentang`
- Label dan deskripsi:
  - `Tangkap Otomatis` / `Simpan teks yang disalin dari aplikasi lain.`
  - `Penanganan Duplikat` (opsi: `Perbarui waktu`, `Abaikan`)
  - `Format Teks` (opsi: `Teks polos`, `Simpan format asli`)
  - `Hapus Otomatis` / `Hapus item yang tidak disematkan setelah waktu tertentu.`
  - `Batas Penyimpanan` / `Item terlama dihapus saat batas terlampaui. Item tersemat aman.`
  - `Masa Simpan Sampah`
  - `Mode Tampilan Bawaan`
  - `Tema` (opsi: `Ikuti Sistem`, `Terang`, `Gelap`)
  - `Overlay Melayang` / `Tampilkan tombol melayang untuk akses cepat.`
  - `Pintasan Snippet` / `Buat pintasan ke snippet tertentu.`
  - `Notifikasi Persisten` / `Tampilkan riwayat terakhir di bilah notifikasi.`
  - `Jumlah Item di Notifikasi`
  - `Getaran`, `Suara`, `Notifikasi Kejadian`
  - `Cadangan Sekarang`, `Cadangan Terjadwal`, `Pulihkan dari Cadangan`
  - `Ekspor Konfigurasi`, `Impor Konfigurasi`
  - `Optimalkan Database`, `Periksa & Perbaiki Database`
  - `Tentang Aplikasi`, `Versi {x}`
  - `Ambil Info Tautan Online` / `Izinkan aplikasi mengambil judul tautan saat ada koneksi.` (bawaan mati)
- Dialog Pulihkan: judul `Pulihkan cadangan?`, isi `Data saat ini akan diganti dengan isi cadangan.`, tombol `Batal` / `Pulihkan`
- Dialog Batas Penyimpanan: judul `Kurangi batas penyimpanan?`, isi `{n} item terlama akan dihapus.`, tombol `Batal` / `Lanjut`
- Dialog Perbaikan: judul `Perbaiki database?`, isi `Aplikasi akan mencoba memulihkan data yang rusak.`, tombol `Batal` / `Perbaiki`
- Snackbar: `Cadangan dibuat`, `Data dipulihkan`, `Konfigurasi diekspor`, `Konfigurasi diimpor`, `Database dioptimalkan`, `Database sehat`, `Database diperbaiki`
- Notifikasi sistem: `{n} item dibersihkan otomatis`, `Tag otomatis ditambahkan ke {n} item`
- Error: `Gagal membuat cadangan`, `Berkas cadangan tidak valid`, `Izin overlay diperlukan`, `Gagal memperbaiki database. Pulihkan dari cadangan.`

## Interaction & Behavior

- **Switch `Tangkap Otomatis`:** menyalakan/mematikan service; sinkron dengan tombol Pause di Beranda Riwayat.
- **Mengubah `Hapus Otomatis` atau `Batas Penyimpanan`:** worker dijadwalkan ulang; jika batas diturunkan, dialog konfirmasi menampilkan jumlah item yang akan dihapus.
- **Mengubah `Tema`:** diterapkan langsung tanpa restart.
- **`Overlay Melayang`:** jika izin belum ada, membuka layar izin sistem; setelah kembali, service overlay dimulai. Tap bubble membuka jendela mini riwayat; drag memindahkan posisi.
- **`Pintasan Snippet`:** pilih snippet, buat pintasan launcher (`ShortcutManagerCompat`) atau widget.
- **`Cadangan Sekarang`:** pilih lokasi via Storage Access Framework, buat file `.clipbak` terenkripsi.
- **`Cadangan Terjadwal`:** menjadwalkan `WorkManager` periodik yang menyimpan backup ke folder terpilih.
- **`Pulihkan`:** pilih file, validasi, konfirmasi, ganti database, aplikasi dimuat ulang.
- **`Ekspor/Impor Konfigurasi`:** file JSON berisi pengaturan, aturan Auto-Tagging, dan pohon filter/preset; saat impor tampil ringkasan dan opsi `Gabungkan` / `Timpa`.
- **`Optimalkan Database`:** menjalankan `VACUUM` dan `REINDEX` dengan indikator progres.
- **`Periksa & Perbaiki Database`:** menjalankan `PRAGMA integrity_check`; jika bermasalah, mencoba pemulihan otomatis.
- **`Notifikasi Persisten`:** menyala/mati ikut mengubah foreground notification.

## Data & Logic

- **Penyimpanan pengaturan:** `DataStore Preferences` (kunci: `captureEnabled`, `dedupMode`, `keepFormat`, `autoPurgeHours`, `maxItems`, `trashDays`, `displayMode`, `theme`, `overlayEnabled`, `persistentNotif`, `notifItemCount`, `haptic`, `sound`, `eventNotif`, `backupSchedule`, `onlineUnfurl`).
- **Retention:**
  - Auto-purge: item tidak tersemat/tidak terkunci dengan `createdAt` lebih tua dari batas dipindah ke penghapusan.
  - FIFO cap: jika jumlah item melebihi batas, hapus item terlama yang tidak tersemat/terkunci.
  - Pin & Lock selalu dikecualikan.
- **Deduplication:** membandingkan `contentHash`, lihat Beranda Riwayat (halaman 1).
- **Backup:** salinan file database terenkripsi + berkas metadata (versi skema, tanggal); kompresi ZIP; nama file `clipboard-backup-YYYYMMDD-HHmm.clipbak`.
- **Restore:** validasi versi skema, cek integritas, ganti database dalam satu langkah aman (tulis ke berkas sementara lalu tukar).
- **Auto-Maintenance:** `WorkManager` mingguan (saat idle dan mengisi daya) menjalankan `ANALYZE`, `REINDEX`, dan `VACUUM`.
- **Auto-Repair:** saat pembukaan database gagal atau `integrity_check` tidak `ok`: 1) coba `wal_checkpoint` dan reopen, 2) `recover` data ke database baru, 3) jika gagal, tawarkan restore dari backup terakhir.
- **Config export:** serialisasi JSON `AppConfig` (pengaturan + `AutoTagRule` + `FilterPreset` + struktur tag).

## Technical Implementation

- **UI:** Compose, komponen `SettingsSection`/`SettingsRow` yang dipakai bersama dengan halaman Keamanan & Privasi.
- **State:** `SettingsViewModel` dengan `StateFlow<SettingsUiState>` yang membaca `DataStore` via `Flow`.
- **Overlay:** `OverlayService` memakai `WindowManager` dengan `TYPE_APPLICATION_OVERLAY` dan izin `SYSTEM_ALERT_WINDOW`.
- **Shortcut:** `ShortcutManagerCompat.pushDynamicShortcut` untuk pintasan dinamis dan `AppWidgetProvider` untuk widget snippet.
- **Quick Settings Tile:** `TileService` untuk Pause/Resume dan buka Beranda.
- **Background:** `WorkManager` untuk purge, backup terjadwal, dan maintenance dengan constraint (`requiresDeviceIdle`, `requiresCharging`).
- **Backup/Restore:** `DatabaseBackupManager` memakai `ContentResolver` dan `ZipOutputStream`.
- **Repair:** `DatabaseRepairManager` dengan `SupportSQLiteDatabase` dan `PRAGMA`.
- **Notifikasi:** `NotificationChannel` terpisah (`capture_persistent`, `events`, `maintenance`).
- **Permissions:** `POST_NOTIFICATIONS` (Android 13+), `SYSTEM_ALERT_WINDOW`, `FOREGROUND_SERVICE`, `VIBRATE`; dijelaskan pada onboarding.
- **Error handling:** semua operasi berat dibungkus `Result` dan ditampilkan via Snackbar/Dialog, serta dicatat di log lokal yang bisa diekspor.

## States & Edge Cases

| State | Perilaku |
|---|---|
| Initial | Pengaturan dimuat dari DataStore |
| Loading | Dialog progres saat backup/restore/vacuum/repair |
| Empty | Tidak relevan; nilai bawaan selalu tersedia |
| Content | Pengaturan tampil normal |
| Disabled | `Cadangan Terjadwal` nonaktif jika lokasi backup belum dipilih; `Pintasan Snippet` nonaktif jika belum ada snippet; `Overlay Melayang` menunggu izin |
| Error | Snackbar atau dialog error |

**Edge case:**
- Ruang penyimpanan tidak cukup saat backup: gagal dengan pesan jelas, tidak ada file setengah jadi.
- Restore dari versi skema lebih baru dari aplikasi: ditolak dengan `Berkas cadangan dari versi aplikasi yang lebih baru`.
- Restore dari versi lebih lama: dimigrasikan otomatis.
- Perangkat mati mendadak saat menulis: WAL dan integrity check pada startup memicu Auto-Repair.
- Izin overlay dicabut saat aktif: service berhenti, switch kembali mati, tampil `Izin overlay diperlukan`.
- Penghemat baterai agresif (OEM tertentu): capture bisa dihentikan sistem; tampil panduan pengecualian optimasi baterai di layar izin.
- Ganti bahasa/tema saat dialog terbuka: state dialog dipertahankan.
- Backup terjadwal gagal berturut-turut: notifikasi `Cadangan terjadwal gagal` setelah 3 kali.
- Impor konfigurasi dengan aturan yang merujuk tag yang tidak ada: tag dibuat otomatis atau aturan dilewati (ditampilkan di ringkasan).

---

## Catatan Akhir

PRD 8 halaman sudah lengkap. Berikut ringkasan pemetaan 70 fitur ke halaman:

| Modul asal | Halaman utama |
|---|---|
| 1. Core Engine & Capture | Beranda Riwayat (1), Detail & Editor Snippet (2), Pengaturan & Sistem (8) |
| 2. Organisasi Folder & Tag | Folder & Tag (3) |
| 3. Pencarian & Filter Dinamis | Pencarian & Filter (4) |
| 4. Pengolahan & Transformasi Teks | Alat Teks (5), Detail & Editor Snippet (2) |
| 5. Keamanan & Privasi | Keamanan & Privasi (6) |
| 6. UI/UX & Aksesibilitas | Beranda Riwayat (1), Detail & Editor Snippet (2), Pengaturan & Sistem (8) |
| 7. Sistem, Analytics & Maintenance | Analitik (7), Pengaturan & Sistem (8), Beranda Riwayat (Sampah) |
