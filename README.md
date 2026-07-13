# 🌟 GLOW — Gunung Kidul Location for Work

> Platform digital nomad untuk menemukan lokasi kerja (*workation*) terbaik di Gunung Kidul, Yogyakarta.

GLOW membantu *remote worker* dan *digital nomad* menemukan penginapan, workspace, wisata, kuliner, dan budaya lokal di kawasan Gunung Kidul. Dilengkapi fitur booking, productivity tracking, paket perjalanan kustom, AI assistant, dan ulasan pengguna.

---

## 📋 Daftar Isi

- [Fitur Utama](#-fitur-utama)
- [Tech Stack](#-tech-stack)
- [Prasyarat](#-prasyarat)
- [Instalasi & Setup](#-instalasi--setup)
- [Menjalankan Aplikasi](#-menjalankan-aplikasi)
- [Akun Demo](#-akun-demo)
- [Struktur Proyek](#-struktur-proyek)
- [Tim Pengembang](#-tim-pengembang)

---

## ✨ Fitur Utama

| Fitur | Deskripsi |
|---|---|
| 🔍 **Pencarian Lokasi** | Cari & filter lokasi berdasarkan kategori, harga, rating, WiFi speed |
| 📦 **Paket Workation** | Buat paket perjalanan kustom dengan drag & drop |
| 📅 **Booking System** | Sistem pemesanan lengkap dengan validasi data diri |
| ⏱️ **Productivity Mode** | Timer Pomodoro, daily journal, dan mood tracking |
| ⭐ **Review & Rating** | Ulasan multi-aspek (WiFi, workspace, ambience) |
| ❤️ **Favorit** | Simpan lokasi favorit untuk referensi |
| 🤖 **AI Assistant** | Rekomendasi itinerary berbasis Gemini AI |
| 👤 **Multi-Role Auth** | Sistem autentikasi untuk User, Owner, dan Admin |
| 📊 **Dashboard** | Dashboard khusus untuk setiap role (User, Owner, Admin) |
| 🗺️ **Peta Interaktif** | Integrasi Google Maps untuk lokasi |

---

## 🛠️ Tech Stack

| Layer | Teknologi |
|---|---|
| **Frontend** | HTML5, CSS3, Vanilla JavaScript (SPA) |
| **Backend** | Node.js, Express.js 5 |
| **Database** | MySQL (via XAMPP) |
| **ORM** | Prisma |
| **Auth** | JWT (JSON Web Token) + bcrypt |
| **AI** | Google Gemini API |
| **Maps** | Google Maps API |
| **File Upload** | Multer |

---

## 📌 Prasyarat

1. **Node.js** (v18 atau lebih baru) — [Download](https://nodejs.org/)
2. **XAMPP** — [Download](https://www.apachefriends.org/)
3. Nyalakan modul **Apache** dan **MySQL** melalui XAMPP Control Panel

---

## 🚀 Instalasi & Setup

### Cara Cepat (Import SQL — Direkomendasikan)

```bash
# 1. Clone repository
git clone https://github.com/Nadhif-Pramudya49/GLOW.git
cd GLOW

# 2. Install dependencies
npm install

# 3. Konfigurasi environment
#    Salin .env.example → .env, lalu sesuaikan kredensial jika perlu
copy .env.example .env

# 4. Import database via phpMyAdmin
#    - Buka http://localhost/phpmyadmin
#    - Buat database baru: glow_db
#    - Klik tab "Import"
#    - Pilih file: database/glow_db.sql
#    - Klik "Go"

# 5. Generate Prisma Client
npx prisma generate
```

### Cara Alternatif (Prisma Migration)

```bash
# Setelah langkah 1-3 di atas, jalankan:
# Buat database glow_db di phpMyAdmin terlebih dahulu

npx prisma migrate dev --name init
npx prisma db seed
```

---

## ▶️ Menjalankan Aplikasi

Buka **2 terminal** terpisah:

### Terminal 1 — Backend (API Server)
```bash
node server/server.js
```
> Backend berjalan di: `http://localhost:3001`

### Terminal 2 — Frontend (Client)
```bash
npx serve client
```
> Frontend berjalan di: `http://localhost:3000`

Buka browser dan akses `http://localhost:3000`

---

## 🔑 Akun Demo

| Role | Email | Password |
|---|---|---|
| 👤 User (Pelanggan) | `budi@example.com` | `password123` |
| 🏢 Owner (Mitra) | `owner@glow.com` | `password123` |
| 🛡️ Admin | `admin@glow.com` | `password123` |

---

## 📁 Struktur Proyek

```
GLOW/
├── client/                     # Frontend (SPA)
│   ├── index.html              # Entry point
│   ├── css/main.css            # Stylesheet utama
│   ├── assets/images/          # Aset gambar
│   └── js/
│       ├── app.js              # Router & init
│       ├── components.js       # Komponen UI (navbar, modal, auth)
│       ├── config.js           # Konfigurasi API
│       ├── data.js             # Data statis
│       ├── state.js            # State management
│       ├── page-*.js           # Halaman-halaman SPA
│       └── services/           # API service layer
│
├── server/                     # Backend (Express)
│   ├── server.js               # Entry point server
│   ├── app.js                  # Express app setup
│   ├── config/database.js      # Konfigurasi database
│   ├── controllers/            # Business logic
│   ├── routes/                 # API endpoints
│   ├── middlewares/            # Auth & upload middleware
│   └── uploads/                # File upload storage
│
├── prisma/                     # Database
│   ├── schema.prisma           # Skema database (11 model)
│   ├── seed.js                 # Data seeder
│   └── migrations/             # Migrasi database
│
├── database/                   # Import database
│   ├── glow_db.sql             # SQL dump (import via phpMyAdmin)
│   └── README.md               # Panduan import
│
├── docs/                       # Dokumentasi proyek
│   ├── BPMN/                   # Business Process Model
│   ├── ERD/                    # Entity Relationship Diagram
│   ├── SRS/                    # Software Requirement Specification
│   ├── UML/                    # UML Diagrams
│   └── Meeting-Notes/          # Catatan meeting
│
└── tests/                      # File testing
```

---

## 👥 Tim Pengembang

Proyek ini dikembangkan untuk mata kuliah **Pengembangan Sistem Informasi (PSI)** — Semester 4.

| Nama | NIM | Role |
|---|---|---|
| Nadhif Pramudya | — | Developer |
| Anjalin Aida Faza | — | Tester |
| Muhammad Ihsan Widodo | — | QA |
| Muhammad Azmi Pasagama | — | UI/UX |
---

## 📄 Lisensi

Proyek ini dibuat untuk keperluan akademik.
