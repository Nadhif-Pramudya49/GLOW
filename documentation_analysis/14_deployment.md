# 14. Analisis Skema Deployment (Deployment & Environment Strategy)

Dokumen ini membahas infrastruktur persiapan rilis (*Production readiness*), transisi dari masa pengembangan lokal, dan strategi distribusi monolitik aplikasi *Full-Stack* **GLOW**.

## 1. Lingkungan Pengembangan Lokal (Local Environment)
Dalam masa tahap kreasi (Prototipe MVP), ekosistem operasional menggunakan perpaduan modular terpisah:
- **Layanan API (Server):** Node.js *Runtime* berjalan di Porta spesifik (seperti Port 3001) mengaktifkan skrip `server/server.js` yang menyerap konektivitas `mysql://root@localhost` (lewat instansi bundel XAMPP DB).
- **Layanan Klien (Frontend):** Melayani kode JS secara terpisah dari *port* *Live Server* / paket `serve` npm yang independen (misal: port 3000). Mengakibatkan komunikasi *cross-origin* (CORS) harus dibuka agar Klien Port 3000 dapat berinteraksi menembak data ke Server Port 3001.
- **Variabel Lingkungan (dotenv):** Semua port dan kunci API sensitif disimpan secara eksklusif dalam repositori tidak-dilacak `.env` yang merujuk pada templat `.env.example`.

## 2. Metodologi Produksi Monolitik Terpadu (Production Ready Build)
Sistem **GLOW** menggunakan modifikasi struktur cerdik di sisi konfigurasi *Server Express*. Pada berkas `app.js`, blok statis dieksekusi agar Server menangkap seluruh folder aset Antarmuka (client):
```javascript
// app.js (Mengkonsolidasi Front-end masuk ke dalam pelukan Back-End)
app.use(express.static(path.join(__dirname, '..', 'client')));
// SPA catch-all untuk URL Refreshing
app.get('*', (req, res) => res.sendFile(path.join(__dirname, '..', 'client', 'index.html')));
```
**Strategi Transformasi:** Proyek tak lagi memerlukan 2 Mesin Host Server (Satu untuk React/Client, satu untuk API Nodejs). Semua dibungkus menjadi layanan **Satu Target Instansi**. Hal ini sangat mempermudah migrasi rilis akhir (Deployment).

### Deteksi Otomatis URL (Auto-Detect Config)
Untuk menghapus penulisan tautan (Hardcoded URLs) secara manual, variabel `API_BASE_URL` disetel cerdas (terletak pada file `client/js/config.js`):
```javascript
API_BASE_URL: window.location.hostname === 'localhost' 
    ? 'http://localhost:3001/api' 
    : window.location.origin + '/api'
```
Sehingga saat masuk ke *hosting* Produksi (*production cloud URL*), kueri API akan langsung mengarah ke kerangka mesin IP-nya sendiri tanpa *error* koneksi buntu (Failed to fetch).

## 3. Komponen Target Deployment Produksi
Strategi peluncuran (Hosting Service Setup) di lingkungan *cloud* direkomendasikan dan disiapkan berdasarkan berkas panduan (`deploy_guide.md`):

1. **Web Service Node.js (Render.com / Railway / Heroku):**
   - Menghubungkan secara otomatis (Git Webhook integrasi) repositori Github GLOW.
   - Perintah perakitan (Build Command): `npm install && npx prisma generate`. *Prisma generate* wajib dipanggil ulang pada fase kompilasi untuk membangkitkan SDK tipe-data klien Prisma ke dalam mesin *cloud* virtual tersebut.
   - Perintah start (Run Command): `node server/server.js`.
2. **Pangkalan Data Terdistribusi (Cloud MySQL):**
   - Mengingat mesin Web Service statis bersifat *stateless*, basis data MySQL (XAMPP Lokal) tidak bisa dipakai lagi. Sistem bergantung pada layanan penyedia MySQL eksternal jarak jauh berskala hobi (seperti Aiven Cloud, TiDB Serverless, PlanetScale).
   - Skrip migrasi Tabel Prisma, maupun injeksi *Dump file MySQL* (`glow_db.sql`) disuntikkan terpisah dari DBeaver atau CLI terminal administrator ke peladen Database eksternal ini.
3. **Penyuntikan Rahasia ENV (Cloud Environment Variables):**
   Pada panel *Dashboard Web Hosting* Render, Admin mereplika isi variabel `.env` sistem, yang melingkupi pendaftaran parameter:
   - `DATABASE_URL` (Diisi dengan String URL lengkap dari Aiven Provider Cloud MySQL).
   - `GEMINI_API_KEY` dan `GOOGLE_MAPS_API_KEY` (Kunci rahasia modul utilitas).
   - `JWT_SECRET` (Meskipun ada kunci darurat statis bawaan, harus diganti via panel env).
   - `NODE_ENV` (Disetel sebagai "production").

## 4. Kelemahan Skema Peluncuran Saat Ini (Storage Migration Flaw)
Sistem ini menggunakan pengolah aset lokal pada memori partisi kontainer. Direktori `server/uploads/` menyimpan gambar unggahan pendaftaran tempat (Mitra Business). Dalam lingkungan berbasis *Cloud PaaS* (Platform as a Service) seperti Render, semua perubahan sistem penyimpanan lokal/diska akan hangus/musnah bila server masuk mode tidur (*Spin-down Sleep / Restart Build*). Gambar yang diunggah akan hilang dari tayangan Antarmuka Publik. Solusinya, Arsitektur masa depan wajib direvisi untuk menggeser pipa penyimpanan Multer ke konektor awan penyimpanan Objek Permanen khusus (seperti S3 Bucket atau ImageKit) alih-alih mengarsipkan gambar di perut mesin lokal.
