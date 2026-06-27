# SIAKAD Cloud — Sistem Informasi Akademik Sederhana Berbasis Cloud

Aplikasi web sistem informasi akademik (login, manajemen mahasiswa, manajemen mata kuliah,
manajemen nilai, dashboard statistik) yang dibangun dengan **HTML, CSS, JavaScript (frontend)**
dan **Node.js + Express (backend)**, siap dihosting pada layanan cloud **Railway**.

## Fitur

- Login pengguna dengan 3 role: `admin`, `dosen`, `mahasiswa` (JWT + bcrypt)
- Manajemen data mahasiswa (CRUD)
- Manajemen data mata kuliah (CRUD)
- Manajemen nilai (CRUD), otomatis menghitung nilai huruf
- Dashboard statistik (jumlah mahasiswa, mata kuliah, rata-rata nilai, distribusi nilai, dll)
- Autentikasi (JWT) & otorisasi berbasis role
- Backup data otomatis (cron job harian) dan backup manual (oleh admin)
- Data dummy sudah disediakan agar bisa langsung dicoba

## Akun Demo

| Role      | Username | Password  |
|-----------|----------|-----------|
| Admin     | admin    | admin123  |
| Dosen     | dosen1   | dosen123  |
| Mahasiswa | mhs1     | mhs123    |

## Menjalankan di Lokal

```bash
npm install
cp .env.example .env
npm start
```

Buka browser ke `http://localhost:3000`

## Struktur Project

```
akademik-cloud/
├── server.js              # Entry point Express
├── middleware/auth.js      # JWT authentication & authorization
├── routes/                 # Auth, mahasiswa, matakuliah, nilai, dashboard, backup
├── data/
│   ├── db.js                # Inisialisasi & load/save data dummy
│   └── db.json              # "Database" (dibuat otomatis saat pertama jalan)
└── public/                  # Frontend (HTML, CSS, JS)
    ├── index.html
    ├── css/style.css
    └── js/{api.js, app.js}
```

## Deploy ke Railway

1. Push project ini ke repository GitHub.
2. Buka [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub repo**.
3. Pilih repository ini. Railway otomatis mendeteksi Node.js (Nixpacks) dan menjalankan `npm install` lalu `node server.js` (lihat `railway.json` / `Procfile`).
4. Pada tab **Variables**, tambahkan environment variable:
   - `JWT_SECRET` = (string acak yang aman)
5. Railway akan memberikan domain publik, contoh: `https://nama-app.up.railway.app`
6. Aplikasi langsung dapat diakses online oleh mahasiswa dan dosen.

### Catatan tentang Database

Untuk kesederhanaan, project ini memakai **file JSON sebagai database** (`data/db.json`) yang
disimpan di volume cloud. Ini cocok untuk demo/skripsi. Untuk produksi sesungguhnya, ganti layer
`data/db.js` dengan koneksi ke database cloud seperti:

- **Railway PostgreSQL / MySQL plugin**
- AWS RDS
- Google Cloud SQL
- MongoDB Atlas

Struktur kode (`routes/*.js`) sudah dipisah per-resource sehingga migrasi ke database
sungguhan hanya memerlukan perubahan pada `data/db.js`, tanpa mengubah route/API.

## Keamanan

- Password disimpan dalam bentuk hash (bcrypt), tidak pernah plaintext.
- Setiap request ke API (kecuali login) wajib menyertakan JWT token pada header `Authorization: Bearer <token>`.
- Otorisasi berbasis role: hanya `admin` yang bisa menghapus data; `admin` & `dosen` bisa menambah/mengubah; `mahasiswa` hanya bisa melihat data (read-only), termasuk nilai miliknya sendiri.

## Backup Data

- **Otomatis**: cron job berjalan setiap hari pukul 02:00 menyalin `db.json` ke `data/backups/`.
- **Manual**: admin bisa menekan tombol "Jalankan Backup Sekarang" di menu *Arsitektur & Backup*.

## Lisensi

Project ini dibuat untuk keperluan tugas/skripsi mata kuliah Cloud Computing.
