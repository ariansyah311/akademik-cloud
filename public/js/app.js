// public/js/app.js

let cache = { mahasiswa: [], matakuliah: [], nilai: [] };

// ===================== TOAST =====================
function showToast(message, isError = false) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = 'toast show' + (isError ? ' error' : '');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

// ===================== LOGIN =====================
document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;
  const errorBox = document.getElementById('login-error');
  errorBox.style.display = 'none';

  try {
    const res = await api.login(username, password);
    setSession(res.token, res.user);
    enterApp();
  } catch (err) {
    errorBox.textContent = err.message;
    errorBox.style.display = 'block';
  }
});

document.getElementById('logout-btn').addEventListener('click', () => {
  clearSession();
  location.reload();
});

// ===================== NAVIGATION =====================
document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', () => {
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    item.classList.add('active');
    const viewName = item.dataset.view;
    document.querySelectorAll('.view').forEach(v => v.style.display = 'none');
    document.getElementById('view-' + viewName).style.display = 'block';
    loadView(viewName);
  });
});

function loadView(viewName) {
  if (viewName === 'dashboard') renderDashboard();
  if (viewName === 'mahasiswa') renderMahasiswa();
  if (viewName === 'matakuliah') renderMatakuliah();
  if (viewName === 'nilai') renderNilai();
  if (viewName === 'arsitektur') renderArsitektur();
}

// ===================== APP ENTRY =====================
function enterApp() {
  const user = getUser();
  if (!user) return;

  document.getElementById('login-view').style.display = 'none';
  document.getElementById('app-view').style.display = 'flex';
  document.getElementById('user-nama').textContent = user.nama;
  document.getElementById('user-role').textContent = user.role;

  // Sembunyikan tombol tambah jika role mahasiswa
  if (user.role === 'mahasiswa') {
    document.getElementById('btn-add-mahasiswa')?.remove();
    document.getElementById('btn-add-matakuliah')?.remove();
    document.getElementById('btn-add-nilai')?.remove();
    document.getElementById('role-admin-only')?.remove();
    document.querySelector('[data-view="mahasiswa"]')?.remove();
    document.querySelector('[data-view="matakuliah"]')?.remove();
  }

  renderDashboard();
}

if (getToken() && getUser()) {
  enterApp();
}

// ===================== DASHBOARD =====================
async function renderDashboard() {
  try {
    const stats = await api.getStats();

    document.getElementById('stat-grid').innerHTML = `
      <div class="stat-card">
        <div class="label">Total Mahasiswa</div>
        <div class="value">${stats.totalMahasiswa}</div>
      </div>
      <div class="stat-card sage">
        <div class="label">Total Mata Kuliah</div>
        <div class="value">${stats.totalMatakuliah}</div>
      </div>
      <div class="stat-card rose">
        <div class="label">Total Data Nilai</div>
        <div class="value">${stats.totalNilai}</div>
      </div>
      <div class="stat-card">
        <div class="label">Rata-rata Nilai Keseluruhan</div>
        <div class="value">${stats.rataRataNilai}</div>
      </div>
    `;

    const maxAvg = Math.max(...stats.rataPerMatkul.map(m => m.rata_rata), 1);
    document.getElementById('chart-matkul').innerHTML = stats.rataPerMatkul.map(m => `
      <div class="bar-row">
        <div class="bar-label">${m.nama}</div>
        <div class="bar-track"><div class="bar-fill" style="width:${(m.rata_rata / maxAvg) * 100}%"></div></div>
        <div class="bar-value">${m.rata_rata}</div>
      </div>
    `).join('') || '<p style="color:#8a8378;font-size:13px;">Belum ada data nilai.</p>';

    const hurufOrder = ['A', 'B', 'C', 'D', 'E'];
    document.getElementById('chart-huruf').innerHTML = hurufOrder.map(h => `
      <div class="huruf-cell">
        <div class="h">${h}</div>
        <div class="n">${stats.distribusiHuruf[h] || 0} mhs</div>
      </div>
    `).join('');

    const maxProdi = Math.max(...Object.values(stats.perProdi), 1);
    document.getElementById('chart-prodi').innerHTML = Object.entries(stats.perProdi).map(([prodi, jumlah]) => `
      <div class="bar-row">
        <div class="bar-label">${prodi}</div>
        <div class="bar-track"><div class="bar-fill sage" style="width:${(jumlah / maxProdi) * 100}%"></div></div>
        <div class="bar-value">${jumlah}</div>
      </div>
    `).join('');
  } catch (err) {
    showToast(err.message, true);
  }
}

