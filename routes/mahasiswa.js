// routes/mahasiswa.js
const express = require('express');
const router = express.Router();
const { load, save } = require('../data/db');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

// GET semua mahasiswa
router.get('/', (req, res) => {
  const db = load();
  res.json(db.mahasiswa);
});

// GET satu mahasiswa
router.get('/:id', (req, res) => {
  const db = load();
  const item = db.mahasiswa.find(m => m.id === parseInt(req.params.id));
  if (!item) return res.status(404).json({ message: 'Mahasiswa tidak ditemukan' });
  res.json(item);
});

// CREATE mahasiswa (admin & dosen)
router.post('/', authorize('admin', 'dosen'), (req, res) => {
  const db = load();
  const { nim, nama, prodi, semester, email } = req.body;
  if (!nim || !nama) return res.status(400).json({ message: 'NIM dan Nama wajib diisi' });

  const newItem = { id: db.nextId.mahasiswa++, nim, nama, prodi, semester: parseInt(semester) || 1, email };
  db.mahasiswa.push(newItem);
  save(db);
  res.status(201).json(newItem);
});

// UPDATE mahasiswa
router.put('/:id', authorize('admin', 'dosen'), (req, res) => {
  const db = load();
  const idx = db.mahasiswa.findIndex(m => m.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ message: 'Mahasiswa tidak ditemukan' });

  const { nim, nama, prodi, semester, email } = req.body;
  db.mahasiswa[idx] = { ...db.mahasiswa[idx], nim, nama, prodi, semester: parseInt(semester), email };
  save(db);
  res.json(db.mahasiswa[idx]);
});

// DELETE mahasiswa (admin only)
router.delete('/:id', authorize('admin'), (req, res) => {
  const db = load();
  const idx = db.mahasiswa.findIndex(m => m.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ message: 'Mahasiswa tidak ditemukan' });

  db.mahasiswa.splice(idx, 1);
  save(db);
  res.json({ message: 'Mahasiswa berhasil dihapus' });
});

module.exports = router;
