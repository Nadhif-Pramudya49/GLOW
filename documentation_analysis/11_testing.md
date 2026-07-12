# 11. Analisis Pengujian Sistem (System Testing Plan)

Dokumen ini merangkum strategi jaminan mutu (*Quality Assurance*) untuk sistem GLOW. Mengingat GLOW belum menggunakan kerangka pengujian otomatis terpandu (seperti Jest atau Cypress) di *source code*-nya, semua analisis ini berbasis Skenario Uji Penerimaan (*Acceptance Testing*) fungsional manual.

## 1. Rencana Pengujian Fungsional (Black-Box Testing)
Memvalidasi masukan dan luaran fitur krusial tanpa memeriksa baris kode secara spesifik.

| ID Skenario | Deskripsi Test Case | Input / Aksi (Trigger) | Ekspektasi Luaran (Expected Output) |
|---|---|---|---|
| **TS-01: Auth** | Uji Registrasi dengan format angka pada nama | Form Daftar. Ketikkan Nama: `Andi123` | (Validation DOM) Teks peringatan merah muncul '*Hanya boleh berisi huruf*'. Tombol Daftar diblokir (Disabled abu-abu). |
| **TS-02: Auth** | Verifikasi Tolakan Kredensial *Login* | Form Masuk. Email benar, Sandi salah acak. | Teks peringatan merah `Invalid credentials` via penolakan JSON `HTTP 401`. |
| **TS-03: Flow** | Booking Tanpa Login | Klik Lanjut Bayar pada Keranjang Paket | (Guard Logic) Notifikasi *Toast* `Silakan login` lalu otomatis pindah (*Redirect*) ke pemicu halaman pencarian. |
| **TS-04: AI** | Tes Batas Harga Rekomendasi Prompt LLM | Input Kriteria Anggaran: Limit Maksimal `Rp. 200,000` | Jawaban Model *Gemini* (Penjumlahan Harga 5 Tempat Terpilih) wajib berjumlah < Rp200.000, dirender di DOM Keranjang. |
| **TS-05: Review** | Tes Dobel Evaluasi (Duplicate Unique) | User submit *rating*, buka kembali form *rating* untuk `BookingId` yang sama. | Backend mengembalikan `HTTP 400: Anda sudah mengulas`. UI Menerima galat dan menutup form paksa. |
| **TS-06: API Auth** | Akses ilegal ke rute Admin (Spionase Privilese) | User Reguler mencegat API lokal dengan CURL: `GET /api/admin/users` menggunakan token JWT pribadinya | Middleware Node.js membatalkan akses, merespons JSON `HTTP 403: Forbidden`. |

## 2. Identifikasi Celah & Kasus Ujung (Edge Cases & Bugs)
Dari telaah struktur *source code*, berikut merupakan titik-titik rentan malfungsi dan batas arsitektur fungsional.

### Isu Kode/Arsitektur Diketahui (Known Issues):
- **Keranjang Bersifat Volatil (Mudah Menguap):** Algoritma state manajemen keranjang bergantung absolut pada `localStorage` (diatur dari Observer *client/js/state.js*). Pembersihan riwayat tembolok browser (Clear Cache) akan memutus status kustom paket pengguna seketika.
- **Timer Klien yang Terbatas:** Pada Modul *Productivity*, algoritma JavaScript pewaktu (Pomodoro Interval) tidak disinkronisasi melalui soket peladen. Me-muat ulang (*Refresh/F5*) laman web akan menghapus hitungan durasi jam.
- **Validasi Sinkron Email yang Lemah:** Fungsi Regular Expression (*Regex*) di formulir (*components.js*) mungkin meloloskan domain palsu yang tidak berekstensi (misalnya melegalkan nama@domain) karena kurangnya verifikasi tautan *Email Confirmation Link* via SMTP NodeMailer.

## 3. Uji Integrasi & Data Flow (Integration Testing Points)

- **Frontend - Middleware Integrasi JWT:** Pengujian ini dilakukan dengan memastikan variabel token JWT yang tersimpan di Klien dikirim utuh pada format penyerta *Bearer Header*. Jika format token rusak 1 huruf, Backend *Middlewares Auth* (`jwt.verify()`) wajib melempar status pengecualian Token Kadaluarsa.
- **Database Cascade Takedown:** Penghapusan Profil Pengguna secara paksa melalui panel ADMIN (Rute: `DELETE /users/:id`) harus memicu penghapusan berantai pada entitas anak tabel `bookings`, `saved_packages`, dan `favorites`. Ini mengkonfirmasi logika `ON DELETE CASCADE` di file Prisma ORM berjalan selaras.
- **Auto-Detect Configuration:** File konfigurasi *client/js/config.js* memiliki baris penyelarasan lokasi IP. Uji integritas ini dengan memeriksa apabila di-*hosting* publik, logika ternary *window.location.hostname* harus menyesuaikan proksi dari localhost:3001 ke alamat Domain Production secara otomatis.

## 4. Rekomendasi Penanganan Cacat (Recommendation)
- **Database Backup Scheduler:** Menambahkan fungsi penjadwalan pencadangan pangkalan data berkala. Mengingat perintah prisma dapat menimpa status tabel secara masif.
- **Server Rate-Limiting:** Menerapkan pembatasan `express-rate-limit` pada rute Login dan `generate-package` (AI) guna mencegah serangan kelelahan API dari robot eksternal dan membengkaknya biaya penagihan batas kueri Google Gemini.