// ===================== MAHASISWA =====================
async function renderMahasiswa(filter = '') {
  try {
    cache.mahasiswa = await api.getMahasiswa();
    const data = cache.mahasiswa.filter(m =>
      m.nama.toLowerCase().includes(filter.toLowerCase()) || m.nim.includes(filter)
    );
    const user = getUser();
    const canEdit = user.role !== 'mahasiswa';

    document.getElementById('tbody-mahasiswa').innerHTML = data.length ? data.map(m => `
      <tr>
        <td>${m.nim}</td>
        <td>${m.nama}</td>
        <td>${m.prodi}</td>
        <td>${m.semester}</td>
        <td>${m.email}</td>
        <td class="actions-cell">
          ${canEdit ? `<button class="btn btn-outline btn-sm" onclick="openMahasiswaModal(${m.id})">Edit</button>` : ''}
          ${user.role === 'admin' ? `<button class="btn btn-danger btn-sm" onclick="deleteMahasiswa(${m.id})">Hapus</button>` : ''}
        </td>
      </tr>
    `).join('') : `<tr><td colspan="6"><div class="empty-state"><div class="display">Tidak ada data</div>Belum ada mahasiswa yang cocok dengan pencarian.</div></td></tr>`;
  } catch (err) {
    showToast(err.message, true);
  }
}

document.getElementById('search-mahasiswa')?.addEventListener('input', (e) => renderMahasiswa(e.target.value));
document.getElementById('btn-add-mahasiswa')?.addEventListener('click', () => openMahasiswaModal());

function openMahasiswaModal(id) {
  const item = id ? cache.mahasiswa.find(m => m.id === id) : null;
  renderModal(`
    <h3>${item ? 'Edit' : 'Tambah'} Mahasiswa</h3>
    <form id="form-mahasiswa">
      <div class="field"><label>NIM</label><input type="text" id="m-nim" value="${item?.nim || ''}" required></div>
      <div class="field"><label>Nama</label><input type="text" id="m-nama" value="${item?.nama || ''}" required></div>
      <div class="field"><label>Program Studi</label><input type="text" id="m-prodi" value="${item?.prodi || ''}" required></div>
      <div class="field"><label>Semester</label><input type="number" id="m-semester" min="1" max="14" value="${item?.semester || 1}" required></div>
      <div class="field"><label>Email</label><input type="email" id="m-email" value="${item?.email || ''}" required></div>
      <div class="modal-foot">
        <button type="button" class="btn btn-outline" onclick="closeModal()">Batal</button>
        <button type="submit" class="btn btn-gold">Simpan</button>
      </div>
    </form>
  `);

  document.getElementById('form-mahasiswa').addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
      nim: document.getElementById('m-nim').value,
      nama: document.getElementById('m-nama').value,
      prodi: document.getElementById('m-prodi').value,
      semester: document.getElementById('m-semester').value,
      email: document.getElementById('m-email').value
    };
    try {
      if (item) await api.updateMahasiswa(item.id, payload);
      else await api.createMahasiswa(payload);
      showToast('Data mahasiswa berhasil disimpan');
      closeModal();
      renderMahasiswa();
    } catch (err) {
      showToast(err.message, true);
    }
  });
}

async function deleteMahasiswa(id) {
  if (!confirm('Hapus data mahasiswa ini?')) return;
  try {
    await api.deleteMahasiswa(id);
    showToast('Data mahasiswa berhasil dihapus');
    renderMahasiswa();
  } catch (err) {
    showToast(err.message, true);
  }
}

