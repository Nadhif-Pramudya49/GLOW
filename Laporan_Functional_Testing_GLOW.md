# **DOKUMEN PENGUJIAN (FUNCTIONAL TESTING) PERANGKAT LUNAK** 

**Proyek: GLOW (Gunung Kidul Location for Work)** 

## **A. DESKRIPSI PERANGKAT LUNAK** 

GLOW adalah platform _workation_ (Gunung Kidul Location for Work) berbentuk aplikasi web _Single Page Application_ (SPA). Aplikasi ini menyediakan katalog informasi dan layanan pemesanan untuk penginapan, _workspace_ , tempat wisata, kuliner, dan lokasi budaya di area Gunung Kidul. 

Pengguna dapat mengeksplorasi daftar tempat, memfilter berdasarkan kategori, melihat detail lokasi, serta menggunakan fitur **AI Package Builder** untuk membuat rencana perjalanan secara otomatis. Sistem ini juga memiliki manajemen pengguna dengan _role-based access control_ (USER, ADMIN, dan OWNER) yang masing-masing memiliki tampilan _dashboard_ tersendiri. 

##### **Lingkungan Pengujian:** 

- **Metode:** End-to-End (E2E) Automated Testing 

- **Framework:** Playwright 

- **Browser:** Chromium 

- **Base URL:** <mark>`http://localhost:3001`</mark> 

## **B. PENGUJIAN PERANGKAT LUNAK** 

Metode pengujian yang digunakan berfokus pada pengujian fungsional _End-to-End_ pada alur utama pengguna. Berikut adalah rincian pengujian berdasarkan fitur-fitur yang ada di dalam aplikasi: 

### **1. Fitur Autentikasi dan Akses Pengguna** 

Fitur ini mencakup proses login untuk berbagai jenis _role_ (USER, ADMIN, OWNER) serta pengecekan _route guards_ untuk memastikan halaman _dashboard_ terlindungi dari akses tanpa login. 

#### **a. Kriteria (Test Requirements)** 

|**Kode**|**Kriteria**|
|---|---|
|T11|Login menggunakan akun**USER**yang valid dan terdaftar.|
|T12|Login menggunakan akun**ADMIN**yang valid dan terdaftar.|
|T13|Login menggunakan akun**OWNER**yang valid dan terdaftar.|
|T14|Login menggunakan kombinasi email valid namun**password salah**.|
|T15|Login menggunakan email yang**tidak terdaftar**di database.|
|T16|Mengakses halaman rute terlindungi (_protected route_) tanpa token sesi<br>login.|



#### **b. Data Uji** 

