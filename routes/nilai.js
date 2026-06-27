// routes/nilai.js
const express = require('express');
const router = express.Router();
const { load, save } = require('../data/db');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

function huruf(angka) {
  if (angka >= 85) return 'A';
  if (angka >= 75) return 'B';
  if (angka >= 65) return 'C';
  if (angka >= 50) return 'D';
  return 'E';
}

// GET semua nilai (dengan join nama mahasiswa & matkul)
router.get('/', (req, res) => {
  const db = load();
  let data = db.nilai.map(n => {
    const mhs = db.mahasiswa.find(m => m.id === n.mahasiswa_id);
    const mk = db.matakuliah.find(m => m.id === n.matakuliah_id);
    return {
      ...n,
      nama_mahasiswa: mhs ? mhs.nama : '-',
      nim: mhs ? mhs.nim : '-',
      nama_matakuliah: mk ? mk.nama : '-',
      kode_matakuliah: mk ? mk.kode : '-'
    };
  });

  // Mahasiswa hanya bisa lihat nilai sendiri
  if (req.user.role === 'mahasiswa') {
    const mhs = db.mahasiswa.find(m => m.nim === req.user.nim);
    data = data.filter(n => mhs && n.mahasiswa_id === mhs.id);
  }

  res.json(data);
});

router.post('/', authorize('admin', 'dosen'), (req, res) => {
  const db = load();
  const { mahasiswa_id, matakuliah_id, nilai_angka, semester } = req.body;
  if (!mahasiswa_id || !matakuliah_id || nilai_angka === undefined) {
    return res.status(400).json({ message: 'Data tidak lengkap' });
  }

  const newItem = {
    id: db.nextId.nilai++,
    mahasiswa_id: parseInt(mahasiswa_id),
    matakuliah_id: parseInt(matakuliah_id),
    nilai_angka: parseFloat(nilai_angka),
    nilai_huruf: huruf(parseFloat(nilai_angka)),
    semester: semester || 'Ganjil 2025/2026'
  };
  db.nilai.push(newItem);
  save(db);
  res.status(201).json(newItem);
});

router.put('/:id', authorize('admin', 'dosen'), (req, res) => {
  const db = load();
  const idx = db.nilai.findIndex(n => n.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ message: 'Data nilai tidak ditemukan' });

  const { mahasiswa_id, matakuliah_id, nilai_angka, semester } = req.body;
  const angka = parseFloat(nilai_angka);
  db.nilai[idx] = {
    ...db.nilai[idx],
    mahasiswa_id: parseInt(mahasiswa_id),
    matakuliah_id: parseInt(matakuliah_id),
    nilai_angka: angka,
    nilai_huruf: huruf(angka),
    semester
  };
  save(db);
  res.json(db.nilai[idx]);
});

router.delete('/:id', authorize('admin', 'dosen'), (req, res) => {
  const db = load();
  const idx = db.nilai.findIndex(n => n.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ message: 'Data nilai tidak ditemukan' });

  db.nilai.splice(idx, 1);
  save(db);
  res.json({ message: 'Data nilai berhasil dihapus' });
});

module.exports = router;
