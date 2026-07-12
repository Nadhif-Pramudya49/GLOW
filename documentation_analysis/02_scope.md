# 02. Scope (Ruang Lingkup)

## 1. Yang Termasuk Scope (In-Scope)
Berdasarkan analisis *source code*, sistem **GLOW** secara aktif menangani fungsionalitas berikut:
- **Manajemen Autentikasi dan Otorisasi:** Registrasi, *login*, autentikasi berbasis JWT, serta pemisahan hak akses antara `USER`, `OWNER`, dan `ADMIN` (*server/middlewares/auth.js*).
- **Manajemen Profil & Bisnis:** Pengelolaan profil pengguna dan status verifikasi profil bisnis untuk `OWNER` (*server/controllers/auth.controller.js*).
- **Pencarian dan Filter Entitas Lokasi:** Pemrosesan kueri lokasi berdasarkan kategori (Penginapan, Workspace, Wisata, Kuliner, Budaya), harga, rating, dan fasilitas WiFi (*client/js/page-search.js*, *server/controllers/location.controller.js*).
- **Custom Package Builder (Keranjang):** Algoritma agregasi untuk menggabungkan berbagai entitas lokasi menjadi satu paket harga kustom dengan penyusunan jadwal otomatis (*client/js/state.js*).
- **AI Recommendation Engine:** Pembuatan *prompt* dinamis yang mengirimkan katalog lokal ke Google Gemini API (`@google/genai`) dan mengurai *output* JSON untuk disajikan sebagai rekomendasi paket (*server/controllers/ai.controller.js*).
- **Booking & Order Management:** Pencatatan transaksi pemesanan (dengan *state machine* status: PENDING, CONFIRMED, COMPLETED, CANCELLED) tanpa gateway pembayaran asli (*server/controllers/booking.controller.js*).
- **Productivity & Tracking Tools:** CRUD *Itinerary* (jadwal harian), kalkulator Pomodoro *timer* (berjalan secara *client-side*), dan pencatatan data riwayat *mood* (*server/controllers/productivity.controller.js*, *client/js/page-productivity.js*).
- **Multi-dimensional Review System:** Evaluasi pasca-pemesanan dan kalkulasi ulang nilai *rating* secara asinkron (*server/controllers/review.controller.js*).
- **File Upload:** Penanganan unggahan berkas gambar lokasi yang dikelola secara lokal menggunakan pustaka *Multer* (*server/middlewares/upload.js*).
- **Admin & Owner Dashboard Analytics:** Agregasi data (seperti perhitungan total pengguna, total *booking*, dan kalkulasi *revenue*) untuk panel manajemen (*server/controllers/admin.controller.js*, *server/controllers/owner.controller.js*).

## 2. Yang Tidak Termasuk Scope (Out-of-Scope)
Fungsionalitas berikut **tidak** diimplementasikan atau tidak ditemukan dalam *source code*:
- **Payment Gateway Real:** Pemesanan (*booking*) tercatat secara langsung di *database* tanpa integrasi ke sistem pembayaran pihak ketiga (seperti Midtrans, Xendit, atau Stripe). Transaksi dianggap *Pending* hingga diubah manual (meskipun belum ada *controller* khusus pengubah status *booking* dalam *source code*).
- **Real-Time Chat/Messaging:** Tidak ada fitur obrolan langsung (*live chat*) antara `USER` dan `OWNER`.
- **Email Notifications:** Sistem tidak mengirimkan email verifikasi, *reset password*, atau konfirmasi pesanan (tidak ada konfigurasi SMTP / Nodemailer).
- **Advanced Route Planning:** Integrasi peta terbatas pada penandaan (*marker*) lokasi. Tidak ada kalkulasi rute perjalanan (*routing*) dari titik A ke titik B.
- **Social Media Login:** Tidak ada integrasi OAuth (Login dengan Google, Facebook, dll).
- **Inventory Management:** Pemesanan tidak secara ketat mengurangi jumlah "kamar" atau "kapasitas" yang tersedia di tabel `locations`.

## 3. Batasan Sistem (System Limitations)
- **Client-Side State Storage:** Data paket yang sedang disusun (*Package Builder*) dan keranjang belanja sangat bergantung pada `localStorage` (di *client/js/state.js*). Jika pengguna berganti perangkat atau menghapus data peramban, paket kustom yang belum disimpan akan hilang.
- **Single Currency:** Sistem hanya mendukung dan mengasumsikan mata uang Rupiah (IDR).
- **Local File Storage:** Gambar yang diunggah (`img`) disimpan secara lokal di direktori `server/uploads/` (*server/middlewares/upload.js*). Hal ini bisa menyulitkan *scaling* horizontal di platform komputasi awan.
- **AI Quota & Dependability:** Rekomendasi AI sepenuhnya bergantung pada konektivitas dan kuota API Google Gemini. *Fallback* hanya berupa pesan *error* jika API gagal merespons.

## 4. Limitasi Prototype (Khusus Tugas Akademik)
Mengingat ini adalah prototipe proyek mata kuliah:
- **Mock Data:** Katalog tempat (Penginapan, Workspace, dll) dihasilkan melalui *seeder* manual (`prisma/seed.js`) dan belum merepresentasikan inventaris nyata (*live inventory*) di lapangan.
- **Dummy Transport Selection:** Pilihan transportasi dalam AI Prompt (*server/controllers/ai.controller.js*) merupakan daftar statis (`[{"id": "motor", "name": "Sewa Motor", "price": 75000}, ...]`) yang *hardcoded*, tidak terhubung dengan tabel entitas penyedia transportasi di *database*.
- **Timer Execution:** Pomodoro Timer di *client-side* akan terhenti atau ter-reset jika halaman di-*refresh* (*client/js/page-productivity.js*).

## 5. Future Scope (Pengembangan Selanjutnya)
Area yang direkomendasikan untuk pengembangan di masa depan:
- **Payment Integration:** Mengintegrasikan platform semacam Midtrans untuk konfirmasi pembayaran otomatis (sehingga status `PENDING` otomatis beralih ke `CONFIRMED`).
- **Cloud Storage:** Memigrasi sistem unggah foto dari disk lokal (`server/uploads`) ke layanan objek *cloud* (contoh: AWS S3 atau Cloudinary).
- **Progressive Web App (PWA):** Menambahkan *Service Worker* dan *manifest* agar aplikasi dapat diinstal di perangkat seluler dan berfungsi dalam kondisi *offline-first*.
- **Real-Time Notifications:** Mengimplementasikan WebSocket (contoh: `Socket.io`) untuk memberikan pemberitahuan seketika saat pesanan dikonfirmasi oleh `OWNER` atau `ADMIN`.
- **Multi-Language (i18n):** Menambahkan lokalisasi Bahasa Inggris untuk menjangkau target pasar *digital nomad* internasional secara lebih luas.