// ===================== MATA KULIAH =====================
async function renderMatakuliah(filter = '') {
  try {
    cache.matakuliah = await api.getMatakuliah();
    const data = cache.matakuliah.filter(m =>
      m.nama.toLowerCase().includes(filter.toLowerCase()) || m.kode.toLowerCase().includes(filter.toLowerCase())
    );
    const user = getUser();

    document.getElementById('tbody-matakuliah').innerHTML = data.length ? data.map(m => `
      <tr>
        <td><span class="badge gold">${m.kode}</span></td>
        <td>${m.nama}</td>
        <td>${m.sks}</td>
        <td>${m.dosen}</td>
        <td class="actions-cell">
          ${user.role !== 'mahasiswa' ? `<button class="btn btn-outline btn-sm" onclick="openMatakuliahModal(${m.id})">Edit</button>` : ''}
          ${user.role === 'admin' ? `<button class="btn btn-danger btn-sm" onclick="deleteMatakuliah(${m.id})">Hapus</button>` : ''}
        </td>
      </tr>
    `).join('') : `<tr><td colspan="5"><div class="empty-state"><div class="display">Tidak ada data</div>Belum ada mata kuliah yang cocok.</div></td></tr>`;
  } catch (err) {
    showToast(err.message, true);
  }
}

document.getElementById('search-matakuliah')?.addEventListener('input', (e) => renderMatakuliah(e.target.value));
document.getElementById('btn-add-matakuliah')?.addEventListener('click', () => openMatakuliahModal());

function openMatakuliahModal(id) {
  const item = id ? cache.matakuliah.find(m => m.id === id) : null;
  renderModal(`
    <h3>${item ? 'Edit' : 'Tambah'} Mata Kuliah</h3>
    <form id="form-matakuliah">
      <div class="field"><label>Kode</label><input type="text" id="mk-kode" value="${item?.kode || ''}" required></div>
      <div class="field"><label>Nama Mata Kuliah</label><input type="text" id="mk-nama" value="${item?.nama || ''}" required></div>
      <div class="field"><label>SKS</label><input type="number" id="mk-sks" min="1" max="6" value="${item?.sks || 3}" required></div>
      <div class="field"><label>Dosen Pengampu</label><input type="text" id="mk-dosen" value="${item?.dosen || ''}" required></div>
      <div class="modal-foot">
        <button type="button" class="btn btn-outline" onclick="closeModal()">Batal</button>
        <button type="submit" class="btn btn-gold">Simpan</button>
      </div>
    </form>
  `);

  document.getElementById('form-matakuliah').addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
      kode: document.getElementById('mk-kode').value,
      nama: document.getElementById('mk-nama').value,
      sks: document.getElementById('mk-sks').value,
      dosen: document.getElementById('mk-dosen').value
    };
    try {
      if (item) await api.updateMatakuliah(item.id, payload);
      else await api.createMatakuliah(payload);
      showToast('Mata kuliah berhasil disimpan');
      closeModal();
      renderMatakuliah();
    } catch (err) {
      showToast(err.message, true);
    }
  });
}

async function deleteMatakuliah(id) {
  if (!confirm('Hapus mata kuliah ini?')) return;
  try {
    await api.deleteMatakuliah(id);
    showToast('Mata kuliah berhasil dihapus');
    renderMatakuliah();
  } catch (err) {
    showToast(err.message, true);
  }
}

// ===================== NILAI =====================
async function renderNilai(filter = '') {
  try {
    cache.nilai = await api.getNilai();
    if (!cache.mahasiswa.length) cache.mahasiswa = await api.getMahasiswa().catch(() => []);
    if (!cache.matakuliah.length) cache.matakuliah = await api.getMatakuliah().catch(() => []);

    const user = getUser();
    if (user.role === 'mahasiswa') {
      document.getElementById('nilai-sub').textContent = 'Nilai akademik Anda';
    }

    const data = cache.nilai.filter(n => n.nama_mahasiswa.toLowerCase().includes(filter.toLowerCase()));

    document.getElementById('tbody-nilai').innerHTML = data.length ? data.map(n => `
      <tr>
        <td>${n.nim}</td>
        <td>${n.nama_mahasiswa}</td>
        <td>${n.nama_matakuliah}</td>
        <td>${n.nilai_angka}</td>
        <td><span class="badge ${n.nilai_huruf === 'A' ? '' : n.nilai_huruf === 'E' ? 'rose' : 'gold'}">${n.nilai_huruf}</span></td>
        <td>${n.semester}</td>
        <td class="actions-cell">
          ${user.role !== 'mahasiswa' ? `
            <button class="btn btn-outline btn-sm" onclick="openNilaiModal(${n.id})">Edit</button>
            <button class="btn btn-danger btn-sm" onclick="deleteNilai(${n.id})">Hapus</button>
          ` : ''}
        </td>
      </tr>
    `).join('') : `<tr><td colspan="7"><div class="empty-state"><div class="display">Tidak ada data</div>Belum ada nilai yang tercatat.</div></td></tr>`;
  } catch (err) {
    showToast(err.message, true);
  }
}