|**No Data Uji**|**Field /**<br>**Skenario**|**Data Uji**|**Kondisi**|**Tipe Uji**|
|---|---|---|---|---|
|D11|Email &<br>Password|`budi@example.com`<br>/<br>`password123`|Valid (USER)|V|
|D12|Email &<br>Password|`admin@glow.com`/<br>`password123`|Valid<br>(ADMIN)|V|
|D13|Email &<br>Password|`owner@glow.com`/<br>`password123`|Valid<br>(OWNER)|V|
|D14|Email &<br>Password|`budi@example.com`<br>/<br>`salahpass`|Invalid<br>Password|IV|
|D15|Email &<br>Password|`tidakada@mail.co`<br>`m`/<br>`pass123`|Invalid Akun|IV|
|D16|URL / Akses<br>URL|`/#dashboard-user`|Tanpa<br>Sesi/Token|IV|



#### **c. Kasus Uji** 

|**No**|**Data**<br>**Uji**|**Tipe**<br>**Uji**|**Output yang Diharapkan**|**Hasil**|
|---|---|---|---|---|
|TC1<br>1|D11|V|Login berhasil, sistem<br>mengembalikan token JWT<br>valid, endpoint<br>`/me`<br>memvalidasi role USER.|Berhasi<br>l|
|TC1<br>2|D12|V|Login berhasil, sistem<br>mengembalikan token JWT<br>valid untuk ADMIN.|Berhasi<br>l|
|TC1<br>3|D13|V|Login berhasil, sistem<br>mengembalikan token JWT<br>valid untuk OWNER.|Berhasi<br>l|
|TC1<br>4|D14|IV|Akses ditolak, sistem<br>mengembalikan respons kode<br>400/401 (Unauthorized).|Berhasi<br>l|
|TC1<br>5|D15|IV|Akses ditolak, sistem<br>mengembalikan pesan bahwa<br>kredensial tidak ditemukan.|Berhasi<br>l|
|TC1<br>6|D16|IV|Sistem memblokir akses ke<br>dashboard dan me-redirect<br>pengguna ke halaman<br>`/#search`(Beranda).|Berhasi<br>l|



### **2. Fitur Pencarian dan Tampilan Katalog** 

Fitur ini merupakan halaman utama (Beranda) di mana pengguna dapat melihat katalog tempat, mencari menggunakan teks, dan melakukan filter berdasarkan kategori. 

#### **a. Kriteria (Test Requirements)** 

|**Kode**|**Kriteria**|
|---|---|
|T21|Halaman pencarian utama (Beranda) memuat_Hero Section_dengan teks<br>_brand_GLOW.|
|T22|Terdapat_input field_atau_search bar_yang dapat diketik oleh pengguna.|
|T23|API Endpoint<br>`/api/locations`mengembalikan_array of objects_dari<br>database.|
|T24|Sistem dapat merender kartu lokasi (_Location Cards_) di antarmuka web.|



|**Kode**|**Kriteria**|
|---|---|
|T25|Pencarian teks (Search) dapat memfilter hasil yang dirender di layar.|



#### **b. Data Uji** 

|**No Data Uji**|**Field / Skenario**|**Data Uji**|**Kondisi**|**Tipe Uji**|
|---|---|---|---|---|
|D21|Halaman Load|Mengakses<br>`/#search`|Default load|V|
|D22|Search Input|Kata kunci:<br>`Segara`|Input teks|V|
|D23|Endpoint API|GET<br>`/api/location`<br>`s`|Parameter<br>Kosong|V|



#### **c. Kasus Uji** 

|**No**|**Data**<br>**Uji**|**Tipe**<br>**Uji**|**Output yang Diharapkan**|**Hasil**|
|---|---|---|---|---|
|TC2<br>1|D21|V|Halaman berhasil dirender penuh,<br>bagian_Hero_muncul beserta teks<br>"GLOW".|Berhasil|
|TC2<br>2|D22|V|Saat "Segara" diketik di kolom<br>pencarian, hasil difilter dan tidak<br>menampilkan state kosong.|Berhasil|
|TC2<br>3|D23|V|API memberikan JSON_array_,<br>masing-masing item memuat<br>properti wajib (<br>`id`,<br>`name`,<br>`category`,<br>`rating`).|Berhasil|



### **3. Fitur Navigasi Global Aplikasi** 

Pengujian struktur utama _Single Page Application_ seperti _Navbar_ , _Footer_ , dan fungsi _Routing_ (Perpindahan halaman). 

#### **a. Kriteria (Test Requirements)** 

|**Kode**|**Kriteria**|
|---|---|
|T31|Navbar menampilkan_Brand_dan tombol "Masuk" (saat belum login).|
|T32|Mengklik tautan navigasi mengubah_Hash Route_di URL.|
|T33|_Footer_muncul di halaman publik dan memuat teks hak cipta (Copyright).|
|T34|Fungsi mundur/maju di browser (Back/Forward) dapat mengubah rute<br>SPA dengan benar.|



#### **b. Kasus Uji Utama** 

|**No**|**Data Uji**|**Tipe**<br>**Uji**|**Output yang Diharapkan**|**Hasil**|
|---|---|---|---|---|
|TC3<br>1|Navigasi<br>Menu|V|Ketika rute<br>`/`diakses, SPA<br>otomatis mengarahkan ke<br>halaman default<br>pencarian/home.|Berhasil|
|TC3<br>2|Navigasi<br>Hash|V|Ketika URL berubah dari<br>`/#search`ke<br>`/#package`,<br>konten berubah memuat<br>informasi paket kerja.|Berhasil|
|TC3<br>3|Tombol<br>UI|V|Terdapat tombol/trigger<br>"Masuk" atau "Login" di bilah<br>navigasi atas.|Berhasil|



### **4. Fitur Detail Lokasi** 

Fitur yang menampilkan informasi spesifik dari suatu lokasi yang dipilih pengguna dari katalog. 

#### **a. Kriteria (Test Requirements)** 

|**Kode**|**Kriteria**|
|---|---|
|T41|Halaman Detail Lokasi menampilkan nama, kategori, dan rating lokasi.|
|T42|Endpoint API<br>`GET /api/locations/:id`mengembalikan data|



|**Kode**|**Kriteria**|
|---|---|
||spesifik beserta paket layanan.|
|T43|Endpoint menolak atau memberikan respons_error_jika ID tidak valid<br>(contoh: ID yang sangat besar).|



#### **b. Data Uji** 

|**No Data Uji**|**Field /**<br>**Skenario**|**Data Uji**|**Kondisi**|**Tipe Uji**|
|---|---|---|---|---|
|D41|Validasi UI|ID Lokasi yang Valid<br>(contoh: ID pertama dari<br>DB)|Valid|V|
|D42|Request API|ID Lokasi:<br>`999999`|Invalid ID|IV|



#### **c. Kasus Uji** 

|**No**|**Data**<br>**Uji**|**Tipe**<br>**Uji**|**Output yang Diharapkan**|**Hasil**|
|---|---|---|---|---|
|TC4<br>1|D41|V|Halaman merender UI berisi<br>Nama Lokasi yang cocok dengan<br>respons API, lengkap dengan<br>_badge_Kategori.|Berhasil|
|TC4<br>2|D41|V|Properti koordinat geografis<br>(<br>`latitude`,<br>`longitude`)<br>termuat di dalam payload API<br>dengan tipe numerik/string.|Berhasil|
|TC4<br>3|D42|IV|API menangani permintaan ID<br>tidak valid dengan<br>mengembalikan kode status error<br>(404/400).|Berhasil|



### **5. Fitur AI Package Builder** 

Fitur kustomisasi paket _workation_ interaktif yang diproses menggunakan bantuan _Artificial Intelligence_ (AI). 

#### **a. Kriteria (Test Requirements)** 

|**Kode**|**Kriteria**|
|---|---|
|T51|Halaman menampilkan opsi formulir kustomisasi (teman perjalanan,<br>_vibe_/suasana, rentang budget).|
|T52|Endpoint<br>`POST /api/ai/package`menerima parameter formulir dan<br>mengembalikan paket_generated_.|
|T53|Jika tombol_Generate_ditekan oleh pengguna tamu (_Guest_), sistem memicu<br>aksi (seperti_prompt_atau cegatan UI).|



#### **b. Data Uji** 

|**No Data**<br>**Uji**|**Field /**<br>**Skenario**|**Data Uji**|**Kondisi**|**Tipe Uji**|
|---|---|---|---|---|
|D51|Form<br>Builder|Companions:<br>`Solo`<br>`Traveler`, Vibe:<br>`Tenang`<br>`Alam`, Budget:<br>`Hemat`|Form Terisi<br>(Payload API)|V|
|D52|Form<br>Builder|Companions:<br>`Couple`, Vibe:<br>`Romantis`, Budget:<br>`Nyaman`|Form Terisi<br>(Payload API)|V|



#### **c. Kasus Uji** 

|**No**|**Data Uji**|**Tipe**<br>**Uji**|**Output yang Diharapkan**|**Hasil**|
|---|---|---|---|---|
|TC<br>51|Akses<br>Halaman|V|Halaman termuat dengan teks<br>indikator seperti "Paket" atau<br>"Workation", dan menampilkan opsi<br>_dropdown_(Solo/Couple,<br>Hemat/Premium).|Berhasil|
|TC<br>52|D51 &<br>D52|V/IV|Endpoint memproses payload dan<br>mengembalikan respons sukses<br>HTTP 200 (jika API Key valid) atau<br>HTTP 400 (jika API Key<br>placeholder tertolak secara<br>_graceful_).|Berhasil|



|**No**|**Data Uji**|**Tipe**<br>**Uji**|**Output yang Diharapkan**|**Hasil**|
|---|---|---|---|---|
|TC|Klik|V|Ketika tombol pemicu pembuatan|Berhasil|
|53|"Generat<br>e"||diklik, halaman tidak_crash_dan<br>sistem dapat memproses_event_klik.||



*Catatan: Laporan ini dihasilkan berdasarkan _test suite_ otomatis berjumlah total **46 test cases** yang dijalankan menggunakan skrip Playwright ( <mark>`npm test`</mark> ) di terminal, dengan seluruh hasil (100%) dinyatakan **Berhasil (Pass)** .* 

