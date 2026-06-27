// routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { load } = require('../data/db');
const { SECRET } = require('../middleware/auth');

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  const db = load();
  const user = db.users.find(u => u.username === username);

  if (!user) return res.status(401).json({ message: 'Username tidak ditemukan.' });

  const valid = bcrypt.compareSync(password, user.password);
  if (!valid) return res.status(401).json({ message: 'Password salah.' });

  const token = jwt.sign(
    { id: user.id, username: user.username, role: user.role, nama: user.nama, nim: user.nim || null },
    SECRET,
    { expiresIn: '8h' }
  );

  res.json({
    message: 'Login berhasil',
    token,
    user: { id: user.id, username: user.username, role: user.role, nama: user.nama, nim: user.nim || null }
  });
});

module.exports = router;
