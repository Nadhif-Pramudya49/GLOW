# 15. Checklist Kebutuhan Data Laporan PSI (Document Requirements Mapping)

Ini adalah dokumen **PALING PENTING** untuk menyusun Laporan Proyek Akhir Pengembangan Sistem Informasi (PSI). Dokumen ini membandingkan data analisis yang telah didapatkan dari *source code* terhadap kerangka (*template*) penulisan Laporan Akademik PSI standar, dan memilah bagian mana yang perlu ditambahkan, diminta dari dosen, atau dibuat secara manual oleh tim mahasiswa.

---

## BAB 1 - PENDAHULUAN

| Sub-Bab | Status Data | Sumber / Tindakan yang Harus Dilakukan |
|---|---|---|
| **1.1 Latar Belakang** | ⚠️ **Kurang** | **Buat Manual.** Source code mengindikasikan masalah konektivitas (*WiFi speed metric*), *productivity*, dan pencarian terpusat di Gunung Kidul (referensi dari `01_project_overview.md`). Tim perlu menulis paragraf naratif akademis yang mengutip data/jurnal tentang tren *digital nomad* dan masalah pariwisata di Gunung Kidul. |
| **1.2 Rumusan Masalah** | ✅ **Tersedia** | **Buat Manual.** Berdasarkan `01_project_overview.md` (Tidak adanya informasi terpusat, sulitnya mengatur *itinerary*, dll). |
| **1.3 Tujuan Penelitian** | ✅ **Tersedia** | **Buat Manual.** Menyediakan platform *Workation* terintegrasi (berdasarkan daftar solusi di dokumen 01). |
| **1.4 Batasan Masalah** | ✅ **Tersedia** | **Ambil dari Source Code.** Lihat dokumen `02_scope.md`. Batasan: Tidak ada *payment gateway* riil, cakupan hanya kawasan Gunung Kidul, tidak ada perhitungan rute *Maps* langsung. |
| **1.5 Manfaat** | ⚠️ **Kurang** | **Buat Manual.** Tuliskan manfaat untuk 3 aktor: Pelaku wisata lokal (OWNER), Pelanggan (USER), dan Pemerintah Daerah (Promosi pariwisata). |

---

## BAB 2 - TINJAUAN PUSTAKA / LANDASAN TEORI

| Sub-Bab | Status Data | Sumber / Tindakan yang Harus Dilakukan |
|---|---|---|
| **2.1 Kajian Pustaka (Aplikasi Sejenis)** | ❌ **TIDAK ADA** | **Tanyakan/Diskusikan dalam Tim.** Cari 2-3 paper/jurnal terdahulu yang membahas platform pariwisata (Traveloka, Tiket.com) dan bandingkan dengan fitur *Workation/AI* GLOW (Gap penelitian). |
| **2.2 Landasan Teori (Tech Stack)** | ✅ **Tersedia** | **Ambil dari Source Code.** Definisi SPA, Express.js, Prisma ORM, JWT, Google Gemini AI (Rujuk dokumen `03_tech_stack.md`). Harus ditulis ulang dengan gaya referensi buku teks (misal mengutip dokumentasi resmi). |
| **2.3 Konsep Basis Data (Relasional)** | ✅ **Tersedia** | Teori ERD, RDBMS (MySQL), dan Normalisasi. Rujuk ke dokumen `07_database.md`. |
| **2.4 Konsep AI / LLM Prompting** | ✅ **Tersedia** | Jelaskan teori dasar *Large Language Model*, *Prompt Engineering*, dan parameter *Temperature*. Rujuk ke dokumen `09_llm.md`. |

---

## BAB 3 - METODOLOGI PENGEMBANGAN SISTEM

