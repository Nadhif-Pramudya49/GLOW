# **DOKUMEN PENGUJIAN UNIT (UNIT TESTING) PERANGKAT LUNAK** 

**Proyek: GLOW (Gunung Kidul Location for Work)** 

## **A. DESKRIPSI PENGUJIAN** 

Pengujian Unit ( _Unit Testing_ ) dilakukan untuk memverifikasi kebenaran fungsionalitas dari setiap komponen independen (seperti fungsi, metode, _middleware_ , dan _controller_ ) di sisi _backend_ (server) aplikasi GLOW. 

Pengujian ini sepenuhnya terisolasi dari _database_ (MySQL) menggunakan teknik **Mocking** . Pemanggilan ke Prisma ORM, _bcrypt_ (hashing password), dan _jsonwebtoken_ (JWT) disimulasikan sehingga pengujian dapat dieksekusi dengan sangat cepat dan akurat untuk menilai logika kode murni dari sistem. 

##### **Lingkungan Pengujian:** 

##### ● **Framework:** Jest 

- **Target Modul:** <mark>`server/controllers`</mark> & <mark>`server/middlewares`</mark> 

- **Metode:** _White-box testing_ , _Positive & Negative testing_ 

## **B. RINGKASAN HASIL PENGUJIAN** 

Pengujian dijalankan melalui _command_ <mark>`npm run unit`</mark> dengan flag <mark>`--silent`</mark> untuk menekan _noise_ dari error yang disengaja ( _negative test_ ). 

- **Total Test Suites:** 8 file ( _middleware_ & _controllers_ ) 

- **Total Kasus Uji (Tests):** 54 _test cases_ 

- **Status Keseluruhan: 100% PASS** (Seluruh 54 kasus berhasil) 

- **Waktu Eksekusi:** ~1.2 detik 

## **C. RINCIAN PENGUJIAN PER MODUL** 

### **1. Middleware:** **<mark>`auth.js`</mark>** 

Memastikan perlindungan rute aplikasi melalui verifikasi token dan pengecekan hak akses ( _role-based access_ ). 

#### **a. Kasus Uji** 

|**ID**|**Kasus Uji (Test Case)**|**Tipe Uji**|**Output Diharapkan**|**Hasil**|
|---|---|---|---|---|
|M-01|Mengakses fungsi tanpa header<br>`Authorization`|Invalid|Status 401 (No token<br>provided)|PASS|
|M-02|Mengakses dengan format header<br>selain<br>`Bearer`|Invalid|Status 401|PASS|
|M-03|Menggunakan token dengan<br>_signature_yang tidak valid|Invalid|Status 401 (Invalid<br>token)|PASS|
|M-04|Menggunakan token valid|Valid|Melanjutkan<br>(<br>`next()`) & set<br>`req.user`|PASS|
|M-05|Hak akses: User masuk ke rute<br>yang membutuhkan role lain|Invalid|Status 403<br>(Forbidden)|PASS|
|M-06|Hak akses: User dengan role yang<br>benar (misal: ADMIN)<br>mengakses rute khusus ADMIN|Valid|Melanjutkan<br>(<br>`next()`)|PASS|



### **2. Controller:** **<mark>`auth.controller.js`</mark>** 

Memvalidasi logika pendaftaran, proses masuk, dan pengambilan profil pengguna. 

#### **a. Kasus Uji** 

|**ID**|**Kasus Uji (Test Case)**|**Tipe Uji**|**Output Diharapkan**|**Hasil**|
|---|---|---|---|---|
|A-01|Register: Mengirim form<br>dengan_field_kosong|Invalid|Status 400|PASS|
|A-02|Register: Mendaftar dengan<br>email yang sudah ada|Invalid|Status 400 (Email<br>registered)|PASS|
|A-03|Register: Pendaftaran<br>berhasil dengan data unik|Valid|Status 201 & Token<br>dikembalikan|PASS|
|A-04|Login: Email tidak<br>ditemukan di database|Invalid|Status 401 (Invalid<br>credentials)|PASS|



|**ID**|**Kasus Uji (Test Case)**|**Tipe Uji**|**Output Diharapkan**|**Hasil**|
|---|---|---|---|---|
|A-05|Login: Kombinasi email<br>benar, password salah|Invalid|Status 401 (Invalid<br>credentials)|PASS|
|A-06|Login: Kredensial valid|Valid|Token JWT dikembalikan<br>tanpa mengembalikan<br>_password hash_|PASS|
|A-07|getMe: Pengambilan profil<br>valid berdasarkan token<br>sesi|Valid|Objek<br>`user`dikembalikan|PASS|



### **3. Controller:** **<mark>`location.controller.js`</mark>** 

Mengelola pengambilan katalog dan detail informasi lokasi _workation_ . 

#### **a. Kasus Uji** 

|**ID**|**Kasus Uji (Test Case)**|**Tipe Uji**|**Output Diharapkan**|**Hasil**|
|---|---|---|---|---|
|L-01|GetAll: Berhasil mengambil<br>semua lokasi dari DB|Valid|JSON_Array of_<br>_locations_|PASS|
|L-02|GetAll: Database kosong|Valid|Array kosong<br>`[]`|PASS|
|L-03|GetById: Lokasi ditemukan<br>berdasarkan ID|Valid|JSON objek spesifik<br>lokasi|PASS|
|L-04|GetById: ID lokasi tidak<br>terdaftar|Invalid|Status 404 (Lokasi<br>tidak ditemukan)|PASS|
|L-05|Database mengalami<br>kegagalan koneksi (_negative_<br>_test_)|Invalid|Status 500 &<br>penangkapan pesan<br>error|PASS|



