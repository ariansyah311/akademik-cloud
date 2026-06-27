// data/db.js
// =====================================================================
// SIMULASI DATABASE CLOUD (Dummy Data)
// Pada implementasi production, ini akan diganti dengan koneksi ke
// layanan database cloud seperti:
//   - AWS RDS (MySQL/PostgreSQL)
//   - Google Cloud SQL
//   - Azure Database
//   - MongoDB Atlas
// Untuk keperluan demo, data disimpan di memory + file JSON (data/db.json)
// agar tetap persist selama aplikasi berjalan & mudah di-backup.
// =====================================================================

const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const DB_FILE = path.join(__dirname, 'db.json');

function defaultData() {
  const hashedAdmin = bcrypt.hashSync('admin123', 8);
  const hashedDosen = bcrypt.hashSync('dosen123', 8);
  const hashedMhs = bcrypt.hashSync('mhs123', 8);

  return {
    users: [
      { id: 1, username: 'admin', password: hashedAdmin, role: 'admin', nama: 'Administrator Sistem' },
      { id: 2, username: 'dosen1', password: hashedDosen, role: 'dosen', nama: 'Dr. Budi Santoso, M.Kom' },
      { id: 3, username: 'mhs1', password: hashedMhs, role: 'mahasiswa', nama: 'Siti Aminah', nim: '2210101001' }
    ],
    mahasiswa: [
      { id: 1, nim: '2210101001', nama: 'Siti Aminah', prodi: 'Teknik Informatika', semester: 4, email: 'siti.aminah@kampus.ac.id' },
      { id: 2, nim: '2210101002', nama: 'Ahmad Fauzi', prodi: 'Sistem Informasi', semester: 4, email: 'ahmad.fauzi@kampus.ac.id' },
      { id: 3, nim: '2210101003', nama: 'Dewi Lestari', prodi: 'Teknik Informatika', semester: 6, email: 'dewi.lestari@kampus.ac.id' },
      { id: 4, nim: '2210101004', nama: 'Rizky Pratama', prodi: 'Sistem Informasi', semester: 2, email: 'rizky.pratama@kampus.ac.id' },
      { id: 5, nim: '2210101005', nama: 'Putri Wulandari', prodi: 'Teknik Informatika', semester: 4, email: 'putri.wulandari@kampus.ac.id' }
    ],
    matakuliah: [
      { id: 1, kode: 'IF101', nama: 'Algoritma dan Pemrograman', sks: 3, dosen: 'Dr. Budi Santoso, M.Kom' },
      { id: 2, kode: 'IF102', nama: 'Basis Data', sks: 3, dosen: 'Dr. Budi Santoso, M.Kom' },
      { id: 3, kode: 'IF103', nama: 'Pemrograman Web', sks: 3, dosen: 'Rina Kartika, M.T.' },
      { id: 4, kode: 'IF104', nama: 'Jaringan Komputer', sks: 2, dosen: 'Agus Wibowo, M.Kom' },
      { id: 5, kode: 'IF105', nama: 'Cloud Computing', sks: 3, dosen: 'Dr. Budi Santoso, M.Kom' }
    ],
    nilai: [
      { id: 1, mahasiswa_id: 1, matakuliah_id: 1, nilai_angka: 88, nilai_huruf: 'A', semester: 'Ganjil 2025/2026' },
      { id: 2, mahasiswa_id: 1, matakuliah_id: 2, nilai_angka: 75, nilai_huruf: 'B', semester: 'Ganjil 2025/2026' },
      { id: 3, mahasiswa_id: 2, matakuliah_id: 1, nilai_angka: 65, nilai_huruf: 'C', semester: 'Ganjil 2025/2026' },
      { id: 4, mahasiswa_id: 2, matakuliah_id: 3, nilai_angka: 92, nilai_huruf: 'A', semester: 'Ganjil 2025/2026' },
      { id: 5, mahasiswa_id: 3, matakuliah_id: 4, nilai_angka: 80, nilai_huruf: 'B', semester: 'Genap 2024/2025' },
      { id: 6, mahasiswa_id: 4, matakuliah_id: 5, nilai_angka: 70, nilai_huruf: 'B', semester: 'Ganjil 2025/2026' },
      { id: 7, mahasiswa_id: 5, matakuliah_id: 2, nilai_angka: 95, nilai_huruf: 'A', semester: 'Ganjil 2025/2026' }
    ],
    nextId: { mahasiswa: 6, matakuliah: 6, nilai: 8, users: 4 }
  };
}

function load() {
  if (!fs.existsSync(DB_FILE)) {
    save(defaultData());
  }
  return JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
}

function save(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

module.exports = { load, save, defaultData };
