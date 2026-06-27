// server.js
// =====================================================================
// SISTEM INFORMASI AKADEMIK BERBASIS CLOUD
// Backend: Node.js + Express
// Deployment Target: Railway (https://railway.app)
// =====================================================================

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const cron = require('node-cron');

const authRoutes = require('./routes/auth');
const mahasiswaRoutes = require('./routes/mahasiswa');
const matakuliahRoutes = require('./routes/matakuliah');
const nilaiRoutes = require('./routes/nilai');
const dashboardRoutes = require('./routes/dashboard');
const { router: backupRoutes, doBackup } = require('./routes/backup');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/mahasiswa', mahasiswaRoutes);
app.use('/api/matakuliah', matakuliahRoutes);
app.use('/api/nilai', nilaiRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/backup', backupRoutes);

// Health check (untuk Railway monitoring)
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server berjalan dengan baik', timestamp: new Date() });
});

// Fallback ke index.html (SPA-like routing untuk halaman frontend)
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) return next();
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// =====================================================================
// BACKUP OTOMATIS
// Backup dijalankan otomatis setiap hari pukul 02:00 (cron job)
// Ini mensimulasikan strategi backup otomatis pada layanan cloud
// (mirip dengan AWS Backup / Snapshot terjadwal pada GCP/Azure)
// =====================================================================
cron.schedule('0 2 * * *', () => {
  console.log('[BACKUP OTOMATIS] Menjalankan backup terjadwal...');
  try {
    const filename = doBackup();
    console.log(`[BACKUP OTOMATIS] Berhasil: ${filename}`);
  } catch (err) {
    console.error('[BACKUP OTOMATIS] Gagal:', err.message);
  }
});

app.listen(PORT, () => {
  console.log(`Server berjalan di port ${PORT}`);
  console.log(`Akses aplikasi di: http://localhost:${PORT}`);
});
