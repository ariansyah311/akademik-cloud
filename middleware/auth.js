// middleware/auth.js
const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET || 'rahasia_skripsi_cloud_2026';

function authenticate(req, res, next) {
  const header = req.headers['authorization'];
  if (!header) return res.status(401).json({ message: 'Token tidak ditemukan. Silakan login.' });

  const token = header.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Token tidak valid.' });

  try {
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Token tidak valid atau sudah kadaluarsa.' });
  }
}

// Authorization: hanya role tertentu yang boleh akses
function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Anda tidak memiliki akses untuk aksi ini.' });
    }
    next();
  };
}

module.exports = { authenticate, authorize, SECRET };