document.getElementById('search-nilai')?.addEventListener('input', (e) => renderNilai(e.target.value));
document.getElementById('btn-add-nilai')?.addEventListener('click', () => openNilaiModal());

function openNilaiModal(id) {
  const item = id ? cache.nilai.find(n => n.id === id) : null;
  const mhsOptions = cache.mahasiswa.map(m => `<option value="${m.id}" ${item?.mahasiswa_id === m.id ? 'selected' : ''}>${m.nim} — ${m.nama}</option>`).join('');
  const mkOptions = cache.matakuliah.map(m => `<option value="${m.id}" ${item?.matakuliah_id === m.id ? 'selected' : ''}>${m.kode} — ${m.nama}</option>`).join('');

  renderModal(`
    <h3>${item ? 'Edit' : 'Input'} Nilai</h3>
    <form id="form-nilai">
      <div class="field"><label>Mahasiswa</label><select id="n-mhs" required>${mhsOptions}</select></div>
      <div class="field"><label>Mata Kuliah</label><select id="n-mk" required>${mkOptions}</select></div>
      <div class="field"><label>Nilai Angka (0-100)</label><input type="number" id="n-angka" min="0" max="100" value="${item?.nilai_angka ?? ''}" required></div>
      <div class="field"><label>Semester</label><input type="text" id="n-semester" value="${item?.semester || 'Ganjil 2025/2026'}" required></div>
      <div class="modal-foot">
        <button type="button" class="btn btn-outline" onclick="closeModal()">Batal</button>
        <button type="submit" class="btn btn-gold">Simpan</button>
      </div>
    </form>
  `);

  document.getElementById('form-nilai').addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
      mahasiswa_id: document.getElementById('n-mhs').value,
      matakuliah_id: document.getElementById('n-mk').value,
      nilai_angka: document.getElementById('n-angka').value,
      semester: document.getElementById('n-semester').value
    };
    try {
      if (item) await api.updateNilai(item.id, payload);
      else await api.createNilai(payload);
      showToast('Nilai berhasil disimpan');
      closeModal();
      renderNilai();
    } catch (err) {
      showToast(err.message, true);
    }
  });
}

async function deleteNilai(id) {
  if (!confirm('Hapus data nilai ini?')) return;
  try {
    await api.deleteNilai(id);
    showToast('Data nilai berhasil dihapus');
    renderNilai();
  } catch (err) {
    showToast(err.message, true);
  }
}

// ===================== ARSITEKTUR & BACKUP =====================
function renderArsitektur() {
  document.getElementById('btn-backup-now')?.addEventListener('click', async () => {
    document.getElementById('backup-status').textContent = 'Memproses...';
    try {
      const res = await api.backupNow();
      document.getElementById('backup-status').textContent = `Berhasil: ${res.filename}`;
      showToast('Backup berhasil dibuat');
      loadBackupList();
    } catch (err) {
      document.getElementById('backup-status').textContent = '';
      showToast(err.message, true);
    }
  }, { once: true });
  loadBackupList();
}

async function loadBackupList() {
  const user = getUser();
  if (user.role !== 'admin') return;
  try {
    const list = await api.backupList();
    document.getElementById('backup-list').innerHTML = list.length
      ? '<strong>Riwayat backup:</strong><ul style="margin-top:6px;margin-left:18px;">' + list.slice(0, 5).map(f => `<li>${f}</li>`).join('') + '</ul>'
      : '<span style="color:#8a8378;">Belum ada riwayat backup.</span>';
  } catch (err) {
    // silent
  }
}

// ===================== MODAL HELPERS =====================
function renderModal(html) {
  document.getElementById('modal-content').innerHTML = html;
  document.getElementById('modal-overlay').classList.add('show');
}
function closeModal() {
  document.getElementById('modal-overlay').classList.remove('show');
}
document.getElementById('modal-overlay').addEventListener('click', (e) => {
  if (e.target.id === 'modal-overlay') closeModal();
});
