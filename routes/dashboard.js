// routes/dashboard.js
const express = require('express');
const router = express.Router();
const { load } = require('../data/db');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/stats', (req, res) => {
  const db = load();

  const totalMahasiswa = db.mahasiswa.length;
  const totalMatakuliah = db.matakuliah.length;
  const totalNilai = db.nilai.length;
  const rataRata = totalNilai > 0
    ? (db.nilai.reduce((sum, n) => sum + n.nilai_angka, 0) / totalNilai).toFixed(2)
    : 0;

  // Distribusi nilai huruf
  const distribusiHuruf = {};
  db.nilai.forEach(n => {
    distribusiHuruf[n.nilai_huruf] = (distribusiHuruf[n.nilai_huruf] || 0) + 1;
  });

  // Mahasiswa per prodi
  const perProdi = {};
  db.mahasiswa.forEach(m => {
    perProdi[m.prodi] = (perProdi[m.prodi] || 0) + 1;
  });

  // Rata-rata nilai per mata kuliah
  const rataPerMatkul = db.matakuliah.map(mk => {
    const nilaiMk = db.nilai.filter(n => n.matakuliah_id === mk.id);
    const avg = nilaiMk.length > 0
      ? (nilaiMk.reduce((s, n) => s + n.nilai_angka, 0) / nilaiMk.length).toFixed(2)
      : 0;
    return { nama: mk.nama, rata_rata: parseFloat(avg) };
  });

  res.json({
    totalMahasiswa,
    totalMatakuliah,
    totalNilai,
    rataRataNilai: parseFloat(rataRata),
    distribusiHuruf,
    perProdi,
    rataPerMatkul
  });
});

module.exports = router;
