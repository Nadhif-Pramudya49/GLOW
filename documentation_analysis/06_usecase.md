# 06. Use Case Diagram dan Analisis Kebutuhan Fungsional

Dokumen ini mendefinisikan *Use Case* sistem GLOW. Menggambarkan representasi fungsional interaksi antara Pengguna (Aktor) dengan Sistem.

## 1. Identifikasi Aktor (Actors)
1. **GUEST (Tamu):** Pengguna publik yang belum terautentikasi (belum mendaftar atau *login*).
2. **USER (Pekerja Remote / Pelanggan):** Individu yang telah terautentikasi dengan hak dasar konsumen platform.
3. **OWNER (Pemilik Bisnis):** Individu pemilik hotel/kafe/wisata yang telah mendaftar sebagai penyedia layanan (memiliki *Business Profile*).
4. **ADMIN (Pengelola Sistem):** Pengelola platform tingkat-dewa (memiliki hak atas *Dashboard Admin*).
5. **GEMINI AI (External System):** Sistem layanan pihak ketiga pembantu pencetus *prompt logic*.

## 2. Diagram Use Case (Use Case Diagram)

```mermaid
usecaseDiagram
    direction LR
    
    actor "GUEST" as Guest
    actor "USER" as User
    actor "OWNER" as Owner
    actor "ADMIN" as Admin

    package "GLOW Workation Platform" {
        usecase "UC01: Cari Lokasi & Filter" as UC01
        usecase "UC02: Lihat Detail Lokasi" as UC02
        usecase "UC03: Register / Login" as UC03
        
        usecase "UC04: Tambah Favorit" as UC04
        usecase "UC05: Susun Custom Package" as UC05
        usecase "UC06: Request AI Recommendation" as UC06
        usecase "UC07: Pemesanan (Booking)" as UC07
        usecase "UC08: Akses Productivity Mode" as UC08
        usecase "UC09: Beri Ulasan (Review)" as UC09
        
        usecase "UC10: Kelola Inventaris Lokasi" as UC10
        usecase "UC11: Lihat Statistik Revenue" as UC11
        
        usecase "UC12: Manajemen Hak Akses Pengguna" as UC12
        usecase "UC13: Verifikasi Status Bisnis" as UC13
        usecase "UC14: Moderasi Publikasi Lokasi" as UC14
    }

    Guest --> UC01
    Guest --> UC02
    Guest --> UC03
    
    User --> UC01
    User --> UC02
    User --> UC04
    User --> UC05
    User --> UC06
    User --> UC07
    User --> UC08
    User --> UC09
    
    Owner --> User : inherits
    Owner --> UC10
    Owner --> UC11
    
    Admin --> User : inherits
    Admin --> UC12
    Admin --> UC13
    Admin --> UC14
```

## 3. Daftar Analisis Use Case Skenario Utama

### UC05: Susun Custom Package (Package Builder)
- **Aktor:** USER (Telah masuk).
- **Deskripsi:** Merupakan kemampuan untuk menggabungkan banyak *item* (Penginapan, *Workspace*, Destinasi) menjadi satu susunan jadwal (keranjang paket harga).
- **Pre-Condition (Prasyarat):** Aktor membuka halaman `Package Builder` dari bilah navigasi (Navbar).
- **Normal Flow:**
  1. Aktor mengklik 'Tambahkan Penginapan' dari katalog.
  2. Sistem menambah variabel *item* (di State JS `State.package.penginapan`).
  3. Aktor menyesuaikan `Jumlah Malam` menginap.
  4. Sistem otomatis mengalikan dan menyuntikkan total biaya agregasi UI.
- **Exception Flow:** Pengguna mencoba *checkout* tanpa mengisi *form* minimum (Misalnya tidak ada Penginapan). Sistem akan menunda perintah dan memunculkan notifikasi "Pilih minimal 1 tempat penginapan".
- **Business Rule:** Transaksi tidak dapat berlanjut tanpa nilai estimasi total dasar.

