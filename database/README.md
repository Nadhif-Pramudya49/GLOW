# 📦 Import Database GLOW

## Cara Import via phpMyAdmin

1. Buka **phpMyAdmin** (`http://localhost/phpmyadmin`)
2. Buat database baru bernama `glow_db`
3. Pilih database `glow_db`
4. Klik tab **Import**
5. Pilih file `glow_db.sql` dari folder ini
6. Klik **Go / Execute**
7. Selesai! ✅

## Cara Import via Command Line

```bash
mysql -u root glow_db < database/glow_db.sql
```

## Akun Demo

| Role | Email | Password |
|---|---|---|
| User (Pelanggan) | `budi@example.com` | `password123` |
| Admin | `admin@glow.com` | `password123` |
| Owner (Mitra) | `owner@glow.com` | `password123` |