### **4. Controller:** **<mark>`booking.controller.js`</mark>** 

Menguji transaksi penyewaan paket _workation_ . 

#### **a. Kasus Uji** 

|**ID**|**Kasus Uji (Test Case)**|**Tipe Uji**|**Output Diharapkan**|**Hasil**|
|---|---|---|---|---|
|B-01|GetMyBookings: Mengambil<br>daftar riwayat pesanan_user_|Valid|JSON_Array of_<br>_bookings_tersortir|PASS|
|B-02|CreateBooking: Pengiriman<br>keranjang (_items_) kosong|Invalid|Status 400 (Keranjang<br>kosong)|PASS|
|B-03|CreateBooking: Membuat<br>pesanan (dan paket kustom)|Valid|Transaksi sukses,<br>Status 201|PASS|



|**ID**|**Kasus Uji (Test Case)**|**Tipe Uji**|**Output Diharapkan**|**Hasil**|
|---|---|---|---|---|
||secara bersamaan||||
|B-04|CreateBooking:_Error handling_|Invalid|Status 500 tidak|PASS|
||bila<br>`prisma.create`gagal||membuat server mati||



### **5. Controller:** **<mark>`package.controller.js`</mark>** 

Memvalidasi pembuatan draf paket khusus melalui _AI Package Builder_ . 

#### **a. Kasus Uji** 

|**ID**|**Kasus Uji (Test Case)**|**Tipe Uji**|**Output Diharapkan**|**Hasil**|
|---|---|---|---|---|
|P-01|GetSavedPackages:<br>Mendapatkan paket milik<br>_user_terkait|Valid|Daftar draf paket ter-<br>_parse_JSON-nya|PASS|
|P-02|SavePackage: Format<br>`packageData`kosong|Invalid|Status 400|PASS|
|P-03|SavePackage: Data paket<br>valid tersimpan|Valid|Objek draf tersimpan,<br>Status 201|PASS|
|P-04|DeletePackage: Menghapus<br>draf paket milik_user_lain|Invalid|Status 404<br>(Unauthorized)|PASS|
|P-05|DeletePackage: Berhasil<br>menghapus milik sendiri|Valid|Konfirmasi<br>penghapusan|PASS|



### **6. Controller:** **<mark>`review.controller.js`</mark>** 

Pengujian pengiriman _rating_ dan ulasan dari pengguna ke lokasi setelah transaksi. 

#### **a. Kasus Uji** 

|**ID**|**Kasus Uji (Test Case)**|**Tipe Uji**|**Output**<br>**Diharapkan**|**Hasil**|
|---|---|---|---|---|
|R-01|CreateReview: Membuat ulasan<br>tanpa poin rating|Invalid|Status 400|PASS|
|R-02|CreateReview: Mengulas pesanan<br>yang bukan miliknya|Invalid|Status 404|PASS|
|R-03|CreateReview: Mengirim ulang<br>ulasan pada pesanan yang sudah<br>diulas (_double submit_)|Invalid|Status 400 (Sudah<br>mengulas)|PASS|
|R-04|CreateReview: Sukses menyimpan|Valid|Status 201|PASS|



|**ID**|**Kasus Uji (Test Case)**|**Tipe Uji**|**Output**<br>**Diharapkan**|**Hasil**|
|---|---|---|---|---|
||dan memperbarui rata-rata rating<br>lokasi (_avg rating computation_)||||
|R-05|GetReviews: Daftar di-_format_<br>dengan nama_user_(tanpa<br>memaparkan data pribadi lengkap)|Valid|Array objek yang<br>telah difilter|PASS|



### **7. Controller:** **<mark>`productivity.controller.js`</mark> &** **<mark>`favorite.controller.js`</mark>** 

Menguji _tracker_ jadwal kerja, catatan kebahagiaan ( _mood_ ), dan daftar ( _wishlist_ ) favorit. 

#### **a. Kasus Uji** 

|**ID**|**Kasus Uji (Test Case)**|**Tipe Uji**|**Output**<br>**Diharapkan**|**Hasil**|
|---|---|---|---|---|
|F-01|AddFavorite: Menambahkan<br>`locationId`menggunakan<br>metode<br>`upsert`|Valid|Status 201|PASS|
|F-02|RemoveFavorite: Menghapus<br>spesifik_wishlist_milik pengguna|Valid|Status 200<br>(Removed)|PASS|
|Pr-01|AddItinerary: Menolak<br>penambahan jadwal jika ID<br>booking salah|Invalid|Status 404|PASS|
|Pr-02|AddItinerary: Pembuatan_timeslot_<br>jadwal berhasil|Valid|Status 201|PASS|
|Pr-03|LogMood: Memasukkan skor<br>kebahagiaan 1-10 ke pengalaman<br>lokasi|Valid|Skor berhasil<br>tercatat|PASS|