### UC06: Request AI Recommendation (Rekomendasi AI)
- **Aktor:** USER, GEMINI AI.
- **Deskripsi:** Pengguna menyerahkan kriteria anggaran dan kondisi mental perjalanan, dan AI akan mengisi `Package Builder` secara sekuensial.
- **Normal Flow:**
  1. Aktor mengisi kriteria jumlah teman (Sendiri/Pasangan), Suasana (Alam/Modern), Kategori Biaya (Backpacker/Premium).
  2. Sistem (Backend Node.js) menarik matriks katalog dari Basis Data.
  3. Sistem mem-parsing data matriks ke format teks untuk Google Gemini.
  4. Gemini AI mengirim balik respon (Respons JSON `{"penginapanId": X, "workspaceId": Y ...}`).
  5. Sistem menyisipkan otomatis (*auto-populate*) rekomendasi tersebut ke `State.package` milik Pengguna (UI).
- **Post-Condition:** Paket belanja telah selesai dirancang, menanti persetujuan pembelian (UC07) oleh pengguna.

### UC07: Pemesanan (Booking Checkout)
- **Aktor:** USER.
- **Deskripsi:** Skenario perpindahan dari niat rancang ke *invoice* legal tertunda (Status PENDING).
- **Pre-Condition:** Terdapat paket (UC05) valid, lengkap dengan rentang tanggal kalender (Tanggal Check-In dan Check-Out).
- **Normal Flow:**
  1. Aktor mengisi profil detil KTP dan Identitas Darurat.
  2. Aktor menyelesaikan klik pembayaran simulasi.
  3. Sistem memasukkan keranjang *Custom Data JSON* ke tabel `packages`.
  4. Sistem memasukkan log tanggal dan total agregasi harga ke tabel `bookings` (`status: PENDING`).
- **Post-Condition:** Booking ID baru terbuat di beranda Daftar Transaksi ("Riwayat Booking").

### UC08: Akses Productivity Mode
- **Aktor:** USER.
- **Deskripsi:** Pelayanan pembantu pengaturan produktivitas kerja pengguna.
- **Normal Flow:**
  1. Pengguna membuka mode *Productivity* dan menyeleksi *booking_id* perjalanan.
  2. Pengguna menambah rincian jadwal jam kegiatan harian ke modul tabel `itineraries`.
  3. Pengguna menekan *Start* pada UI jam digital timer Pomodoro (25:00 menit), jam berjalan terputus hitung mundur (tanpa sinkronisasi API).
  4. Pada penutupan hari (Akhir Sesi), pengguna mengisi *mood rating* ke tabel `experience_logs`.

### UC10: Kelola Inventaris Lokasi Bisnis
- **Aktor:** OWNER.
- **Pre-Condition:** Sistem mengenali tipe hak akses profil JWT *token* (`role: 'OWNER'`).
- **Deskripsi:** Proses operasional di mana entitas penginapan/kedai diperbaharui.
- **Normal Flow:**
  1. Buka laman *Dashboard Mitra Bisnis*.
  2. Pilih aksi CRUD (+ Tambah).
  3. Lengkapi formulir pendaftaran lokasi (Latitude, Longitude, Kategori: Cafe/Villa, dll).
  4. Lampirkan foto (*Multipart FormData Upload*).
  5. Aksi Simpan. Sistem menyimpan arsip di direktori `/uploads/` dan mem-posting basis data lokal.
- **Business Rule:** Properti profil Bisnis dari OWNER harus dalam *state* `status: 'VERIFIED'` agar properti yang dikirim dapat terlihat/ditambahkan publik (di pencarian beranda).

### UC12: Manajemen Hak Akses Pengguna & Verifikasi Status
- **Aktor:** ADMIN.
- **Pre-Condition:** Aktor menggunakan sandi level-tertinggi JWT (`role: 'ADMIN'`).
- **Deskripsi:** Fasilitas penghentian penyalahgunaan peran dan pelolosan bisnis.
- **Normal Flow:**
  1. Buka Dasbor Admin. Navigasi ke Panel Validasi Pemilik.
  2. Meninjau daftar akun pengajuan `OWNER` (berstatus PENDING).
  3. Admin mengeksekusi "Terima".
  4. Sistem memperbarui log `business_profiles.status` menjadi `VERIFIED`.
- **Exception Flow:** Bila Administrator mencoba MENGHAPUS entitas atau MENURUNKAN peran dirinya sendiri (`req.user.id === target.id`) atau rekan Admin lain, kontrol logis penghentian (*Guard Rails*) memutus rute *request*.
