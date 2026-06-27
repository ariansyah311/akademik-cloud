// routes/backup.js
const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { authenticate, authorize } = require('../middleware/auth');

const DB_FILE = path.join(__dirname, '../data/db.json');
const BACKUP_DIR = path.join(__dirname, '../data/backups');

if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR, { recursive: true });

function doBackup() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFile = path.join(BACKUP_DIR, `backup-${timestamp}.json`);
  fs.copyFileSync(DB_FILE, backupFile);
  return `backup-${timestamp}.json`;
}

router.use(authenticate);

// Backup manual (admin only)
router.post('/manual', authorize('admin'), (req, res) => {
  try {
    const filename = doBackup();
    res.json({ message: 'Backup berhasil dibuat', filename });
  } catch (err) {
    res.status(500).json({ message: 'Gagal melakukan backup', error: err.message });
  }
});

// List backup files
router.get('/list', authorize('admin'), (req, res) => {
  const files = fs.existsSync(BACKUP_DIR) ? fs.readdirSync(BACKUP_DIR) : [];
  res.json(files.sort().reverse());
});

module.exports = { router, doBackup };
