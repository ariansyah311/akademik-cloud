// routes/matakuliah.js
const express = require('express');
const router = express.Router();
const { load, save } = require('../data/db');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

router.get('/', (req, res) => {
  const db = load();
  res.json(db.matakuliah);
});

router.get('/:id', (req, res) => {
  const db = load();
  const item = db.matakuliah.find(m => m.id === parseInt(req.params.id));
  if (!item) return res.status(404).json({ message: 'Mata kuliah tidak ditemukan' });
  res.json(item);
});

router.post('/', authorize('admin', 'dosen'), (req, res) => {
  const db = load();
  const { kode, nama, sks, dosen } = req.body;
  if (!kode || !nama) return res.status(400).json({ message: 'Kode dan Nama wajib diisi' });

  const newItem = { id: db.nextId.matakuliah++, kode, nama, sks: parseInt(sks) || 1, dosen };
  db.matakuliah.push(newItem);
  save(db);
  res.status(201).json(newItem);
});

router.put('/:id', authorize('admin', 'dosen'), (req, res) => {
  const db = load();
  const idx = db.matakuliah.findIndex(m => m.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ message: 'Mata kuliah tidak ditemukan' });

  const { kode, nama, sks, dosen } = req.body;
  db.matakuliah[idx] = { ...db.matakuliah[idx], kode, nama, sks: parseInt(sks), dosen };
  save(db);
  res.json(db.matakuliah[idx]);
});

router.delete('/:id', authorize('admin'), (req, res) => {
  const db = load();
  const idx = db.matakuliah.findIndex(m => m.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ message: 'Mata kuliah tidak ditemukan' });

  db.matakuliah.splice(idx, 1);
  save(db);
  res.json({ message: 'Mata kuliah berhasil dihapus' });
});

module.exports = router;
