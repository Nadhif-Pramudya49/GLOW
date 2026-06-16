# GLOW (Gunung Kidul Location for Work)

GLOW adalah platform digital nomad untuk menemukan lokasi kerja (workation) terbaik di Gunung Kidul. Proyek ini terdiri dari Frontend SPA dan Backend Express dengan Prisma ORM.

## Persiapan Prasyarat

1.  **XAMPP**: Pastikan XAMPP terinstal.
2.  **MySQL**: Nyalakan modul **Apache** dan **MySQL** melalui XAMPP Control Panel.
3.  **Database**: Buat database bernama `glow_db` di phpMyAdmin.
4.  **Node.js**: Pastikan Node.js sudah terinstal di sistem Anda.

## Instalasi

1.  Clone repository ini.
2.  Instal dependensi:
    ```bash
    npm install
    ```
3.  Konfigurasi environment:
    *   Salin `.env.example` menjadi `.env`.
    *   Sesuaikan `DATABASE_URL` dengan kredensial MySQL Anda (default: `mysql://root:@localhost:3306/glow_db`).
4.  Setup database (Prisma):
    ```bash
    npx prisma migrate dev --name init
    npx prisma db seed
    ```

## Menjalankan Aplikasi

Aplikasi harus dijalankan dalam dua terminal terpisah:

### 1. Backend (API)
```bash
node src/server.js
```
*   Backend akan berjalan di: `http://localhost:3001`
*   Endpoint utama: `http://localhost:3001/api/locations`

### 2. Frontend (Client)
```bash
npx serve .
```
*   Frontend akan berjalan di port default `serve` (biasanya `http://localhost:3000`).
*   Pastikan backend sudah menyala agar data lokasi dapat tampil.

## Struktur Proyek

*   `src/`: Source code backend (Controllers, Routes, Middlewares).
*   `js/`, `css/`, `img/`, `index.html`: Source code frontend.
*   `prisma/`: Skema database dan file migrasi.

## Tim Pengembang
Proyek ini dikembangkan untuk mata kuliah Pengembangan Sistem Informasi (PSI).
