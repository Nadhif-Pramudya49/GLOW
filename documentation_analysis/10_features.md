# 10. Daftar dan Rincian Fitur Utama (Features)

Analisis fungsionalitas fitur aplikasi GLOW (*Gunung Kidul Location for Work*), dari sisi komponen teknis dan modul UI.

## 1. Search & Filter Lokasi
- **Tujuan:** Menampilkan daftar properti dengan kapabilitas seleksi berdasarkan kriteria spasial dan angka.
- **Role Target:** Semua pengguna (Guest, User, Owner, Admin).
- **Berkas Klien (Halaman & Modul):** `client/js/page-search.js`, `client/js/components.js` (komponen kartu HTML).
- **Rute API Terpanggil:** `GET /api/locations`
- **Interaksi Basis Data:** Tabel `locations` (beserta LEFT JOIN `business` dan agregat perhitungan jumlah `packages`).
- **Status Integrasi:** Selesai (Diimplementasikan). Filtering dieksekusi secara asinkron di dalam array Javascript Klien.

## 2. Location Details & Map Interaction
- **Tujuan:** Merender properti multimedia lokasi (galeri statis), paragraf promosi, daftar metrik fasilitas, dan lokasi Peta akurat.
- **Role Target:** Semua pengguna.
- **Berkas Klien:** `client/js/page-location-detail.js`.
- **Rute API Terpanggil:** `GET /api/locations/:id` (Detail) dan `GET /api/reviews/:locationId` (Ulasan).
- **Interaksi Basis Data:** Pembacaan parsial baris unik Tabel `locations` dan deret array `reviews`.
- **Status Integrasi:** Selesai. Google Maps tersemat melalui iframe embed dengan merelasikan lintang-bujur (*latitude, longitude*).

## 3. Package Builder (Keranjang Custom)
- **Tujuan:** Fungsi perakitan rencana *itinerary* lintas sektor (Hotel + Kerja + Wisata + Transport) dalam satu wadah keranjang.
- **Role Target:** USER (Terotentikasi).
- **Berkas Klien:** `client/js/page-package.js`, `client/js/state.js` (menyimpan sesi objek keranjang dalam skema Observer).
- **Rute API Terpanggil:** - (Perhitungan kalkulasi angka *total price* murni dieksekusi pada *Client-Side Script*). API baru dipanggil pada fitur anak "*Simpan Paket*" (`POST /api/packages/saved`).
- **Interaksi Basis Data:** Tabel abstrak statis dan referensi data `saved_packages`.
- **Status Integrasi:** Selesai. Didukung dengan logik pemisahan hotel (`penginapanSchedule[]`) secara rasional untuk kalkulasi.

## 4. AI Recommendation (Gemini)
- **Tujuan:** Menjawab kendala pengguna awam yang malas memilih lokasi, dengan menggunakan Kecerdasan Buatan berparameter suhu (`Temperature 0.2`).
- **Berkas Klien:** `client/js/page-package.js` (Modul `generateAiPackage`).
- **Rute API Terpanggil:** `POST /api/ai/generate-package`.
- **Interaksi LLM & Basis Data:** API mengambil *Snapshot* seluruh tabel lokasi, disusutkan, dan dipompa (inject) ke *Prompt* Gemini. Memaksa balasan JSON ID referensi.
- **Status Integrasi:** Selesai. Bekerja sempurna dengan *fallback* dan peredaman halusinasi teks *markdown* dari Google API.

## 5. Booking Checkout (Form Pemesanan)
- **Tujuan:** Form pencatatan bukti komitmen transaksi pemesanan.
- **Berkas Klien:** `client/js/page-booking.js` (dibagi menjadi pola pergerakan "Wizard" 4 Langkah di sisi Klien).
- **Rute API Terpanggil:** `POST /api/bookings`.
- **Interaksi Basis Data:** Melakukan *Insertion* berantai: Tabel `user_profiles` (identitas KTP), `packages` (Mengkristalkan struktur Harga Kustom JSON), dan entitas `bookings` (`status: 'PENDING'`).
- **Status Integrasi:** Selesai. (Terbatas hanya pada log database, mengesampingkan portal gerbang pembayaran nyata).

## 6. Productivity Dashboard (Pomodoro & Mood)
- **Tujuan:** Pelengkap gaya hidup pekerja jarak jauh, fitur pendamping yang berjalan saat masa menginap (*stay*).
- **Berkas Klien:** `client/js/page-productivity.js`.
- **Rute API Terpanggil:** `GET/POST /api/productivity/:bookingId/itineraries`, `POST /api/productivity/:bookingId/mood`.
- **Interaksi Basis Data:** `itineraries` (Jadwal rutinitas) dan `experience_logs` (Jurnal kesehatan mental angka 1-5).
- **Status Integrasi:** Selesai. Timer Javascript (setInterval) dieksekusi secara mandiri.

## 7. Sistem Ulasan Kuadran (Multi-Dimensional Review)
- **Tujuan:** Skala nilai penilaian tidak sekadar 1 aspek (1-5), tetapi menyentuh Kualitas WiFi, Ergonomi Kerja, Suasana Alam.
- **Berkas Klien:** `client/js/page-review.js`.
- **Rute API Terpanggil:** `POST /api/reviews/` dan pemanggilan `GET` pada halaman detail tempat.
- **Interaksi Basis Data:** Rekaman tunggal `reviews` unik untuk setiap `bookingId`. Fitur Trigger (Aksi Belakang Layar) mengubah/merata-ratakan *Rating* master pada tabel `locations`.
- **Status Integrasi:** Selesai.

## 8. Role-Based Analytics Dashboard
Sistem menyediakan 3 wajah panel berbeda yang dipisahkan berlapis.

- **Dashboard User:** `page-dashboard-user.js` → Histori pemesanan (`/api/bookings`), Paket harapan (*Saved Packages*), Chart Kesejahteraan Mental (Mood Tracker).
- **Dashboard Owner:** `page-dashboard-owner.js` → Agregasi omzet/pendapatan Mitra (`/api/owner/stats`), CRUD inventaris lokasi dengan unggah gambar (Multer Parser), Grafik bulan.
- **Dashboard Admin:** `page-dashboard-admin.js` → Pusat Pengendalian Pengguna (`/api/admin/users`), Spionase (*Read-Only*) Transaksi detail anggota, Validasi status penerimaan Mitra, Panel sembunyikan properti (Takedown lokasi cacat).
- **Status Integrasi:** Selesai. Ketiganya terlindungi oleh API *Middleware* Otorisasi `requireRole(['ROLE_X'])` JWT tingkat peladen.