| Sub-Bab | Status Data | Sumber / Tindakan yang Harus Dilakukan |
|---|---|---|
| **3.1 Metode Pengembangan (SDLC)** | ❌ **TIDAK ADA** | **Tanyakan ke Dosen/Tim.** Apakah laporan wajib menggunakan metode **Waterfall**, **Agile/Scrum**, atau **Prototyping**? Ini tidak bisa dianalisis dari kode sumber. Tim harus menyepakati narasi metode apa yang digunakan selama pengerjaan tugas. |
| **3.2 Analisis Kebutuhan Sistem (Fungsional & Non-Fungsional)** | ✅ **Tersedia** | **Ambil dari Source Code.** Kebutuhan fungsional = 10 Fitur di dokumen `10_features.md`. Non-fungsional = Kinerja (SPA load time), Keamanan (JWT, Validasi di dokumen `13_security.md`). |
| **3.3 Pemodelan Sistem (UML)** | ✅ **Sebagian** | **Ubah format.** *Use Case Diagram* dan skenario sudah dibuat di `06_usecase.md`. Tim harus mereplikasi/menggambar ulang diagram *Activity Diagram* dan *Sequence Diagram* untuk proses utama (Booking, Package Builder, Login) memakai *tools* seperti StarUML atau Draw.io (panduan langkah ada di `05_business_process.md`). |
| **3.4 Perancangan Basis Data** | ✅ **Tersedia** | ERD dan *Data Dictionary* (Kamus Data) lengkap 11 tabel. Rujuk dokumen `07_database.md`. |
| **3.5 Perancangan Antarmuka (Mockup/Wireframe)** | ⚠️ **Kurang** | **Screenshot Manual.** Analisis UX ada di `12_ui.md`, tapi tim harus mengambil *Screenshot/Tangkapan Layar* desain UI akhir secara manual dari web browser untuk ditaruh di laporan. |

---

## BAB 4 - IMPLEMENTASI DAN PENGUJIAN

| Sub-Bab | Status Data | Sumber / Tindakan yang Harus Dilakukan |
|---|---|---|
| **4.1 Implementasi Antarmuka (UI)** | ⚠️ **Kurang** | **Screenshot Manual.** Hasil *capture* UI akhir aplikasi disandingkan dengan *Mockup* Bab 3. Tulis penjelasan komponen dari `12_ui.md`. |
| **4.2 Implementasi Kode (Backend & API)** | ✅ **Tersedia** | **Ambil dari Source Code.** Jelaskan struktur arsitektur *Route-Controller-Model* (MVC). Sertakan daftar titik henti (Endpoint API) berdasarkan tabel di `08_api.md`. Masukkan cuplikan kode (*code snippet*) krusial seperti integrasi Gemini API. |
| **4.3 Pengujian Fungsional (Black-Box Testing)** | ✅ **Sebagian** | **Lengkapi secara Manual.** Basis tabel *Test Case* sudah disusun di `11_testing.md`. Tim harus mencoba secara manual dan mengisi kolom akhir tabel dengan hasil "LULUS / BERHASIL (PASSED)". |
| **4.4 Pengujian Pengguna (UAT)** | ❌ **TIDAK ADA** | **Buat Manual (Opsional).** Jika silabus dosen meminta kuesioner, tim harus menyebar form Google Form (*System Usability Scale*) ke beberapa mahasiswa/teman dan meringkas hasil grafiknya di sini. *Cek panduan/template resmi Dosen.* |
| **4.5 Deployment (Implementasi Server)** | ✅ **Tersedia** | **Ambil dari Source Code.** Jelaskan langkah mengunggah ke Render.com dan MySQL awan (Rujuk dokumen `14_deployment.md` dan *deploy_guide.md*). |

---

## BAB 5 - PENUTUP

| Sub-Bab | Status Data | Sumber / Tindakan yang Harus Dilakukan |
|---|---|---|
| **5.1 Kesimpulan** | ✅ **Tersedia** | **Buat Manual.** Rangkum pencapaian pemenuhan Tujuan (Bab 1.3) berdasarkan daftar fitur yang berhasil diimplementasikan (Rujuk dokumen akhir di `10_features.md`). Tuliskan bahwa aplikasi SPA + AI berhasil berjalan. |
| **5.2 Saran (Future Works)** | ✅ **Tersedia** | **Ambil dari Source Code.** Rujuk bagian Pengembangan Masa Depan di dokumen `02_scope.md` (Integrasi *Payment Gateway*, migrasi *Cloud Storage S3*, dan PWA). |

---

## RINGKASAN TUGAS TIM SELANJUTNYA (TO-DO LIST MAHASISWA):
1. **Tulis Narasi:** Mulai mengetik Bab 1 Latar Belakang dan meramu kutipan referensi.
2. **Klarifikasi Dosen:** Pastikan metodologi SDLC (*Waterfall/Agile*) apa yang wajib diakui di Bab 3.
3. **Capture UI:** Buka `http://localhost:3000` dan kumpulkan semua *screenshot* antarmuka web.
4. **Draw UML:** Salin *flow* logika dari dokumen 05 dan 06 untuk digambar ulang menjadi *Activity Diagram* yang rapi di MS Visio/Draw.io.
5. **Jalankan Black-Box Testing:** Eksekusi skenario uji coba di dokumen 11 dan buat laporannya dalam bentuk tabel hasil centang (✅).
