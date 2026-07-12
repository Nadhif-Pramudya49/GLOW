# 13. Analisis Keamanan Sistem (Security Analysis)

Dokumen ini memetakan mekanisme pertahanan dan mitigasi risiko aplikasi **GLOW** dari sisi klien hingga logika akses basis data, yang merujuk pada standar praktik keamanan OWASP Top 10.

## 1. Otentikasi dan Manajemen Sesi (Authentication & Session)
- **Implementasi:** Stateless JWT (JSON Web Token).
- **Proses Pertahanan:** Backend (`jsonwebtoken`) merakit dan membubuhkan tanda tangan (Signature) rahasia pada token dengan masa kedaluwarsa 7 Hari (`expiresIn: '7d'`). JWT dipertukarkan di antara Klien dan API tanpa tabel pelacakan Sesi (*Sessionless*).
- **Celah Kelemahan Teridentifikasi:** Klien mengarsipkan string Token rahasia ini ke dalam keranjang publik `localStorage`. Pendekatan ini membuat sistem rentan jika ada eksploitasi peretasan dom silang (*Cross-Site Scripting* - XSS), karena skrip eksternal (bot jahat) bisa mengambil `localStorage.getItem('token')` dengan mudah. Praktek yang lebih aman adalah meletakkan JWT ke dalam pilar Cookie (metode *HttpOnly Cookie*).

## 2. Otorisasi Akses (Authorization Controls)
- **Implementasi:** Middleware Rantai `requireRole()` di Express.js.
- **Proses Pertahanan:** Setelah lapisan 1 meng-dekripsi (Decoded) JWT dari Header permintaan, lapisan 2 (Fungsi Otorisasi Role) memverifikasi profil `req.user.role`. API menolak HTTP 403 Forbidden bila *Role* JWT tidak beririsan dengan Izin Target (misalnya akun tipe *User* mencegat panel dasbor pendaftaran *Owner*).
- **Mekanisme Guard Rail (Proteksi Bunuh Diri):** Terdapat peredam keamanan tambahan pada pengontrol `admin.controller.js` (Baris 112 dan 134) yang mencegah seorang "Admin B" untuk melucuti status jabatan (Role) maupun menghapus (*Delete Record*) identitas "Admin A" atau Diri-Sendiri, melindungi platform dari sabotase hierarki internal.

## 3. Perlindungan Injeksi Kode (SQL Injection Prevention)
- **Implementasi:** Eksekusi Database Abstraksi Prisma ORM.
- **Proses Pertahanan:** Kueri langsung bahasa SQL manual sangat dihindari. Seluruh alur operasi basis data diketik lewat antarmuka pustaka objek bawaan *Prisma Client*. Prisma secara mutlak merekatkan (*sanitize/parameterized*) format kuerinya ke mesin database MySQL secara *prepared statement*. Sangat mustahil input form liar menyuntikkan kode SQL jahat seperti `DROP TABLE`.

## 4. Validasi Input Klien & Sanitasi (Validation & Sanitization)
- **Implementasi:** Dual Validation (Pemeriksaan Ganda Frontend + Backend).
- **Frontend Validasi:** Halaman web menangkal muatan form yang kotor secara proaktif *Real-Time* menggunakan Ekspresi Reguler (`/^[A-Za-z\s]+$/`). Menangkal angka pada pendaftaran nama, karakter tak terdefinisi di format email, dengan teknik blokir tombol Submit (Tombol Submit tak akan aktif).
- **Backend Validasi:** *Controller* menolak *undefined body parameters*. Mengabaikan *Request Body* berbahaya bila ada.
- **Kelemahan (Sanitasi String Lanjutan):** Backend tidak memindai format kode HTML sisipan (*XSS Tag Stripping*) yang mungkin diinput oleh pemilik (OWNER) di kolom keterangan (*Description*). Bila ada input teks seperti `<script>alert(1)</script>`, UI Klien berisiko menampilkannya saat merender Katalog Publik. Klien wajib mengandalkan properti standar penanganan *textContent* alih-alih `innerHTML` secara hati-hati.

## 5. Keamanan Penyimpanan Kriptografi Sandi (Password Storage)
- **Implementasi:** Hashing satu-arah `bcrypt`.
- **Proses Pertahanan:** Sandi tak akan pernah menyentuh Database secara polos (*Plaintext*). Saat pengguna mendaftar, node-bcrypt melipat dan mengacak nilai parameter selama 10 putaran enkripsi acak (*Salt Rounds = 10*). Hasil *hash* direkam, kemudian saat aktivitas *Login*, kode dicocokkan (Compare).

## 6. Penanganan Unggah File (File Upload Vulnerability)
- **Implementasi:** Ekstensi Penahan Multer.
- **Celah Kelemahan Teridentifikasi:** Server menerima unggahan file lokal pada `server/middlewares/upload.js`. Meskipun ada pembatasan memori ekstensi biner untuk pendaftaran foto `locations`, mitigasi format tipe file MIME yang agresif belum dideklarasikan dengan kaku. Hacker potensial bisa memanipulasi *Payload Form-Data* untuk mengunggah skrip berekstensi *Shell (.php)* jika tidak ditambal secara spesifik oleh aturan penyaringan (*File Filter Extension Config*).

## 7. Ketersediaan Lingkungan Eksekusi & Rate Limiting (DoS Risk)
- Variabel Rahasia (*Secret Variables*) tidak dilacak Git publik berkat arsitektur mitigasi `.env` dan pendaftaran eksklusi `.gitignore` absolut.
- Namun perlindungan pembatasan laju (*Rate Limiter API*) tidak difasilitasi dalam blok server GLOW. Permintaan API pendaftaran atau API Kecerdasan Buatan (Gemini Endpoint) berisiko mendapat serangan Spam (Serangan *Denial of Service*), menghabiskan jatah hitungan komputasi mesin dengan ribuan *request* bot buatan per detiknya.
