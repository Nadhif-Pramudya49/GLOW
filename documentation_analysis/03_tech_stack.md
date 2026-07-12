# 03. Tech Stack (Teknologi yang Digunakan)

Proyek **GLOW** dibangun menggunakan arsitektur *Client-Server* penuh (*Full-Stack*), yang memisahkan aplikasi web sisi-klien (*Frontend*) dengan layanan penyedia data sisi-server (*Backend REST API*). Berikut adalah rincian lengkap dari seluruh teknologi yang ditemukan pada proyek ini:

## 1. Frontend (Aplikasi Sisi-Klien)
Pendekatan *frontend* pada proyek ini mengedepankan performa *vanilla* (murni) tanpa menggunakan kerangka kerja besar (seperti React, Vue, atau Angular). Tujuannya adalah membangun Single Page Application (SPA) yang sangat ringan dan cepat.

| Kategori | Teknologi | Deskripsi / Penggunaan dalam Proyek |
|---|---|---|
| **Bahasa Utama** | HTML5, CSS3, JavaScript (ES6+) | Fondasi utama pembangunan UI dan logika interaksi aplikasi (*client/js/*.js*). |
| **Arsitektur UI** | SPA (Single Page Application) | Menggunakan *Hash-based Routing* (`window.onhashchange`) di *app.js* untuk berpindah halaman tanpa memuat ulang peramban. |
| **Desain Styling** | Vanilla CSS (Custom Properties) | Tidak ada *framework* CSS eksternal (Tailwind/Bootstrap). Desain memanfaatkan CSS Variables (Terdapat di *client/css/main.css*) untuk tema warna dan tipografi. |
| **State Management** | Custom Observer Pattern | Ditemukan di *client/js/state.js* (`subscribe` dan `notify`). Berfungsi memantau perubahan data (*seperti badge Favorite*) agar disinkronkan ke seluruh UI. |
| **Penyimpanan Lokal** | Browser `localStorage` | Menyimpan State aplikasi sementara, JWT token kredensial, dan konfigurasi paket (*client/js/state.js*, *client/js/services/auth.service.js*). |
| **Maps Integration** | Google Maps Embed API | Digunakan di *client/js/page-location-detail.js* (baris 85) untuk menampilkan peta interaktif via `<iframe>`. |

## 2. Backend (Layanan Sisi-Server)
Bagian *backend* berfungsi murni sebagai antarmuka pemrograman aplikasi (RESTful API), yang memproses logika bisnis dan koneksi basis data.

| Kategori | Teknologi | Deskripsi / Penggunaan dalam Proyek |
|---|---|---|
| **Lingkungan Runtime** | Node.js (v18+) | Platform dasar eksekusi kode *backend* (*server/server.js*). |
| **Framework Web** | Express.js (`express: ^4.18.2`*) | Menangani *Routing* (REST API), penanganan HTTP, dan *Middleware* (*server/app.js*). <br/> *(Catatan: Meskipun package.json belum didefinisikan ketat di source asli, gaya kodenya adalah Express v4/v5)*. |
| **Basis Data** | MySQL | Mesin relasional yang menyimpan seluruh 11 tabel (*database/glow_db.sql*). Dijalankan via XAMPP lokal. |
| **ORM (Object-Relational Mapping)** | Prisma (`prisma: ^5.x`, `@prisma/client: ^5.x`) | Pemetaan skema, eksekusi kueri yang *type-safe*, dan manajemen migrasi struktur tabel (*prisma/schema.prisma*). |
| **Authentication** | JWT (`jsonwebtoken`) & `bcrypt` | Pembuatan dan verifikasi token berbasis HMAC (*server/middlewares/auth.js*), dan fungsi pengacakan (*hashing*) kata sandi dengan salt-rounds (*server/controllers/auth.controller.js*). |
| **File Uploading** | Multer (`multer`) | Menangkap format `multipart/form-data` untuk memproses unggahan gambar lokasi dan menyimpannya di `/uploads` (*server/middlewares/upload.js*). |
| **Artificial Intelligence (AI)** | Google Gemini (`@google/genai`) | Model LLM (`gemini-2.5-flash`) yang difungsikan untuk menganalisis parameter masukan klien dan merekomendasikan paket perjalanan berbentuk JSON murni (*server/controllers/ai.controller.js*). |
| **Cross-Origin Configuration** | CORS (`cors`) | Mengelola perlindungan keamanan sumber (*origin*) peramban antara aplikasi lokal *frontend* dan port *backend* (*server/app.js*). |
| **Environment Configuration**| DotEnv (`dotenv`) | Memuat rahasia konfigurasi (`DATABASE_URL`, `JWT_SECRET`, kunci API) dari berkas `.env` yang tidak dilacak Git (*server/server.js*, `.env.example`). |

## 3. Tooling, Deployment, dan Integrasi Lanjutan
Kumpulan perkakas (*tools*) pendukung siklus pengembangan, pengujian lingkungan, dan prosedur *deployment*.

| Kategori | Teknologi | Deskripsi / Penggunaan dalam Proyek |
|---|---|---|
| **Version Control System** | Git & GitHub | Pelacakan revisi (terdapat direktori `.git` dan `.gitignore`), *tag* rilis (`final`), dan peninjauan kolaborasi antar modul sistem. |
| **Build & Run Tools** | NPM Scripts | Otomasi perintah seperti `npm start` (menjalankan server) dan `npm run build` (`npx prisma generate`) yang terdapat di *package.json*. |
| **Production Hosting Target** | Render.com (Web Service) | Skrip *backend* dimodifikasi secara khusus agar dapat melayani (*serve*) direktori *client* secara statis untuk kemudahan *deployment* monolitik (*server/app.js* baris 22-23). |
| **Database Cloud Target** | Aiven / TiDB Cloud | Eksternal MySQL *cloud service* gratis (sesuai dokumen *deploy_guide.md*) sebagai target untuk URL `DATABASE_URL` pada mesin *Production*. |
| **E2E Testing / Scraping** | Puppeteer & JSDOM | Terdapat pustaka `puppeteer` dan `jsdom` (dari artefak file/folder terhapus/awal) yang secara historis relevan sebagai *tools* untuk pengujian DOM/sistem *crawling*. |

## Kesimpulan Analisis Teknologi
Tumpukan teknologi (*Tech Stack*) ini mengindikasikan paradigma arsitektur yang kuat dan mandiri. Pemilihan *Vanilla JS* membuktikan kedalaman penguasaan fundamental tanpa *overhead* kerangka kerja, sedangkan penggunaan Node.js + Express + Prisma mencerminkan standar kelayakan industri (*industry-standard*) modern yang memudahkan pemeliharaan dan skalabilitas ke depan. Integrasi AI (Gemini) merupakan nilai inovasi signifikan (*X-Factor*) dalam proyek PSI ini.
