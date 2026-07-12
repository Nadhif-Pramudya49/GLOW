# 08. Arsitektur Antarmuka (API & Endpoints)

Analisis spesifikasi rute antarmuka pertukaran sistem GLOW (RESTful JSON Endpoints). 
- URL Inti (Base Path): `/api/*`
- Otorisasi: Format HTTP Header `Authorization: Bearer <JWT_TOKEN>`

## 1. Modul Otentikasi (`/api/auth`)
| Method | Endpoint | Tujuan | Auth Token? |
|---|---|---|---|
| **POST** | `/register` | Mendaftarkan pengguna baru (USER/OWNER) | False |
| **POST** | `/login` | Memvalidasi kredensial, Menerima token JWT | False |
| **GET** | `/me` | Meminta seluruh detil *state* data diri JWT | True |
| **PUT** | `/profile` | Modifikasi rincian data biografi (Tabel *UserProfile*) | True |

## 2. Modul Lokasi (`/api/locations`)
| Method | Endpoint | Tujuan | Auth Token? |
|---|---|---|---|
| **GET** | `/` | Melakukan operasi kueri (Search), Kategori, Range Harga | False |
| **GET** | `/:id` | Menerima rincian data lengkap spesifik + daftar Harga | False |

## 3. Modul Pemesanan Transaksi (`/api/bookings`)
| Method | Endpoint | Tujuan | Keterangan Proteksi |
|---|---|---|---|
| **GET** | `/` | Rekapitulasi Riwayat Transaksi Pengguna (`bookings`) | True (Hanya data kepemilikan User) |
| **POST** | `/` | Proses pembuatan tagihan/reservasi (*Checkout Custom Data*) | True |

## 4. Modul Admin (`/api/admin`)
Modul ini dilindungi *Middleware* `requireRole(['ADMIN'])`. Semua request non-Admin akan tertolak HTTP 403 Forbidden.

| Method | Endpoint | Tujuan | Aturan Khusus |
|---|---|---|---|
| **GET** | `/stats` | Menghitung akumulasi Dasbor: Total Profit, Jumlah Pengguna | - |
| **GET** | `/users` | Mencari akun anggota & pemilik | Bisa kueri nama via `?q=teks` |
| **PUT** | `/users/:id/role` | Membuka *privilege* status Role, ke level `OWNER` | Error jika mengubah `ADMIN` |
| **DELETE** | `/users/:id` | Menghapus permanen *instance* user dari basis data | Error bila Hapus-Diri-Sendiri |
| **GET** | `/users/:id/details`| Detail penelusuran (Spionase Admin) ke profil, pesanan, dan aset lokasi user | Menghapus return sandi hash |
| **GET** | `/business` | Daftar Mitra Lokasi | Mendukung kueri filter status persetujuan |
| **PUT** | `/business/:id/status`| Aksi Verifikasi / Tolak Status Kemitraan (`business_profile.status`) | ENUM Validator |
| **GET** | `/locations` | Mengambil seluruh katalog secara global | - |
| **PUT** | `/locations/:id/publish`| Kontrol "Toggle" sembunyikan properti ke mode Privat/Tidak di-Publish | - |
| **DELETE** | `/locations/:id` | Penghapusan (Pemaksaan/Takedown) Lokasi Mitra secara permanen | - |

## 5. Modul Pemilik Mitra (`/api/owner`)
Dilindungi *Middleware* `requireRole(['OWNER', 'ADMIN'])`.

| Method | Endpoint | Tujuan | Mekanisme Tambahan |
|---|---|---|---|
| **GET** | `/stats` | Pendapatan, Kinerja (Grafik Bulan 1-12) & Total Bookings milik 1 Owner | Agregasi manual (Iteration over packages) |
| **GET** | `/locations` | Hanya me-*return* lokasi yang dimiliki BusinessId JWT tersebut | - |
| **POST** | `/locations` | Mendaftarkan properti inventaris (Upload `multipart/form-data`) | `upload.single('image')` (Multer Parser) |
| **PUT** | `/locations/:id`| Modifikasi properti, termasuk fitur penandaan Fasilitas / Suasana (JSON) | - |
| **DELETE**| `/locations/:id`| Hapus entitas inventaris pribadi | Pengecekan pemilik BusinessID sebelum DROP |

## 6. Modul Fitur Nilai Tambah

**Ulasan (`/api/reviews`)**
- **GET `/:locationId`:** Membaca testimoni publik untuk katalog tersebut.
- **POST `/` (Auth=True):** Menulis *feedback*. Membutuhkan Body (`bookingId`, rating, wifiRating dsb). Berisi logika rekalkulasi rata-rata (menjumlah dan membagi ke total rating tabel Lokasi di latar belakang). Menolak bila User bukan pemesan ID tersebut, atau telah *Double Review*.

**Manajemen Kerja & Suasana (`/api/productivity`)**
- **GET `/:bookingId/itineraries` (Auth=True):** Request daftar jadwal berdasarkan identifikasi reservasi.
- **POST `/:bookingId/itineraries` (Auth=True):** Masukan objek `dayNumber`, nama jadwal, durasi waktu `timeSlot`, dan mode Produktifitas *bool*.
- **DELETE `/itineraries/:id` (Auth=True):** Hapus slot waktu. Memastikan agenda tersebut milik pengguna JWT tersebut.
- **POST `/:bookingId/mood` (Auth=True):** Penyetoran Skala Angka Bintang (1-5) *Mood Tracker* per hari.
- **GET `/:bookingId/mood` (Auth=True):** Pencarian log grafik emosi kerja *remote* pengguna.

**Modul Kecerdasan Buatan (`/api/ai`)**
- **POST `/generate-package` (Auth=False):** Mengkomunikasikan kriteria parameter dan mentransfer konteks (*context-awareness*) dari Tabel Lokasi database ke Pihak Ketiga. Memblokir kegagalan respons format pihak ketiga (Menuntut parsing struktur standar JSON Murni).

**Katalog Bintang & Paket Kustom Pribadi**
- `/api/favorites` (GET/POST/DELETE): Menyimpan referensi tautan N:M antara tabel `users` dan `locations`.
- `/api/packages/saved` (GET/POST/DELETE): Modul khusus penyimpanan (*Load Save File*) State keranjang UI. Berkomunikasi dalam skema *Serialization Payload* string utuh.
